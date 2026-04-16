<template>
    <div class="space-y-4 mt-5">
        <div>
            <div class="flex flex-col">
                <div class="flex flex-row gap-2 my-2" v-if="currentVersion?.status === 'pending' && isReviewer">
                    <AppButton buttonStyle="void" @click="postAction({ type: 'reviewed' })"
                        :disabled="actionLoading || hasReviewed" :loading="actionLoading" :class="[
                            'px-1 py-0.5  col-span-1 items-center flex gap-2 border rounded-md',
                            hasReviewed
                                ? 'bg-accent-blue shadow-inner opacity-80 text-opposite'
                                : ' text-opposite rounded-md hover:bg-main-border'
                        ]" test-id="ready-for-approval-button">
                        <div
                            class="bg-accent-green rounded-full w-5 h-5 flex flex-row items-center justify-center text-white text-xs">
                            <i class="fa-solid fa-check text-xs"></i>
                        </div>
                        Ready for Approval
                    </AppButton>
                    <AppButton buttonStyle="void" @click="postAction({ type: 'reviewed_rejected' })"
                        :disabled="actionLoading || hasReviewedRejected" :loading="actionLoading" :class="[
                            'px-1 py-0.5  col-span-1 text-start border rounded-md',
                            hasReviewedRejected
                                ? 'bg-accent-blue shadow-inner opacity-80 text-opposite '
                                : ' text-opposite rounded-md hover:bg-main-border'
                        ]" test-id="request-changes-button">
                        <i class="fa-solid fa-ban mr-2"></i>Request Changes
                    </AppButton>
                </div>
                <div class="grid grid-cols-2 gap-2 my-2 w-full"
                    v-else-if="currentVersion?.status === 'ready_for_approval' && isApprover">
                    <AppButton buttonStyle="void" @click="!hasApproved && postAction({ type: 'approved' })"
                        :disabled="actionLoading || hasApproved" :loading="actionLoading" :class="[
                            'px-1 py-0.5  col-span-1 items-center flex gap-2 border rounded-md',
                            hasApproved
                                ? 'bg-accent-blue shadow-inner opacity-80 text-opposite'
                                : 'text-opposite rounded-md hover:bg-main-border hover:text-opposite'
                        ]" test-id="approve-button">
                        <div
                            class="bg-green-600 rounded-full w-5 h-5 flex flex-row items-center justify-center text-white text-xs">
                            <i class="fa-solid fa-check text-xs"></i>
                        </div>
                        Approve
                    </AppButton>
                    <AppButton buttonStyle="void" @click="!hasRejected && postAction({ type: 'rejected' })"
                        :disabled="actionLoading || hasRejected" :loading="actionLoading" :class="[
                            'px-1 py-0.5 rounded-md border col-span-1 text-start',
                            hasRejected
                                ? 'bg-accent-blue shadow-inner opacity-80 text-opposite '
                                : ' text-opposite rounded-md hover:bg-main-border hover:text-opposite'
                        ]" test-id="approver-request-changes-button">
                        <i class="fa-solid fa-ban mr-2"></i>Request Changes
                    </AppButton>
                </div>
                <Can subject="documents" :actions="['update']">
                    <span class="text-sm text-neutral-500" v-if="currentVersion?.status === 'pending'">
                        <p v-if="canSendForApproval" class="text-sm text-opposite/60 py-2">
                            This Document meets the required number of reviews, you can send it to the approval process.
                        </p>
                        <AppButton v-if="canSendForApproval" @click="
                            async () =>
                                await postAction({
                                    type: 'ready_for_approval'
                                })
                        "
                            warn-before="Are you sure you want to send this document for approval? Approvers will be notified that the document is ready for approval."
                            buttonStyle="primary" test-id="send-for-approval-button">Send it for approvers to review
                        </AppButton>
                    </span>
                    <!-- Ready for Approval Status Actions -->
                    <span class="text-sm text-neutral-500 flex flex-col gap-2"
                        v-else-if="currentVersion?.status === 'ready_for_approval'">
                        <p v-if="canPublish" class="text-sm text-neutral-500 py-2">
                            This Document meets the required number of approvals, you may publish it now.
                        </p>
                        <div class="grid grid-cols-2 gap-2 w-full">
                            <AppButton v-if="canPublish" @click="postAction({ type: 'published' })"
                                :loading="actionLoading" warn-before="Are you sure you want to publish this document?"
                                buttonStyle="void" :class="[
                                    'px-1 py-1 rounded-xl col-span-1 text-start',
                                    'bg-green-500 text-black rounded-md hover:bg-green-300'
                                ]" test-id="publish-document-button">
                                <div class="flex items-center gap-2">
                                    <i class="fa-solid fa-check text-xs"></i>
                                    <span>Publish</span>
                                </div>
                            </AppButton>
                            <AppButton v-if="reviewers.length > 0" @click="
                                async () =>
                                    await postAction({
                                        type: 'send_for_review'
                                    })
                            " :loading="actionLoading" buttonStyle="void" :class="[
                                    'px-1 py-0.5 rounded-xl col-span-1 text-start',
                                    'bg-accent-red text-opposite rounded-md hover:bg-accent-red/80'
                                ]"
                                warn-before="Are you sure you want to send this document back to review? Reviewers will have to review it again."
                                test-id="send-back-to-review-button">
                                <div class="flex items-center gap-2">
                                    <i class="fa-solid fa-ban text-xs"></i>
                                    <span>Send back to Review</span>
                                </div>
                            </AppButton>
                        </div>
                    </span>
                </Can>

                <!-- Mark Obsolete Button -->
                <Can subject="documents" :actions="['update']">
                    <div>
                        <AppButton v-if="
                            currentVersion?.status === 'published' &&
                            documentData?.versions[documentData?.versions.length - 1]
                                .versionNumber === currentVersion?.versionNumber
                        " buttonStyle="danger" @click="markObsolete"
                            warn-before="Are you sure you want to mark this document as obsolete? This action cannot be undone."
                            test-id="mark-obsolete-button">
                            <i class="fa-solid fa-ban mr-2"></i>Mark Obsolete
                        </AppButton>
                    </div>
                </Can>
            </div>

            <!-- Override Approval Button -->
            <Can subject="documents" :actions="['override_approve']">
                <div class="border-t py-2 mt-2 flex flex-col gap-2 text-start"
                    v-if="showOverrideButton && !canSendForApproval">
                    <span class="text-sm text-neutral-500 mb-2">If you want to skip the approval process, you can
                        override the approval and
                        move the document to published.</span>
                    <AppButton buttonStyle="warning" @click="overrideApprove"
                        warn-before="Are you sure you want to override the approval and move the document to published?"
                        test-id="override-approval-button">
                        <i class="fa-solid fa-triangle-exclamation mr-2"></i>Override Approval
                    </AppButton>
                </div>
            </Can>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '../AppButton.vue'
