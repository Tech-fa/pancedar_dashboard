<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium text-opposite">Workflow Runs Kanban</h3>
                    <div class="flex items-center gap-2">
                        <AppButton buttonStyle="secondary" type="button" @click="refreshColumns">
                            Refresh
                        </AppButton>
                        <AppButton buttonStyle="secondary" type="button" @click="goBack">
                            Back
                        </AppButton>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <section class="bg-main rounded-lg border border-amber-500/30 min-h-[420px] p-3 space-y-3">
                        <div class="flex items-center justify-between border-b border-gray-800 pb-2">
                            <h4 class="font-medium text-amber-300">Awaiting Action</h4>
                            <span class="text-xs text-opposite/50">{{ awaiting.totalCount }}</span>
                        </div>
                        <div v-if="awaiting.loading" class="flex justify-center py-8">
                            <Spinner width="2.5" height="2.5" />
                        </div>
                        <div v-else-if="awaiting.runs.length === 0" class="text-sm text-opposite/50 py-6 text-center">
                            No runs.
                        </div>
                        <div v-else class="space-y-2">
                            <a v-for="run in awaiting.runs" :key="run.id"
                                class="bg-secondary rounded border border-gray-800 p-3 text-sm space-y-2"
                                :href="(getAwaitingActionRoute(run) as string)" target="_blank">
                                >
                                <div class="text-opposite/80 break-all">{{ run.workflow?.name }}</div>
                                <div class="text-opposite/60">Step: {{ run.currentStep || '-' }}</div>
                                <div class="text-opposite/60">Updated: {{ formatDate(run.updatedAt) }}</div>
                            </a>
                        </div>
                    </section>

                    <section class="bg-main rounded-lg border border-blue-500/30 min-h-[420px] p-3 space-y-3">
                        <div class="flex items-center justify-between border-b border-gray-800 pb-2">
                            <h4 class="font-medium text-blue-300">In Progress</h4>
                            <span class="text-xs text-opposite/50">{{ inProgress.totalCount }}</span>
                        </div>
                        <div v-if="inProgress.loading" class="flex justify-center py-8">
                            <Spinner width="2.5" height="2.5" />
                        </div>
                        <div v-else-if="inProgress.runs.length === 0" class="text-sm text-opposite/50 py-6 text-center">
                            No runs.
                        </div>
                        <div v-else class="space-y-2">
                            <article v-for="run in inProgress.runs" :key="run.id"
                                class="bg-secondary rounded border border-gray-800 p-3 text-sm space-y-2">
                                <div class="text-opposite/80 break-all">{{ run.workflow?.name }}</div>
                                <div class="text-opposite/60">Status: {{ run.status }}</div>
                                <div class="text-opposite/60">Updated: {{ formatDate(run.updatedAt) }}</div>
                            </article>
                        </div>
                    </section>

                    <section class="bg-main rounded-lg border border-emerald-500/30 min-h-[420px] p-3 space-y-3">
                        <div class="flex items-center justify-between border-b border-gray-800 pb-2">
                            <h4 class="font-medium text-emerald-300">Done</h4>
                            <span class="text-xs text-opposite/50">{{ done.totalCount }}</span>
                        </div>
                        <div v-if="done.loading" class="flex justify-center py-8">
                            <Spinner width="2.5" height="2.5" />
                        </div>
                        <div v-else-if="done.runs.length === 0" class="text-sm text-opposite/50 py-6 text-center">
                            No runs.
                        </div>
                        <div v-else class="space-y-2 flex flex-col">
                            <a v-for="run in done.runs" :key="run.id" :href="(getCompletedRoute(run) as string)" target="_blank"
                                class="bg-secondary rounded border border-gray-800 p-3 text-sm space-y-2">
                                <div class="text-opposite/80 break-all">{{ run.workflow?.name }}</div>
                                <div class="text-opposite/60">Status: {{ run.status }}</div>
                                <div class="text-opposite/60">Updated: {{ formatDate(run.updatedAt) }}</div>
                            </a>
                        </div>
                    </section>
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
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { formatDate } from '@/util/util'
import {
    getWorkflowRunsByStatus,
} from '@/components/automation/endpoints'
import type { WorkflowRun } from '@/components/automation/workflow.interface'
import { getAwaitingActionRoute, getCompletedRoute } from './dto'

type KanbanColumnState = {
    loading: boolean
    totalCount: number
    runs: WorkflowRun[]
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const workflowId = computed(() => route.params.id ? route.params.id as string : null)
const perPage = 20

const awaiting = ref<KanbanColumnState>({
    loading: false,
    totalCount: 0,
    runs: [],
})
const inProgress = ref<KanbanColumnState>({
    loading: false,
    totalCount: 0,
    runs: [],
})
const done = ref<KanbanColumnState>({
    loading: false,
    totalCount: 0,
    runs: [],
})

const crumbs = computed(() => ([
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '/automation/workflows' },
    { name: 'Workflow Runs Kanban', path: '' },
]))

const loadAwaiting = async () => {
    awaiting.value.loading = true
    try {
        const res = await getWorkflowRunsByStatus(workflowId.value, authStore, "awaiting_action", { page: 1, perPage })
        awaiting.value.runs = res.data
        awaiting.value.totalCount = res.totalCount
    } finally {
        awaiting.value.loading = false
    }
}

const loadInProgress = async () => {
    inProgress.value.loading = true
    try {
        const res = await getWorkflowRunsByStatus(workflowId.value, authStore, "pending", { page: 1, perPage })
        inProgress.value.runs = res.data
        inProgress.value.totalCount = res.totalCount
    } finally {
        inProgress.value.loading = false
    }
}

const loadDone = async () => {
    done.value.loading = true
    try {
        const res = await getWorkflowRunsByStatus(workflowId.value, authStore, "completed", { page: 1, perPage })
        done.value.runs = res.data
        done.value.totalCount = res.totalCount
    } finally {
        done.value.loading = false
    }
}

const refreshColumns = async () => {
    try {
        await Promise.all([loadAwaiting(), loadInProgress(), loadDone()])
    } catch {
        toast.showToast('Error', 'Failed to load workflow kanban runs', 'error')
    }
}

const goBack = () => {
    router.push('/automation/workflows')
}

onMounted(() => {
    refreshColumns()
})
</script>
