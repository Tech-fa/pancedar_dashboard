<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />
        <div class="px-6 pb-6 pt-4">
            <div v-if="pageLoading" class="flex items-center justify-center py-24">
                <Spinner width="3" height="3" />
            </div>

            <div v-else class="max-w-7xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-opposite">
                        {{ isEditing ? 'Edit Checklist' : 'New Checklist' }}
                    </h3>
                </div>

                <div class="bg-secondary rounded-lg border border-gray-800 p-6 space-y-6">
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-opposite mb-1">Checklist Name</label>
                            <AppInput v-model="builderName" type="text" placeholder="Enter checklist name" hideIcon
                                class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-opposite mb-1">Description</label>
                            <AppInput v-model="builderDescription" type="text"
                                placeholder="Enter description (optional)" hideIcon class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-opposite mb-1">Type</label>
                            <Select2 :modelValue="typeOptions.find(o => o.value === builderType) || null"
                                :values="typeOptions" :display="(o: any) => o?.label || ''" placeholder="Select type..."
                                :disabled="isEditing"
                                @update:modelValue="(val: any) => builderType = val?.value || 'PRE_JOB'" />
                        </div>
                    </div>

                    <div class="border-t border-gray-700 pt-6">
                        <div class="flex items-center justify-between mb-4">
                            <label class="block text-sm font-medium text-opposite">Checklist Items</label>
                            <AppButton buttonStyle="void" @click="addItem" type="button"
                                class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <i class="fa-solid fa-plus"></i>
                                Add Item
                            </AppButton>
                        </div>

                        <div v-if="builderItems.length === 0"
                            class="text-center py-8 text-opposite/40 border border-dashed border-gray-700 rounded-lg">
                            No items yet. Click "Add Item" to get started.
                        </div>

                        <div v-else class="space-y-3">
                            <div v-for="(item, index) in builderItems" :key="index"
                                class="bg-main rounded-lg border border-gray-700 p-3 relative">
                                <AppButton buttonStyle="void" @click="removeItem(index)" type="button"
                                    class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs hover:bg-red-400">
                                    <i class="fa-solid fa-times"></i>
                                </AppButton>
                                <div class="text-xs text-opposite/40 mb-1">Step {{ index + 1 }}</div>
                                <div class="grid grid-cols-2 gap-3 mb-2">
                                    <AppInput v-model="item.name" type="text" placeholder="Item name" hideIcon
                                        class="w-full text-sm" />
                                    <AppInput v-model="item.description" type="text"
                                        placeholder="Description (optional)" hideIcon class="w-full text-sm" />
                                </div>

                                <!-- Input Type Toggle -->
                                <div class="mb-3">
                                    <label class="block text-xs text-opposite/60 mb-1">Input Type</label>
                                    <div class="flex items-center gap-2">
                                        <button type="button"
                                            class="px-3 py-1 text-xs rounded-md border transition-colors" :class="item.inputType === 'manual'
                                                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                                : 'border-gray-600 text-opposite/50 hover:border-gray-500'"
                                            @click="switchInputType(item, 'manual')">
                                            Manual Fields
                                        </button>
                                        <button type="button"
                                            class="px-3 py-1 text-xs rounded-md border transition-colors" :class="item.inputType === 'connector'
                                                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                                : 'border-gray-600 text-opposite/50 hover:border-gray-500'"
                                            @click="switchInputType(item, 'connector')">
                                            Connector
                                        </button>
                                    </div>
                                </div>

                                <!-- Connector Mode -->
                                <template v-if="item.inputType === 'connector'">
                                    <ConnectorActionPicker :connectors="connectors"
                                        :selectedConnector="item.selectedConnector"
                                        :selectedActionInstance="item.selectedActionInstance"
                                        :variableBindings="item.variableBindings"
                                        :injectable-options="injectableOptions"
                                        :response-options="getPreviousStepResponseOptions(index)"
                                        @update:selectedConnector="(val: any) => onConnectorSelected(item, val)"
                                        @update:selectedActionInstance="(val: any) => onActionInstanceSelected(item, val)"
                                        @update:variableBindings="(val: any) => item.variableBindings = val"
                                        @reload-connectors="reloadConnectors" />
                                </template>

                                <!-- Manual Fields Mode -->
                                <template v-if="item.inputType === 'manual'">
                                    <div class="border border-gray-700 rounded-lg p-3">
                                        <div class="flex items-center justify-between mb-2">
                                            <label class="text-xs text-opposite/60 font-medium">Dynamic Fields</label>
                                            <AppButton buttonStyle="void" @click="addDynamicField(item)" type="button"
                                                class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                                <i class="fa-solid fa-plus"></i>
                                                Add Field
                                            </AppButton>
                                        </div>

                                        <div v-if="item.dynamicFields.length === 0"
                                            class="text-center py-4 text-opposite/30 text-xs border border-dashed border-gray-700 rounded">
                                            No fields yet. Click "Add Field" to define what the pilot fills in.
                                        </div>

                                        <div v-else class="space-y-2">
                                            <div v-for="(df, dfIndex) in item.dynamicFields" :key="dfIndex"
                                                class="bg-secondary rounded border border-gray-600 p-2">
                                                <div class="flex items-center gap-2">
                                                    <div class="flex-1 grid grid-cols-3 gap-2">
                                                        <AppInput v-model="df.name" type="text" placeholder="Field name"
                                                            hideIcon class="w-full text-xs" />
                                                        <Select2
                                                            :modelValue="dynamicFieldTypeOptions.find(o => o.value === df.type) || null"
                                                            :values="dynamicFieldTypeOptions"
                                                            :display="(o: any) => o?.label || ''" placeholder="Type..."
                                                            @update:modelValue="(val: any) => onDynamicFieldTypeChanged(df, val?.value || 'text')" />
                                                        <div class="flex items-center gap-2">
                                                            <label
                                                                class="flex items-center gap-1 text-xs text-opposite/60 cursor-pointer">
                                                                <input type="checkbox" v-model="df.required"
                                                                    class="rounded border-gray-600 text-blue-500 focus:ring-blue-500 h-3 w-3" />
                                                                Required
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <AppButton v-if="dfIndex > 0" buttonStyle="void"
                                                            @click="moveDynamicField(item, dfIndex, -1)" type="button"
                                                            class="text-xs text-opposite/40 hover:text-opposite p-0.5">
                                                            <i class="fa-solid fa-arrow-up"></i>
                                                        </AppButton>
                                                        <AppButton v-if="dfIndex < item.dynamicFields.length - 1"
                                                            buttonStyle="void"
                                                            @click="moveDynamicField(item, dfIndex, 1)" type="button"
                                                            class="text-xs text-opposite/40 hover:text-opposite p-0.5">
                                                            <i class="fa-solid fa-arrow-down"></i>
                                                        </AppButton>
                                                        <AppButton buttonStyle="void"
                                                            @click="removeDynamicField(item, dfIndex)" type="button"
                                                            class="text-xs text-red-400 hover:text-red-300 p-0.5">
                                                            <i class="fa-solid fa-trash"></i>
                                                        </AppButton>
                                                    </div>
                                                </div>
                                                <div v-if="df.type === 'options'" class="mt-2">
                                                    <label class="block text-xs text-opposite/50 mb-1">Options (one per
                                                        line)</label>
                                                    <textarea :value="(df.options || []).join('\n')"
                                                        @input="(e: Event) => df.options = (e.target as HTMLTextAreaElement).value.split('\n').filter(s => s.trim())"
                                                        placeholder="Option 1&#10;Option 2&#10;Option 3" rows="3"
                                                        class="w-full rounded-md border border-gray-600 bg-main text-opposite text-xs px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>

                                <div class="flex items-center gap-2 mt-2">
                                    <AppButton v-if="index > 0" buttonStyle="void" @click="moveItem(index, -1)"
                                        type="button" class="text-xs text-opposite/40 hover:text-opposite">
                                        <i class="fa-solid fa-arrow-up"></i>
                                    </AppButton>
                                    <AppButton v-if="index < builderItems.length - 1" buttonStyle="void"
                                        @click="moveItem(index, 1)" type="button"
                                        class="text-xs text-opposite/40 hover:text-opposite">
                                        <i class="fa-solid fa-arrow-down"></i>
                                    </AppButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 border-t border-gray-700 pt-4">
                        <AppButton buttonStyle="secondary" type="button"
                            @click="router.push(jobTypeId ? `/fleet/job-types/${jobTypeId}` : '/automation/checklists')">
                            Cancel
                        </AppButton>
                        <AppButton buttonStyle="primary" type="button" @click="saveChecklist" :loading="isSaving">
                            {{ isEditing ? 'Update Checklist' : 'Create Checklist' }}
                        </AppButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import BreadCrums from '@/components/breadCrums.vue'
