<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />
        <div class="px-6 pb-6 pt-4">
            <div v-if="loading" class="flex items-center justify-center py-20">
                <Spinner width="3" height="3" />
            </div>

            <template v-else>
                <div class="max-w-5xl mx-auto">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-opposite">Connectors</h3>
                    </div>

                    <div v-if="neededConnectors.length === 0"
                        class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                        No workflows require connectors yet.
                    </div>

                    <div v-else class="grid gap-4 ">
                        <div v-for="typeName in neededConnectors" :key="typeName"
                            class="bg-main rounded-lg border border-gray-800 p-5 flex flex-col">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <h4 class="text-opposite font-medium">{{ typeName }}</h4>
                                    <span
                                        v-if="connectorsForType(typeName).filter(c => c.status === 'active').length === 0">
                                        <i class="fa-solid fa-triangle-exclamation text-yellow-400 text-sm"
                                            title="No connections added"></i>
                                    </span>
                                </div>
                                <span class="text-xs text-opposite/40">
                                    {{ connectorsForType(typeName).length }}
                                    {{ connectorsForType(typeName).length === 1 ? 'connection' : 'connections' }}
                                </span>
                            </div>

                            <div v-if="connectorsForType(typeName).length === 0"
                                class="text-xs text-opposite/80 bg-secondary rounded p-3 mb-3">
                                No connections added yet.
                            </div>

                            <div v-else class="space-y-2 mb-3">
                                <div v-for="c in connectorsForType(typeName)" :key="c.id"
                                    class="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <div
                                            :class="['w-2 h-2 rounded-full shrink-0', c.status === 'active' ? 'bg-green-500' : 'bg-red-500']">
                                        </div>
                                        <div class="flex flex-col gap-1">
                                            <div class="text-sm text-opposite truncate">{{ c.name }}</div>
                                            <span class="ml-3  text-xs text-opposite/60 truncate">{{ c.primaryIdentifier
                                            }}</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2 shrink-0">
                                        <AppButton buttonStyle="void"
                                            class="text-green-600 hover:text-green-500 text-xs"
                                            @click="reconnectConfirmed(c)">
                                            <i class="fa-solid fa-refresh"></i>
                                        </AppButton>
                                        <AppButton buttonStyle="void" class="text-red-600 hover:text-red-500 text-xs"
                                            :warnBefore="`Delete connection &quot;${c.name}&quot;?`"
                                            @click="deleteConfirmed(c)">
                                            <i class="fa-solid fa-trash"></i>
                                        </AppButton>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-auto">
                                <AppButton buttonStyle="secondary" type="button" :loading="addingType === typeName"
                                    @click="onAddConnection(typeName)">
                                    <i class="fa-solid fa-plus mr-1"></i>
                                    Add Connection
                                </AppButton>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getNeedConnectors,
    getConnectors,
    deleteConnector,
    addConnection,
    type Connector,
    reconnectConnector,
} from '@/components/automation/endpoints'

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Connectors', path: '' },
]

const loading = ref(false)
const neededConnectors = ref<string[]>([])
const connectors = ref<Connector[]>([])
const addingType = ref<string | null>(null)
let oauthPopup: Window | null = null

// Only one active status-polling timer at any time. Restarting cancels the prior one.
const WATCH_INTERVAL_MS = 5_000
const WATCH_MAX_DURATION_MS = 3 * 60 * 1_000
let watchIntervalId: number | null = null
let watchStopTimeoutId: number | null = null
let watchedConnectorId: string | null = null

const connectorsForType = (typeName: string) =>
    connectors.value.filter(c => c.connectorTypeId === typeName)

const loadAll = async () => {
    try {
        const [needed, existing] = await Promise.all([
            getNeedConnectors(authStore),
            getConnectors(authStore),
        ])
        neededConnectors.value = needed || []
        connectors.value = existing || []
    } catch {
        neededConnectors.value = []
        connectors.value = []
    }
}

const stopWatchingConnector = () => {
    if (watchIntervalId !== null) {
        clearInterval(watchIntervalId)
        watchIntervalId = null
    }
    if (watchStopTimeoutId !== null) {
        clearTimeout(watchStopTimeoutId)
        watchStopTimeoutId = null
    }
    watchedConnectorId = null
}

const startWatchingConnector = (connectorId: string) => {
    stopWatchingConnector()
    watchedConnectorId = connectorId
    const initialStatus =
        connectors.value.find(c => c.id === connectorId)?.status ?? null

    const tick = async () => {
        if (watchedConnectorId !== connectorId) return
        try {
            const list = await getConnectors(authStore)
            connectors.value = list || []
            const current = (list || []).find(c => c.id === connectorId)
            if (current && current.status !== initialStatus) {
                stopWatchingConnector()
            }
        } catch {
            // Keep polling on transient errors until the max-duration guard fires.
        }
    }

    watchIntervalId = window.setInterval(tick, WATCH_INTERVAL_MS)
    watchStopTimeoutId = window.setTimeout(
        stopWatchingConnector,
        WATCH_MAX_DURATION_MS,
    )
}

const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'AUTH_SUCCESS') {
        toast.showToast('Connected', 'OAuth authorization successful', 'success')
        loadAll()
    }
}

const onAddConnection = async (typeName: string) => {
    addingType.value = typeName
    try {
        const resp = await addConnection({ connectorTypeName: typeName }, authStore)
        if (resp?.oauthUrl) {
            oauthPopup = window.open(
                resp.oauthUrl,
                'oauth_popup',
                'width=600,height=700,scrollbars=yes,resizable=yes',
            )
            if (!oauthPopup) {
                toast.showToast('Error', 'Popup blocked — please allow popups for this site', 'error')
            }
        } else {
            toast.showToast('Created', 'Connection created', 'success')
        }
        await loadAll()
        const newConnectorId = resp?.connectorId || resp?.connector?.id
        if (newConnectorId) {
            startWatchingConnector(newConnectorId)
        }
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to add connection', 'error')
    } finally {
        addingType.value = null
    }
}

const reconnectConfirmed = async (c: Connector) => {
    try {
        const resp = await reconnectConnector(c.id, authStore)
        if (resp?.oauthUrl) {
            oauthPopup = window.open(
                resp.oauthUrl,
                'oauth_popup',
                'width=600,height=700,scrollbars=yes,resizable=yes',
            )
            if (!oauthPopup) {
                toast.showToast('Error', 'Popup blocked — please allow popups for this site', 'error')
            }
        } else {
            toast.showToast('Created', 'Connection created', 'success')
        }
        await loadAll()
        startWatchingConnector(c.id)
    } catch {
        toast.showToast('Error', 'Failed to reconnect connection', 'error')
    }
}

const deleteConfirmed = async (c: Connector) => {
    try {
        await deleteConnector(c.id, authStore)
        toast.showToast('Deleted', 'Connection deleted', 'success')
        await loadAll()
    } catch {
        toast.showToast('Error', 'Failed to delete connection', 'error')
    }
}

onMounted(async () => {
    loading.value = true
    window.addEventListener('message', handleMessage, false)
    await loadAll()
    loading.value = false
})

onUnmounted(() => {
    window.removeEventListener('message', handleMessage, false)
    stopWatchingConnector()
})
</script>
