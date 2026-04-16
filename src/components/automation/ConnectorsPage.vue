<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />
        <div class="px-6 pb-6 pt-4">
            <div v-if="loading" class="flex items-center justify-center py-20">
                <Spinner width="3" height="3" />
            </div>

            <template v-else>
                <Tabs :tabs="['Connectors', 'Connector Types']" v-model="currentTab" />

                <!-- Tab 0: Connectors CRUD -->
                <div v-if="currentTab === 0" class="max-w-3xl mx-auto">
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
                            <Select2 :modelValue="formType" :values="connectorTypes"
                                :display="(t: any) => t?.name || ''" placeholder="Select type..."
                                @update:modelValue="onTypeSelected" />
                        </div>
                        <div v-else class="text-xs text-opposite/40">
                            Type: <span class="text-opposite font-medium">{{ editingConnector.connectorType?.name
                                }}</span>
                        </div>

                        <template v-if="selectedTypeFields && Object.keys(selectedTypeFields).length">
                            <label class="block text-xs text-opposite/60">Configuration</label>
                            <div v-for="(field, key) in selectedTypeFields" :key="key" class="mb-2">
                                <label class="block text-xs text-opposite/60 mb-1">
                                    {{ field.label }}
                                    <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
                                </label>
                                <input :type="field.type === 'number' ? 'number' : 'text'"
                                    :value="formCredentials[key as string]"
                                    @input="(e: Event) => formCredentials[key as string] = (e.target as HTMLInputElement).value"
                                    :placeholder="field.label" :class="[INPUT_CLASS, 'w-full text-sm']" />
                            </div>
                        </template>



                        <div class="flex items-center gap-3 pt-2">
                            <AppButton buttonStyle="secondary" type="button" @click="showForm = false">
                                Cancel
                            </AppButton>
                            <AppButton buttonStyle="primary" type="button" @click="saveConnector" :loading="isSaving">
                                {{ editingConnector ? 'Update' : 'Create' }}
                            </AppButton>
                        </div>
                    </div>

                    <div v-if="connectors.length === 0 && !showForm"
                        class="text-center py-12 text-opposite/50 bg-secondary rounded-lg border border-gray-800">
                        No connectors configured yet.
                    </div>

                    <div v-else-if="!showForm" class="space-y-3">
                        <div v-for="c in connectors" :key="c.id"
                            class="bg-secondary rounded-lg border border-gray-800 p-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div
                                    :class="['w-2.5 h-2.5 rounded-full shrink-0', c.isActive ? 'bg-green-500' : 'bg-gray-500']">
                                </div>
                                <div>
                                    <div class="text-opposite font-medium">{{ c.name }}</div>
                                    <div class="text-xs text-opposite/40 mt-0.5">
                                        {{ c.connectorType?.name }}
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button v-if="c.connectorType?.oauthUrl"
                                    @click="openOAuthPopup(c.connectorType.oauthUrl!, c.id)"
                                    class="text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1"
                                    :disabled="awaitingOAuth">
                                    <i class="fa-solid fa-link"></i>
                                    Authorize
                                </button>

                                <button @click="router.push(`/automation/connectors/${c.id}`)"
                                    class="text-blue-400 hover:text-blue-300 text-sm">
                                    <i class="fa-solid fa-eye"></i>
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

                <!-- Tab 1: Connector Types (tiles) -->
                <div v-if="currentTab === 1">
                    <div v-if="connectorTypes.length === 0"
                        class="text-center py-12 text-opposite/50 bg-secondary rounded-lg border border-gray-800">
                        No connector types available.
                    </div>

                    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div v-for="ct in connectorTypes" :key="ct.id"
                            class="bg-secondary rounded-lg border border-gray-800 p-5 flex flex-col">
                            <!-- Tile header -->
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-2.5">
                                    <div
                                        class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <i class="fa-solid fa-plug text-blue-400"></i>
                                    </div>
                                    <h4 class="text-opposite font-semibold">{{ ct.name }}</h4>
                                </div>
                                <a v-if="ct.oauthUrl" :href="ct.oauthUrl" target="_blank"
                                    class="text-opposite/30 hover:text-blue-400 text-xs mt-1" title="OAuth Setup">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                </a>
                            </div>

                            <p v-if="ct.description" class="text-sm text-opposite/50 mb-4 line-clamp-2">
                                {{ ct.description }}
                            </p>

                            <!-- Credential fields -->
                            <div v-if="ct.fields && Object.keys(ct.fields).length" class="mb-4">
                                <h5 class="text-xs font-medium text-opposite/50 uppercase tracking-wide mb-1.5">
                                    Credentials
                                </h5>
                                <div class="flex flex-wrap gap-1.5">
                                    <span v-for="(field, key) in ct.fields" :key="key"
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 text-xs text-opposite/60">
                                        {{ field.label }}
                                        <span v-if="field.required" class="text-red-400">*</span>
                                    </span>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div v-if="ct.actions?.length" class="mt-auto">
                                <h5 class="text-xs font-medium text-opposite/50 uppercase tracking-wide mb-1.5">
                                    Actions
                                </h5>
                                <div class="space-y-1.5">
                                    <div v-for="action in ct.actions" :key="action.id"
                                        class="flex items-start gap-2 p-2 rounded bg-gray-800/50">
                                        <i class="fa-solid fa-bolt text-yellow-400 text-xs mt-0.5"></i>
                                        <div class="min-w-0">
                                            <div class="text-sm text-opposite font-medium truncate">{{ action.name }}
                                            </div>
                                            <div v-if="action.description"
                                                class="text-xs text-opposite/40 mt-0.5 line-clamp-1">
                                                {{ action.description }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer: connector count -->
                            <div class="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                                <span class="text-xs text-opposite/40">
                                    {{ connectorsForType(ct.id).length }} connector{{ connectorsForType(ct.id).length
                                        !== 1 ? 's' : ''
                                    }} configured
                                </span>
                                <button type="button" @click="goToAddForType(ct)"
                                    class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                    <i class="fa-solid fa-plus"></i>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Tabs from '@/components/Tabs.vue'
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
    getConnectorStatus,
    getConnectorAuthUrl,
} from '@/components/fleet/endpoints'
import type { Connector, ConnectorType } from '@/components/fleet/endpoints'
import { INPUT_CLASS } from '@/components/contants'

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const connectors = ref<Connector[]>([])
const connectorTypes = ref<ConnectorType[]>([])
const loading = ref(false)
const currentTab = ref(0)

