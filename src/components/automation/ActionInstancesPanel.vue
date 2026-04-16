<template>
    <div class="bg-secondary rounded-lg border border-gray-800 p-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-opposite">Action Instances</h3>
            <button v-if="!showForm" type="button" @click="startAdd"
                class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <i class="fa-solid fa-plus"></i>
                Add Action
            </button>
        </div>

        <!-- Add/Edit Form -->
        <div v-if="showForm" class="border border-gray-700 rounded-lg p-4 space-y-4 mb-4">
            <h4 class="text-sm font-medium text-opposite">
                {{ editing ? 'Edit Action Instance' : 'New Action Instance' }}
            </h4>

            <div>
                <label class="block text-xs text-opposite/60 mb-1">Name <span class="text-red-400">*</span></label>
                <input v-model="formName" type="text" placeholder="e.g. Sync inventory daily"
                    :class="[INPUT_CLASS, 'w-full']" />
            </div>

            <div>
                <label class="block text-xs text-opposite/60 mb-1">Action <span class="text-red-400">*</span></label>
                <Select2 :modelValue="formAction" :values="availableActions" :display="(a: any) => a?.name || ''"
                    placeholder="Select action..." @update:modelValue="onActionSelected" />
            </div>

            <template v-if="selectedActionFields && Object.keys(selectedActionFields).length">
                <label class="block text-xs text-opposite/60">Action Configuration</label>
                <div v-for="(field, key) in selectedActionFields" :key="key" class="mb-2">
                    <label class="block text-xs text-opposite/60 mb-1">
                        {{ field.label }}
                        <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
                    </label>
                    <template v-if="field.type === 'json'">
                        <div class="space-y-2">
                            <div v-for="(row, idx) in getJsonRows(key as string)" :key="idx"
                                class="flex items-center gap-2">
                                <input :value="row.key"
                                    @input="(e: Event) => updateJsonRowKey(key as string, idx, (e.target as HTMLInputElement).value)"
                                    placeholder="Key" :class="[INPUT_CLASS, 'w-1/2 text-sm']" />
                                <input :value="row.value"
                                    @input="(e: Event) => updateJsonRowValue(key as string, idx, (e.target as HTMLInputElement).value)"
                                    placeholder="Value" :class="[INPUT_CLASS, 'w-1/2 text-sm']" />
                                <button type="button" @click="removeJsonRow(key as string, idx)"
                                    class="text-red-400 hover:text-red-300 shrink-0 px-1">
                                    <i class="fa-solid fa-xmark text-xs"></i>
                                </button>
                            </div>
                            <button type="button" @click="addJsonRow(key as string)"
                                class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <i class="fa-solid fa-plus"></i>
                                Add entry
                            </button>
                        </div>
                    </template>
                    <template v-else-if="field.options && field.options.length">
                        <Select2 :modelValue="formConfig[key as string] || null" :values="field.options"
                            :display="(o: any) => o?.label || o || ''" placeholder="Select..."
                            @update:modelValue="(val: any) => formConfig[key as string] = val?.value ?? val" />
                    </template>
                    <template v-else>
                        <input :type="field.type === 'number' ? 'number' : 'text'" :readonly="!!field.value"
                            :value="field.value ? field.value : formConfig[key as string]"
                            @input="(e: Event) => formConfig[key as string] = (e.target as HTMLInputElement).value"
                            :placeholder="field.label" :class="[INPUT_CLASS, 'w-full text-sm']" />
                    </template>
                </div>
            </template>

            <!-- Response Mapping -->
            <div class="border border-gray-700 rounded-lg p-3 mt-3">
                <div class="flex items-center justify-between mb-2">
                    <label class="text-xs text-opposite/60 font-medium">Response Mapping</label>
                    <button type="button" class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        @click="formResponseMapping.push({ mappedFrom: '', mappedTo: '' })">
                        <i class="fa-solid fa-plus"></i> Add Mapping
                    </button>
                </div>
                <div v-if="formResponseMapping.length === 0"
                    class="text-center py-3 text-opposite/30 text-xs border border-dashed border-gray-700 rounded">
                    No response mappings. Define how response fields map to named values.
                </div>
                <div v-else class="space-y-2">
                    <div v-for="(mapping, mIdx) in formResponseMapping" :key="mIdx" class="flex items-center gap-2">
                        <div class="flex-1">
                            <input v-model="mapping.mappedFrom" type="text"
                                placeholder="Response path (e.g. data.order.id)"
                                :class="[INPUT_CLASS, 'w-full text-xs']" />
                        </div>
                        <i class="fa-solid fa-arrow-right text-opposite/30 text-xs"></i>
                        <div class="flex-1">
                            <input v-model="mapping.mappedTo" type="text" placeholder="Mapped name (e.g. orderId)"
                                :class="[INPUT_CLASS, 'w-full text-xs']" />
                        </div>
                        <button type="button" @click="formResponseMapping.splice(mIdx, 1)"
                            class="text-red-400 hover:text-red-300 text-xs p-1">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
                <AppButton buttonStyle="secondary" type="button" @click="cancelForm">
                    Cancel
                </AppButton>
                <AppButton buttonStyle="primary" type="button" @click="save" :loading="isSaving">
                    {{ editing ? 'Update' : 'Create' }}
                </AppButton>
            </div>
        </div>

        <!-- List -->
        <div v-if="loadingList" class="flex items-center justify-center py-8">
            <Spinner width="2" height="2" />
        </div>
        <div v-else-if="instances.length === 0 && !showForm" class="text-center py-8 text-opposite/40 text-sm">
            No action instances configured yet.
        </div>
        <div v-else class="space-y-2">
            <div v-for="inst in instances" :key="inst.id"
                class="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">

                <div class="flex items-start gap-3 min-w-0">
                    <button @click="executeInstance(inst, undefined, true)"
                        v-if="inst.connectorTypeAction?.direction === 'outbound'"
                        class="text-green-400 hover:text-green-300 text-sm" :disabled="executingId === inst.id"
                        title="Execute action">
                        <span v-if="executingId === inst.id"><i class="fa-solid fa-spinner fa-spin"></i></span>
                        <span v-else><i class="fa-solid fa-play"></i></span>
                    </button>
                    <div class="min-w-0">
                        <span v-if="inst.connectorTypeAction?.direction === 'inbound'"
                            class="text-green-400 text-xs mb-1">Inbound Action, Can only receive data from the
                            connector</span>
                        <div class="text-sm text-opposite font-medium">{{ inst.name }}</div>
                        <div class="text-xs text-opposite/40 mt-0.5">
                            {{ inst.connectorTypeAction?.name }}
                        </div>
                        <div v-if="inst.actionConfig && Object.values(inst.actionConfig).filter((v: any) => !!v).length"
                            class="text-xs text-opposite/30 mt-1 flex flex-col">
                            <template v-for="[key, val] in Object.entries(inst.actionConfig).filter(([_, v]) => !!v)"
                                :key="key">
                                <template v-if="typeof val === 'object' && val !== null && !Array.isArray(val)">
                                    <div class="mr-3">{{ formatLabel(key as string) }}:</div>
                                    <div v-for="(v, k) in val" :key="k" class="ml-3 break-words break-all">
                                        {{ k }}: {{ v }}
                                    </div>
                                </template>
                                <div v-else class="mr-3 break-words break-all">
                                    {{ formatLabel(key as string) }}: {{ val }}
                                </div>
                            </template>
                        </div>
                        <div v-if="inst.connectorTypeAction?.fields && Object.keys(inst.connectorTypeAction?.fields).filter((f) => inst.connectorTypeAction?.fields?.[f]?.value).length"
                            class="text-xs text-opposite/30 mt-1 flex flex-col">
                            <div v-for="field in Object.keys(inst.connectorTypeAction?.fields).filter((f) => inst.connectorTypeAction?.fields?.[f]?.value)"
                                :key="field">
                                {{ field }}: {{ inst.connectorTypeAction?.fields?.[field]?.value?.replace('@@actionInstanceId@@', inst.id) }}
                            </div>
                        </div>
                        <div v-if="getResponseJson(inst)" class="mt-2">
                            <button @click="toggleResponse(inst.id)"
                                class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <i :class="expandedResponses[inst.id] ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'"
                                    class="text-[10px]"></i>
                                {{ testResponses[inst.id] ? 'Test Response' : 'Last Response' }}
                            </button>
                            <pre v-if="expandedResponses[inst.id]"
                                class="mt-1 text-xs text-opposite/50 bg-gray-900 rounded p-2 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                        {{ JSON.stringify(getResponseJson(inst), null, 2) }}</pre>
                        </div>
                        <button v-if="inst.connectorTypeAction.direction == 'inbound'"
                            @click="openResponses(inst)"
                            class="mt-1 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <i class="fa-solid fa-list"></i>
                            View Responses
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">

                    <button @click="startEdit(inst)" class="text-blue-400 hover:text-blue-300 text-sm">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button @click="confirmDelete(inst)" class="text-red-400 hover:text-red-300 text-sm">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Spinner from '@/components/Spinner.vue'