import Select2 from '@/components/Select2.vue'
import Spinner from '@/components/Spinner.vue'
import ConnectorActionPicker from '@/components/ConnectorActionPicker.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getChecklistById,
    createStandaloneChecklist,
    createChecklist,
    updateChecklistById,
    getConnectors,
    getInjectables,
} from '@/components/fleet/endpoints'
import type {
    Checklist,
    Connector,
    ConnectorActionInstance,
    DynamicFieldType,
    InjectableModule,
    VariableBinding,
} from '@/components/fleet/endpoints'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const pageLoading = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const editingChecklist = ref<Checklist | null>(null)
const jobTypeId = computed(() => (route.query.jobTypeId as string) || null)

const connectors = ref<Connector[]>([])

const builderName = ref('')
const builderDescription = ref('')
const builderType = ref<'PRE_JOB' | 'POST_JOB'>('PRE_JOB')

const typeOptions = [
    { value: 'PRE_JOB', label: 'Pre-Job' },
    { value: 'POST_JOB', label: 'Post-Job' },
]

const dynamicFieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'options', label: 'Options' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'file', label: 'File' },
]

interface BuilderDynamicField {
    name: string
    type: DynamicFieldType
    options: string[]
    required: boolean
}

interface BuilderItem {
    name: string
    description: string
    inputType: 'connector' | 'manual'
    selectedConnector: Connector | null
    selectedActionInstance: ConnectorActionInstance | null
    variables: string[]
    variableBindings: Record<string, VariableBinding>
    loadingVariables: boolean
    dynamicFields: BuilderDynamicField[]
}

