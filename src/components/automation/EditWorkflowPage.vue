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
                        <h1 class="text-2xl font-medium text-opposite">
                            {{ capitalizeFirstLetter(workflow.name) }}
                        </h1>
                        <span class="text-base text-opposite/60 ml-2">{{ workflow.workflowType }}</span>

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
                                <Select2 :modelValue="selectedConnectorForType(typeName)"
                                    :values="connectorOptionsForType(typeName)" :display="displayConnectorOption"
                                    :placeholder="`Select ${typeName} connector...`" :optional="true"
                                    @update:modelValue="(connector: Connector | null) => onConnectorSelect(typeName, connector)" />
                                <div v-if="selectedConnectorForType(typeName) && connectorDisabled(selectedConnectorForType(typeName)!)"
                                    class="text-xs text-opposite/50">
                                    Linked to {{ linkedWorkflowName(selectedConnectorForType(typeName)!) }}
                                </div>
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
                            <div v-if="step.availableActions?.length" class="space-y-3 pl-4 border-l border-gray-800">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <div class="text-xs text-opposite/60">Available actions <span
                                                class="text-red-400">*</span></div>
                                        <p class="text-xs text-opposite/40 mt-0.5">
                                            Add each action once, then choose the information it should collect.
                                        </p>
                                        <p v-if="step.availableActions?.length && !selectableActionNamesForStep(step).length"
                                            class="text-xs text-amber-500/90 mt-1">
                                            Link the connectors above to enable actions for this step.
                                        </p>
                                    </div>
                                    <button type="button" class="text-xs text-primary hover:underline"
                                        :disabled="!canAddAction(step)"
                                        :class="{ 'opacity-40 cursor-not-allowed': !canAddAction(step) }"
                                        @click="addActionEntry(step.name)">
                                        Add action
                                    </button>
                                </div>

                                <div v-for="(entry, actionIndex) in stepActions[step.name]"
                                    :key="`${step.name}-${actionIndex}-${entry.action || 'new'}`"
                                    class="bg-secondary rounded-lg border border-gray-800 p-3 space-y-3">
                                    <div class="flex items-start gap-3">
                                        <div class="flex-1">
                                            <Select2 :modelValue="entry.action"
                                                :values="availableActionsForEntry(step, actionIndex)"
                                                :display="(action: string) => action" placeholder="Select an action"
                                                @update:modelValue="(action: string | null) => setActionEntry(step, actionIndex, action)" />
                                        </div>
                                        <button v-if="stepActions[step.name]?.length > 1" type="button"
                                            class="text-xs text-red-400 hover:underline pt-3"
                                            @click="removeActionEntry(step.name, actionIndex)">
                                            Remove
                                        </button>
                                    </div>

                                    <div v-if="entry.action" class="space-y-1">
                                        <div class="text-xs text-opposite/60">Required information <span
                                                class="text-red-400">*</span></div>
                                        <MultiSelect :modelValue="entry.requiredInformation"
                                            :values="requiredInformationForAction(step, entry.action)"
                                            :display="(info: string) => info" placeholder="Select required information"
                                            @update:modelValue="(value: string[]) => setActionRequiredInformation(step.name, actionIndex, value)" />
                                    </div>
                                </div>
                            </div>
                            <div v-if="!step.fields?.length && !step.availableActions?.length"
                                class="text-xs text-opposite/40 pl-4">
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
import Select2 from '@/components/Select2.vue'
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
    WorkflowActionConfig,
    WorkflowAllowedActions,
    WorkflowFieldConfig,
    WorkflowStep,
    WorkflowStepConfig,
} from '@/components/automation/workflow.interface'
import { capitalizeFirstLetter } from '@/util/util'
import MultiSelect from '../MultiSelect.vue'

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
type WorkflowStepActionEntry = {
    action: string | null
    requiredInformation: string[]
}

const stepActions = ref<Record<string, WorkflowStepActionEntry[]>>({})

const typeConfig = computed<AvailableWorkflow | undefined>(() =>
    availableTypes.value.find((t) => t.name === workflow.value?.workflowType),
)

const fieldKey = (field: WorkflowFieldConfig) => field.name || field.label