import Can from '../Can.vue'
import { mapDocumentStatus } from '@/util/util'
import type { Document, DocumentVersion, User } from '@/util/interfaces'
import { useAuthStore } from '@/stores/auth'

interface Props {
    documentData: Document | undefined
    actionLoading: boolean
    reviewers: Array<{
        fname: string
        lname: string
        id: string
        action: string | null
        time: string | null
        createdDate: number
        actionMessage: string
    }>
    approvers: Array<{
        fname: string
        lname: string
        id: string
        action: string | null
        time: string | null
        actionMessage: string
        createdDate: number
    }>
    currentVersion?: DocumentVersion
}

interface Emits {
    (e: 'postAction', action: { type: string; comment?: string }): void
    (e: 'markObsolete'): void
    (e: 'overrideApprove'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()

const isReviewer = computed(() => {
    return props.documentData?.reviewers?.some(
        (reviewer: User) => reviewer.id === authStore.state.userDetails.id
    )
})

const isApprover = computed(() => {
    return props.documentData?.approvers?.some(
        (approver: User) => approver.id === authStore.state.userDetails.id
    )
})

const canSendForApproval = computed(() => {
    return (
        props.reviewers.filter((reviewer) => reviewer.action === 'reviewed').length >=
        (props.documentData?.approvalStrategy?.requiredReviews || 0) &&
        !props.reviewers.some((reviewer) => reviewer.action === 'reviewed_rejected')
    )
})

const canPublish = computed(() => {
    return (
        props.approvers.filter((approver) => approver.action === 'approved').length >=
        (props.documentData?.approvalStrategy?.requiredApprovals || 0) &&
        !props.approvers.some((approver) => approver.action === 'rejected')
    )
})

const showOverrideButton = computed(() => {
    return (
        !['published', 'obsolete'].includes(props.currentVersion?.status || '')
    )
})

const postAction = (action: { type: string; comment?: string }) => {
    emit('postAction', action)
}

const markObsolete = () => {
    emit('markObsolete')
}

const overrideApprove = () => {
    emit('overrideApprove')
}

const hasRejected = computed(() => {
    const currentVersion = props.documentData?.versions.find(
        (v) => v.versionNumber === props.currentVersion?.versionNumber
    )
    return props.documentData?.contributors
        .filter((c) => c.version === currentVersion?.versionNumber)
        .filter((contributor) => contributor.user?.id === authStore.state.userDetails.id)
        .some((contributor) => contributor.actions.some((action) => action.type === 'rejected'))
})
const hasReviewed = computed(() => {
    const currentVersion = props.documentData?.versions.find(
        (v) => v.versionNumber === props.currentVersion?.versionNumber
    )
    return props.documentData?.contributors
        .filter((c) => c.version === currentVersion?.versionNumber)
        .filter((contributor) => contributor.user?.id === authStore.state.userDetails.id)
        .some((contributor) => contributor.actions.some((action) => action.type === 'reviewed'))
})

const hasReviewedRejected = computed(() => {
    const currentVersion = props.documentData?.versions.find(
        (v) => v.versionNumber === props.currentVersion?.versionNumber
    )
    return props.documentData?.contributors
        .filter((c) => c.version === currentVersion?.versionNumber)
        .filter((contributor) => contributor.user?.id === authStore.state.userDetails.id)
        .some((contributor) =>
            contributor.actions.some((action) => action.type === 'reviewed_rejected')
        )
})
const hasApproved = computed(() => {
    const currentVersion = props.documentData?.versions.find(
        (v) => v.versionNumber === props.currentVersion?.versionNumber
    )
    return props.documentData?.contributors
        .filter((c) => c.version === currentVersion?.versionNumber)
        .filter((contributor) => contributor.user?.id === authStore.state.userDetails.id)
        .some((contributor) => contributor.actions.some((action) => action.type === 'approved'))
})
</script>