const builderItems = ref<BuilderItem[]>([])
const injectableModules = ref<Record<string, InjectableModule>>({})

const crumbs = computed(() => {
    if (jobTypeId.value) {
        return [
            { name: 'Job Types', path: '/fleet/job-types', icon: 'fa-solid fa-tags text-neutral-700 text-2xl' },
            { name: 'Checklists', path: '' },
            { name: isEditing.value ? 'Edit Checklist' : 'New Checklist', path: '' },
        ]
    }
    return [
        { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
        { name: 'Checklists', path: '/automation/checklists' },
        { name: isEditing.value ? 'Edit Checklist' : 'New Checklist', path: '' },
    ]
})

const injectableOptions = computed(() => {
    const options: { module: string; property: string; label: string }[] = []
    for (const [moduleName, mod] of Object.entries(injectableModules.value)) {
        for (const prop of mod.properties) {
            options.push({
                module: moduleName,
                property: prop.key,
                label: `${mod.label} → ${prop.label}`,
            })
        }
    }
    return options
})

const getPreviousStepResponseOptions = (itemIndex: number): { sourceId: string; sourceType: string; source: string; step: string }[] => {
    if (itemIndex <= 0) return []
    const prevItem = builderItems.value[itemIndex - 1]
    if (!prevItem?.selectedActionInstance?.responseMapping) return []
    return prevItem.selectedActionInstance.responseMapping.map(m => ({
        sourceId: prevItem.selectedActionInstance?.id || '',
        sourceType: 'Response',
        source: 'ConnectorActionInstance',
        step: `${itemIndex}`,
    }))
}

const reloadConnectors = async () => {
    await loadConnectors()
    for (const item of builderItems.value) {
        if (item.selectedConnector) {
            const updated = connectors.value.find(c => c.id === item.selectedConnector!.id)
            if (updated) {
                item.selectedConnector = updated
                if (item.selectedActionInstance) {
                    item.selectedActionInstance = updated.actionInstances?.find(
                        ai => ai.id === item.selectedActionInstance!.id
                    ) || null
                }
            }
        }
    }
}

const onActionInstanceSelected = (item: BuilderItem, val: ConnectorActionInstance | null) => {
    item.selectedActionInstance = val
}

const onConnectorSelected = (item: BuilderItem, val: Connector | null) => {
    item.selectedConnector = val
    item.selectedActionInstance = null
    item.variables = []
    item.variableBindings = {}
}

const switchInputType = (item: BuilderItem, type: 'connector' | 'manual') => {
    if (item.inputType === type) return
    item.inputType = type
    if (type === 'manual') {
        item.selectedConnector = null
        item.selectedActionInstance = null
        item.variables = []
        item.variableBindings = {}
    } else {
        item.dynamicFields = []
    }
}

const addDynamicField = (item: BuilderItem) => {
    item.dynamicFields.push({ name: '', type: 'text', options: [], required: false })
}

const removeDynamicField = (item: BuilderItem, index: number) => {
    item.dynamicFields.splice(index, 1)
}

const moveDynamicField = (item: BuilderItem, index: number, direction: number) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= item.dynamicFields.length) return
    const fields = [...item.dynamicFields]
    const [moved] = fields.splice(index, 1)
    fields.splice(newIndex, 0, moved)
    item.dynamicFields = fields
}