const actionName = (action: WorkflowActionConfig | string) =>
    typeof action === 'string' ? action : action.name

const actionRequiredInformation = (action: WorkflowActionConfig | string) =>
    typeof action === 'string' ? [] : action.requiredInformation || []

const configuredAction = (step: WorkflowStepConfig, name: string | null) =>
    (step.availableActions || []).find((action) => actionName(action) === name)

const selectedActionNames = (stepName: string, exceptIndex?: number) =>
    new Set(
        (stepActions.value[stepName] || [])
            .filter((_, index) => index !== exceptIndex)
            .map((entry) => entry.action)
            .filter(Boolean),
    )

/** Connector type IDs (e.g. Gmail) covered by the workflow’s linked connectors. */
const selectedConnectorTypeIds = computed(() => {
    const ids = new Set<string>()
    for (const id of selectedConnectorIds.value) {
        const c = connectors.value.find((item) => item.id === id)
        if (c?.connectorTypeId) ids.add(c.connectorTypeId)
    }
    return ids
})

const actionConnectorsNeeded = (step: WorkflowStepConfig, name: string | null) => {
    if (!name) return [] as string[]
    const action = configuredAction(step, name)
    if (!action || typeof action === 'string') return []
    return action.connectorsNeeded || []
}

const actionAllowedByLinkedConnectors = (step: WorkflowStepConfig, name: string) => {
    const needed = actionConnectorsNeeded(step, name)
    if (!needed.length) return true
    const linked = selectedConnectorTypeIds.value
    return needed.every((type) => linked.has(type))
}

const selectableActionNamesForStep = (step: WorkflowStepConfig) =>{
   return  (step.availableActions || [])
        .map(actionName)
        .filter((name) => actionAllowedByLinkedConnectors(step, name))
}

const availableActionsForEntry = (step: WorkflowStepConfig, index: number) => {
    const selected = selectedActionNames(step.name, index)
    const currentAction = stepActions.value[step.name]?.[index]?.action ?? null
    return (step.availableActions || [])
        .map(actionName)
        .filter((name) => !selected.has(name))
        .filter(
            (name) =>
                actionAllowedByLinkedConnectors(step, name) || name === currentAction,
        )
}

const requiredInformationForAction = (step: WorkflowStepConfig, name: string) => {
    const action = configuredAction(step, name)
    return action ? actionRequiredInformation(action) : []
}

const canAddAction = (step: WorkflowStepConfig) => {
    const selected = selectedActionNames(step.name)
    const selectable = selectableActionNamesForStep(step)
    return selectable.some((name) => !selected.has(name))
}

const connectorTypeNames = computed(() => typeConfig.value?.connectorsNeeded || [])

const connectorTypeConfig = (typeName: string) =>
    connectorTypes.value.find((t) => t.name === typeName)

const connectorTypeDescription = (typeName: string) =>
    connectorTypeConfig(typeName)?.description || 'Connect this workflow to an existing account.'

const connectorTypeAllowsMultiple = (typeName: string) =>
    connectorTypeConfig(typeName)?.multiLink ?? false

const connectorsForType = (typeName: string) =>
    connectors.value.filter((connector) => connector.connectorTypeId === typeName)

const displayConnectorOption = (connector: Connector | null) =>
    connector ? `${connector.name} (${connector.primaryIdentifier || connector.status})` : ''

const linkedWorkflowName = (connector: Connector) =>
    connector.linkedWorkflows?.find((linkedWorkflow) => linkedWorkflow.id !== workflow.value?.id)?.name || 'another workflow'

const connectorDisabled = (connector: Connector) => {
    if (connectorTypeAllowsMultiple(connector.connectorTypeId)) return false
    return !!connector.linkedWorkflows?.some((linkedWorkflow) => linkedWorkflow.id !== workflow.value?.id)
}

const selectedConnectorForType = (typeName: string) => {
    const selectedIds = new Set(selectedConnectorIds.value)
    return connectorsForType(typeName).find((connector) => selectedIds.has(connector.id)) || null
}

const connectorOptionsForType = (typeName: string) => {
    const selected = selectedConnectorForType(typeName)
    return connectorsForType(typeName).filter((connector) =>
        !connectorDisabled(connector) || connector.id === selected?.id,
    )
}

