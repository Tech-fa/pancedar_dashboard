<template>
    <div class="bg-secondary rounded-lg shadow-lg md:w-[600px] w-full h-[700px] overflow-y-auto border border-main"
        test-id="change-request-dialog">
        <div class="p-6 border-b">
            <div class="flex items-center justify-between" test-id="change-request-dialog-header">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-file-circle-plus text-opposite text-xl"></i>
                    <h2 class="text-lg font-semibold text-opposite">
                        {{ props.isViewMode ? 'View Change Request' : 'Create Change Request' }}
                    </h2>
                </div>
                <button @click="handleCancel" class="text-neutral-400 hover:text-neutral-600">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
        </div>

        <div class="p-6">
            <div v-if="props.isViewMode" class="space-y-6">
                <div v-if="isFetchingChangeRequest" class="flex justify-center py-8">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <template v-else-if="changeRequest">
                    <div>
                        <label class="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                        <div class="flex items-center gap-2">
                            <span :class="[
                                'px-2 py-1 rounded-full text-sm font-medium',
                                changeRequest.status === 'active'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : changeRequest.status === 'accepted'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                            ]">
                                {{
                                    changeRequest.status === 'active'
                                        ? 'Active'
                                        : changeRequest.status === 'accepted'
                                            ? 'Accepted'
                                            : 'Rejected'
                                }}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-opposite/70 mb-2">Requested By</label>
                        <p class="text-opposite">
                            {{ changeRequest.requestedBy?.fname }}
                            {{ changeRequest.requestedBy?.lname }}
                        </p>
                    </div>

                    <div v-if="changeRequest.documentIds && changeRequest.documentIds.length">
                        <label class="block text-sm font-medium text-neutral-700 mb-2">Documents</label>
                        <div class="bg-neutral-50 p-3 rounded-md">
                            <ul class="list-disc list-inside space-y-1">
                                <li v-for="document in changeRequest.documents" :key="document.id"
                                    class="text-blue-900 underline cursor-pointer" @click="
                                        () => {
                                            $router.push(`/qms/documents/${document.id}`)
                                            handleCancel()
                                        }
                                    ">
                                    Document : {{ document.title || 'N/A' }}
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-700 mb-2">Reason</label>
                        <div class="bg-neutral-50 p-3 rounded-md">
                            <p class="text-neutral-900 whitespace-pre-wrap">
                                {{ changeRequest.reason || 'No reason provided' }}
                            </p>
                        </div>
                    </div>
                    <div v-if="changeRequest.justification">
                        <label class="block text-sm font-medium text-neutral-700 mb-2">Justification</label>
                        <div class="bg-neutral-50 p-3 rounded-md">
                            <p class="text-neutral-900 whitespace-pre-wrap">
                                {{ changeRequest.justification }}
                            </p>
                        </div>
                    </div>
                    <div v-if="changeRequest.riskIdentified">
                        <label class="block text-sm font-medium text-neutral-700 mb-2">Risk Identified / Effects</label>
                        <div class="bg-neutral-50 p-3 rounded-md">
                            <p class="text-neutral-900 whitespace-pre-wrap">
                                {{ changeRequest.riskIdentified }}
                            </p>
                        </div>
                    </div>
                    <div v-if="changeRequest.reviewedBy">
                        <label class="block text-sm font-medium text-neutral-700 mb-2">Reviewed By</label>
                        <p class="text-neutral-900">
                            {{ changeRequest.reviewedBy?.fname }}
                            {{ changeRequest.reviewedBy?.lname }}
                        </p>
                    </div>
                    <div v-if="changeRequest.reviewComment">
                        <label class="block text-sm font-medium text-neutral-700 mb-2">Review Comment</label>
                        <div class="bg-neutral-50 p-3 rounded-md">
                            <p class="text-neutral-900 whitespace-pre-wrap">
                                {{ changeRequest.reviewComment }}
                            </p>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-700 mb-2">Created</label>
                        <p class="text-neutral-900">
                            {{ formatDate(changeRequest.createdAt || 0) }}
                        </p>
                    </div>
                </template>
                <div class="p-6 border-t bg-neutral-50 flex justify-end gap-3" v-if="changeRequest">
                    <Can subject="change_requests" :actions="['update']" v-if="changeRequest.status === 'active'">
                        <AppButton type="button" buttonStyle="warning" @click="showRejectDialog = true"
                            :loading="isLoading">
                            <i class="fa-solid fa-ban mr-2"></i>
                            Reject
                        </AppButton>
                    </Can>
                    <Can subject="change_requests" :actions="['update']" v-if="changeRequest.status === 'active'">
                        <AppButton type="button" buttonStyle="success" @click="showApproveDialog = true"
                            :loading="isLoading">
                            <i class="fa-solid fa-check mr-2"></i>
                            Approve
                        </AppButton>
                    </Can>
                    <Can subject="change_requests" :actions="['delete']" v-if="
                        changeRequest.status === 'active' &&
                        changeRequest.requestedBy?.id === authStore.state.userDetails.id
                    ">
                        <AppButton type="button" buttonStyle="danger" @click="deleteChangeRequest" :loading="isLoading">
                            <i class="fa-solid fa-trash mr-2"></i>
                            Delete
                        </AppButton>
                    </Can>
                    <AppButton type="button" buttonStyle="secondary" @click="handleCancel">
                        Close
                    </AppButton>
                </div>

                <!-- Approve Dialog -->
                <div v-if="showApproveDialog"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 class="text-lg font-semibold mb-4">Approve Change Request</h3>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-neutral-700 mb-2">Review Comment
                                (Optional)</label>
                            <textarea v-model="approveComment" rows="3"
                                class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Add a comment about why you're approving this request..."></textarea>
                        </div>
                        <div class="flex justify-end gap-3">
                            <AppButton type="button" buttonStyle="secondary" @click="showApproveDialog = false"
                                :disabled="isLoading">
                                Cancel
                            </AppButton>
                            <AppButton type="button" buttonStyle="success" @click="approveChangeRequest"
                                :loading="isLoading">
                                <i class="fa-solid fa-check mr-2"></i>
                                Approve
                            </AppButton>
                        </div>
                    </div>
                </div>

                <!-- Reject Dialog -->
                <div v-if="showRejectDialog"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 class="text-lg font-semibold mb-4">Reject Change Request</h3>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-neutral-700 mb-2">Review Comment
                                (Required)</label>
                            <textarea v-model="rejectComment" rows="3"
                                class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Please provide a reason for rejecting this request..." required></textarea>
                        </div>
                        <div class="flex justify-end gap-3">
                            <AppButton type="button" buttonStyle="secondary" @click="showRejectDialog = false"
                                :disabled="isLoading">
                                Cancel
                            </AppButton>
                            <AppButton type="button" buttonStyle="warning" @click="rejectChangeRequest"
                                :loading="isLoading" :disabled="!rejectComment.trim()">
                                <i class="fa-solid fa-ban mr-2"></i>
                                Reject
                            </AppButton>
                        </div>
                    </div>
                </div>
            </div>
            <Form v-else @submit="submitChangeRequest" class="space-y-6" test-id="change-request-form">


                <div test-id="change-request-reason-field">
                    <AppTextareaForm name="reason" label="Changes" :required="true"
                        :rules="(v) => (!v ? 'Reason is required' : true)" rows="3"
                        placeholder="What changes are you requesting?" test-id="change-request-reason-textarea" />
                </div>

                <div test-id="change-request-justification-field">
                    <AppTextareaForm name="justification" label="Justification" :required="false" rows="3"
                        placeholder="Provide justification for this change request" />
                </div>

                <div test-id="change-request-risks-field">
                    <AppTextareaForm name="risks" label="Risk Identified / Effects" :required="false" rows="3"
                        placeholder="Describe any risks identified or potential effects" />
                </div>

                <div test-id="change-request-documents-field">
                    <label class="block text-sm font-medium text-neutral-700 mb-2">
                        Documents affected by the change<span class="text-red-600">*</span>
                    </label>
                    <SearcheableApiMultiSelect v-model="selectedDocuments" :results="documentSearchResults"
                        placeholder="Search for documents..." :display="(doc: any) => doc.title || 'Untitled Document'"
                        :changeQuery="searchDocuments" test-id="change-request-documents-multiselect" />
                </div>

                <div class="p-6 border-t  flex justify-end gap-3" test-id="change-request-form-actions">
                    <AppButton type="button" buttonStyle="secondary" @click="handleCancel" :disabled="isLoading">
                        Cancel
                    </AppButton>
                    <AppButton type="submit" buttonStyle="primary" :loading="isLoading">
                        <i class="fa-solid fa-plus mr-2"></i>
                        Create Change Request
                    </AppButton>
                </div>
            </Form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import AppButton from '../AppButton.vue'
