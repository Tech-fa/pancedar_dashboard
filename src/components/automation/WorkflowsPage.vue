<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-opposite">Workflows</h3>
                    <button type="button" @click="goToNewWorkflow"
                        class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <i class="fa-solid fa-plus"></i>
                        Add Workflow
                    </button>
                </div>

                <div v-if="loadingWorkflows" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="workflows.length === 0"
                    class="text-center py-12 text-opposite/50 bg-secondary rounded-lg border border-gray-800">
                    No workflows defined yet.
                </div>

                <div v-else class="space-y-3">
                    <div v-for="wf in workflows" :key="wf.id"
                        class="bg-main rounded-md border border-gray-700/80 p-5 flex items-start justify-between gap-4 transition-all duration-200 hover:border-gray-500 hover:shadow-md hover:shadow-black/20">
                        <div class="min-w-0">
                            <div class="text-opposite font-semibold text-base truncate">{{ capitalizeFirstLetter(wf.name) }}</div>
                            <div class="text-opposite/50 font-semibold text-xs truncate">{{ wf.workflowType }}</div>
                            <div v-if="wf.description" class="text-sm text-opposite/80 mt-1">
                                {{ wf.description }}
                            </div>
                            <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-opposite/45">
                                <span v-if="wf.createdAt">Created: {{ formatDate(wf.createdAt) }}</span>
                                <span v-if="wf.updatedAt">Updated: {{ formatDate(wf.updatedAt) }}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap justify-end shrink-0">
                            <Can :subject="'workflows'" :actions="['read']">
                                <div class="flex items-center gap-2">
                                    <AppButton buttonStyle="void"
                                        class="text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                        @click="viewWorkflowRuns(wf)">
                                        <i class="fa-solid fa-clock-rotate-left"></i>
                                        <span>History</span>
                                    </AppButton>
                                    <AppButton buttonStyle="void"
                                        class="text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                        @click="viewWorkflowRunsKanban(wf)">
                                        <i class="fa-solid fa-table-columns"></i>
                                        <span>Kanban</span>
                                    </AppButton>
                                    <AppButton buttonStyle="void"
                                        class="text-blue-300 hover:text-blue-200 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                        @click="viewWorkflow(wf)">
                                        <i class="fa-solid fa-eye"></i>
                                        <span>View</span>
                                    </AppButton>
                                </div>
                            </Can>
                            <Can :subject="'workflows'" :actions="['delete']">
                                <div class="flex items-center gap-2">
                                    <AppButton buttonStyle="void"
                                        class="text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                        :warnBefore="`Are you sure you want to delete workflow &quot;${wf.name}&quot;?`"
                                        @click="deleteWorkflowConfirmed(wf)">
                                        <i class="fa-solid fa-trash"></i>
                                        <span>Delete</span>
                                    </AppButton>
                                </div>
                            </Can>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { capitalizeFirstLetter, formatDate } from '@/util/util'
import {
    getWorkflows,
    deleteWorkflow,
} from '@/components/automation/endpoints'
import type { Workflow } from '@/components/automation/workflow.interface'
import Can from '../Can.vue'

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '' },
]

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const workflows = ref<Workflow[]>([])
const loadingWorkflows = ref(false)

function goToNewWorkflow() {
    router.push('/automation/workflows/new')
}

function viewWorkflow(wf: Workflow) {
    router.push(`/automation/workflows/${wf.id}`)
}

function viewWorkflowRuns(wf: Workflow) {
    router.push(`/automation/workflows/${wf.id}/runs`)
}

function viewWorkflowRunsKanban(wf: Workflow) {
    router.push(`/automation/workflows/${wf.id}/runs/kanban`)
}

const deleteWorkflowConfirmed = async (wf: Workflow) => {
    try {
        await deleteWorkflow(wf.id, authStore)
        toast.showToast('Deleted', 'Workflow deleted successfully', 'success')
        loadAllWorkflows()
    } catch {
        toast.showToast('Error', 'Failed to delete workflow', 'error')
    }
}

const loadAllWorkflows = async () => {
    loadingWorkflows.value = true
    try {
        workflows.value = await getWorkflows(authStore)
    } catch {
        workflows.value = []
    } finally {
        loadingWorkflows.value = false
    }
}

onMounted(() => {
    loadAllWorkflows()
})
</script>
