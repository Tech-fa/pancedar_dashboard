<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto space-y-4">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h3 class="text-lg font-medium text-opposite">Kiji Links</h3>
                        <p class="text-sm text-opposite/60">
                            Tracked Kijiji listing links grouped by Workflow.
                        </p>
                    </div>

                    <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <label class="flex flex-col gap-1 text-sm text-opposite">
                            <span class="text-opposite/70">Workflow</span>
                            <select v-model="selectedWorkflowId"
                                class="min-w-72 rounded-md border border-gray-700 bg-main px-3 py-2 text-sm text-opposite"
                                @change="fetchLinks">
                                <option value="" disabled>Select workflow</option>
                                <option v-for="workflow in workflows" :key="workflow.id" :value="workflow.id">
                                    {{ workflow.name }}
                                </option>
                            </select>
                        </label>

                        <button type="button"
                            class="rounded-md bg-main border border-gray-700 px-4 py-2 text-sm font-medium text-opposite hover:bg-complementary-main/50 disabled:opacity-50"
                            :disabled="!selectedWorkflowId || loadingLinks" @click="fetchLinks">
                            Refresh
                        </button>
                    </div>
                </div>

                <div v-if="loadingConnectors || loadingLinks" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="workflows.length === 0"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                    No workflows found.
                </div>

                <div v-else-if="!selectedWorkflowId"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                    Select a connector to view tracked Kijiji links.
                </div>

                <div v-else-if="links.length === 0"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                    No tracked Kijiji links found for this connector.
                </div>

                <div v-else class="bg-main border border-gray-800 rounded-lg overflow-hidden">
                    <div
                        class="grid grid-cols-12 gap-4 border-b border-gray-800 px-4 py-3 text-xs uppercase tracking-wide text-opposite/50">
                        <div class="col-span-7">Link</div>
                        <div class="col-span-3">Source</div>
                        <div class="col-span-2">Last Seen</div>
                    </div>

                    <div v-for="link in links" :key="link._id || link.link"
                        class="grid grid-cols-12 gap-4 border-b border-gray-800 px-4 py-3 text-sm last:border-b-0">
                        <div class="col-span-12 lg:col-span-7 min-w-0">
                            <a :href="link.link" target="_blank" rel="noopener noreferrer"
                                class="block truncate text-primary hover:underline">
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
import { getConnectors, getKijiLinks, getWorkflows, type Connector, type KijiLink } from '@/components/automation/endpoints'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { formatIfTimestamp } from '@/util/util'
import type { Workflow } from '../automation/workflow.interface'

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
const links = ref<KijiLink[]>([])
const workflows = ref<Workflow[]>([])
const selectedWorkflowId = ref('')



const formatLinkDate = (value?: string) => {
    if (!value) return '-'
    return formatIfTimestamp(value)
}

const setSelectedWorkflowFromRoute = () => {
    const workflowId = route.query.workflowId
    if (typeof workflowId === 'string' && workflows.value.some((workflow) => workflow.id === workflowId)) {
        selectedWorkflowId.value = workflowId
        return
    }
    selectedWorkflowId.value = ''
}

const fetchLinks = async () => {
    if (!selectedWorkflowId.value) {
        links.value = []
        return
    }

    loadingLinks.value = true
    try {
        links.value = await getKijiLinks(selectedWorkflowId.value, authStore)
        router.replace({
            path: route.path,
            query: { ...route.query, workflowId: selectedWorkflowId.value },
        })
    } catch {
        links.value = []
        toast.showToast('Error', 'Failed to load Kiji links', 'error')
    } finally {
        loadingLinks.value = false
    }
}

const loadWorkflows = async () => {
    loadingConnectors.value = true
    try {
        workflows.value = await getWorkflows(authStore, { workflowType: 'kijiji-notifier' })
        setSelectedWorkflowFromRoute()
        await fetchLinks()
    } catch {
        workflows.value = []
        links.value = []
        toast.showToast('Error', 'Failed to load connectors', 'error')
    } finally {
        loadingConnectors.value = false
    }
}

watch(
    () => route.query.workflowId,
    (workflowId) => {
        if (workflowId === selectedWorkflowId.value) return
        setSelectedWorkflowFromRoute()
        fetchLinks()
    },
)

onMounted(() => {
    loadWorkflows()
})
</script>
