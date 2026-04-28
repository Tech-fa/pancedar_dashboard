<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-2xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-opposite">Workflow</h3>
                </div>

                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="!workflow"
                    class="text-center py-12 text-opposite/50 bg-secondary rounded-lg border border-gray-800">
                    Workflow not found.
                </div>

                <div v-else class="bg-secondary rounded-lg border border-gray-800 p-6 space-y-4">
                    <div>
                        <label class="block text-xs text-opposite/60 mb-1 ml-1">Workflow Type</label>
                        <div class="bg-main border border-gray-800 rounded-md px-3 py-2 text-sm text-opposite/80">
                            {{ typeConfig?.name || workflow.workflowType }}
                        </div>
                        <label class="block text-xs text-opposite/60 mb-1 ml-1">Workflow Name</label>
                        <div class="bg-main border border-gray-800 rounded-md px-3 py-2 text-sm text-opposite/80">
                            {{ workflow.name }}
                        </div>
                        <p v-if="typeConfig?.description" class="text-xs text-opposite/60 mt-2 ml-1">
                            {{ typeConfig.description }}
                        </p>
                    </div>

                    <div>
                        <label class="block text-xs text-opposite/60 mb-1 ml-1">Description</label>
                        <div
                            class="bg-main border border-gray-800 rounded-md px-3 py-2 text-sm text-opposite/80 min-h-[2.25rem]">
                            {{ workflow.description || '—' }}
                        </div>
                    </div>

                    <div v-if="connectorTypeNames.length" class="pt-2 space-y-4">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <h4 class="text-sm font-medium text-opposite">Linked Connectors</h4>
                                <p class="text-xs text-opposite/60 mt-1">
                                    Choose the existing connections this workflow can use.
                                </p>
                            </div>
                            <RouterLink to="/automation/connectors" class="text-xs text-primary hover:underline">
                                Manage connectors
                            </RouterLink>
                        </div>

                        <div v-for="typeName in connectorTypeNames" :key="typeName"
                            class="bg-main rounded-lg border border-gray-800 p-4 space-y-3">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <div class="text-sm font-medium text-opposite">{{ typeName }}</div>
                                    <div class="text-xs text-opposite/60 mt-0.5">
                                        {{ connectorTypeDescription(typeName) }}
                                    </div>
                                </div>
                                <span class="text-xs text-opposite/40">
                                    {{ connectorTypeAllowsMultiple(typeName) ? 'Reusable' : 'One workflow only' }}
                                </span>
                            </div>

                            <div v-if="connectorsForType(typeName).length" class="space-y-2">
                                <label v-for="connector in connectorsForType(typeName)" :key="connector.id"
                                    :class="[
                                        'flex items-center justify-between gap-3 rounded-md bg-secondary px-3 py-2 border',
                                        connectorDisabled(connector)
                                            ? 'border-gray-800 opacity-60 cursor-not-allowed'
                                            : 'border-gray-800 cursor-pointer hover:border-gray-700',
                                    ]">
                                    <div class="flex items-center gap-3 min-w-0">
                                        <input type="checkbox"
                                            class="rounded border-gray-700 bg-main text-primary focus:ring-primary"
                                            :checked="selectedConnectorIds.includes(connector.id)"
                                            :disabled="connectorDisabled(connector)"
                                            @change="onConnectorToggle(connector.id, $event)" />
                                        <span
                                            :class="['w-2 h-2 rounded-full shrink-0', connector.status === 'active' ? 'bg-green-500' : 'bg-red-500']"></span>
                                        <span class="min-w-0">
                                            <span class="block text-sm text-opposite truncate">{{ connector.name }}</span>
                                            <span class="block text-xs text-opposite/60 truncate">
                                                {{ connector.primaryIdentifier || connector.status }}
                                            </span>
                                        </span>
                                    </div>
                                    <span v-if="connectorDisabled(connector)" class="text-xs text-opposite/50 shrink-0">
                                        Linked to {{ linkedWorkflowName(connector) }}
                                    </span>
                                </label>
                            </div>

                            <div v-else class="text-xs text-opposite/60 bg-secondary rounded p-3">
                                No existing {{ typeName }} connectors. Create one from the connectors page first.
                            </div>
                        </div>
                    </div>

                    <div v-if="typeConfig && typeConfig.steps?.length" class="pt-2 space-y-4">
                        <h4 class="text-sm font-medium text-opposite">Step Configuration</h4>
                        <div v-for="(step, index) in typeConfig.steps" :key="step.name"
                            class="bg-main rounded-lg border border-gray-800 p-4 space-y-3">
                            <div class="flex items-baseline gap-2">
                                <span class="text-xs text-opposite/50 font-mono">{{ index + 1 }}.</span>
                                <div>
                                    <div class="text-sm font-medium text-opposite">{{ step.name }}</div>
                                    <div v-if="step.description" class="text-xs text-opposite/60 mt-0.5">
                                        {{ step.description }}
                                    </div>
                                </div>
                            </div>

                            <div v-if="step.fields?.length" class="space-y-3 pl-4 border-l border-gray-800">
                                <WorkflowFieldInput v-for="field in step.fields" :key="fieldKey(field)" :field="field"
                                    :modelValue="stepValues[step.name]?.[fieldKey(field)]"
                                    @update:modelValue="(v: any) => setFieldValue(step.name, field, v)" />
                            </div>
                            <div v-else class="text-xs text-opposite/40 pl-4">
                                No configuration needed for this step.
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 pt-2">
                        <AppButton buttonStyle="secondary" type="button" @click="back">
                            Back
                        </AppButton>
                        <Can :subject="'workflows'" :actions="['update']">
                            <AppButton buttonStyle="primary" type="button" @click="save" :loading="isSaving">
                                Save
                            </AppButton>
                        </Can>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import Can from '@/components/Can.vue'