import { apiPost, apiDelete, apiGet } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import AppTextareaForm from '../AppTextareaForm.vue'
import { Form } from 'vee-validate'
import type { ChangeRequest } from '@/util/interfaces'
import { ChangeRequestStatus } from '@/util/interfaces'
import Can from '../Can.vue'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '../ConfirmDialog.vue'
import { flattenTree } from '@/util/util'
import Select2 from '../Select2.vue'
import SearcheableApiMultiSelect from '../SearcheableApiMultiSelect.vue'

interface Props {
    changeRequestId?: number
    isViewMode?: boolean
    onConfirm?: () => void
    onCancel?: () => void
}

const props = defineProps<Props>()

const authStore = useAuthStore()
const toast = useToast()
const dialogStore = useDialog()
const isLoading = ref(false)
const isFetchingChangeRequest = ref(false)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const approveComment = ref('')
const rejectComment = ref('')
const changeRequest = ref<ChangeRequest | null>(null)
const documentSearchResults = ref<any[]>([])
const selectedDocuments = ref<any[]>([])

const formData = reactive({
    reason: '',
    justification: '',
    risks: '',
    documentIds: []
})

const handleCancel = () => {
    if (!isLoading.value && props.onCancel) {
        props.onCancel()
    }
}

const fetchChangeRequest = async () => {
    if (!props.changeRequestId) return

    isFetchingChangeRequest.value = true
    try {
        const response = await apiGet<ChangeRequest>(
            `/documents/change-requests/${props.changeRequestId}`,
            authStore
        )
        changeRequest.value = response
    } catch (error) {
        console.error('Error fetching change request:', error)
        toast.showToast('Error', 'Failed to fetch change request details', 'error')
    } finally {
        isFetchingChangeRequest.value = false
    }
}



