<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div v-if="loading" class="flex items-center justify-center py-24">
                <Spinner width="3" height="3" />
            </div>

            <div v-else-if="!workflow" class="text-center py-12 text-opposite/50">
                Workflow not found.
            </div>

            <div v-else class="max-w-7xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <router-link to="/automation/workflows"
                        class="text-sm text-opposite/60 hover:text-opposite flex items-center gap-1">
                        <i class="fa-solid fa-arrow-left"></i>
                        Back to Workflows
                    </router-link>
                    <router-link :to="`/automation/workflows/${workflow.id}/edit`"
                        class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <i class="fa-solid fa-pen"></i>
                        Edit
                    </router-link>
                </div>

                <!-- Header -->
                <div class="bg-secondary rounded-lg border border-gray-800 p-6 mb-4">
                    <h3 class="text-lg font-medium text-opposite">{{ workflow.name }}</h3>
                    <p v-if="workflow.description" class="text-sm text-opposite/60 mt-1">{{ workflow.description }}</p>
                    <div class="flex items-center gap-4 text-xs text-opposite/40 mt-3">
                        <span v-if="workflow.trigger?.conditions?.length" class="flex items-center gap-1">
                            <i class="fa-solid fa-bolt text-yellow-400"></i>
                            {{ snakeToCamelCase(workflow.trigger.triggerKey as string) }}
                        </span>
                        <span>{{ countSubTriggers(workflow) }} sub-triggers</span>
                        <span>{{ totalSteps }} steps</span>
                    </div>
                </div>

                <!-- Run history -->
                <div class="bg-secondary rounded-lg border border-gray-800 p-6 mb-4">
                    <h3 class="text-sm font-medium text-opposite mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-clock-rotate-left text-blue-400"></i>
                        Run history
                    </h3>
                    <p v-if="!workflowInstances.length" class="text-sm text-opposite/50">
                        No runs yet. When this workflow is triggered, executions and step responses will appear here.
                    </p>
                    <div v-else class="space-y-4">
                        <div v-for="run in workflowInstances" :key="run.id">
                            <InstanceNode :run="run" :depth="0" :step-name-fn="stepNameForWorkflowStep" />
                        </div>
                    </div>
                </div>

                <!-- Flowchart -->
                <div class="bg-secondary rounded-lg border border-gray-800 p-6 space-y-6">
                    <FlowchartBuilder v-model="flowchartModel" :read-only="true" @node-selected="onNodeSelected" />

                    <!-- Node Detail Panel -->
                    <div v-if="selectedNode" class="border-t border-gray-700 pt-6">
                        <!-- Start / Trigger -->
                        <div v-if="selectedNode.kind === 'trigger'">
                            <h4 class="text-sm font-medium text-opposite mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-bolt text-yellow-400"></i> Trigger
                            </h4>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-xs text-opposite/50">Trigger</span>
                                    <p class="text-opposite">{{ workflow.trigger?.conditions?.length ?
                                        snakeToCamelCase(workflow.trigger.triggerKey as string) : '—' }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Step -->
                        <div v-else-if="selectedNode.kind === 'step'">
                            <h4 class="text-sm font-medium text-opposite mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-square text-gray-400"></i> Step — {{ selectedNode.label }}
                            </h4>
                            <div class="space-y-3 text-sm">

                                <div v-if="stepConnectorName">
                                    <span class="text-xs text-opposite/50">Connector</span>
                                    <p class="text-opposite">{{ stepConnectorName }}</p>
                                </div>
                                <div v-if="stepActionInstanceName">
                                    <span class="text-xs text-opposite/50">Action Instance</span>
                                    <p class="text-opposite">{{ stepActionInstanceName }}</p>
                                </div>
                                <div v-if="stepBindingEntries.length > 0">
                                    <span class="text-xs text-opposite/50 block mb-2">Variable Bindings</span>
                                    <div class="space-y-1.5">
                                        <div v-for="b in stepBindingEntries" :key="b.varName"
                                            class="bg-main rounded border border-gray-700 px-3 py-2 flex items-center gap-2 text-xs">
                                            <span class="font-mono text-opposite">@@{{ b.varName }}@@</span>
                                            <span class="text-opposite/40">→</span>
                                            <span v-if="b.binding.type === 'constant'" class="text-blue-400">
                                                constant: {{ (b.binding as any).value || '(empty)' }}
                                            </span>
                                            <span v-else-if="b.binding.type === 'injectable'" class="text-purple-400">
                                                inject: {{ (b.binding as any).module }}.{{ (b.binding as any).property
                                                }}
                                            </span>
                                            <span v-else-if="b.binding.type === 'response'" class="text-green-400">
                                                response: {{ (b.binding as any).mappedTo }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    v-if="selectedNode.meta?.conditionMet !== undefined && selectedNode.meta?.conditionMet !== null">
                                    <span class="text-xs text-opposite/50">Branch</span>
                                    <p :class="selectedNode.meta.conditionMet ? 'text-emerald-400' : 'text-red-400'">
                                        {{ selectedNode.meta.conditionMet ? 'True' : 'False' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import FlowchartBuilder from './FlowchartBuilder.vue'
import InstanceNode from './InstanceNode.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getConnectors,
} from '@/components/fleet/endpoints'
import type { Connector } from '@/components/fleet/endpoints'
import {
    getWorkflowById,
    getSourceModules,
    getWorkflowInstances,
} from '@/components/automation/endpoints'
import type {
    Workflow,
    WorkflowInstanceRun,
} from '@/components/automation/endpoints'
import { formatDate, snakeToCamelCase } from '@/util/util'
import {
    createDefaultFlowchart,
    type FlowchartModel,
    type FlowchartNode,
} from './flowchartTypes'
import { workflowToFlowchart } from './dtos'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const workflowId = computed(() => route.params.id as string)
const loading = ref(true)
const workflow = ref<Workflow | null>(null)
const connectors = ref<Connector[]>([])
const workflowInstances = ref<WorkflowInstanceRun[]>([])


const flowchartModel = ref<FlowchartModel>(createDefaultFlowchart())
const selectedNode = ref<FlowchartNode | null>(null)

const crumbs = computed(() => [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '/automation/workflows' },
    { name: workflow.value?.name || 'View', path: '' },
])


function findStepNameInWorkflowTree(wf: Workflow, stepId: string): string | null {
    const direct = wf.steps?.find((s) => s.id === stepId)
    if (direct?.name) return direct.name
    for (const s of wf.steps ?? []) {
        for (const sub of s.subTriggers ?? []) {
            if (sub.workflow) {
                const n = findStepNameInWorkflowTree(sub.workflow, stepId)
                if (n) return n
            }
        }
    }
    return null
}

function stepNameForWorkflowStep(stepId: string): string {
    const wf = workflow.value
    if (!wf) return stepId
    return findStepNameInWorkflowTree(wf, stepId) ?? stepId
}

function countStepsInTree(wf: Workflow): number {
    let n = wf.steps?.length ?? 0
    for (const s of wf.steps ?? []) {
        for (const sub of s.subTriggers ?? []) {
            if (sub.workflow) n += countStepsInTree(sub.workflow)
        }
    }
    return n
}

function countSubTriggers(wf: Workflow): number {
    let n = 0
    for (const s of wf.steps ?? []) {
        n += s.subTriggers?.length ?? 0
        for (const sub of s.subTriggers ?? []) {
            if (sub.workflow) n += countSubTriggers(sub.workflow)
        }
    }
    return n
}


const totalSteps = computed(() => (workflow.value ? countStepsInTree(workflow.value) : 0))

// ─── Step detail helpers ───

const stepConnectorName = computed(() => {
    const id = selectedNode.value?.meta?.connectorId
    if (!id) return null
    return connectors.value.find((c) => c.id === id)?.name || null
})

const stepActionInstanceName = computed(() => {
    const instanceId = selectedNode.value?.meta?.connectorActionInstanceId
    const connectorId = selectedNode.value?.meta?.connectorId
    if (!instanceId || !connectorId) return null
    const connector = connectors.value.find((c) => c.id === connectorId)
    const inst = connector?.actionInstances?.find((ai) => ai.id === instanceId)
    if (!inst) return null
    const typeName = inst.connectorTypeAction?.name
    return typeName ? `${inst.name} (${typeName})` : inst.name
})

const stepBindingEntries = computed(() => {
    const bindings = selectedNode.value?.meta?.variableBindings
    if (!bindings || typeof bindings !== 'object') return []
    return Object.entries(bindings).map(([varName, binding]) => ({ varName, binding: binding as any }))
})

// ─── Node selection ───

function onNodeSelected(node: FlowchartNode | null) {
    selectedNode.value = node
        ? flowchartModel.value.nodes.find((n) => n.id === node.id) || null
        : null
}

// ─── Workflow → Flowchart conversion ───





// ─── Load ───

onMounted(async () => {
    loading.value = true
    try {
        const [wf, c, instances] = await Promise.all([
            getWorkflowById(workflowId.value, authStore),
            getConnectors(authStore).catch(() => []),
            getWorkflowInstances(workflowId.value, authStore).catch(() => [] as WorkflowInstanceRun[]),
        ])
        workflow.value = wf.workflow as Workflow;
        connectors.value = c
        workflowInstances.value = Array.isArray(instances) ? instances : []


        flowchartModel.value = workflowToFlowchart(wf, connectors.value)
    } catch (e: any) {
        toast.showToast('Error', e?.response?.data?.message || 'Failed to load workflow', 'error')
    } finally {
        loading.value = false
    }
})
</script>
