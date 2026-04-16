<template>
    <div id="main-container" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crums" test-id="breadcrumbs">
            <div class="flex gap-2">
                <Can subject="documents" :actions="['update']">
                    <AppButton buttonStyle="secondary" test-id="edit-document-button"
                        :href="`/qms/documents/${documentId}/edit?redirect=/qms/documents/${documentId}`"
                        v-if="documentData?.createdBy?.id === authStore.state.userDetails.id">
                        <i class="fa-solid fa-pen-to-square mr-2"></i>
                        Edit Document
                    </AppButton>
                </Can>
                <Can subject="documents" :actions="['delete']">
                    <AppButton buttonStyle="danger" @click="deleteDocument" test-id="delete-document-button"
                        warn-before="Are you sure you want to delete this document? This action cannot be undone.">
                        <i class="fa-solid fa-trash mr-2"></i>
                        Delete Document
                    </AppButton>
                </Can>
                <Can subject="change_requests" :actions="['read']">
                    <AppButton v-if="!!changeRequest" buttonStyle="primary"
                        @click="() => viewChangeRequest(changeRequest as any)" test-id="view-change-request-button">
                        <i class="fa-solid fa-file-circle-plus mr-2"></i>
                        View Change Request
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>
        <div v-if="isLoading" class="flex items-center justify-center h-screen">
            <Spinner width="5" />
        </div>
        <main id="main-content" class="p-6" v-else-if="documentData">
            <div class="space-y-6">
                <div id="document-content" class="space-y-6" test-id="document-details-view">
                    <div class="grid 2xl:grid-cols-8 grid-cols-4 gap-6">
                        <div class="bg-secondary border border-main rounded-lg p-4 col-span-2 max-h-[5000px] overflow-y-auto"
                            test-id="status-section">
                            <h2 class="text-lg mb-4 text-opposite/70" test-id="status-heading">
                                Status:
                                <span :class="['px-2 py-1 bg-main rounded-full text-sm text-opposite/70']"
                                    test-id="status-badge">{{
                                        mapDocumentStatus(
                                            documentData?.versions.find(
                                                (v) => v.versionNumber === currentVersion
                                            )?.status || ''
                                        )
                                    }}</span>
                            </h2>

                            <DocumentStatusManager v-if="
                                documentData?.versions.find(
                                    (v) => v.versionNumber === currentVersion
                                )?.file
                            " :documentData="documentData" :actionLoading="actionLoading"
                                :reviewers="reviewersWithStatus" :approvers="approversWithStatus"
                                @postAction="postAction" @markObsolete="markObsolete" @overrideApprove="overrideApprove"
                                :currentVersion="documentData?.versions.find(
                                    (v) => v.versionNumber === currentVersion
                                )
                                    " />
                            <span v-else class="text-opposite/70">No Document Uploaded, upload one so it can be
                                reviewed</span>
                            <div v-if="
                                ['published', 'obsolete'].includes(
                                    documentData?.versions.find(
                                        (v) => v.versionNumber === currentVersion
                                    )?.status || ''
                                )
                            " test-id="actions-done-section">
                                <span v-for="(action, index) in actionsDone" :key="action.actionMessage"
                                    class="flex fleitems-center gap-2 my-4" :test-id="`action-item-${index}`">
                                    <MemberIcon :member="{
                                        fname: action.fname,
                                        lname: action.lname,
                                        image: '',
                                        index
                                    }" />
                                    <span class="flex flex-col">
                                        <span test-id="action-user-name" class="text-opposite/70">{{ action.fname }} {{
                                            action.lname }}</span>
                                        <span class="text-xs text-neutral-500" test-id="action-message-time">{{
                                            action.actionMessage }} - {{ action.time }}</span>
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div class="bg-secondary border border-main rounded-lg p-4 col-span-2"
                            test-id="document-information-section">
                            <h2 class="text-lg mb-4 text-opposite/70" test-id="document-information-heading">
                                Document Information
                            </h2>
                            <h2 v-if="documentStatus === 'obsolete'"
                                class="text-lg font-bold capitalize text-red-700 mb-4 text-opposite/70"
                                test-id="obsolete-warning">
                                THIS DOCUMENT IS OBSOLETE
                            </h2>
                            <div class="space-y-4 flex flex-col gap-2 justify-between">
                                <div test-id="document-title-field">
                                    <h3 class="text-sm text-opposite/50" test-id="document-title-label">
                                        Title
                                    </h3>
                                    <p test-id="document-title-value" class="text-opposite/80">{{ documentData?.title }}
                                    </p>
                                </div>
                                <div test-id="document-code-field">
                                    <h3 class="text-sm text-opposite/50" test-id="document-code-label">
                                        Code
                                    </h3>
                                    <p test-id="document-code-value" class="text-opposite/80">
                                        {{ documentData?.documentCode }}
                                    </p>
                                </div>

                                <div test-id="document-last-modified-field">
                                    <h3 class="text-sm text-opposite/50" test-id="document-last-modified-label">
                                        Last Modified
                                    </h3>
                                    <p test-id="document-last-modified-value" class="text-opposite/80">
                                        {{ formatDate(documentData?.updatedAt || 0) }}
                                    </p>
                                </div>
                                <div test-id="document-version-field">
                                    <h3 class="text-sm text-opposite/50" test-id="document-version-label">
                                        Version
                                    </h3>
                                    <p test-id="document-version-value" class="text-opposite/80">
                                        {{ documentData?.currentVersion }}
                                    </p>
                                </div>
                                <AppButton buttonStyle="primary" @click="downloadDocument"
                                    test-id="download-document-button">
                                    <i class="fa-solid fa-download mr-2"></i>
                                    Download Document
                                </AppButton>
                            </div>
                        </div>

                        <!-- People -->
                        <div class="bg-secondary border border-main rounded-lg p-4 col-span-2 max-h-[5000px] overflow-y-auto"
                            test-id="people-section">
                            <h2 class="text-lg mb-4 text-opposite/70" test-id="people-heading">People</h2>
                            <div class="space-y-4">
                                <div test-id="owner-field">
                                    <h3 class="text-sm text-opposite/50 mb-2" test-id="owner-label">
                                        Owner
                                    </h3>
                                    <div class="flex items-center gap-2" test-id="owner-value">
                                        <MemberIcon :member="{
                                            fname: documentData?.createdBy?.fname || '',
                                            lname: documentData?.createdBy?.lname || '',
                                            image: '',
                                            index: 0
                                        }" />
                                        <span class="text-opposite/80">{{ documentData?.createdBy?.fname }}
                                            {{ documentData?.createdBy?.lname }}</span>
                                    </div>
                                </div>

                                <div v-if="reviewersWithStatus?.length" test-id="reviewers-field">
                                    <h3 class="text-sm text-opposite/50 mb-2" test-id="reviewers-label">
                                        Reviewers
                                    </h3>
                                    <div class="space-y-2" test-id="reviewers-list">
                                        <div v-for="(reviewer, index) in reviewersWithStatus" :key="reviewer.id"
                                            class="flex items-center justify-between gap-2 p-2 rounded-lg "
                                            :test-id="`reviewer-item-${reviewer.id}`">
                                            <div class="flex items-center gap-2">
                                                <MemberIcon :member="{
                                                    fname: reviewer.fname || '',
                                                    lname: reviewer.lname || '',
                                                    image: '',
                                                    index: index
                                                }" />
                                                <div class="flex flex-col">
                                                    <span class="text-sm font-medium text-opposite/80 text-nowrap">
                                                        {{ reviewer.fname }} {{ reviewer.lname }}
                                                    </span>
                                                    <span :class="[
                                                        'text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit',
                                                        reviewer.action === 'reviewed'
                                                            ? 'text-green-600 bg-green-50'
                                                            : reviewer.action ===
                                                                'reviewed_rejected'
                                                                ? 'text-red-600 bg-red-50'
                                                                : 'text-gray-600 bg-gray-50'
                                                    ]">
                                                        <i :class="[
                                                            reviewer.action === 'reviewed'
                                                                ? 'fa-solid fa-check'
                                                                : reviewer.action ===
                                                                    'reviewed_rejected'
                                                                    ? 'fa-solid fa-times'
                                                                    : 'fa-solid fa-clock'
                                                        ]"></i>
                                                        {{ reviewer.actionMessage }}
                                                    </span>
                                                </div>
                                            </div>
                                            <span class="text-xs text-neutral-400">
                                                {{ reviewer.time || '' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-4" v-if="approversWithStatus?.length" test-id="approvers-field">
                                    <h3 class="text-sm text-opposite/50 mb-2" test-id="approvers-label">
                                        Approvers
                                    </h3>
                                    <div class="space-y-2" test-id="approvers-list">
                                        <div v-for="(approver, index) in approversWithStatus" :key="approver.id"
                                            class="flex items-center justify-between gap-2 p-2 rounded-lg "
                                            :test-id="`approver-item-${approver.id}`">
                                            <div class="flex items-center gap-2">
                                                <MemberIcon :member="{
                                                    fname: approver.fname || '',
                                                    lname: approver.lname || '',
                                                    image: '',
                                                    index: index
                                                }" />
                                                <div class="flex flex-col">
                                                    <span class="text-sm font-medium text-opposite/80 text-nowrap">
                                                        {{ approver.fname }} {{ approver.lname }}
                                                    </span>
                                                    <span :class="[
                                                        'text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit',
                                                        approver.action === 'approved'
                                                            ? 'text-green-600 bg-green-50'
                                                            : approver.action === 'rejected'
                                                                ? 'text-red-600 bg-red-50'
                                                                : 'text-gray-600 bg-gray-50'
                                                    ]">
                                                        <i :class="[
                                                            approver.action === 'approved'
                                                                ? 'fa-solid fa-check'
                                                                : approver.action === 'rejected'
                                                                    ? 'fa-solid fa-times'
                                                                    : 'fa-solid fa-clock'
                                                        ]"></i>
                                                        {{ approver.actionMessage }}
                                                    </span>
                                                </div>
                                            </div>
                                            <span class="text-xs text-neutral-400">
                                                {{ approver.time || '' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-secondary border border-main rounded-lg p-4 col-span-2 max-h-[500px] overflow-y-auto"
                            test-id="version-history-section">
                            <h2 class="text-lg mb-4 flex justify-between items-center flex-wrap text-opposite/70"
                                test-id="version-history-heading">
                                Version History
                                <Can subject="documents" :actions="['update']">
                                    <span v-if="
                                        ['published', 'obsolete'].includes(
                                            documentStatus || ''
                                        ) &&
                                        documentData?.currentVersion ==
                                        documentData?.versions[
                                            documentData?.versions.length - 1
                                        ].versionNumber &&
                                        documentStatus !== 'obsolete'
                                    ">
                                        <AppButton v-if="!changeRequest" buttonStyle="warning" @click="createNewVersion"
                                            test-id="create-new-version-button">
                                            <i class="fa-solid fa-plus mr-2"></i>
                                            Create New Version
                                        </AppButton>
                                        <span v-else class="text-sm text-neutral-500">Review Change Request
                                        </span>
                                    </span>
                                </Can>
                            </h2>
                            <div class="space-y-3" test-id="version-history-list">
                                <div v-for="(version, index) in [
                                    ...(documentData?.versions || [])
                                ].reverse()" :key="version.id" @click="() => (currentVersion = version.versionNumber)"
                                    class="flex flex-col items-start gap-2 hover:bg-neutral-700 p-2 rounded transition-colors text-opposite"
                                    :class="{
                                        
                                        'bg-neutral-600': currentVersion == version.versionNumber
                                    }" :test-id="`version-item-${version.versionNumber}`" tabindex="0">
                                    <div class="flex flex-col items-start gap-2">
                                        <div class="flex items-center gap-2">
                                            <span>Version {{ version.versionNumber }}</span>
                                            <span class="text-xs px-2 py-1 rounded-full capitalize"
                                                :class="versionStatusBadgeClass(version.status)">
                                                {{ mapDocumentStatus(version.status) }}
                                            </span>
                                            <span v-if="
                                                documentData?.currentVersion ===
                                                version.versionNumber
                                            " class="text-sm text-opposite/60">Current Version</span>
                                            <span v-else-if="
                                                documentData?.currentVersion <
                                                version.versionNumber
                                            " class="text-sm text-opposite/60">Version Under Review</span>
                                        </div>
                                        <div class="flex flex-row justify-between w-full gap-2">
                                            <div class="flex flex-col gap-2">
                                                <span v-if="version.changes"
                                                    class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full cursor-pointer"
                                                    @click="showVersionChanges(version)"
                                                    :title="'Click to view changes'">
                                                    <i class="fa-solid fa-info-circle mr-1"></i>Has
                                                    Changes
                                                </span>
                                                <span @click="
                                                    viewChangeRequest(version.changeRequest)
                                                    " v-if="version.changeRequest"
                                                    class="text-xs text-neutral-500 text-underline bg-blue-100 px-2 py-1 rounded-full cursor-pointer">
                                                    From change request
                                                </span>
                                                <span v-if="version.createdBy"
                                                    class="text-xs text-neutral-500 text-underline bg-blue-100 px-2 py-1 rounded-full cursor-pointer">
                                                    by: {{ version.createdBy.fname }}
                                                    {{ version.createdBy.lname }}
                                                </span>
                                            </div>

                                            <span class="text-sm">{{
                                                formatDate(version.createdAt)
                                            }}</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2" @click.stop>
                                        <AppButton v-if="
                                            version.versionNumber !==
                                            documentData?.currentVersion
                                        " buttonStyle="secondary" class="px-2 py-1 text-sm" :download="version.file"
                                            :aria-label="`Download version ${version.versionNumber}`"
                                            :title="`Download version ${version.versionNumber}`">
                                            <i class="fa-solid fa-download mr-1"></i>
                                            Download
                                        </AppButton>
                                        <Can subject="documents" :actions="['update']"
                                            v-if="version.status !== DocumentStatus.PUBLISHED">
                                            <AppButton buttonStyle="primary" class="px-2 py-1 text-sm"
                                                @click="uploadVersionFile(version)"
                                                :aria-label="`Upload file for version ${version.versionNumber}`"
                                                :title="`Upload file for version ${version.versionNumber}`"
                                                test-id="upload-version-file-button">
                                                <i class="fa-solid fa-upload mr-1"></i>
                                                {{ version.file ? 'Replace File' : 'Upload File' }}
                                            </AppButton>
                                        </Can>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Comments Section -->
                        <div class="2xl:col-span-8 col-span-4" test-id="comments-section">
                            <Comments :comments="comments" :loading="actionLoading" @post-comment="
                                (comment) => postAction({ type: 'commented', comment })
                            " @on-delete="deleteComment" />
                        </div>

                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '../AppButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { apiDelete, apiGet, apiPost, apiPut } from '@/util/api'
