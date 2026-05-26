<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium text-opposite">Workflow Runs</h3>
                    <AppButton buttonStyle="secondary" type="button" @click="goBack">
                        Back
                    </AppButton>
                </div>

                <div class="bg-main rounded-lg border border-gray-800 p-4">
                    <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 text-sm text-opposite/80">
                        <label class="inline-flex items-center gap-2 cursor-pointer">
                            <input v-model="hideCompleted" type="checkbox"
                                class="rounded border-gray-600 bg-secondary" />
                            <span>Hide completed</span>
                        </label>
                        <label class="inline-flex items-center gap-2 cursor-pointer">
                            <input v-model="hideSkipped" type="checkbox" class="rounded border-gray-600 bg-secondary" />
                            <span>Hide skipped</span>
                        </label>
                        <label class="inline-flex items-center gap-2 cursor-pointer">
                            <input v-model="onlyShowAwaitingActions" type="checkbox"
                                class="rounded border-gray-600 bg-secondary" />
                            <span>Only show awaiting actions</span>
                        </label>
                    </div>
                </div>

                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="runs.length === 0"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                    No runs found for this workflow.
                </div>

                <div v-else class="space-y-3">
                    <WorkflowRunCard
                        v-for="run in runs"
                        :key="run.id"
                        :run="run"
                        mode="full"
                        link-mode="none"
                        show-status
                    />

                    <div v-if="totalCount > 10"
                        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-opposite/70 bg-main rounded-lg border border-gray-800 px-4 py-3">
                        <span>
                            Showing {{ rangeStart }}–{{ rangeEnd }} of {{ totalCount }} runs
                        </span>
                        <div class="flex flex-wrap items-center gap-2">
                            <label class="inline-flex items-center gap-2">
                                <Select2 v-model.number="perPage" :values="perPageOptions"
                                    :display="(value: number) => value.toString()" placeholder="Per page" />
                            </label>
                            <div class="flex items-center gap-1">
                                <AppButton type="button" buttonStyle="secondary" :disabled="currentPage <= 1"
                                    @click="goToPage(currentPage - 1)">
                                    Previous
                                </AppButton>
                                <span class="px-2 text-opposite/60">
                                    Page {{ currentPage }} of {{ totalPages }}
                                </span>
                                <AppButton type="button" buttonStyle="secondary" :disabled="currentPage >= totalPages"
                                    @click="goToPage(currentPage + 1)">
                                    Next
                                </AppButton>
                            </div>
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
import { getWorkflowRuns } from '@/components/automation/endpoints'
import type { WorkflowRun } from '@/components/automation/workflow.interface'
import WorkflowRunCard from '@/components/automation/WorkflowRunCard.vue'
import Select2 from '../Select2.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const workflowId = computed(() => route.params.id as string)

const loading = ref(false)
const runs = ref<WorkflowRun[]>([])
const hideCompleted = ref(false)
const hideSkipped = ref(false)
const onlyShowAwaitingActions = ref(false)

const currentPage = ref(1)
const perPage = ref(10)
const totalCount = ref(0)
const perPageOptions = [10, 25, 50, 100]

const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalCount.value / perPage.value)),
)

const rangeStart = computed(() => {
    if (totalCount.value === 0) return 0
    return (currentPage.value - 1) * perPage.value + 1
})

const rangeEnd = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.min(currentPage.value * perPage.value, totalCount.value)
})

const crumbs = computed(() => ([
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '/automation/workflows' },
    { name: 'Workflow Runs', path: '' },
]))

const loadRuns = async () => {
    loading.value = true
    try {
        const res = await getWorkflowRuns(workflowId.value, authStore, {
            hideCompleted: hideCompleted.value,
            hideSkipped: hideSkipped.value,
            onlyShowAwaitingActions: onlyShowAwaitingActions.value,
            page: currentPage.value,
            perPage: perPage.value,
        })
        runs.value = res.data
        totalCount.value = res.totalCount
        if (res.currentPage !== currentPage.value) {
            currentPage.value = res.currentPage
        }
    } catch {
        runs.value = []
        totalCount.value = 0
        toast.showToast('Error', 'Failed to load workflow runs', 'error')
    } finally {
        loading.value = false
    }
}

const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages.value)
    if (next !== currentPage.value) {
        currentPage.value = next
    }
}

const goBack = () => {
    router.push('/automation/workflows')
}

watch(workflowId, () => {
    currentPage.value = 1
}, { flush: 'sync' })

watch(
    () => [hideCompleted.value, hideSkipped.value, onlyShowAwaitingActions.value],
    () => {
        currentPage.value = 1
    },
    { flush: 'sync' },
)

watch(perPage, () => {
    currentPage.value = 1
}, { flush: 'sync' })

watch(
    [workflowId, hideCompleted, hideSkipped, onlyShowAwaitingActions, currentPage, perPage],
    () => {
        loadRuns()
    },
    { immediate: true },
)
</script>