const searchDocuments = async (query: string) => {
    try {
        const response = await apiGet<any>(
            `/documents?search=${encodeURIComponent(query.trim())}&limit=20`,
            authStore
        )
        documentSearchResults.value = response.data
    } catch (error) {
        console.error('Error searching documents:', error)
        documentSearchResults.value = []
    }
}

const submitChangeRequest = async (values: any) => {
    if (!selectedDocuments.value.length) {
        toast.showToast('Error', 'At least one document must be selected', 'error')
        return
    }

    isLoading.value = true

    try {
        const payload = {
            reason: values.reason?.trim() || undefined,
            justification: values.justification?.trim() || undefined,
            risks: values.risks?.trim() || undefined,
            documentIds: selectedDocuments.value.map((doc: any) => doc.id)
        }

        await apiPost('/documents/change-requests', payload, authStore)

        toast.showToast('Success', 'Change request created successfully', 'success')

        if (props.onConfirm) {
            props.onConfirm()
        }
    } catch (error) {
        console.error('Error creating change request:', error)
        toast.showToast(
            'Error',
            (error as any)?.response?.data?.message || 'Failed to create change request',
            'error'
        )
    } finally {
        isLoading.value = false
    }
}

const formatDate = (timestamp: number | string) => {
    if (!timestamp) return ''

    const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp
    if (isNaN(numericTimestamp)) {
        console.error('Invalid timestamp:', timestamp)
        return 'Invalid Date'
    }
    const date = new Date(numericTimestamp)
    if (isNaN(date.getTime())) {
        console.error('Invalid date created from timestamp:', numericTimestamp)
        return 'Invalid Date'
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const approveChangeRequest = async () => {
    if (!changeRequest.value) return

    try {
        isLoading.value = true
        await apiPost(
            `/documents/change-requests/${changeRequest.value.id}/review`,
            {
                status: ChangeRequestStatus.ACCEPTED,
                reviewComment: approveComment.value.trim() || 'Change request approved'
            },
            authStore
        )

        toast.showToast('Success', 'Change request approved successfully', 'success')
        showApproveDialog.value = false
        approveComment.value = ''
        if (props.onConfirm) {
            props.onConfirm()
        }
    } catch (error) {
        console.error('Error approving change request:', error)
        toast.showToast('Error', 'Failed to approve change request', 'error')
    } finally {
        isLoading.value = false
    }
}

const rejectChangeRequest = async () => {
    if (!changeRequest.value) return

    if (!rejectComment.value.trim()) {
        toast.showToast(
            'Error',
            'Please provide a reason for rejecting the change request',
            'error'
        )
        return
    }

    try {
        isLoading.value = true
        await apiPost(
            `/documents/change-requests/${changeRequest.value.id}/review`,
            {
                status: ChangeRequestStatus.REJECTED,
                reviewComment: rejectComment.value.trim()
            },
            authStore
        )

        toast.showToast('Success', 'Change request rejected successfully', 'success')
        showRejectDialog.value = false
        rejectComment.value = ''
        if (props.onConfirm) {
            props.onConfirm()
        }
    } catch (error) {
        console.error('Error rejecting change request:', error)
        toast.showToast('Error', 'Failed to reject change request', 'error')
    } finally {
        isLoading.value = false
    }
}

const deleteChangeRequest = async () => {
    if (!changeRequest.value) return

    dialogStore.openDialog(ConfirmDialog, {
        message:
            'Are you sure you want to delete this change request? This action cannot be undone.',
        onConfirm: async () => {
            try {
                isLoading.value = true
                await apiDelete(`/documents/change-requests/${changeRequest.value!.id}`, authStore)
                toast.showToast('Success', 'Change request deleted successfully', 'success')
                if (props.onConfirm) {
                    props.onConfirm()
                }
            } catch (error) {
                console.error('Error deleting change request:', error)
                toast.showToast('Error', 'Failed to delete change request', 'error')
            } finally {
                isLoading.value = false
                dialogStore.closeDialog()
            }
        },
        onCancel: dialogStore.closeDialog
    })
}

onMounted(() => {
    if (props.isViewMode && props.changeRequestId) {
        fetchChangeRequest()
    }
})


</script>