import type { Document, ChangeRequest } from '@/util/interfaces'
import { ChangeRequestStatus, DocumentStatus } from '@/util/interfaces'
import { useToast } from '@/stores/notification'
import router from '@/router'
import MemberIcon from '@/components/memberIcon.vue'
import Spinner from '../Spinner.vue'
import Can from '../Can.vue'
import Comments from '../Comments.vue'
import {
    mapDocumentStatus,
    mapActionTypeToMessage,
    formatDateToDay,
    snakeToCamelCase
} from '@/util/util'
import HistoryView from '../history-view.vue'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ChangeRequestDialog from './ChangeRequestDialog.vue'
import VersionChangesDialog from './VersionChangesDialog.vue'
import DocumentStatusManager from './DocumentStatusManager.vue'
import UploadVersionFileDialog from './UploadVersionFileDialog.vue'
import CreateNewVersionDialog from './CreateNewVersion.vue'

const route = useRoute()
const documentId = route.params.id
const documentData = ref<Document>()
const isLoading = ref(true)
const authStore = useAuthStore()
const toast = useToast()
const dialogStore = useDialog()
const comment = ref('')
const actionLoading = ref(false)

const historyRefreshTrigger = ref(0)

const changeRequest = ref<ChangeRequest | null>(null)
const changeRequestLoading = ref(false)

