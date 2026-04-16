<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div v-if="loading" class="flex items-center justify-center py-24">
                <Spinner width="3" height="3" />
            </div>

            <div v-else-if="!job" class="text-center py-12 text-opposite/50">
                Cron job not found.
            </div>

            <div v-else class="max-w-5xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <router-link to="/automation/cron-jobs"
                        class="text-sm text-opposite/60 hover:text-opposite flex items-center gap-1">
                        <i class="fa-solid fa-arrow-left"></i>
                        Back to Cron Jobs
                    </router-link>
                    <router-link :to="`/automation/cron-jobs/${job.id}/edit`"
                        class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <i class="fa-solid fa-pen"></i>
                        Edit
                    </router-link>
                </div>

                <div class="bg-secondary rounded-lg border border-gray-800 p-6 mb-4">
                    <div class="flex items-start gap-3">
                        <div
                            :class="['w-3 h-3 rounded-full shrink-0 mt-1.5', job.isActive ? 'bg-green-500' : 'bg-gray-500']" />
                        <div class="min-w-0 flex-1">
                            <h3 class="text-lg font-medium text-opposite">{{ job.name }}</h3>
                            <p v-if="job.description" class="text-sm text-opposite/60 mt-1">{{ job.description }}</p>
                            <div class="text-xs text-opposite/50 mt-3 space-y-1">
                                <div>
                                    <span class="text-opposite/40">Connector</span>
                                    {{ job.connector?.name ?? '—' }}
                                </div>
                                <div>
                                    <span class="text-opposite/40">Action</span>
                                    {{ job.connectorActionInstance?.name ?? '—' }}
                                    <template v-if="job.connectorActionInstance?.connectorTypeAction?.name">
                                        ({{ job.connectorActionInstance.connectorTypeAction.name }})
                                    </template>
                                </div>
                                <div>
                                    <span class="text-opposite/40">Schedule</span>
                                    <span class="font-mono">{{ frequencyLabel(job.frequency) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                    <h3 class="text-sm font-medium text-opposite mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-clock-rotate-left text-blue-400"></i>
                        Run history
                    </h3>
                    <div v-if="instancesLoading" class="flex justify-center py-8">
                        <Spinner width="3" height="3" />
                    </div>
                    <template v-else>
                        <p v-if="!instancesWithResponses.length" class="text-sm text-opposite/50">
                            No runs recorded yet. Execution rows appear here after the scheduler runs this job.
                        </p>
                        <div v-else class="space-y-4">
                            <div v-for="row in instancesWithResponses" :key="row.instance.id"
                                class="rounded-lg border border-gray-700 bg-main/40 overflow-hidden">
                                <div
                                    class="px-4 py-3 flex flex-wrap items-center gap-3 border-b border-gray-800/80 text-xs text-opposite/50">

                                    <span>Started {{ formatDate(row.instance.startedAt) }}</span>
                                    <span v-if="row.instance.finishedAt">
                                        Finished {{ formatDate(row.instance.finishedAt) }}
                                    </span>
                                    <span v-if="row.instance.durationMs != null">
                                        Duration {{ formatDuration(row.instance.durationMs) }}
                                    </span>
                                    <span v-else-if="!row.instance.finishedAt" class="text-amber-400/90">
                                        No finish time recorded
                                    </span>
                                </div>
                                <div class="px-4 py-3 space-y-3">
                                    <template v-if="row.responses.length">
                                        <span class="text-xs text-opposite/50">Connector responses</span>
                                        <ExecutionResponseDisplay v-for="resp in row.responses" :key="resp.id"
                                            variant="compact" :response="resp" />
                                    </template>
                                    <p v-else class="text-xs text-opposite/40">
                                        No response rows linked to this run yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-if="instancesTotalCount > 0"
                            class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-opposite/60">
                            <p>
                                Showing
                                <span class="text-opposite/80 font-medium">{{ instancesRangeFrom }}</span>
                                –
                                <span class="text-opposite/80 font-medium">{{ instancesRangeTo }}</span>
                                of
                                <span class="text-opposite/80 font-medium">{{ instancesTotalCount }}</span>
                            </p>
                            <div class="flex items-center gap-2">
                                <label class="sr-only" for="cron-instances-per-page">Per page</label>
                                <select id="cron-instances-per-page" v-model.number="instancesPerPage"
                                    :class="[INPUT_CLASS, 'text-xs py-1.5']" @change="onInstancesPerPageChange">
                                    <option :value="10">10 / page</option>
                                    <option :value="25">25 / page</option>
                                    <option :value="50">50 / page</option>
                                </select>
                                <button type="button"
                                    class="rounded-md border border-gray-700 px-3 py-1.5 text-xs text-opposite hover:bg-main/60 disabled:opacity-40 disabled:pointer-events-none"
                                    :disabled="instancesPage <= 1 || instancesLoading"
                                    @click="goInstancesPage(instancesPage - 1)">
                                    Previous
                                </button>
                                <span class="text-xs tabular-nums px-1 flex flex-row">
                                   <span class="pr-1"> {{ instancesPage }}</span> / <span class="pl-1"> {{ instancesTotalPages }}</span>
                                </span>
                                <button type="button"
                                    class="rounded-md border border-gray-700 px-3 py-1.5 text-xs text-opposite hover:bg-main/60 disabled:opacity-40 disabled:pointer-events-none"
                                    :disabled="instancesPage >= instancesTotalPages || instancesLoading"
                                    @click="goInstancesPage(instancesPage + 1)">
                                    Next
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import ExecutionResponseDisplay from '@/components/ExecutionResponseDisplay.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getCronJobById,
    getCronJobInstances,
    CRON_JOB_INSTANCE_SOURCE_TYPE,
} from '@/components/automation/endpoints'
import type { CronJob, CronJobInstance } from '@/components/automation/endpoints'
import { getResponses, type ResponseEntity } from '@/components/fleet/endpoints'
import { formatDate } from '@/util/util'
import { FREQUENCY_OPTIONS } from './frequencies'
import { INPUT_CLASS } from '@/components/contants'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const cronJobId = computed(() => route.params.id as string)
const loading = ref(true)
const instancesLoading = ref(false)
const job = ref<CronJob | null>(null)
const instancesWithResponses = ref<{ instance: CronJobInstance; responses: ResponseEntity[] }[]>([])
const instancesPage = ref(1)
const instancesPerPage = ref(10)
const instancesTotalCount = ref(0)

const crumbs = computed(() => [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Cron Jobs', path: '/automation/cron-jobs' },
    { name: job.value?.name || 'View', path: '' },
])

const instancesTotalPages = computed(() =>
    Math.max(1, Math.ceil(instancesTotalCount.value / instancesPerPage.value)),
)

const instancesRangeFrom = computed(() => {
    if (instancesTotalCount.value === 0) return 0
    return (instancesPage.value - 1) * instancesPerPage.value + 1
})

const instancesRangeTo = computed(() => {
    if (instancesTotalCount.value === 0) return 0
    return Math.min(instancesPage.value * instancesPerPage.value, instancesTotalCount.value)
})

const frequencyLabel = (cron: string): string => {
    const match = FREQUENCY_OPTIONS.find((o) => o.value === cron)
    return match ? match.label : cron
}

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms} ms`
    const s = ms / 1000
    if (s < 60) return `${s.toFixed(1)} s`
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}m ${r.toFixed(0)}s`
}

