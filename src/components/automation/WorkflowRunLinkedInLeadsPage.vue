<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto space-y-4">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <h3 class="text-lg font-medium text-opposite">LinkedIn leads</h3>
                        <p class="text-sm text-opposite/60">
                            Profiles collected from this LinkedIn search outreach run.
                            Run ID: <span class="font-mono">{{ runId }}</span>
                        </p>
                    </div>
                    <AppButton buttonStyle="secondary" type="button" @click="goBack">
                        Back
                    </AppButton>
                </div>

                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="leads.length === 0"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                    No LinkedIn leads were recorded for this run.
                </div>

                <div v-else class="space-y-4">
                    <div v-if="statusCounts.length > 0"
                        class="bg-main rounded-lg border border-gray-800 p-4 space-y-3">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div class="text-xs uppercase text-opposite/50 tracking-wide">
                                Filters
                                <span v-if="selectedStatus" class="normal-case text-opposite/70">
                                    ({{ filteredLeads.length }} of {{ leads.length }})
                                </span>
                            </div>
                            <button v-if="selectedStatus" type="button"
                                class="text-xs text-blue-400 hover:text-blue-300 shrink-0"
                                @click="selectedStatus = null">
                                Clear filters
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <button v-for="entry in statusCounts" :key="entry.status" type="button"
                                class="text-xs px-2 py-1 rounded border transition-colors"
                                :class="selectedStatus === entry.status
                                    ? statusFilterActiveClass(entry.status)
                                    : 'border-gray-700 text-opposite/70 bg-secondary hover:border-gray-600'"
                                @click="toggleStatus(entry.status)">
                                {{ entry.status }} ({{ entry.count }})
                            </button>
                        </div>
                    </div>

                    <div v-if="filteredLeads.length === 0"
                        class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                        No leads match the selected filters.
                    </div>

                    <div v-for="lead in filteredLeads" :key="lead.id"
                        class="bg-main rounded-lg border border-gray-800 p-4 space-y-3">
                        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div class="space-y-1 min-w-0">
                                <div class="text-base font-medium text-opposite">
                                    {{ lead.name || 'Unknown profile' }}
                                </div>
                                <div v-if="lead.position" class="text-sm text-opposite/70">
                                    {{ lead.position }}
                                </div>
                            </div>
                            <div class="text-xs uppercase tracking-wide px-2 py-1 rounded border shrink-0"
                                :class="statusClass(lead.status)">
                                {{ lead.status }}
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div class="space-y-1">
                                <div class="text-xs uppercase text-opposite/50 tracking-wide">Profile</div>
                                <a :href="lead.profileUrl" target="_blank" rel="noopener noreferrer"
                                    class="text-blue-400/90 hover:underline break-all">
                                    {{ lead.profileUrl }}
                                </a>
                            </div>
                            <div class="space-y-1">
                                <div class="text-xs uppercase text-opposite/50 tracking-wide">Search URL</div>
                                <a :href="lead.searchUrl" target="_blank" rel="noopener noreferrer"
                                    class="text-blue-400/90 hover:underline break-all">
                                    {{ lead.searchUrl }}
                                </a>
                            </div>
                        </div>

                        <div v-if="lead.outreachSummary" class="space-y-1">
                            <div class="text-xs uppercase text-opposite/50 tracking-wide">Outreach message</div>
                            <pre
                                class="text-sm text-opposite/90 bg-secondary border border-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap">{{
                                    lead.outreachSummary }}</pre>
                        </div>

                        <div v-if="lead.skipReason" class="space-y-1">
                            <div class="text-xs uppercase text-opposite/50 tracking-wide">Skip reason</div>
                            <p class="text-sm text-opposite/80">{{ lead.skipReason }}</p>
                        </div>

                        <div class="flex flex-wrap gap-4 text-sm text-opposite/70">
                            <span>
                                <span class="text-opposite/50">Created:</span>
                                {{ formatDateToTime(lead.createdAt) }}
                            </span>
                            <span>
                                <span class="text-opposite/50">Updated:</span>
                                {{ formatDateToTime(lead.updatedAt) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getLinkedInLeads,
    type LinkedInLead,
} from '@/components/automation/endpoints'
import { formatDateToTime } from '@/util/util'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const runId = computed(() => route.params.runId as string)

const loading = ref(false)
const leads = ref<LinkedInLead[]>([])
const selectedStatus = ref<LinkedInLead['status'] | null>(null)

const statusCounts = computed(() => {
    const counts = new Map<LinkedInLead['status'], number>()
    for (const lead of leads.value) {
        counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1)
    }
    return [...counts.entries()]
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => a.status.localeCompare(b.status))
})

const filteredLeads = computed(() => {
    if (!selectedStatus.value) {
        return leads.value
    }
    return leads.value.filter((lead) => lead.status === selectedStatus.value)
})

const crumbs = computed(() => ([
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflow Runs', path: '/automation/workflows' },
    { name: 'LinkedIn leads', path: '' },
]))

const statusClass = (status: LinkedInLead['status']) => {
    if (status === 'completed') {
        return 'text-emerald-300 border-emerald-500/50 bg-emerald-500/10'
    }
    if (status === 'pending') {
        return 'text-amber-300 border-amber-500/50 bg-amber-500/10'
    }
    if (status === 'failed') {
        return 'text-red-300 border-red-500/50 bg-red-500/10'
    }
    return 'text-opposite/70 border-gray-700 bg-transparent'
}

const statusFilterActiveClass = (status: LinkedInLead['status']) => {
    if (status === 'completed') {
        return 'border-emerald-600 text-emerald-800 bg-emerald-500/25'
    }
    if (status === 'pending') {
        return 'border-amber-600 text-amber-800 bg-amber-500/25'
    }
    if (status === 'failed') {
        return 'border-red-600 text-red-800 bg-red-500/25'
    }
    return 'border-gray-600 text-opposite bg-secondary'
}

const toggleStatus = (status: LinkedInLead['status']) => {
    selectedStatus.value = selectedStatus.value === status ? null : status
}

const load = async () => {
    loading.value = true
    selectedStatus.value = null
    try {
        leads.value = await getLinkedInLeads(authStore, {
            workflowRunId: runId.value,
            limit: 500,
        })
    } catch {
        leads.value = []
        toast.showToast('Error', 'Failed to load LinkedIn leads', 'error')
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.back()
}

watch(runId, () => {
    void load()
}, { immediate: true })
</script>