const comments = computed(() => {
    return documentData.value?.contributors
        .filter((contributor) => contributor.actions.some((action) => action.type === 'commented'))
        .map((contributor) =>
            contributor.actions
                .filter((action) => action.type === 'commented')
                .map((action) => ({
                    fname: contributor.user.fname,
                    lname: contributor.user.lname,
                    comment: action.comment.text,
                    createdDate: action.createdDate,
                    id: action.id
                }))
        )
        .flat()
        .sort((a, b) => b.createdDate - a.createdDate)
})

const versionStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-700'
        case 'ready_for_approval':
            return 'bg-indigo-100 text-indigo-700'
        case 'published':
            return 'bg-green-100 text-green-700'
        case 'in_review':
            return 'bg-blue-100 text-blue-700'
        case 'valid':
            return 'bg-green-50 text-green-700'
        case 'invalid':
            return 'bg-red-100 text-red-700'
        case 'obsolete':
            return 'bg-neutral-200 text-neutral-700'
        default:
            return 'bg-neutral-100 text-neutral-600'
    }
}

const createNewVersion = () => {
    dialogStore.openDialog(CreateNewVersionDialog, {
        documentId: String(documentId),
        onConfirm: async () => {
            dialogStore.closeDialog()
            toast.showToast('Success', 'New version created successfully', 'success')
            await fetchDocument(true)
        },
        onCancel: dialogStore.closeDialog
    })
}
const currentVersion = ref(1)

