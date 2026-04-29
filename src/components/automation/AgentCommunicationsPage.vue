<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto space-y-4">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <h3 class="text-lg font-medium text-opposite">Agent Communications</h3>
                        <p class="text-sm text-opposite/60">
                            Workflow Run ID: <span class="font-mono">{{ runId }}</span>
                        </p>
                    </div>
                    <AppButton buttonStyle="secondary" type="button" @click="goBack">
                        Back
                    </AppButton>
                </div>

                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="communications.length === 0"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                    No communications found for this run.
                </div>

                <div v-else class="space-y-3">
                    <div v-for="communication in communications" :key="communication._id"
                        class=" p-2 space-y-3">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div class="flex flex-wrap items-center gap-2 text-xs">
                                <span v-if="communication.role"
                                    class="uppercase tracking-wide px-2 py-1 rounded border border-gray-700 text-opposite/80">
                                    {{ communication.role }}
                                </span>
                                <span v-if="communication.type"
                                    class="uppercase tracking-wide px-2 py-1 rounded border border-blue-500/40 text-blue-300 bg-blue-500/10">
                                    {{ communication.type }}
                                </span>
                            </div>
                            <div class="text-sm text-opposite/70">
                                {{ formatCommunicationDate(communication.createdAt) }}
                            </div>
                        </div>

                        <div v-if="hasContent(communication.content)" class="space-y-1">
                            <pre
                                class="text-sm text-opposite/90 bg-main border border-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap">{{
                                    getMessageContent(formatJson(communication.content)) }}</pre>
                        </div>

                        <div v-if="hasContent(communication.metadata)" class="space-y-1">
                            <div class="text-xs uppercase text-opposite/50 tracking-wide">Metadata</div>
                            <pre
                                class="text-sm text-opposite/90 bg-secondary border border-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap">{{
                                    formatJson(communication.metadata) }}</pre>
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
import { getWorkflowRunCommunications } from '@/components/automation/endpoints'
import type { AgentCommunication } from '@/components/automation/workflow.interface'
import { DateTime } from 'luxon'
import { formatJson } from '@/util/util'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const runId = computed(() => route.params.runId as string)

const loading = ref(false)
const communications = ref<AgentCommunication[]>([])

const crumbs = computed(() => ([
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflow Runs', path: '/automation/workflows' },
    { name: 'Agent Communications', path: '' },
]))

const hasContent = (value: unknown) => {
    if (value === null || value === undefined) {
        return false
    }
    if (typeof value === 'string') {
        return value.trim().length > 0
    }
    return true
}

const formatCommunicationDate = (value?: string | number) => {
    if (!value) {
        return '-'
    }
    if (typeof value === 'number') {
        return DateTime.fromMillis(value).toFormat('dd MMM yyyy HH:mm:ss')
    }
    const parsedIso = DateTime.fromISO(value)
    if (parsedIso.isValid) {
        return parsedIso.toFormat('dd MMM yyyy HH:mm:ss')
    }
    const parsedJs = new Date(value)
    if (!Number.isNaN(parsedJs.getTime())) {
        return DateTime.fromMillis(parsedJs.getTime()).toFormat('dd MMM yyyy HH:mm:ss')
    }
    return String(value)
}

const loadCommunications = async () => {
    loading.value = true
    try {
        communications.value = await getWorkflowRunCommunications(runId.value, authStore)
    } catch {
        communications.value = []
        toast.showToast('Error', 'Failed to load agent communications', 'error')
    } finally {
        loading.value = false
    }
}

const getMessageContent = (content: string) => {
    if (content.includes('{')) {
        return JSON.parse(content)?.spokenMessage;
    }
    return content
}
const goBack = () => {
    router.back()
}

watch(runId, () => {
    loadCommunications()
}, { immediate: true })
</script>