const connectorsForType = (typeId: string) =>
    connectors.value.filter(c => c.connectorTypeId === typeId || c.connectorType?.id === typeId)

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Connectors', path: '' }
]

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

const goToAddForType = (ct: ConnectorType) => {
    currentTab.value = 0
    editingConnector.value = null
    formName.value = ''
    formType.value = ct
    formCredentials.value = {}
    formIsActive.value = true
    showForm.value = true
}

// OAuth popup state
const awaitingOAuth = ref(false)
let oauthPopup = ref<Window | null>(null)

const openOAuthPopup = async (oauthPath: string, connectorId: string) => {
    try {
        const resp = await getConnectorAuthUrl(oauthPath, connectorId, authStore)
        const authUrl = resp.url || resp as any

        oauthPopup.value = window.open(
            authUrl,
            'oauth_popup',
            'width=600,height=700,scrollbars=yes,resizable=yes'
        )
        if (!oauthPopup.value) {
            toast.showToast('Error', 'Popup blocked — please allow popups for this site', 'error')
            return
        }


        window.addEventListener('message', handleMessage, false)


    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to get auth URL', 'error')
    }
}



const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'AUTH_SUCCESS') {
        toast.showToast('Connected', 'OAuth authorization successful', 'success')
        showForm.value = false
        loadConnectors()
    }
}

const onOAuthPopupClosed = async (connectorId: string) => {
    try {
        const status = await getConnectorStatus(connectorId, authStore)
        if (status.hasCredentials) {
            toast.showToast('Connected', 'OAuth authorization successful', 'success')
        } else {
            toast.showToast('Warning', 'OAuth flow was closed without completing authorization', 'warning')
        }
    } catch {
        toast.showToast('Error', 'Failed to check connector status', 'error')
    }
    await loadConnectors()
}

const saveConnector = async () => {
    if (!formName.value.trim()) {
        toast.showToast('Error', 'Name is required', 'error')
        return
    }

    if (!formType.value) {
        toast.showToast('Error', 'Connector type is required', 'error')
        return
    }

    const fields = selectedTypeFields.value
    if (fields) {
        for (const [key, field] of Object.entries(fields)) {
            if (field.required && !formCredentials.value[key]?.toString().trim()) {
                toast.showToast('Error', `${field.label} is required`, 'error')
                return
            }
        }
    }

    isSaving.value = true
    try {

        const creds = Object.keys(formCredentials.value).length > 0 ? formCredentials.value : undefined

        const hasOAuth = !!formType.value!.oauthUrl
        const created = await createConnector({
            name: formName.value.trim(),
            connectorTypeId: formType.value!.id,
            credentials: creds,
            isActive: !hasOAuth,
        }, authStore)


        if (hasOAuth) {
            toast.showToast('Created', 'Connector created — completing OAuth...', 'success')
            await openOAuthPopup(formType.value!.oauthUrl!, created.id)
        } else {
            showForm.value = false
            toast.showToast('Created', 'Connector created', 'success')
            router.push(`/automation/connectors/${created.id}`)
        }
    } catch (error: any) {
        console.error(error)
        toast.showToast('Error', error?.response?.data?.message || 'Failed to save', 'error')
    } finally {
        await loadConnectors()
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
    try {
        connectors.value = await getConnectors(authStore)
    } catch {
        connectors.value = []
    }
}

const loadTypes = async () => {
    try {
        connectorTypes.value = await getConnectorTypes(authStore)
    } catch {
        connectorTypes.value = []
    }
}

onMounted(async () => {
    loading.value = true
    await Promise.all([loadConnectors(), loadTypes()])
    loading.value = false
})

onUnmounted(() => {
    window.removeEventListener('message', handleMessage, false);
})
</script>
