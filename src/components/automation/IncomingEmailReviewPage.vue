<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-5xl mx-auto space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium text-opposite">Incoming Email Review</h3>
                </div>

                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="!incomingEmail"
                    class="text-center py-12 text-opposite/50 bg-secondary rounded-lg border border-gray-800">
                    Incoming email not found.
                </div>

                <div v-else class="space-y-4">
                    <div class="bg-secondary rounded-lg border border-gray-800 p-4">
                        <div class="text-sm text-opposite/60">From</div>
                        <div class="text-opposite mt-1">{{ incomingEmail.from }}</div>

                        <div v-if="incomingEmail.subject" class="text-sm text-opposite/60 mt-3">Subject</div>
                        <div v-if="incomingEmail.subject" class="text-opposite mt-1">{{ incomingEmail.subject }}</div>
                    </div>

                    <div class="bg-secondary rounded-lg border border-gray-800 p-4">
                        <h4 class="text-sm font-medium text-opposite mb-3">Original Email</h4>
                        <div class="bg-main border border-gray-800 rounded-md p-4 prose prose-invert max-w-none overflow-auto"
                            v-html="incomingEmail.htmlText || '<em>No HTML content available</em>'"></div>
                    </div>

                    <div v-if="incomingEmail.replyEmail"
                        class="bg-secondary rounded-lg border border-gray-800 p-4 space-y-3">
                        <h4 class="text-sm font-medium text-opposite">Reply Draft</h4>
                        <RichText v-model="replyBody" placeholder="Edit reply body..." />

                        <div class="flex items-center gap-3 pt-2">
                            <AppButton buttonStyle="secondary" type="button" @click="back">
                                Back
                            </AppButton>
                            <AppButton buttonStyle="primary" type="button"
                                v-if="incomingEmail.workflowRun?.status === 'awaiting_action'"
                                :disabled="!incomingEmail.replyEmail.actionUrl" :loading="sending" @click="sendReply">
                                Send Reply
                            </AppButton>
                            <span v-else>
                                Reply already sent
                            </span>
                        </div>
                    </div>

                    <div v-else class="bg-secondary rounded-lg border border-gray-800 p-4 text-sm text-opposite/60">
                        No workflow reply draft is available for this email.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import RichText from '@/components/RichText.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getIncomingEmailReview,
    sendIncomingEmailReply,
    type IncomingEmailReview,
} from '@/components/automation/endpoints'

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Incoming Email Review', path: '' },
]

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const sending = ref(false)
const incomingEmail = ref<IncomingEmailReview | null>(null)
const replyBody = ref('')

const load = async () => {
    loading.value = true
    try {
        const emailId = route.params.id as string
        incomingEmail.value = await getIncomingEmailReview(emailId, authStore)
        replyBody.value = incomingEmail.value.replyEmail?.replyBody || ''
    } catch {
        incomingEmail.value = null
        toast.showToast('Error', 'Failed to load incoming email review', 'error')
    } finally {
        loading.value = false
    }
}

const back = () => {
    router.back()
}

const sendReply = async () => {
    const actionUrl = incomingEmail.value?.replyEmail?.actionUrl
    if (!actionUrl) {
        toast.showToast('Error', 'No action URL is available for this reply', 'error')
        return
    }
    sending.value = true
    try {
        await sendIncomingEmailReply(actionUrl, replyBody.value, authStore)
        toast.showToast('Sent', 'Reply sent successfully', 'success')
        await load()
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to send reply', 'error')
    } finally {
        sending.value = false
    }
}

onMounted(() => {
    load()
})
</script>
