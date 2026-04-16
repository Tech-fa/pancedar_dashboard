<template>
    <div class="max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-opposite">Connectors</h3>
            <button v-if="!showForm" type="button" @click="startAdd"
                class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <i class="fa-solid fa-plus"></i>
                Add Connector
            </button>
        </div>

        <!-- Connector Form -->
        <div v-if="showForm" class="bg-secondary rounded-lg border border-gray-800 p-6 space-y-4 mb-6">
            <h4 class="text-sm font-medium text-opposite">
                {{ editingConnector ? 'Edit Connector' : 'New Connector' }}
            </h4>
            <div>
                <label class="block text-xs text-opposite/60 mb-1">Name</label>
                <input v-model="formName" type="text" placeholder="e.g. My Gmail Account"
                    :class="[INPUT_CLASS, 'w-full']" />
            </div>
            <div v-if="!editingConnector">
                <label class="block text-xs text-opposite/60 mb-1">Connector Type</label>
                <Select2
                    :modelValue="formType"
                    :values="connectorTypes"
                    :display="(t: any) => t?.name || ''"
                    placeholder="Select type..."
                    @update:modelValue="onTypeSelected"
                />
            </div>
            <div v-else class="text-xs text-opposite/40">
                Type: <span class="text-opposite font-medium">{{ editingConnector.connectorType?.name }}</span>
            </div>

            <!-- Credentials fields based on type's fields schema -->
            <template v-if="selectedTypeFields && Object.keys(selectedTypeFields).length">
                <label class="block text-xs text-opposite/60">Credentials</label>
                <div v-for="(field, key) in selectedTypeFields" :key="key" class="mb-2">
                    <label class="block text-xs text-opposite/60 mb-1">
                        {{ field.label }}
                        <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                        :type="field.type === 'number' ? 'number' : 'text'"
                        :value="formCredentials[key as string]"
                        @input="(e: Event) => formCredentials[key as string] = (e.target as HTMLInputElement).value"
                        :placeholder="field.label"
                        :class="[INPUT_CLASS, 'w-full text-sm']"
                    />
                </div>
            </template>

            <div class="flex items-center gap-2">
                <label class="text-xs text-opposite/60">Active</label>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="formIsActive" class="sr-only peer" />
                    <div
                        class="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600">
                    </div>
                </label>
            </div>

            <div class="flex items-center gap-3 pt-2">
                <AppButton buttonStyle="secondary" type="button" @click="showForm = false">
                    Cancel
                </AppButton>
                <AppButton buttonStyle="primary" type="button" @click="saveConnector"
                    :loading="isSaving">
                    {{ editingConnector ? 'Update' : 'Create' }}
                </AppButton>
            </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
            <Spinner width="3" height="3" />
        </div>

        <div v-else-if="connectors.length === 0 && !showForm"
            class="text-center py-12 text-opposite/50 bg-secondary rounded-lg border border-gray-800">
            No connectors configured yet.
        </div>

        <!-- Connectors List -->
        <div v-else-if="!showForm" class="space-y-3">
            <div v-for="c in connectors" :key="c.id"
                class="bg-secondary rounded-lg border border-gray-800 p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div :class="['w-2.5 h-2.5 rounded-full shrink-0', c.isActive ? 'bg-green-500' : 'bg-gray-500']"></div>
                    <div>
                        <div class="text-opposite font-medium">{{ c.name }}</div>
                        <div class="text-xs text-opposite/40 mt-0.5">
                            {{ c.connectorType?.name }}
                            <span class="font-mono ml-1">{{ c.connectorType?.serviceName }}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button @click="startEdit(c)" class="text-blue-400 hover:text-blue-300 text-sm">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <AppButton buttonStyle="void" class="text-red-400 hover:text-red-300 text-sm"
                        :warnBefore="`Are you sure you want to delete connector &quot;${c.name}&quot;?`"
                        @click="deleteConfirmed(c)">
                        <i class="fa-solid fa-trash"></i>
                    </AppButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import Select2 from '@/components/Select2.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getConnectors,
    createConnector,
    updateConnector,
    deleteConnector,
    getConnectorTypes,
} from '@/components/fleet/endpoints'
import type { Connector, ConnectorType } from '@/components/fleet/endpoints'
import { INPUT_CLASS } from '@/components/contants'

const authStore = useAuthStore()
const toast = useToast()

const connectors = ref<Connector[]>([])
const connectorTypes = ref<ConnectorType[]>([])
const loading = ref(false)

// Form state
const showForm = ref(false)
const editingConnector = ref<Connector | null>(null)
const isSaving = ref(false)
const formName = ref('')
const formType = ref<ConnectorType | null>(null)
const formCredentials = ref<Record<string, any>>({})
const formIsActive = ref(true)

const selectedTypeFields = computed(() => {
    if (editingConnector.value) {
        return editingConnector.value.connectorType?.fields || null
    }
    return formType.value?.fields || null
})

const onTypeSelected = (val: ConnectorType | null) => {
    formType.value = val
    formCredentials.value = {}
}

const startAdd = () => {
    editingConnector.value = null
    formName.value = ''
    formType.value = null
    formCredentials.value = {}
    formIsActive.value = true
    showForm.value = true
}

const startEdit = (c: Connector) => {
    editingConnector.value = c
    formName.value = c.name
    formType.value = null
    formCredentials.value = c.credentials ? { ...c.credentials } : {}
    formIsActive.value = c.isActive
    showForm.value = true
}

const saveConnector = async () => {
    if (!formName.value.trim()) {
        toast.showToast('Error', 'Name is required', 'error')
        return
    }

    if (!editingConnector.value && !formType.value) {
        toast.showToast('Error', 'Connector type is required', 'error')
        return
    }

    isSaving.value = true
    try {
        const creds = Object.keys(formCredentials.value).length > 0 ? formCredentials.value : undefined

        if (editingConnector.value) {
            await updateConnector(editingConnector.value.id, {
                name: formName.value.trim(),
                credentials: creds ?? null,
                isActive: formIsActive.value,
            }, authStore)
            toast.showToast('Updated', 'Connector updated', 'success')
        } else {
            await createConnector({
                name: formName.value.trim(),
                connectorTypeId: formType.value!.id,
                credentials: creds,
                isActive: formIsActive.value,
            }, authStore)
            toast.showToast('Created', 'Connector created', 'success')
        }
        showForm.value = false
        await loadConnectors()
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to save', 'error')
    } finally {
        isSaving.value = false
    }
}

const deleteConfirmed = async (c: Connector) => {
    try {
        await deleteConnector(c.id, authStore)
        toast.showToast('Deleted', 'Connector deleted', 'success')
        await loadConnectors()
    } catch {
        toast.showToast('Error', 'Failed to delete connector', 'error')
    }
}

const loadConnectors = async () => {
    loading.value = true
    try {
        connectors.value = await getConnectors(authStore)
    } catch {
        connectors.value = []
    } finally {
        loading.value = false
    }
}

const loadTypes = async () => {
    try {
        connectorTypes.value = await getConnectorTypes(authStore)
    } catch {
        connectorTypes.value = []
    }
}

onMounted(() => {
    loadConnectors()
    loadTypes()
})
</script>
