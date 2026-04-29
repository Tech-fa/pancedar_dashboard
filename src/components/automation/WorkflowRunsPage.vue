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


                    <div v-for="run in runs" :key="run.id"
                        class="bg-main rounded-lg border border-gray-800 p-4 space-y-3">
                        <div class="flex items-center justify-between gap-4">

                            <div class="text-xs uppercase tracking-wide px-2 py-1 rounded border"
                                :class="statusClass(run.status)">
                                {{ run.status }}
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div class="text-opposite/70">
                                <span class="text-opposite/50">Created:</span> {{ formatDate(run.createdAt) }}
                            </div>
                            <div class="text-opposite/70">
                                <span class="text-opposite/50">Updated:</span> {{ formatDate(run.updatedAt) }}
                            </div>
                            <div class="text-opposite/70" v-if="run.currentStep && run.status !== 'completed'">
                                <span class="text-opposite/50">Current Step:</span> {{ run.currentStep || '-' }}
                            </div>
                            <div class="text-opposite/70" v-if="run.displayContext">
                                <div class="flex items-center gap-2" v-for="key in Object.keys(run.displayContext)"
                                    :key="key">
                                    <span class="text-opposite/50">{{ key }}:</span> {{
                                        formatIfTimestamp(run.displayContext[key]) }}
                                </div>
                            </div>
                        </div>
                        <div class="" v-if="run.explanation">
                            <span class="text-opposite/50 text-sm"> Explanation on why the workflow was not
                                completed:</span> <span class=" font-bold text-opposite"> {{
                                    run.explanation.explanation }}</span>
                        </div>

                        <div v-if="run.status === 'awaiting_action'"
                            class="text-sm text-opposite/80 bg-secondary rounded border border-gray-800 p-3">
                            <span class="text-opposite/50">Awaiting Action Step:</span> {{ getAwaitingActionStep(run) ||
                                '-' }}
                        </div>

                        <div v-if="run.status === 'awaiting_action' && getAwaitingActionRoute(run)" class="pt-1">
                            <a class="text-blue-400 hover:text-blue-300 text-sm p-0"
                                :href="(getAwaitingActionRoute(run) as string)" target="_blank">
                                <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i>
                                Manually Approve
                            </a>
                        </div>
                        <div v-if="run.status === 'completed' && getCompletedRoute(run)" class="pt-1"> <a
                                class="text-blue-400 hover:text-blue-300 text-sm p-0 cursor-pointer"
                                :href="(getCompletedRoute(run) as string)" target="_blank">
                                <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i>
                                View Details
                            </a></div>

                    </div>
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
import { formatDate, formatIfTimestamp } from '@/util/util'
import { getWorkflowRuns } from '@/components/automation/endpoints'
import type { WorkflowRun } from '@/components/automation/workflow.interface'
import Select2 from '../Select2.vue'
import { getAwaitingActionRoute, getAwaitingActionStep, getCompletedRoute } from './dto'



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

const statusClass = (status: string) => {
    if (status === 'awaiting_action') {
        return 'text-amber-300 border-amber-500/50 bg-amber-500/10'
    }
    return 'text-opposite/70 border-gray-700 bg-transparent'
}









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
