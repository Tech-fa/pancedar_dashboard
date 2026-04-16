<template>
    <BreadCrums :crumbs="[
        {
            name: 'Jobs',
            path: '/fleet/planned-jobs',
            icon: 'fa-solid fa-briefcase text-neutral-700 text-2xl'
        },
        {
            name: job?.name || 'View Job',
            path: '',
            icon: ''
        }
    ]">
        <div class="flex items-center gap-3">
            <Can :subject="'vehicle-job'" :actions="['update']">
                <AppButton buttonStyle="secondary" @click="editJob">
                    <i class="fa-solid fa-edit mr-2"></i>
                    Edit Job
                </AppButton>
            </Can>
        </div>
    </BreadCrums>

    <div v-if="pageLoading" class="flex items-center justify-center py-24">
        <Spinner width="3" height="3" />
    </div>

    <div v-else-if="job" class="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <!-- Job Details -->
        <section v-if="showJobDetails" class="bg-secondary border border-gray-800 rounded-lg">
            <div class="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-opposite">{{ job.name }}</h2>
                    <p v-if="job.displayId" class="text-sm text-opposite/60">{{ job.displayId }}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getStatusClass(job.status)">
                        {{ statusLabel(job.status) }}
                    </span>

                    <AppButton v-if="isAssignedPilot && isInExecutionStatus && pilotViewMode && checklists.length > 0"
                        buttonStyle="primary" @click="pilotViewMode = false" class="ml-2">
                        <i class="fa-solid fa-play mr-2"></i>
                        Show Execution Panel
                    </AppButton>

                    <Can :subject="'vehicle-job'" :actions="['update']">
                        <!-- Draft → Planned -->
                        <AppButton v-if="job.status === 'Draft'" buttonStyle="primary" :loading="statusUpdating"
                            @click="confirmPlan" class="ml-2">
                            <i class="fa-solid fa-check mr-2"></i>
                            Confirm Plan
                        </AppButton>
                        <!-- Planned → InProgress (only pilot) -->
                        <AppButton v-else-if="isAssignedPilot && job.status === 'Planned'" buttonStyle="primary"
                            :loading="statusUpdating" @click="startExecution" class="ml-2">
                            <i class="fa-solid fa-play mr-2"></i>
                            Execute Job
                        </AppButton>
                        <!-- InProgress + pre-job checklist done → Executed (only pilot) -->
                        <AppButton
                            v-else-if="isAssignedPilot && job.status === 'InProgress' && (preJobChecklistComplete || checklists.length === 0)"
                            buttonStyle="primary" :loading="statusUpdating" @click="markAsExecuted" class="ml-2">
                            <i class="fa-solid fa-flag-checkered mr-2"></i>
                            Mark as Executed
                        </AppButton>
                        <!-- Executed → PostExecution (only pilot) -->
                        <AppButton v-else-if="isAssignedPilot && job.status === 'Executed'" buttonStyle="primary"
                            :loading="statusUpdating" @click="startPostExecution" class="ml-2">
                            <i class="fa-solid fa-clipboard-check mr-2"></i>
                            Post Execution
                        </AppButton>
                    </Can>
                </div>
            </div>

            <div class="p-6 space-y-6">
                <div v-if="job.description" class="text-opposite/80 text-sm">
                    {{ job.description }}
                </div>

                <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div v-if="job.jobType">
                        <label class="text-xs text-opposite/60 block mb-1">Job Type</label>
                        <p class="text-opposite text-sm font-medium">{{ job.jobType.name }}</p>
                    </div>
                    <div v-if="job.customer">
                        <label class="text-xs text-opposite/60 block mb-1">Customer</label>
                        <p class="text-opposite text-sm font-medium">{{ job.customer.name }}</p>
                    </div>
                    <div v-if="job.asset">
                        <label class="text-xs text-opposite/60 block mb-1">Vehicle</label>
                        <p class="text-opposite text-sm font-medium">{{ job.asset.name }}</p>
                    </div>
                    <div v-if="job.assignedPilot">
                        <label class="text-xs text-opposite/60 block mb-1">Assigned Pilot</label>
                        <p class="text-opposite text-sm font-medium">
                            {{ job.assignedPilot.fname }} {{ job.assignedPilot.lname }}
                        </p>
                    </div>
                    <div v-if="job.startDate">
                        <label class="text-xs text-opposite/60 block mb-1">Start Date</label>
                        <p class="text-opposite text-sm font-medium">{{ formatDate(job.startDate) }}</p>
                    </div>
                    <div v-if="job.endDate">
                        <label class="text-xs text-opposite/60 block mb-1">End Date</label>
                        <p class="text-opposite text-sm font-medium">{{ formatDate(job.endDate) }}</p>
                    </div>
                    <div v-if="job.dueDate">
                        <label class="text-xs text-opposite/60 block mb-1">Due Date</label>
                        <p class="text-opposite text-sm font-medium">{{ formatDate(job.dueDate) }}</p>
                    </div>
                </div>

                <div v-if="job.notes" class="border-t border-gray-800 pt-4">
                    <label class="text-xs text-opposite/60 block mb-1">Notes</label>
                    <p class="text-opposite/80 text-sm whitespace-pre-wrap">{{ job.notes }}</p>
                </div>
            </div>
        </section>

        <!-- Line Items -->
        <!-- <section v-if="showJobDetails" class="bg-secondary border border-gray-800 rounded-lg">
            <div class="px-6 py-4 border-b border-gray-800">
                <h2 class="text-lg font-semibold text-opposite">
                    Line Items ({{ job.lineItems?.length || 0 }})
                </h2>
            </div>

            <div class="p-6">
                <div v-if="job.lineItems && job.lineItems.length > 0" class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-opposite/70 uppercase border-b border-gray-700">
                            <tr>
                                <th class="px-4 py-3">#</th>
                                <th class="px-4 py-3">Drone</th>
                                <th class="px-4 py-3">Pilot</th>
                                <th class="px-4 py-3">Duration</th>
                                <th class="px-4 py-3">Rate</th>
                                <th class="px-4 py-3 text-right">Line Total</th>
                                <th class="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in job.lineItems" :key="item.id" class="border-b border-gray-800">
                                <td class="px-4 py-3 text-opposite font-medium">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-opposite">
                                    {{ item.asset?.name || 'Unknown' }}
                                </td>
                                <td class="px-4 py-3 text-opposite">
                                    <span v-if="item.pilot">
                                        {{ item.pilot.fname }} {{ item.pilot.lname }}
                                    </span>
                                    <span v-else class="text-opposite/50">Not assigned</span>
                                </td>
                                <td class="px-4 py-3 text-opposite">
                                    {{ item.flightDurationMinutes ? `${item.flightDurationMinutes} min` : '-' }}
                                </td>
                                <td class="px-4 py-3 text-opposite">
                                    {{ item.hourlyRate ? `$${item.hourlyRate.toFixed(2)}/hr` : '-' }}
                                </td>
                                <td class="px-4 py-3 text-opposite text-right font-medium">
                                    {{ item.lineTotal ? `$${item.lineTotal.toFixed(2)}` : '-' }}
                                </td>
                                <td class="px-4 py-3">
                                    <span class="text-xs px-2 py-0.5 rounded"
                                        :class="getLineItemStatusClass(item.status)">
                                        {{ item.status }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-opposite/60 text-sm text-center py-4">
                    No line items for this job
                </div>
            </div>
        </section> -->

        <!-- Pricing -->
        <!-- <section v-if="showJobDetails && job.totalAmount > 0" class="bg-secondary border border-gray-800 rounded-lg">
            <div class="px-6 py-4 border-b border-gray-800">
                <h2 class="text-lg font-semibold text-opposite">Pricing</h2>
            </div>
            <div class="p-6 space-y-2 text-sm max-w-sm">
                <div class="flex justify-between">
                    <span class="text-opposite/60">Subtotal</span>
                    <span class="text-opposite">
                        ${{ ((+job.totalAmount || 0) - (+job.tax || 0) + (+job.discount || 0)).toFixed(2) }}
                    </span>
                </div>
                <div v-if="job.discount > 0" class="flex justify-between">
                    <span class="text-opposite/60">Discount</span>
                    <span class="text-green-400">-${{ (+job.discount || 0).toFixed(2) }}</span>
                </div>
                <div v-if="job.tax > 0" class="flex justify-between">
                    <span class="text-opposite/60">Tax</span>
                    <span class="text-opposite">${{ (+job.tax || 0).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between font-semibold border-t border-gray-700 pt-2 mt-2">
                    <span class="text-opposite">Total</span>
                    <span class="text-opposite">${{ (+job.totalAmount || 0).toFixed(2) }}</span>
                </div>
            </div>
        </section> -->

        <!-- Checklist Actions (read-only) -->
        <ChecklistItemActionsView v-if="checklistActionsGroups.length > 0" :groups="checklistActionsGroups"
            :completed-item-ids="completedChecklistItemIds" />

        <!-- Checklist Execution Panel (pilot only) -->
        <section v-if="activeChecklist" class="bg-secondary border border-gray-800 rounded-lg">
            <div class="px-6 py-4 border-b border-gray-800">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-xs font-medium" :class="activeChecklist.type === 'PRE_JOB'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-teal-500/20 text-teal-400'">
                            {{ activeChecklist.type === 'PRE_JOB' ? 'Pre-Job' : 'Post-Job' }}
                        </span>
                        <h2 class="text-lg font-semibold text-opposite">{{ activeChecklist.name }}</h2>
                    </div>
                    <button type="button"
                        class="text-sm text-opposite/60 hover:text-opposite transition-colors flex items-center gap-1.5"
                        @click="pilotViewMode = true">
                        <i class="fa-solid fa-eye"></i>
                        View Job Details
                    </button>
                </div>
                <p v-if="activeChecklist.description" class="text-sm text-opposite/60 mt-1">
                    {{ activeChecklist.description }}
                </p>
                <div class="flex items-center gap-2 mt-3">
                    <div class="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div class="bg-green-500 h-full rounded-full transition-all duration-300"
                            :style="{ width: `${checklistProgress}%` }"></div>
                    </div>
                    <span class="text-xs text-opposite/60">
                        {{ currentStepIndex + 1 }} / {{ totalStepCount }}
                    </span>
                </div>
            </div>

            <div v-if="checklistLoading" class="flex items-center justify-center py-12">
                <Spinner width="3" height="3" />
            </div>

            <div v-else class="p-6">
                <!-- Step progress indicators -->
                <div class="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                    <div v-for="(item, idx) in activeChecklistItems" :key="item.id" class="flex items-center shrink-0">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            :class="idx < currentStepIndex
                                ? 'bg-green-500 text-white'
                                : idx === currentStepIndex
                                    ? 'bg-accent-blue text-white ring-2 ring-accent-blue/40'
                                    : 'bg-gray-700 text-gray-500'">
                            <span v-if="idx < currentStepIndex"><i class="fa-solid fa-check"></i></span>
                            <span v-else>{{ idx + 1 }}</span>
                        </div>
                        <div v-if="idx < activeChecklistItems.length - 1" class="w-6 h-0.5 mx-0.5"
                            :class="idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-700'"></div>
                    </div>
                </div>

                <!-- Current step -->
                <ChecklistItemExecution v-if="currentStep && job?.id" :key="`${job.id}-${currentStep.id}`"
                    :item="currentStep" :step-number="currentStepIndex + 1" :field-values="fieldValues" :job-id="job.id"
                    :show-previous="currentStepIndex > 0" :is-last-step="isLastStep"
                    @update:field-values="onFieldValuesUpdate" @confirm="confirmCurrentStep"
                    @previous="goToPreviousStep" @aborted="onJobAborted" />

                <!-- All steps completed message -->
                <div v-else class="text-center py-8">
                    <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-check-double text-green-400 text-2xl"></i>
                    </div>
                    <p class="text-opposite font-semibold text-lg">Checklist Complete</p>
                    <p class="text-opposite/60 text-sm mt-1">
                        All {{ activeChecklist.type === 'PRE_JOB' ? 'pre-job' : 'post-job' }} steps have been
                        completed.
                    </p>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { getVehicleJobById, getChecklistForJob, changeVehicleJobStatus, confirmChecklistItemInstance } from './endpoints'
import type {
    ChecklistActionsGroup,
    ChecklistForJob,
    ChecklistItemConfirmStoreFields,
    ChecklistItemForJob,
} from './endpoints'
import type { VehicleJob } from '@/util/interfaces'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Can from '@/components/Can.vue'
import Spinner from '@/components/Spinner.vue'
import ChecklistItemActionsView from './ChecklistItemActionsView.vue'
import ChecklistItemExecution from './ChecklistItemExecution.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const job = ref<VehicleJob | null>(null)
const pageLoading = ref(true)
const statusUpdating = ref(false)
const checklists = ref<ChecklistForJob[]>([])
const checklistLoading = ref(false)
const currentStepIndex = ref(0)
const completedSteps = ref(new Set<string>())
const fieldValues = ref<Record<string, string>>({})
const pilotViewMode = ref(false)

const isAssignedPilot = computed(() => {
    if (!job.value?.assignedPilotId) return false
    return job.value.assignedPilotId === authStore.state.userDetails?.id
})

const isInExecutionStatus = computed(() =>
    job.value?.status === 'InProgress' || job.value?.status === 'PostExecution'
)

const showExecutionPanel = computed(() =>
    isAssignedPilot.value && isInExecutionStatus.value && !pilotViewMode.value && checklists.value.length > 0
)

const showJobDetails = computed(() => !showExecutionPanel.value)

const activeChecklist = computed<ChecklistForJob | null>(() => {
    if (!showExecutionPanel.value || !job.value) return null
    if (job.value.status === 'InProgress') {
        return checklists.value.find((c) => c.type === 'PRE_JOB') || null
    }
    if (job.value.status === 'PostExecution') {
        return checklists.value.find((c) => c.type === 'POST_JOB') || null
    }
    return null
})

const activeChecklistItems = computed<ChecklistItemForJob[]>(() => {
    if (!activeChecklist.value?.items) return []
    return [...activeChecklist.value.items].sort((a, b) => a.order - b.order)
})

const checklistActionsGroups = computed<ChecklistActionsGroup[]>(() => {
    if (!job.value || checklists.value.length === 0) return []
    if (showExecutionPanel.value) return []

    const validStatuses = ['InProgress', 'PostExecution', 'Executed', 'Completed']
    if (!validStatuses.includes(job.value.status)) return []

    const groups: ChecklistActionsGroup[] = []
    const preJob = checklists.value.find((c) => c.type === 'PRE_JOB')
    const postJob = checklists.value.find((c) => c.type === 'POST_JOB')
    if (preJob?.items?.length) {
        groups.push({
            type: 'PRE_JOB',
            checklistName: preJob.name,
            description: preJob.description,
            items: [...preJob.items],
        })
    }
    if (postJob?.items?.length && ['PostExecution', 'Completed'].includes(job.value.status)) {
        groups.push({
            type: 'POST_JOB',
            checklistName: postJob.name,
            description: postJob.description,
            items: [...postJob.items],
        })
    }
    return groups
})

const completedChecklistItemIds = computed<Set<string>>(() => {
    const ids = new Set<string>()
    for (const cl of checklists.value) {
        for (const item of cl.items || []) {
            if (item.instance?.confirmedAt) {
                ids.add(item.id)
            }
        }
    }
    return ids
})

const preJobChecklistComplete = computed(() => {
    if (!job.value || job.value.status !== 'InProgress') return false
    const preJob = checklists.value.find((c) => c.type === 'PRE_JOB')
    if (!preJob?.items?.length) return false
    return preJob.items.every((item) => item.instance?.confirmedAt)
})

const totalStepCount = computed(() => activeChecklistItems.value.length)

const completedStepCount = computed(() => {
    return activeChecklistItems.value.filter((item) => completedSteps.value.has(item.id)).length
})

const checklistProgress = computed(() => {
    if (totalStepCount.value === 0) return 0
    return Math.round(((currentStepIndex.value + 1) / totalStepCount.value) * 100)
})

const currentStep = computed<ChecklistItemForJob | null>(() => {
    if (currentStepIndex.value >= activeChecklistItems.value.length) return null
    return activeChecklistItems.value[currentStepIndex.value] || null
})

const isLastStep = computed(() => {
    return currentStepIndex.value === activeChecklistItems.value.length - 1
})

const onFieldValuesUpdate = (v: Record<string, string>) => {
    fieldValues.value = v
}

const confirmCurrentStep = async (payload: {
    instanceId: string
    storeFields: ChecklistItemConfirmStoreFields
}) => {
    if (!currentStep.value) return
    try {
        await confirmChecklistItemInstance(payload.instanceId, authStore, payload.storeFields)
    } catch (err: any) {
        toast.showToast('Error', err?.response?.data?.message || 'Failed to confirm step', 'error')
        return
    }
    completedSteps.value.add(currentStep.value.id)

    if (isLastStep.value) {
        await onChecklistComplete()
    } else {
        currentStepIndex.value++
    }
}

const goToPreviousStep = () => {
    if (currentStepIndex.value > 0) {
        const prevItem = activeChecklistItems.value[currentStepIndex.value]
        if (prevItem) completedSteps.value.delete(prevItem.id)
        currentStepIndex.value--
    }
}

const onJobAborted = () => {
    if (job.value) {
        job.value.status = 'Cancelled' as any
        resetChecklistState()
        pilotViewMode.value = true
    }
}

const onChecklistComplete = async () => {
    if (!job.value) return
    if (job.value.status === 'InProgress') {
        toast.showToast('Success', 'Pre-job checklist completed. You can now mark the job as executed.', 'success')
        resetChecklistState()
        await fetchChecklists()
        pilotViewMode.value = true
    } else if (job.value.status === 'PostExecution') {
        statusUpdating.value = true
        try {
            const updated = await changeVehicleJobStatus(job.value.id, 'Completed', authStore)
            job.value.status = updated.status ?? 'Completed'
            toast.showToast('Success', 'Post-execution checklist completed. Job is now complete.', 'success')
            resetChecklistState()
            await fetchChecklists()
        } catch (err: any) {
            toast.showToast('Error', err?.response?.data?.message || 'Failed to update status', 'error')
        } finally {
            statusUpdating.value = false
        }
    }
}

const markAsExecuted = async () => {
    if (!job.value) return
    statusUpdating.value = true
    try {
        const updated = await changeVehicleJobStatus(job.value.id, 'Executed', authStore)
        job.value.status = updated.status ?? 'Executed'
        toast.showToast('Success', 'Job marked as executed.', 'success')
    } catch (err: any) {
        toast.showToast('Error', err?.response?.data?.message || 'Failed to update status', 'error')
    } finally {
        statusUpdating.value = false
    }
}

const resetChecklistState = () => {
    currentStepIndex.value = 0
    completedSteps.value.clear()
    fieldValues.value = {}
}

const statusLabel = (status: string): string => {
    switch (status) {
        case 'InProgress': return 'In Execution'
        case 'Executed': return 'Executed'
        case 'PostExecution': return 'Post Execution'
        case 'Completed': return 'Completed'
        default: return status
    }
}

const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getStatusClass = (status: string): string => {
    switch (status) {
        case 'Draft': return 'bg-gray-500/20 text-gray-300'
        case 'Planned': return 'bg-purple-500/20 text-purple-300'
        case 'InProgress': return 'bg-blue-500/20 text-blue-300'
        case 'Executed': return 'bg-cyan-500/20 text-cyan-300'
        case 'PostExecution': return 'bg-orange-500/20 text-orange-300'
        case 'Completed': return 'bg-green-500/20 text-green-300'
        case 'Cancelled': return 'bg-red-500/20 text-red-300'
        default: return 'bg-gray-500/20 text-gray-300'
    }
}

const getLineItemStatusClass = (status: string): string => {
    switch (status) {
        case 'Pending': return 'bg-gray-500/20 text-gray-300'
        case 'InProgress': return 'bg-blue-500/20 text-blue-300'
        case 'Completed': return 'bg-green-500/20 text-green-300'
        case 'Cancelled': return 'bg-red-500/20 text-red-300'
        default: return 'bg-gray-500/20 text-gray-300'
    }
}

const confirmPlan = async () => {
    if (!job.value) return
    statusUpdating.value = true
    try {
        const updated = await changeVehicleJobStatus(job.value.id, 'Planned', authStore)
        job.value.status = updated.status ?? 'Planned'
        toast.showToast('Success', 'Job confirmed as Planned', 'success')
    } catch (err: any) {
        toast.showToast('Error', err?.response?.data?.message || 'Failed to update status', 'error')
    } finally {
        statusUpdating.value = false
    }
}

const startExecution = async () => {
    if (!job.value) return
    statusUpdating.value = true
    try {
        let status = 'InProgress';
        if (!checklists.value.find((c) => c.type === 'PRE_JOB')) {
            status = 'PostExecution';
        }
        if (!checklists.value.find((c) => c.type === 'POST_JOB')) {
            status = 'Completed';
        }
        const updated = await changeVehicleJobStatus(job.value.id, status, authStore)
        job.value.status = updated.status ?? 'InProgress'
        resetChecklistState()
        await fetchChecklists()
    } catch (err: any) {
        toast.showToast('Error', err?.response?.data?.message || 'Failed to start execution', 'error')
    } finally {
        statusUpdating.value = false
    }
}

const startPostExecution = async () => {
    if (!job.value) return
    statusUpdating.value = true
    try {
        const updated = await changeVehicleJobStatus(job.value.id, 'PostExecution', authStore)
        job.value.status = updated.status ?? 'PostExecution'
        resetChecklistState()
        if (checklists.value.length === 0) {
            await fetchChecklists()
        }
        pilotViewMode.value = true
    } catch (err: any) {
        toast.showToast('Error', err?.response?.data?.message || 'Failed to start post-execution', 'error')
    } finally {
        statusUpdating.value = false
    }
}

const editJob = () => {
    if (job.value) {
        router.push(`/fleet/plan-job?jobId=${job.value.id}`)
    }
}

const fetchChecklists = async () => {
    if (!job.value?.id) return
    checklistLoading.value = true
    try {
        checklists.value = await getChecklistForJob(job.value.id, authStore)
        for (const cl of checklists.value) {
            for (const item of cl.items || []) {
                if (item.instance?.confirmedAt) {
                    completedSteps.value.add(item.id)
                }
            }
        }
        if (!checklists.value.length) {
            pilotViewMode.value = false;


        }
    } catch (err) {
        console.error('Error fetching checklists:', err)
    } finally {
        checklistLoading.value = false
    }
}

onMounted(async () => {
    const jobId = route.params.jobId as string
    if (!jobId) {
        router.push('/fleet/planned-jobs')
        return
    }

    try {
        job.value = await getVehicleJobById(jobId, authStore)
        if (job.value && ['InProgress', 'PostExecution', 'Executed', 'Completed'].includes(job.value.status)) {
            await fetchChecklists()
        }
    } catch (err: any) {
        toast.showToast(
            'Error',
            err?.response?.data?.message || 'Failed to load job.',
            'error'
        )
        router.push('/fleet/planned-jobs')
    } finally {
        pageLoading.value = false
    }
})
</script>
