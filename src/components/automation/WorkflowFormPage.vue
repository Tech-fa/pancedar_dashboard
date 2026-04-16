<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div v-if="pageLoading" class="flex items-center justify-center py-24">
                <Spinner width="3" height="3" />
            </div>

            <div v-else class="max-w-7xl mx-auto">
                <Notice
                    :description="'When a trigger is set up, the entity coming from the trigger will be available to all steps in the workflow, under injectables'"
                    :level="'info'" />

                <div class="bg-secondary rounded-lg border border-gray-800 p-6 space-y-6 mt-3">
                    <!-- Basic Info -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-opposite mb-1">Workflow Name</label>
                            <input v-model="builderName" type="text" placeholder="Enter workflow name"
                                :class="[INPUT_CLASS, 'w-full']" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-opposite mb-1">Description</label>
                            <input v-model="builderDescription" type="text" placeholder="Enter description (optional)"
                                :class="[INPUT_CLASS, 'w-full']" />
                        </div>
                    </div>

                    <!-- Flowchart Builder -->
                    <div class="border-t border-gray-700 pt-6">
                        <FlowchartBuilder v-model="flowchartModel"
                            @node-selected="(node: any, ancestors: any) => onNodeSelected(node, ancestors)" />
                    </div>

                    <!-- Node Configuration Panel -->
                    <div v-if="selectedNode" class="border-t border-gray-700 pt-6">
                        <!-- Trigger Config -->
                        <TriggerStep :key="selectedNode.id" v-if="selectedNode.kind === 'trigger'" :node="selectedNode"
                            :ancestors="selectedNodeAncestors" :updateNodeMeta="updateNodeMeta"
                            :updateNodeLabel="updateNodeLabel" :refreshSelectedNode="refreshSelectedNode"
                            :deleteFromMeta="deleteFromMeta" />

                        <!-- Step Config -->
                        <div v-else-if="selectedNode.kind === 'step'">
                            <h4 class="text-sm font-medium text-opposite mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-square text-gray-400"></i> Configure Step
                            </h4>
                            <div class="space-y-3">
                                <ConnectorActionPicker :connectors="connectors" :key="selectedNode.id"
                                    :selectedConnector="selectedStepConnector"
                                    :selectedActionInstance="selectedStepActionInstance"
                                    :variableBindings="selectedStepBindings" :injectableOptions="injectableOptions"
                                    :responseOptions="previousStepResponseOptions"
                                    @update:selectedConnector="onStepConnectorChanged"
                                    @update:selectedActionInstance="onStepActionInstanceChanged"
                                    @update:variableBindings="onStepBindingsChanged"
                                    @reload-connectors="reloadConnectors" />

                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-3 border-t border-gray-700 pt-4">
                        <AppButton buttonStyle="secondary" type="button" @click="goBackToList">
                            Cancel
                        </AppButton>
                        <AppButton buttonStyle="primary" type="button" @click="saveWorkflow"
                            :loading="isSavingWorkflow">
                            {{ editingWorkflow ? 'Update Workflow' : 'Create Workflow' }}
                        </AppButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getConnectors,
    getInjectables,
} from '@/components/fleet/endpoints'
import type { Connector, ConnectorActionInstance, InjectableModule } from '@/components/fleet/endpoints'
import ConnectorActionPicker from '@/components/ConnectorActionPicker.vue'
import {
    getWorkflowById,
    createWorkflow,
    updateWorkflow,
    getSourceModules,
} from '@/components/automation/endpoints'
import type { Workflow, WorkflowTriggerData } from '@/components/automation/endpoints'
import { INPUT_CLASS } from '@/components/contants'
import FlowchartBuilder from './FlowchartBuilder.vue'
import {
    FLOWCHART_START_ID,
    createDefaultFlowchart,
    type FlowchartModel,
    type FlowchartNode,
} from './flowchartTypes'
import { workflowToFlowchart, type SourceModule } from './dtos'
import TriggerStep from './TriggerStep.vue'
import Notice from '../Notice.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const workflowId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!workflowId.value)

const crumbs = computed(() => [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '/automation/workflows' },
    { name: isEditing.value ? 'Edit' : 'New', path: '' },
])

const pageLoading = ref(true)
const editingWorkflow = ref<Workflow | null>(null)
const isSavingWorkflow = ref(false)

