<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-opposite">Workflows</h3>
                    <button disabled type="button" @click="goToNewWorkflow"
                        class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <i class="fa-solid fa-plus"></i>
                        Add Workflow (Coming Soon)
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
                        class="bg-secondary rounded-lg border border-gray-800 p-4 flex items-center justify-between">
                        <div>
                            <div class="text-opposite font-medium">{{ wf.workflow?.name }}</div>
                            <div v-if="wf.workflow?.description" class="text-sm text-opposite/60 mt-1">
                                {{ wf.workflow?.description }}
                            </div>
                            <div class="flex gap-4 mt-1 text-xs text-opposite/40">
                                <span v-if="wf.workflow?.createdAt">Created: {{ formatDate(wf.workflow.createdAt)
                                    }}</span>
                                <span v-if="wf.workflow?.updatedAt">Updated: {{ formatDate(wf.workflow.updatedAt)
                                    }}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <router-link :to="`/automation/workflows/${wf.id}`"
                                class="text-opposite/50 hover:text-opposite text-sm" title="View">
                                <i class="fa-solid fa-eye"></i>
                            </router-link>
                            <router-link :to="`/automation/workflows/${wf.id}/edit`"
                                class="text-blue-400 hover:text-blue-300 text-sm" title="Edit">
                                <i class="fa-solid fa-pen"></i>
                            </router-link>
                            <AppButton buttonStyle="void" class="text-red-400 hover:text-red-300 text-sm"
                                :warnBefore="`Are you sure you want to delete workflow &quot;${wf.workflow?.name}&quot;?`"
                                @click="deleteWorkflowConfirmed(wf)">
                                <i class="fa-solid fa-trash"></i>
                            </AppButton>
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
import { formatDate } from '@/util/util'
import {
    getWorkflows,
    deleteWorkflow,
} from '@/components/automation/endpoints'
import type { WorkflowTriggerData } from '@/components/automation/endpoints'

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '' },
]

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const workflows = ref<WorkflowTriggerData[]>([])
const loadingWorkflows = ref(false)




function goToNewWorkflow() {
    router.push('/automation/workflows/new')
}

const deleteWorkflowConfirmed = async (wf: WorkflowTriggerData) => {
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