import AppButton from '@/components/AppButton.vue'
import Select2 from '@/components/Select2.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import {
    getActionInstances,
    createActionInstance,
    updateActionInstance,
    deleteActionInstance,
    executeConnectorAction,
} from '@/components/fleet/endpoints'
import type { ConnectorActionInstance, ConnectorTypeAction } from '@/components/fleet/endpoints'
import ExecuteFieldsDialog from './ExecuteFieldsDialog.vue'
import ActionInstanceResponsesDialog from './ActionInstanceResponsesDialog.vue'
import { INPUT_CLASS } from '@/components/contants'

const props = defineProps<{
    connectorId: string
    availableActions: ConnectorTypeAction[]
    showFormOnMount?: boolean
}>()

const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const instances = ref<ConnectorActionInstance[]>([])
const loadingList = ref(false)

const showForm = ref(false)
const editing = ref<ConnectorActionInstance | null>(null)
const isSaving = ref(false)
const formName = ref('')
const formAction = ref<ConnectorTypeAction | null>(null)
const formConfig = ref<Record<string, any>>({})
const formResponseMapping = ref<{ mappedFrom: string; mappedTo: string }[]>([])

const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^\w/, c => c.toUpperCase()).trim()

const selectedActionFields = computed(() => formAction.value?.fields || null)