const reviewersWithStatus = computed(() => {
    if (!documentData.value?.reviewers) return []

    return documentData.value.reviewers.map((reviewer) => {
        // Find the contributor record for this reviewer
        const contributor = documentData.value?.contributors
            .filter((c) => c.version === currentVersion.value)
            .find((c) => c.user.id === reviewer.id)

        // Find the most recent review action
        const reviewAction = contributor?.actions
            .filter((action) => action.type === 'reviewed' || action.type === 'reviewed_rejected')
            .sort((a, b) => b.createdDate - a.createdDate)[0]

        return {
            fname: reviewer.fname,
            lname: reviewer.lname,
            id: reviewer.id,
            action: reviewAction?.type || null,
            actionMessage: reviewAction
                ? mapActionTypeToMessage(reviewAction.type) || snakeToCamelCase(reviewAction.type)
                : 'No action taken',
            time: reviewAction ? formatDateToDay(reviewAction.createdDate) : null,
            createdDate: reviewAction?.createdDate || 0
        }
    })
})

const actionsDone = computed(() => {
    return documentData.value?.contributors
        .filter((c) => c.version === currentVersion.value)

        .map((contributor) =>
            contributor.actions
                .filter(
                    (action) =>
                        ![
                            'approved',
                            'rejected',
                            'commented',
                            'reviewed',
                            'reviewed_rejected'
                        ].includes(action.type)
                )
                .map((action) => ({
                    fname: contributor.user.fname,
                    lname: contributor.user.lname,
                    actionMessage:
                        mapActionTypeToMessage(action.type) || snakeToCamelCase(action.type),
                    time: action.createdDate ? formatDateToDay(action.createdDate) : null
                }))
        )
        .flat()
})
const approversWithStatus = computed(() => {
    if (!documentData.value?.approvers) return []

    return documentData.value.approvers.map((approver) => {
        // Find the contributor record for this approver
        const contributor = documentData.value?.contributors
            .filter((c) => c.version === currentVersion.value)
            .find((c) => c.user.id === approver.id)

        // Find the most recent approval action
        const approvalAction = contributor?.actions
            .filter((action) => action.type === 'approved' || action.type === 'rejected')
            .sort((a, b) => b.createdDate - a.createdDate)[0]

        return {
            fname: approver.fname,
            lname: approver.lname,
            id: approver.id,
            action: approvalAction?.type || null,
            actionMessage: approvalAction
                ? mapActionTypeToMessage(approvalAction.type) ||
                snakeToCamelCase(approvalAction.type)
                : 'No action taken',
            time: approvalAction ? formatDateToDay(approvalAction.createdDate) : null,
            createdDate: approvalAction?.createdDate || 0
        }
    })
})

