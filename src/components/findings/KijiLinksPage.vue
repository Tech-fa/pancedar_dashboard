<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto space-y-4">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h3 class="text-lg font-medium text-opposite">Kiji Links</h3>
                        <p class="text-sm text-opposite/60">
                            Tracked Kijiji listing links grouped by connector.
                        </p>
                    </div>

                    <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <label class="flex flex-col gap-1 text-sm text-opposite">
                            <span class="text-opposite/70">Connector</span>
                            <select
                                v-model="selectedConnectorId"
                                class="min-w-72 rounded-md border border-gray-700 bg-main px-3 py-2 text-sm text-opposite"
                                @change="fetchLinks"
                            >
                                <option value="" disabled>Select connector</option>
                                <option v-for="connector in displayConnectors" :key="connector.id" :value="connector.id">
                                    {{ connectorLabel(connector) }}
                                </option>
                            </select>
                        </label>

                        <button
                            type="button"
                            class="rounded-md bg-main border border-gray-700 px-4 py-2 text-sm font-medium text-opposite hover:bg-complementary-main/50 disabled:opacity-50"
                            :disabled="!selectedConnectorId || loadingLinks"
                            @click="fetchLinks"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <div v-if="loadingConnectors || loadingLinks" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div
                    v-else-if="displayConnectors.length === 0"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800"
                >
                    No connectors found.
                </div>

                <div
                    v-else-if="!selectedConnectorId"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800"
                >
                    Select a connector to view tracked Kijiji links.
                </div>

                <div
                    v-else-if="links.length === 0"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800"
                >
                    No tracked Kijiji links found for this connector.
                </div>

                <div v-else class="bg-main border border-gray-800 rounded-lg overflow-hidden">
                    <div class="grid grid-cols-12 gap-4 border-b border-gray-800 px-4 py-3 text-xs uppercase tracking-wide text-opposite/50">
                        <div class="col-span-7">Link</div>
                        <div class="col-span-3">Source</div>
                        <div class="col-span-2">Last Seen</div>
                    </div>

                    <div
                        v-for="link in links"
                        :key="link._id || link.link"
                        class="grid grid-cols-12 gap-4 border-b border-gray-800 px-4 py-3 text-sm last:border-b-0"
                    >
                        <div class="col-span-12 lg:col-span-7 min-w-0">
                            <a
                                :href="link.link"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="block truncate text-primary hover:underline"
                            >
                                {{ link.link }}
                            </a>
                            <div class="mt-1 text-xs text-opposite/40">
                                Collected {{ formatLinkDate(link.collectedAt || link.createdAt) }}
                            </div>
                        </div>
                        <div class="col-span-8 lg:col-span-3 min-w-0 text-opposite/70">
                            <span class="block truncate">{{ link.sourceUrl }}</span>
                        </div>
                        <div class="col-span-4 lg:col-span-2 text-opposite/70">
                            {{ formatLinkDate(link.lastSeenAt || link.updatedAt) }}
                        </div>
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
import Spinner from '@/components/Spinner.vue'
import { getConnectors, getKijiLinks, type Connector, type KijiLink } from '@/components/automation/endpoints'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { formatIfTimestamp } from '@/util/util'

const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const crumbs = [
    { name: 'Findings', path: '/findings/kiji-links', icon: 'fa-solid fa-magnifying-glass text-neutral-700 text-2xl' },
    { name: 'Kiji Links', path: '' },
]

const loadingConnectors = ref(false)
const loadingLinks = ref(false)
const connectors = ref<Connector[]>([])
const links = ref<KijiLink[]>([])
const selectedConnectorId = ref('')

const kijijiConnectors = computed(() =>
    connectors.value.filter((connector) =>
        `${connector.connectorTypeId} ${connector.name || ''}`
            .toLowerCase()
            .includes('kiji'),
    ),
)

const displayConnectors = computed(() =>
    kijijiConnectors.value.length ? kijijiConnectors.value : connectors.value,
)

const connectorLabel = (connector: Connector) =>
    connector.name || connector.primaryIdentifier || connector.connectorTypeId || connector.id

const formatLinkDate = (value?: string) => {
    if (!value) return '-'
    return formatIfTimestamp(value)
}

const setSelectedConnectorFromRoute = () => {
    const connectorId = route.query.connectorId
    if (typeof connectorId === 'string' && displayConnectors.value.some((connector) => connector.id === connectorId)) {
        selectedConnectorId.value = connectorId
        return
    }

    if (displayConnectors.value.length === 1) {
        selectedConnectorId.value = displayConnectors.value[0].id
        return
    }

    selectedConnectorId.value = ''
}

const fetchLinks = async () => {
    if (!selectedConnectorId.value) {
        links.value = []
        return
    }

    loadingLinks.value = true
    try {
        links.value = await getKijiLinks(selectedConnectorId.value, authStore)
        router.replace({
            path: route.path,
            query: { ...route.query, connectorId: selectedConnectorId.value },
        })
    } catch {
        links.value = []
        toast.showToast('Error', 'Failed to load Kiji links', 'error')
    } finally {
        loadingLinks.value = false
    }
}

const loadConnectors = async () => {
    loadingConnectors.value = true
    try {
        connectors.value = await getConnectors(authStore)
        setSelectedConnectorFromRoute()
        await fetchLinks()
    } catch {
        connectors.value = []
        links.value = []
        toast.showToast('Error', 'Failed to load connectors', 'error')
    } finally {
        loadingConnectors.value = false
    }
}

watch(
    () => route.query.connectorId,
    (connectorId) => {
        if (connectorId === selectedConnectorId.value) return
        setSelectedConnectorFromRoute()
        fetchLinks()
    },
)

onMounted(() => {
    loadConnectors()
})
</script>