const jsonRows = reactive<Record<string, { key: string; value: string }[]>>({})

const getJsonRows = (fieldKey: string): { key: string; value: string }[] => {
    if (!jsonRows[fieldKey]) jsonRows[fieldKey] = []
    return jsonRows[fieldKey]
}

const addJsonRow = (fieldKey: string) => {
    if (!jsonRows[fieldKey]) jsonRows[fieldKey] = []
    jsonRows[fieldKey].push({ key: '', value: '' })
}

const removeJsonRow = (fieldKey: string, idx: number) => {
    jsonRows[fieldKey]?.splice(idx, 1)
    syncJsonRowsToConfig(fieldKey)
}

const updateJsonRowKey = (fieldKey: string, idx: number, val: string) => {
    if (jsonRows[fieldKey]?.[idx]) {
        jsonRows[fieldKey][idx].key = val
        syncJsonRowsToConfig(fieldKey)
    }
}

const updateJsonRowValue = (fieldKey: string, idx: number, val: string) => {
    if (jsonRows[fieldKey]?.[idx]) {
        jsonRows[fieldKey][idx].value = val
        syncJsonRowsToConfig(fieldKey)
    }
}

const syncJsonRowsToConfig = (fieldKey: string) => {
    const rows = jsonRows[fieldKey] || []
    const obj: Record<string, string> = {}
    for (const row of rows) {
        if (row.key.trim()) obj[row.key.trim()] = row.value
    }
    formConfig.value[fieldKey] = Object.keys(obj).length > 0 ? obj : undefined
}

const initJsonRowsFromConfig = (fieldKey: string) => {
    const existing = formConfig.value[fieldKey]
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
        jsonRows[fieldKey] = Object.entries(existing).map(([k, v]) => ({
            key: k,
            value: String(v ?? ''),
        }))
    } else {
        jsonRows[fieldKey] = []
    }
}

const resetJsonRows = () => {
    for (const key of Object.keys(jsonRows)) delete jsonRows[key]
}

const onActionSelected = (val: ConnectorTypeAction | null) => {
    formAction.value = val
    formConfig.value = {}
    resetJsonRows()
}

const startAdd = () => {
    editing.value = null
    formName.value = ''
    formAction.value = null
    formConfig.value = {}
    formResponseMapping.value = []
    resetJsonRows()
    showForm.value = true
}

const startEdit = (inst: ConnectorActionInstance) => {
    editing.value = inst
    formName.value = inst.name
    formAction.value = props.availableActions.find(a => a.id === inst.connectorTypeActionId) || null
    formConfig.value = inst.actionConfig ? { ...inst.actionConfig } : {}

    formResponseMapping.value = inst.responseMapping
        ? inst.responseMapping.map(m => ({ ...m }))
        : []
    resetJsonRows()
    const fields = formAction.value?.fields
    if (fields) {
        for (const [key, field] of Object.entries(fields)) {
            if (field.type === 'json') initJsonRowsFromConfig(key)
        }
    }
    showForm.value = true
}

const cancelForm = () => {
    showForm.value = false
    editing.value = null
}