import WorkflowFieldInput from './WorkflowFieldInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getAvailableWorkflows,
    getConnectors,
    getConnectorTypes,
    getWorkflowById,
    updateWorkflow,
    type Connector,
    type ConnectorTypeConfig,
} from '@/components/automation/endpoints'
import type {
    AvailableWorkflow,
    Workflow,
    WorkflowFieldConfig,
    WorkflowStep,
} from '@/components/automation/workflow.interface'

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '/automation/workflows' },
    { name: 'View', path: '' },
]

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const isSaving = ref(false)
const workflow = ref<Workflow | null>(null)
const availableTypes = ref<AvailableWorkflow[]>([])
const connectors = ref<Connector[]>([])
const connectorTypes = ref<ConnectorTypeConfig[]>([])
const selectedConnectorIds = ref<string[]>([])
const stepValues = ref<Record<string, Record<string, any>>>({})

const typeConfig = computed<AvailableWorkflow | undefined>(() =>
    availableTypes.value.find((t) => t.name === workflow.value?.workflowType),
)

const fieldKey = (field: WorkflowFieldConfig) => field.name || field.label

const connectorTypeNames = computed(() => typeConfig.value?.connectorsNeeded || [])

const connectorTypeConfig = (typeName: string) =>
    connectorTypes.value.find((t) => t.name === typeName)

const connectorTypeDescription = (typeName: string) =>
    connectorTypeConfig(typeName)?.description || 'Connect this workflow to an existing account.'

const connectorTypeAllowsMultiple = (typeName: string) =>
    connectorTypeConfig(typeName)?.multiLink ?? false

const connectorsForType = (typeName: string) =>
    connectors.value.filter((connector) => connector.connectorTypeId === typeName)

const linkedWorkflowName = (connector: Connector) =>
    connector.linkedWorkflows?.find((linkedWorkflow) => linkedWorkflow.id !== workflow.value?.id)?.name || 'another workflow'

const connectorDisabled = (connector: Connector) => {
    if (connectorTypeAllowsMultiple(connector.connectorTypeId)) return false
    return !!connector.linkedWorkflows?.some((linkedWorkflow) => linkedWorkflow.id !== workflow.value?.id)
}