const onDynamicFieldTypeChanged = (df: BuilderDynamicField, newType: DynamicFieldType) => {
    df.type = newType
    if (newType !== 'options') df.options = []
}

const addItem = () => {
    builderItems.value.push({
        name: '',
        description: '',
        inputType: 'manual',
        selectedConnector: null,
        selectedActionInstance: null,
        variables: [],
        variableBindings: {},
        loadingVariables: false,
        dynamicFields: [],
    })
}

const removeItem = (index: number) => {
    builderItems.value.splice(index, 1)
}

const moveItem = (index: number, direction: number) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= builderItems.value.length) return
    const items = [...builderItems.value]
    const [moved] = items.splice(index, 1)
    items.splice(newIndex, 0, moved)
    builderItems.value = items
}

const buildItemsPayload = () => {
    return builderItems.value
        .filter((item) => item.name.trim())
        .map((item, index) => ({
            name: item.name.trim(),
            description: item.description?.trim() || undefined,
            order: index + 1,
            inputType: item.inputType,
            connectorId: item.inputType === 'connector' ? (item.selectedConnector?.id || undefined) : undefined,
            connectorTypeActionId: item.inputType === 'connector' ? (item.selectedActionInstance?.connectorTypeActionId || undefined) : undefined,
            connectorActionInstanceId: item.inputType === 'connector' ? (item.selectedActionInstance?.id || undefined) : undefined,
            variableBindings: item.inputType === 'connector' && Object.keys(item.variableBindings).length > 0
                ? item.variableBindings
                : undefined,
            dynamicFields: item.inputType === 'manual'
                ? item.dynamicFields.filter(df => df.name.trim()).map((df, dfIdx) => ({
                    name: df.name.trim(),
                    type: df.type,
                    options: df.type === 'options' ? df.options : undefined,
                    required: df.required,
                    order: dfIdx + 1,
                }))
                : undefined,
        }))
}