const documentStatus = computed(() => {
    return documentData.value?.versions[documentData.value?.versions.length - 1].status
})

const markObsolete = () => {
    actionLoading.value = true
    apiPut(`/documents/${documentId}/mark-obsolete`, {}, authStore)
        .then(() => {
            fetchDocument(true, () => {
                actionLoading.value = false
                toast.showToast('Success', 'Document marked as obsolete', 'success')
            })
        })
        .catch((error) => {
            console.error('Error marking document as obsolete:', error)
            toast.showToast('Error', 'Failed to mark document as obsolete', 'error')
            actionLoading.value = false
        })
}

const fetchDocument = async (skipLoading = false, callback = () => { }) => {
    try {
        if (!skipLoading) {
            isLoading.value = true
        }
        const data = await apiGet<Document>(`/documents/${documentId}`, authStore)
        documentData.value = data
        currentVersion.value = data.versions[data.versions.length - 1].versionNumber
        changeRequest.value = data.changeRequest as ChangeRequest
        // Fetch change request for this document
    } catch (error) {
        console.error('Error fetching document:', error)
        toast.showToast('Error', 'Document not found', 'error')
        router.replace('/qms/documents')
    } finally {
        isLoading.value = false
        callback()
    }
}

const crums = [
    {
        name: 'Documents',
        path: '/qms/documents',
        icon: 'fa-solid fa-file-lines'
    },
    {
        name: 'Document Details',
        path: '',
        icon: ''
    }
]

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

