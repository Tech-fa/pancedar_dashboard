<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-opposite">Workflows</h3>
                    <div class="flex items-center gap-2">
                        <Can :subject="'workflows'" :actions="['deploy']">
                            <AppButton buttonStyle="void"
                                class="text-green-500 hover:text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                :loading="deployingLightsails" :warnBefore="'Deploy all Lightsails?'"
                                @click="deployLightsailsConfirmed">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                                <span>Deploy Lightsails</span>
                            </AppButton>
                        </Can>
                        <AppButton buttonStyle="primary" @click="goToNewWorkflow">
                            Add Workflow
                        </AppButton>
                        <AppButton buttonStyle="void"
                            class="text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                            @click="viewWorkflowRunsKanban()">
                            <i class="fa-solid fa-table-columns"></i>
                            <span>Kanban</span>
                        </AppButton>
                    </div>
                </div>

                <div v-if="loadingWorkflows" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="workflows.length === 0"
                    class="text-center py-12 text-opposite/50 bg-secondary rounded-lg border border-gray-800">
                    No workflows defined yet.
                </div>

                <div v-else class="space-y-3">
                    <WorkflowCard v-for="wf in workflows" :key="wf.id" :workflow="wf">
                        <Can :subject="'workflows'" :actions="['update']">
                            <AppButton v-if="!wf.isStopped && wf.lightSailInstanceId" buttonStyle="void"
                                class="text-orange-500 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                :loading="stoppingWorkflowId === wf.id"
                                :warnBefore="`Stop workflow &quot;${wf.name}&quot;? This will tear down its Lightsail instance.`"
                                @click="stopWorkflowConfirmed(wf)">
                                <i class="fa-solid fa-stop"></i>
                                <span>Stop</span>
                            </AppButton>
                            <AppButton v-else-if="wf.isStopped" buttonStyle="void"
                                class="text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                :loading="startingWorkflowId === wf.id"
                                :warnBefore="`Start workflow &quot;${wf.name}&quot;? This will recreate its Lightsail instance if needed.`"
                                @click="startWorkflowConfirmed(wf)">
                                <i class="fa-solid fa-play"></i>
                                <span>Start</span>
                            </AppButton>
                        </Can>
                        <Can :subject="'workflows'" :actions="['create']">
                            <AppButton v-if="wf.actionUrl && !wf.isStopped" buttonStyle="void"
                                class="text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                :loading="triggeringWorkflowId === wf.id"
                                :warnBefore="wf.actionFields?.length ? undefined : 'Run Workflow now? This will trigger the workflow and cannot be undone.'"
                                @click="triggerWorkflowConfirmed(wf)">
                                <i class="fa-solid fa-play"></i>
                                <span>Run Workflow</span>
                            </AppButton>
                        </Can>
                        <Can :subject="'workflows'" :actions="['read']">
                            <div class="flex items-center gap-2">
                                <AppButton buttonStyle="void"
                                    class="text-purple-500 hover:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                    @click="viewWorkflowRuns(wf)">
                                    <i class="fa-solid fa-clock-rotate-left"></i>
                                    <span>History</span>
                                </AppButton>
                                <AppButton buttonStyle="void"
                                    class="text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                    @click="viewWorkflowRunsKanban(wf)">
                                    <i class="fa-solid fa-table-columns"></i>
                                    <span>Kanban</span>
                                </AppButton>
                                <AppButton buttonStyle="void"
                                    class="text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                    @click="viewWorkflow(wf)">
                                    <i class="fa-solid fa-eye"></i>
                                    <span>View</span>
                                </AppButton>
                            </div>
                        </Can>
                        <Can :subject="'workflows'" :actions="['delete']">
                            <AppButton buttonStyle="void"
                                class="text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-400/60 rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                :warnBefore="`Are you sure you want to delete workflow &quot;${wf.name}&quot;?`"
                                @click="deleteWorkflowConfirmed(wf)">
                                <i class="fa-solid fa-trash"></i>
                                <span>Delete</span>
                            </AppButton>
                        </Can>
                    </WorkflowCard>
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
import {
    getWorkflows,
    deleteWorkflow,
    deployLightsails,
    stopWorkflow,
    startWorkflow,
    triggerWorkflow,
} from '@/components/automation/endpoints'
import type { Workflow } from '@/components/automation/workflow.interface'
import WorkflowActionDialog from '@/components/automation/WorkflowActionDialog.vue'
import WorkflowCard from '@/components/automation/WorkflowCard.vue'
import { useDialog } from '@/stores/dialog'
import Can from '../Can.vue'

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '' },
]

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const workflows = ref<Workflow[]>([])
const loadingWorkflows = ref(false)
const deployingLightsails = ref(false)
const triggeringWorkflowId = ref<string | null>(null)
const stoppingWorkflowId = ref<string | null>(null)
const startingWorkflowId = ref<string | null>(null)

function goToNewWorkflow() {
    router.push('/automation/workflows/new')
}

function viewWorkflow(wf: Workflow) {
    router.push(`/automation/workflows/${wf.id}`)
}

function viewWorkflowRuns(wf: Workflow) {
    router.push(`/automation/workflows/${wf.id}/runs`)
}

function viewWorkflowRunsKanban(wf?: Workflow) {
    if (wf) {
        router.push(`/automation/workflows/${wf.id}/runs/kanban`)
    } else {
        router.push(`/automation/workflows/kanban`)
    }
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

const runWorkflow = async (wf: Workflow, extraBody: Record<string, unknown> = {}) => {
    if (!wf.actionUrl) return
    triggeringWorkflowId.value = wf.id
    try {
        await triggerWorkflow(wf.id, wf.actionUrl, authStore, extraBody)
        toast.showToast(
            'Workflow started',
            `Started workflow ${wf.name}`,
            'success',
        )
        loadAllWorkflows()
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to start workflow',
            'error',
        )
    } finally {
        triggeringWorkflowId.value = null
    }
}

const triggerWorkflowConfirmed = (wf: Workflow) => {
    if (!wf.actionUrl) return

    if (wf.actionFields?.length) {
        dialog.openDialog(WorkflowActionDialog, {
            workflowName: wf.name,
            fields: wf.actionFields,
            onConfirm: async (values: Record<string, unknown>) => {
                dialog.closeDialog()
                await runWorkflow(wf, values)
            },
            onCancel: () => dialog.closeDialog(),
        })
        return
    }

    void runWorkflow(wf)
}

const stopWorkflowConfirmed = async (wf: Workflow) => {
    stoppingWorkflowId.value = wf.id
    try {
        await stopWorkflow(wf.id, authStore)
        toast.showToast('Stopped', `Stopped workflow ${wf.name}`, 'success')
        loadAllWorkflows()
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to stop workflow',
            'error',
        )
    } finally {
        stoppingWorkflowId.value = null
    }
}

const startWorkflowConfirmed = async (wf: Workflow) => {
    startingWorkflowId.value = wf.id
    try {
        await startWorkflow(wf.id, authStore)
        toast.showToast('Started', `Started workflow ${wf.name}`, 'success')
        loadAllWorkflows()
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to start workflow',
            'error',
        )
    } finally {
        startingWorkflowId.value = null
    }
}

const deployLightsailsConfirmed = async () => {
    deployingLightsails.value = true
    try {
        await deployLightsails(authStore)
        toast.showToast('Deployed', 'Lightsails deployed successfully', 'success')
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to deploy Lightsails', 'error')
    } finally {
        deployingLightsails.value = false
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