const connectors = ref<Connector[]>([])
const injectableModules = ref<Record<string, InjectableModule>>({})


const sourceModules = ref<SourceModule[]>([])

const builderName = ref('')
const builderDescription = ref('')

const flowchartModel = ref<FlowchartModel>(createDefaultFlowchart())
const selectedNode = ref<FlowchartNode | null>(null)
const selectedNodeAncestors = ref<FlowchartNode[]>([])

// ─── Step helpers ───

const selectedStepConnector = computed(() => {
    const id = selectedNode.value?.meta?.connectorId
    return id ? connectors.value.find((c) => c.id === id) || null : null
})

const selectedStepActionInstance = computed(() => {
    const id = selectedNode.value?.meta?.connectorActionInstanceId
    const connector = selectedStepConnector.value
    return id && connector
        ? connector.actionInstances?.find((ai) => ai.id === id) || null
        : null
})

const selectedStepBindings = computed(() =>
    (selectedNode.value?.meta?.variableBindings || {}) as Record<string, any>,
)

const injectableOptions: any = computed(() => {
    const options: { module: string; property: string; label: string }[] = []
    for (const ancestor of selectedNodeAncestors.value.filter((a) => a.kind !== 'step')) {
        const mod = injectableModules.value[ancestor.meta?.sourceType || '']
        if (mod) {
            for (const prop of mod.properties) {
                options.push({
                    module: ancestor.meta?.sourceType || '',
                    property: prop.key,
                    label: `${mod.label} → ${prop.label}`,
                })
            }
        }
    }
    return options
})

const previousStepResponseOptions = computed(() => {
    if (!selectedNode.value || selectedNode.value.kind !== 'step') return []

    const options: { source: string; sourceId: string; sourceType: string, step: string }[] = []
    for (const ancestor of selectedNodeAncestors.value) {
        console.log(ancestor.meta?.sourceType)
        if ((ancestor.kind !== 'step' && ancestor.id !== FLOWCHART_START_ID) || (ancestor.id == FLOWCHART_START_ID && ancestor.meta?.sourceType !== 'Response')) continue
        options.push({
            source: ancestor.meta?.source || '',
            sourceId: ancestor.meta?.sourceId || '',
            sourceType: ancestor.meta?.sourceType || '',
            step: ancestor.label || '',
        })
    }
    return options
})

// ─── Node meta update helpers ───

function updateNodeMeta(nodeId: string, updates: Record<string, any>) {
    const nodes = flowchartModel.value.nodes.map((n) => {
        if (n.id === nodeId) {
            return { ...n, meta: { ...(n.meta || {}), ...updates } }
        }
        return n
    })
    flowchartModel.value = { ...flowchartModel.value, nodes }
}

function updateNodeLabel(nodeId: string, label: string) {
    const nodes = flowchartModel.value.nodes.map((n) => {
        if (n.id === nodeId) {
            return { ...n, label }
        }
        return n
    })
    flowchartModel.value = { ...flowchartModel.value, nodes }
}

// ─── Node selection handler ───

function onNodeSelected(node: FlowchartNode | null, ancestors: FlowchartNode[]) {
    (document.activeElement as HTMLElement)?.blur()
    selectedNode.value = node ? flowchartModel.value.nodes.find((n) => n.id === node.id) || null : null
    selectedNodeAncestors.value = ancestors

}

// ─── Trigger config handlers ───


// ─── Step config handlers ───

function onStepConnectorChanged(val: Connector | null) {
    if (!selectedNode.value) return
    updateNodeMeta(selectedNode.value.id, {
        connectorId: val?.id || undefined,
        connectorActionInstanceId: undefined,
        connectorTypeActionId: undefined,
        variableBindings: {},
    })
    refreshSelectedNode()
}

function onStepActionInstanceChanged(val: ConnectorActionInstance | null) {
    if (!selectedNode.value) return
    updateNodeMeta(selectedNode.value.id, {
        connectorActionInstanceId: val?.id || undefined,
        connectorTypeActionId: val?.connectorTypeActionId || undefined,
        sourceType: 'Response',
        source: 'ConnectorActionInstance',
        sourceId: val?.id || undefined,

    })
    const label = val ? `${selectedNodeAncestors.value.length} - ${val.name}` : selectedNode.value.label
    updateNodeLabel(selectedNode.value.id, label)
    refreshSelectedNode()
}