const toggleConnector = (connectorId: string, checked: boolean) => {
    if (checked) {
        if (!selectedConnectorIds.value.includes(connectorId)) {
            selectedConnectorIds.value = [...selectedConnectorIds.value, connectorId]
        }
        return
    }
    selectedConnectorIds.value = selectedConnectorIds.value.filter((id) => id !== connectorId)
}

const onConnectorToggle = (connectorId: string, event: Event) => {
    toggleConnector(connectorId, (event.target as HTMLInputElement).checked)
}

const defaultValueFor = (field: WorkflowFieldConfig) => {
    switch (field.type) {
        case 'boolean': return false
        case 'number': return null
        case 'select': return null
        case 'files': return null
        default: return ''
    }
}

const setFieldValue = (
    stepName: string,
    field: WorkflowFieldConfig,
    value: any,
) => {
    if (!stepValues.value[stepName]) stepValues.value[stepName] = {}
    stepValues.value[stepName][fieldKey(field)] = value
}

const initStepValues = () => {
    stepValues.value = {}
    const config = typeConfig.value
    if (!config) return
    const existingByStep = new Map(
        (workflow.value?.steps || []).map((s) => [s.name, s.values || {}]),
    )
    for (const step of config.steps || []) {
        const initial: Record<string, any> = {}
        const existing = existingByStep.get(step.name) || {}
        for (const field of step.fields || []) {
            const key = fieldKey(field)
            initial[key] = key in existing ? existing[key] : defaultValueFor(field)
        }
        stepValues.value[step.name] = initial
    }
}

const load = async () => {
    loading.value = true
    try {
        const id = route.params.id as string
        const [wf, types, existingConnectors, existingConnectorTypes] = await Promise.all([
            getWorkflowById(id, authStore),
            getAvailableWorkflows(authStore),
            getConnectors(authStore),
            getConnectorTypes(authStore),
        ])
        workflow.value = wf
        availableTypes.value = types
        connectors.value = existingConnectors || []
        connectorTypes.value = existingConnectorTypes || []
        selectedConnectorIds.value = wf.linkedConnectors?.map((connector) => connector.id) || []
        initStepValues()
    } catch {
        workflow.value = null
        toast.showToast('Error', 'Failed to load workflow', 'error')
    } finally {
        loading.value = false
    }
}

const back = () => {
    router.push('/automation/workflows')
}

// File objects can't be serialized by JSON; replace with a lightweight descriptor.
const serializeValue = (value: any) => {
    if (value instanceof File) {
        return { name: value.name, size: value.size, type: value.type }
    }
    return value
}

const buildSteps = (): WorkflowStep[] => {
    const config = typeConfig.value
    if (!config) return []
    return config.steps.map((step) => {
        const raw = stepValues.value[step.name] || {}
        const values: Record<string, any> = {}
        for (const [key, value] of Object.entries(raw)) {
            values[key] = serializeValue(value)
        }
        return { name: step.name, values }
    })
}

const validateRequired = (): string | null => {
    const config = typeConfig.value
    if (!config) return null
    for (const step of config.steps || []) {
        for (const field of step.fields || []) {
            if (!field.required) continue
            const value = stepValues.value[step.name]?.[fieldKey(field)]
            const missing =
                value === undefined ||
                value === null ||
                value === '' ||
                (field.type === 'boolean' && value === undefined)
            if (missing) {
                return `"${field.label}" is required in step "${step.name}"`
            }
        }
    }
    return null
}

const save = async () => {
    if (!workflow.value) return
    const err = validateRequired()
    if (err) {
        toast.showToast('Error', err, 'error')
        return
    }

    isSaving.value = true
    try {
        const updated = await updateWorkflow(
            workflow.value.id,
            { steps: buildSteps(), linkedConnectorIds: selectedConnectorIds.value },
            authStore,
        )
        workflow.value = updated
        selectedConnectorIds.value = updated.linkedConnectors?.map((connector) => connector.id) || []
        toast.showToast('Saved', 'Workflow updated successfully', 'success')
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to update workflow', 'error')
    } finally {
        isSaving.value = false
    }
}

onMounted(() => {
    load()
})
</script>