async function enrichInstancesWithResponses(list: CronJobInstance[]) {
    return Promise.all(
        list.map(async (instance) => {
            try {
                const responses = await getResponses(authStore, {
                    sourceId: instance.id,
                    sourceType: CRON_JOB_INSTANCE_SOURCE_TYPE,
                })
                return {
                    instance,
                    responses: Array.isArray(responses) ? responses : [],
                }
            } catch {
                return { instance, responses: [] as ResponseEntity[] }
            }
        }),
    )
}

async function loadInstances() {
    instancesLoading.value = true
    try {
        const pageRes = await getCronJobInstances(cronJobId.value, authStore, {
            page: instancesPage.value,
            perPage: instancesPerPage.value,
        }).catch(() => ({
            data: [] as CronJobInstance[],
            currentPage: 1,
            totalCount: 0,
            perPage: instancesPerPage.value,
        }))
        instancesTotalCount.value = pageRes.totalCount ?? 0
        if (pageRes.currentPage && pageRes.currentPage !== instancesPage.value) {
            instancesPage.value = pageRes.currentPage
        }
        const list = Array.isArray(pageRes.data) ? pageRes.data : []
        instancesWithResponses.value = await enrichInstancesWithResponses(list)
    } catch (e: any) {
        instancesWithResponses.value = []
        instancesTotalCount.value = 0
        toast.showToast(
            'Error',
            e?.response?.data?.message || 'Failed to load run history',
            'error',
        )
    } finally {
        instancesLoading.value = false
    }
}

function goInstancesPage(page: number) {
    const next = Math.min(Math.max(1, page), instancesTotalPages.value)
    if (next !== instancesPage.value) {
        instancesPage.value = next
        loadInstances()
    }
}

function onInstancesPerPageChange() {
    instancesPage.value = 1
    loadInstances()
}

async function load() {
    loading.value = true
    try {
        const fetchedJob = await getCronJobById(cronJobId.value, authStore)
        job.value = fetchedJob
        await loadInstances()
    } catch (e: any) {
        job.value = null
        instancesWithResponses.value = []
        instancesTotalCount.value = 0
        toast.showToast('Error', e?.response?.data?.message || 'Failed to load cron job', 'error')
    } finally {
        loading.value = false
    }
}

watch(cronJobId, () => {
    instancesPage.value = 1
    load()
})

onMounted(() => {
    load()
})
</script>