function onStepBindingsChanged(bindings: Record<string, any>) {
    if (!selectedNode.value) return
    updateNodeMeta(selectedNode.value.id, { variableBindings: bindings })
    refreshSelectedNode()
}

async function reloadConnectors() {
    try {
        connectors.value = await getConnectors(authStore)
    } catch {
        connectors.value = []
    }
}



function refreshSelectedNode() {
    if (!selectedNode.value) return
    selectedNode.value = flowchartModel.value.nodes.find((n) => n.id === selectedNode.value!.id) || null
}

// ─── Flowchart → API conversion ───

function collectSteps(fromId: string, model: FlowchartModel): any[] {
    const steps: any[] = []
    let order = 1
    const queue: string[] = model.edges.filter(e => e.from === fromId).map(e => e.to)
    const visited = new Set<string>()

    while (queue.length) {
        const cur = queue.shift()!
        if (visited.has(cur)) continue
        visited.add(cur)

        const node = model.nodes.find((n) => n.id === cur)
        if (!node || node.kind !== 'step') continue

        const step: any = {
            name: node.label?.trim(),
            order: order++,
            kind: 'step',
            id: node.meta?.id || undefined,
            connectorActionInstanceId: node.meta?.connectorActionInstanceId || undefined,
            variableBindings: node.meta?.variableBindings && Object.keys(node.meta.variableBindings).length
                ? node.meta.variableBindings : undefined,
        }
        steps.push(step)

        const targets = model.edges.filter(e => e.from === cur).map(e => e.to)
        const subTriggers: any[] = []

        for (const targetId of targets) {
            const targetNode = model.nodes.find(n => n.id === targetId)
            if (!targetNode) continue

            if (targetNode.kind === 'trigger') {
                visited.add(targetId)
                subTriggers.push({
                    triggerKey: targetNode.meta?.source || undefined,
                    conditions: (targetNode.meta?.conditionRows || [])
                        .filter((r: any) => r.field)
                        .map((r: any) => ({
                            step: targetNode.meta?.step || undefined,
                            source: targetNode.meta?.source || '',
                            sourceId: targetNode.meta?.sourceId || null,
                            sourceType: targetNode.meta?.sourceType || '',
                            field: r.field,
                            operator: r.operator,
                            value: r.value || undefined,
                        })),
                    id: targetNode.meta?.id || undefined,
                    workflow: {
                        id: targetNode?.meta?.workflowId || undefined,
                        name: targetNode.label?.trim() || 'Sub-workflow',
                        steps: collectSteps(targetId, model),
                    },
                })
            } else if (targetNode.kind === 'step') {
                queue.push(targetId)
            }
        }

        if (subTriggers.length) {
            step.subTriggers = subTriggers
        }
    }

    return steps
}

function flowchartToPayload(model: FlowchartModel) {
    const start = model.nodes.find((n) => n.id === FLOWCHART_START_ID)
    return {
        conditions: (start?.meta?.conditionRows || [])
            .filter((r: any) => r.field)
            .map((r: any) => ({
                source: start?.meta?.source || '',
                sourceType: start?.meta?.sourceType || '',
                sourceId: start?.meta?.sourceId || null,
                field: r.field,
                operator: r.operator,
                value: r.value || undefined,
            })),
        triggerKey: start?.meta?.source || undefined,
        id: start?.meta?.id || undefined,
        workflow: {
            name: builderName.value.trim(),
            description: builderDescription.value.trim() || undefined,
            id: start?.meta?.workflowId,
            steps: collectSteps(FLOWCHART_START_ID, model),
        },
    }
}

// ─── CRUD ───

function resetNewForm() {
    editingWorkflow.value = null
    builderName.value = ''
    builderDescription.value = ''
    flowchartModel.value = createDefaultFlowchart()
    selectedNode.value = null
}

function applyWorkflowToForm(wf: WorkflowTriggerData) {
    editingWorkflow.value = wf.workflow || null
    builderName.value = wf.workflow?.name || ''
    builderDescription.value = wf.workflow?.description || ''
    flowchartModel.value = workflowToFlowchart(wf, connectors.value)
    selectedNode.value = null
}