const onConnectorSelect = (typeName: string, connector: Connector | null) => {
    const selectedId = connector?.id
    const retainedIds = selectedConnectorIds.value.filter((id) => {
        const existing = connectors.value.find((item) => item.id === id)
        return existing?.connectorTypeId !== typeName
    })
    selectedConnectorIds.value = selectedId ? [...retainedIds, selectedId] : retainedIds
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

const normalizeAllowedActions = (
    allowedActions: WorkflowStep['allowedActions'],
    step: WorkflowStepConfig,
): WorkflowStepActionEntry[] => {
    if (Array.isArray(allowedActions)) {
        return allowedActions.map((action) => ({
            action,
            requiredInformation: requiredInformationForAction(step, action),
        }))
    }

    if (allowedActions && typeof allowedActions === 'object') {
        return Object.entries(allowedActions).map(([action, config]) => ({
            action,
            requiredInformation: config.requiredInformation || [],
        }))
    }

    return (step.availableActions || []).map((action) => ({
        action: action.name,
        requiredInformation: action.requiredInformation || [],
    }))
}

const initStepValues = () => {
    stepValues.value = {}
    stepActions.value = {}
    const config = typeConfig.value
    if (!config) return
    const existingByStep = new Map<string, WorkflowStep>(
        (workflow.value?.steps || []).map((s) => [s.name, s]),
    )
    for (const step of config.steps || []) {
        const initial: Record<string, any> = {}
        const existing = existingByStep.get(step.name)
        const existingValues = existing?.values || {}
        for (const field of step.fields || []) {
            const key = fieldKey(field)
            initial[key] = key in existingValues ? existingValues[key] : defaultValueFor(field)
        }
        stepValues.value[step.name] = initial
        stepActions.value[step.name] = normalizeAllowedActions(existing?.allowedActions, step)
    }
}

const addActionEntry = (stepName: string) => {
    stepActions.value[stepName] = [
        ...(stepActions.value[stepName] || []),
        { action: null, requiredInformation: [] },
    ]
}

const removeActionEntry = (stepName: string, index: number) => {
    stepActions.value[stepName] = (stepActions.value[stepName] || []).filter((_, i) => i !== index)
}

const setActionEntry = (
    step: WorkflowStepConfig,
    index: number,
    action: string | null,
) => {
    const entries = [...(stepActions.value[step.name] || [])]
    entries[index] = {
        action,
        requiredInformation: [],
    }
    stepActions.value[step.name] = entries
}

const setActionRequiredInformation = (
    stepName: string,
    index: number,
    requiredInformation: string[],
) => {
    const entries = [...(stepActions.value[stepName] || [])]
    if (!entries[index]) return
    entries[index] = {
        ...entries[index],
        requiredInformation: [...requiredInformation],
    }
    stepActions.value[stepName] = entries
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
        const allowedActions: WorkflowAllowedActions = {}
        for (const entry of stepActions.value[step.name] || []) {
            if (!entry.action) continue
            allowedActions[entry.action] = {
                requiredInformation: [...entry.requiredInformation],
            }
        }
        return {
            name: step.name,
            values,
            allowedActions,
        }
    })
}

const validateRequired = (): string | null => {
    const config = typeConfig.value
    if (!config) return null
    for (const step of config.steps || []) {

        const actionNames = (stepActions.value[step.name] || [])
            .map((entry) => entry.action)
            .filter(Boolean)
        if (new Set(actionNames).size !== actionNames.length) {
            return `Each action can only be selected once in step "${step.name}"`
        }
        for (const entry of stepActions.value[step.name] || []) {
            if (!entry.action) continue
            if (!actionAllowedByLinkedConnectors(step, entry.action)) {
                const needed = actionConnectorsNeeded(step, entry.action)
                return `Link ${needed.join(', ')} for action "${entry.action}" in step "${step.name}" (or pick another action)`
            }
            if (requiredInformationForAction(step, entry.action).length && !entry.requiredInformation.length) {
                return `Required information is required for action "${entry.action}" in step "${step.name}"`
            }
        }
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
        router.push(`/automation/workflows`)
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