const downloadDocument = async () => {
    try {
        const latestVersion = documentData.value?.versions.find(
            (v) => v.versionNumber === documentData.value?.currentVersion
        )
        if (!latestVersion?.file) {
            toast.showToast('Error', 'No file found for the latest version', 'error')
            return
        }

        const response = await apiGet<string>(
            `/files/${encodeURIComponent(latestVersion?.file)}`,
            authStore
        )

        const link = document.createElement('a')
        link.href = response
        link.download = documentData.value?.title || 'document'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error('Error downloading document:', error)
        toast.showToast('Error', 'Failed to download document', 'error')
    }
}

const postAction = async (action: { type: string; comment?: string }) => {
    actionLoading.value = true
    try {
        await apiPost(`/documents/${documentId}/actions`, { ...action }, authStore)
        comment.value = ''
        fetchDocument(true, () => {
            toast.showToast('Success', '', 'success')
            actionLoading.value = false
            historyRefreshTrigger.value = historyRefreshTrigger.value + 1
        })
    } catch (error) {
        console.error('Error posting action:', error)
        toast.showToast('Error', (error as any)?.response?.data?.message, 'error')
        actionLoading.value = false
    }
}

const overrideApprove = () => {
    actionLoading.value = true
    apiPut(`/documents/${documentId}/override-approve`, {}, authStore)
        .then(() => {
            fetchDocument(true, () => {
                actionLoading.value = false
                toast.showToast('Success', 'Document approved', 'success')
            })
        })
        .catch((error) => {
            console.error('Error overriding approval:', error)
            toast.showToast('Error', 'Failed to override approval', 'error')
            actionLoading.value = false
        })
}

const deleteDocument = () => {
    apiDelete(`/documents/${documentId}`, authStore)
        .then(() => {
            toast.showToast('Success', 'Document deleted', 'success')
            router.replace('/qms/documents')
        })
        .catch((error) => {
            console.error('Error deleting document:', error)
            toast.showToast('Error', 'Failed to delete document', 'error')
        })
}

const deleteComment = async (commentId: number | string) => {
    dialogStore.openDialog(ConfirmDialog, {
        message: 'Are you sure you want to delete this comment? This action cannot be undone.',
        onConfirm: async () => {
            try {
                actionLoading.value = true
                await apiDelete(`/documents/${documentId}/actions/${commentId}`, authStore)
                fetchDocument(true, () => {
                    toast.showToast('Success', 'Comment deleted successfully', 'success')
                    actionLoading.value = false
                    historyRefreshTrigger.value = historyRefreshTrigger.value + 1
                })
            } catch (error) {
                console.error('Error deleting comment:', error)
                toast.showToast('Error', 'Failed to delete comment', 'error')
                actionLoading.value = false
            } finally {
                dialogStore.closeDialog()
            }
        },
        onCancel: dialogStore.closeDialog
    })
}

const showVersionChanges = (version: Document['versions'][number]) => {
    dialogStore.openDialog(VersionChangesDialog, {
        version: version,
        onCancel: dialogStore.closeDialog
    })
}

const viewChangeRequest = (changeRequest: { id: number }) => {
    dialogStore.openDialog(ChangeRequestDialog, {
        changeRequestId: changeRequest.id,
        isViewMode: true,
        onConfirm: async () => {
            dialogStore.closeDialog()
            fetchDocument(true)
        },
        onCancel: dialogStore.closeDialog
    })
}

const uploadVersionFile = (version: Document['versions'][number]) => {
    dialogStore.openDialog(UploadVersionFileDialog, {
        version: {
            id: version.id,
            versionNumber: version.versionNumber
        },
        documentId: String(documentId),
        onConfirm: async () => {
            dialogStore.closeDialog()
            toast.showToast('Success', 'File uploaded successfully', 'success')
            await fetchDocument(true)
        },
        onCancel: dialogStore.closeDialog
    })
}

onMounted(() => {
    fetchDocument()
})
</script>