function goBackToList() {
    router.push('/automation/workflows')
}

function validatePayload(payload: ReturnType<typeof flowchartToPayload>): string | null {
    if (!builderName.value.trim()) return 'Workflow name is required'
    const check = (steps: any[]): string | null => {
        for (const s of steps) {
            if (!s.connectorActionInstanceId) return `Step "${s.name}" must have a connector action`
            if (s.variableBindings) {
                for (const [k, b] of Object.entries(s.variableBindings as Record<string, any>)) {
                    if (!b?.type) return `Step "${s.name}": variable @@${k}@@ has no binding type`
                    if (b.type === 'constant' && !b.value?.trim()) return `Step "${s.name}": @@${k}@@ needs a constant value`
                    if (b.type === 'injectable' && (!b.module?.trim() || !b.property?.trim())) return `Step "${s.name}": @@${k}@@ needs an injectable property`
                    if (b.type === 'response' && !b.mappedTo?.trim()) return `Step "${s.name}": @@${k}@@ needs a response mapping`
                }
            }
            for (const sub of s.subTriggers || []) {
                if (!sub.workflow?.steps?.length) {
                    return "Sub-workflow must have at least one step"
                }
                if (!sub.conditions?.length) {
                    return "Sub-workflow must have at least one condition"
                }
                const err = check(sub.workflow?.steps || [])
                if (err) return err
            }
        }
        return null
    }
    const steps = payload.workflow?.steps || []
    if (!steps.length) return 'At least one step is required'
    return check(steps)
}

const saveWorkflow = async () => {
    const payload = flowchartToPayload(flowchartModel.value)
    const err = validatePayload(payload)
    if (err) { toast.showToast('Error', err, 'error'); return }

    isSavingWorkflow.value = true
    console.log('payload', payload)
    try {
        if (editingWorkflow.value) {
            await updateWorkflow(editingWorkflow.value.id, payload as any, authStore)
            toast.showToast('Updated', 'Workflow updated successfully', 'success')
        } else {
            await createWorkflow(payload as any, authStore)
            toast.showToast('Created', 'Workflow created successfully', 'success')
        }
        router.push('/automation/workflows')
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to save workflow', 'error')
    } finally {
        isSavingWorkflow.value = false
    }
}

// ─── Data loading ───

const loadConnectors = async () => {
    try {
        connectors.value = await getConnectors(authStore)
    } catch {
        connectors.value = []
    }
}

const loadInjectables = async () => {
    try {
        const result = await getInjectables('workflow', authStore)
        injectableModules.value = result.modules
    } catch {
        injectableModules.value = {}
    }
}

function deleteFromMeta(nodeId: string, keys: string[]) {
    updateNodeMeta(nodeId, keys.reduce((acc, key) => {
        acc[key] = undefined
        return acc
    }, {} as Record<string, any>))
}

const loadSourceModules = async () => {
    try {
        sourceModules.value = await getSourceModules(authStore)
    } catch {
        sourceModules.value = []
    }
}



async function loadWorkflowForEdit(id: string) {
    const wf = await getWorkflowById(id, authStore)
    applyWorkflowToForm(wf)
}

async function initPage() {
    pageLoading.value = true
    try {
        await Promise.all([
            loadConnectors(),
            loadInjectables(), loadSourceModules(),
        ])
        if (isEditing.value && workflowId.value) {
            await loadWorkflowForEdit(workflowId.value)
        } else {
            resetNewForm()
        }
    } catch {
        if (isEditing.value) {
            toast.showToast('Error', 'Failed to load workflow', 'error')
            router.push('/automation/workflows')
        } else {
            resetNewForm()
        }
    } finally {
        pageLoading.value = false
    }
}

onMounted(() => {
    void initPage()
})

watch(
    () => route.params.id,
    async (id, prev) => {
        if (id === prev) return
        pageLoading.value = true
        try {
            if (id && typeof id === 'string') {
                await loadWorkflowForEdit(id)
            } else {
                resetNewForm()
            }
        } catch {
            if (id) {
                toast.showToast('Error', 'Failed to load workflow', 'error')
                router.push('/automation/workflows')
            }
        } finally {
            pageLoading.value = false
        }
    },
)


</script>
