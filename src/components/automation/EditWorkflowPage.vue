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
                            <div v-if="step.availableActions?.length" class="space-y-1 pl-4 border-l border-gray-800">
                                <div class="text-xs text-opposite/60">Action <span class="text-red-400">*</span></div>
                                <MultiSelect :modelValue="stepActions[step.name]" :values="step.availableActions"
                                    :display="(action: string) => action" placeholder="Select an action"
                                    @update:modelValue="(value: string[]) => addAction(step.name, value)" />
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
    WorkflowFieldConfig,
    WorkflowStep,
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
const stepActions = ref<Record<string, string[] | null>>({})

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
        stepActions.value[step.name] = existing?.allowedActions || []
    }
}

const addAction = (stepName: string, action: string[]) => {
    stepActions.value[stepName] = [...action]
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
        const selectedActions = stepActions.value[step.name]
        return {
            name: step.name,
            values,
            allowedActions: selectedActions || [],
        }
    })
}

const validateRequired = (): string | null => {
    const config = typeConfig.value
    if (!config) return null
    for (const step of config.steps || []) {
        if (step.availableActions?.length && !stepActions.value[step.name]) {
            return `An action is required in step "${step.name}"`
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