const validateForm = (): boolean => {
    if (!builderName.value.trim()) {
        toast.showToast('Error', 'Checklist name is required', 'error')
        return false
    }

    for (const item of builderItems.value) {
        if (!item.name.trim()) continue
        if (item.inputType === 'manual') {
            for (const df of item.dynamicFields) {
                if (!df.name.trim()) {
                    toast.showToast('Error', `Item "${item.name}": all dynamic fields must have a name`, 'error')
                    return false
                }
                if (df.type === 'options' && (!df.options || df.options.length === 0)) {
                    toast.showToast('Error', `Item "${item.name}": field "${df.name}" needs at least one option`, 'error')
                    return false
                }
            }
        }
    }
    return true
}

const saveChecklist = async () => {
    if (!validateForm()) return

    isSaving.value = true
    try {
        const itemsPayload = buildItemsPayload()

        if (isEditing.value && editingChecklist.value) {
            await updateChecklistById(editingChecklist.value.id, {
                name: builderName.value.trim(),
                description: builderDescription.value.trim() || undefined,
                items: itemsPayload,
            }, authStore)
            toast.showToast('Updated', 'Checklist updated successfully', 'success')
        } else if (jobTypeId.value) {
            await createChecklist(jobTypeId.value, {
                name: builderName.value.trim(),
                description: builderDescription.value.trim() || undefined,
                type: builderType.value,
                items: itemsPayload,
            }, authStore)
            toast.showToast('Created', 'Checklist created and linked to job type successfully', 'success')
        } else {
            await createStandaloneChecklist({
                name: builderName.value.trim(),
                description: builderDescription.value.trim() || undefined,
                type: builderType.value,
                items: itemsPayload,
            }, authStore)
            toast.showToast('Created', 'Checklist created successfully', 'success')
        }

        router.push(jobTypeId.value ? `/fleet/job-types/${jobTypeId.value}` : '/automation/checklists')
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to save checklist',
            'error'
        )
    } finally {
        isSaving.value = false
    }
}

const loadChecklist = async (id: string) => {
    pageLoading.value = true
    try {
        const cl = await getChecklistById(id, authStore)
        editingChecklist.value = cl
        isEditing.value = true
        builderName.value = cl.name
        builderDescription.value = cl.description || ''
        builderType.value = cl.type

        builderItems.value = (cl.items || [])
            .sort((a, b) => a.order - b.order)
            .map((item) => {
                const connectorId = item.connectorId || item.connector?.id
                const matchedConnector: Connector | null =
                    connectors.value.find(c => c.id === connectorId) || null

                const dynamicFields: BuilderDynamicField[] = (item.dynamicFields || [])
                    .sort((a, b) => a.order - b.order)
                    .map((df) => ({
                        name: df.name,
                        type: df.type,
                        options: df.options || [],
                        required: !!df.required,
                    }))

                const matchedActionInstance = matchedConnector?.actionInstances?.find(
                    ai => ai.id === (item.connectorActionInstanceId || item.connectorActionInstance?.id)
                ) || item.connectorActionInstance || null

                return {
                    name: item.name,
                    description: item.description || '',
                    inputType: item.inputType || 'manual',
                    selectedConnector: matchedConnector,
                    selectedActionInstance: matchedActionInstance,
                    variables: [] as string[],
                    variableBindings: (item.variableBindings || {}) as Record<string, VariableBinding>,
                    loadingVariables: false,
                    dynamicFields,
                }
            })
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to load checklist', 'error')
        router.push('/automation/checklists')
    } finally {
        pageLoading.value = false
    }
}

const loadConnectors = async () => {
    try {
        connectors.value = await getConnectors(authStore)
    } catch {
        connectors.value = []
    }
}

const loadInjectables = async () => {
    try {
        const result = await getInjectables('checklist', authStore)
        injectableModules.value = result.modules
    } catch {
        injectableModules.value = {}
    }
}

onMounted(async () => {
    const checklistId = route.params.id as string

    await Promise.all([loadConnectors(), loadInjectables()])

    if (checklistId) {
        await loadChecklist(checklistId)
    }
})
</script>