const save = async () => {
    if (!formName.value.trim()) {
        toast.showToast('Error', 'Name is required', 'error')
        return
    }
    if (!formAction.value) {
        toast.showToast('Error', 'Action is required', 'error')
        return
    }

    const fields = selectedActionFields.value
    if (fields) {
        for (const [key, field] of Object.entries(fields)) {
            if (field.type === 'json') {
                const rows = jsonRows[key] || []
                for (const row of rows) {
                    const hasKey = row.key.trim() !== ''
                    const hasValue = row.value.trim() !== ''
                    if (hasKey !== hasValue) {
                        toast.showToast('Error', `${field.label}: each entry must have both a key and a value`, 'error')
                        return
                    }
                }
                if (field.required) {
                    const validRows = rows.filter(r => r.key.trim() && r.value.trim())
                    if (validRows.length === 0) {
                        toast.showToast('Error', `${field.label} requires at least one key-value entry`, 'error')
                        return
                    }
                }
            } else if (field.required && !formConfig.value[key]?.toString().trim()) {
                toast.showToast('Error', `${field.label} is required`, 'error')
                return
            }
        }
    }

    isSaving.value = true
    try {
        const config = Object.keys(formConfig.value).length > 0 ? formConfig.value : undefined
        const mapping = formResponseMapping.value.filter(m => m.mappedFrom.trim() && m.mappedTo.trim())

        if (editing.value) {
            await updateActionInstance(
                props.connectorId,
                editing.value.id,
                {
                    name: formName.value.trim(),
                    connectorTypeActionId: formAction.value.id,
                    actionConfig: config ?? null,
                    responseMapping: mapping.length > 0 ? mapping : null,
                },
                authStore
            )
            toast.showToast('Updated', 'Action instance updated', 'success')
        } else {
            await createActionInstance(
                props.connectorId,
                {
                    name: formName.value.trim(),
                    connectorTypeActionId: formAction.value.id,
                    actionConfig: config,
                    responseMapping: mapping.length > 0 ? mapping : undefined,
                },
                authStore
            )
            toast.showToast('Created', 'Action instance created', 'success')
        }
        showForm.value = false
        editing.value = null
        await loadInstances()
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to save action instance', 'error')
    } finally {
        isSaving.value = false
    }
}

const executingId = ref<string | null>(null)
const isTestRun = ref(false)
const testResponses = reactive<Record<string, Record<string, any>>>({})
const expandedResponses = reactive<Record<string, boolean>>({})

const getResponseJson = (inst: ConnectorActionInstance): Record<string, any> | null => {
    if (testResponses[inst.id]) return testResponses[inst.id]
    if (inst.response?.responseJson) return inst.response.responseJson
    return null
}

const toggleResponse = (id: string) => {
    expandedResponses[id] = !expandedResponses[id]
}



const executeInstance = async (inst: ConnectorActionInstance, fields?: Record<string, string>, test = false) => {
    executingId.value = inst.id
    isTestRun.value = test
    try {
        const payload: { fields?: Record<string, string>; test?: boolean } = {}
        if (fields) payload.fields = fields
        if (test) payload.test = true

        const result = await executeConnectorAction(inst.id, payload, authStore)

        if (result?.requiresFields && result.variables?.length) {
            dialog.openDialog(ExecuteFieldsDialog, {
                variables: result.variables,
                onConfirm: async (filledFields: Record<string, string>) => {
                    dialog.closeDialog()
                    await executeInstance(inst, filledFields, test)
                },
                onCancel: () => {
                    dialog.closeDialog()
                },
            })
            return
        }

        if (test) {
            testResponses[inst.id] = result?.responseJson ?? result ?? {}
            expandedResponses[inst.id] = true
        } else {
            delete testResponses[inst.id]
            await loadInstances()
            expandedResponses[inst.id] = true
            toast.showToast('Success', 'Action executed and response saved', 'success')
        }
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to execute action', 'error')
    } finally {
        executingId.value = null
        isTestRun.value = false
    }
}

const openResponses = (inst: ConnectorActionInstance) => {
    dialog.openDialog(ActionInstanceResponsesDialog, {
        instanceId: inst.id,
        instanceName: inst.name,
        onClose: () => dialog.closeDialog(),
    })
}

const confirmDelete = (inst: ConnectorActionInstance) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete action instance "${inst.name}"?`,
        onConfirm: async () => {
            try {
                await deleteActionInstance(props.connectorId, inst.id, authStore)
                toast.showToast('Deleted', 'Action instance deleted', 'success')
                await loadInstances()
            } catch {
                toast.showToast('Error', 'Failed to delete action instance', 'error')
            }
        },
        onCancel: () => { },
    })
}

const loadInstances = async () => {
    loadingList.value = true
    try {
        instances.value = await getActionInstances(props.connectorId, authStore)
    } catch {
        instances.value = []
    } finally {
        loadingList.value = false
    }
}

watch(() => props.connectorId, () => {
    if (props.connectorId) loadInstances()
})

onMounted(async () => {
    if (props.connectorId) {
        await loadInstances()
        if (props.showFormOnMount) startAdd()
    }
})
</script>
