<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />
        <div class="px-6 pb-6 pt-4">
            <div class="max-w-3xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-opposite">Cron Jobs</h3>
                    <AppButton buttonStyle="primary" :href="'/automation/cron-jobs/add'">
                        <i class="fa-solid fa-plus mr-1"></i>
                        Add Cron Job
                    </AppButton>
                </div>

                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="cronJobs.length === 0"
                    class="text-center py-12 text-opposite/50 bg-secondary rounded-lg border border-gray-800">
                    No cron jobs configured yet.
                </div>

                <div v-else class="space-y-3">
                    <div v-for="job in cronJobs" :key="job.id"
                        class="bg-secondary rounded-lg border border-gray-800 p-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                :class="['w-2.5 h-2.5 rounded-full shrink-0', job.isActive ? 'bg-green-500' : 'bg-gray-500']">
                            </div>
                            <div>
                                <div class="text-opposite font-medium">{{ job.name }}</div>
                                <div v-if="job.description" class="text-xs text-opposite/60 mt-0.5">
                                    {{ job.description }}
                                </div>
                                <div class="text-xs text-opposite/40 mt-0.5">
                                    {{ job.connector?.name }} &rarr; {{ job.connectorActionInstance?.name }}
                                    <template v-if="job.connectorActionInstance?.connectorTypeAction?.name">
                                        ({{ job.connectorActionInstance.connectorTypeAction.name }})
                                    </template>
                                    <span class="font-mono ml-2">{{ frequencyLabel(job.frequency) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <router-link :to="`/automation/cron-jobs/${job.id}`"
                                class="text-opposite/70 hover:text-opposite text-sm" title="View runs">
                                <i class="fa-solid fa-eye"></i>
                            </router-link>
                            <router-link :to="`/automation/cron-jobs/${job.id}/edit`"
                                class="text-blue-400 hover:text-blue-300 text-sm">
                                <i class="fa-solid fa-pen"></i>
                            </router-link>
                            <button type="button" class="text-red-400 hover:text-red-300 text-sm"
                                @click="confirmDelete(job)">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import { getCronJobs, deleteCronJob } from '@/components/automation/endpoints'
import type { CronJob } from '@/components/automation/endpoints'
import { FREQUENCY_OPTIONS } from './frequencies'

const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const cronJobs = ref<CronJob[]>([])
const loading = ref(false)

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Cron Jobs', path: '' },
]

const frequencyLabel = (cron: string): string => {
    const match = FREQUENCY_OPTIONS.find(o => o.value === cron)
    return match ? match.label : cron
}

const confirmDelete = (job: CronJob) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete cron job "${job.name}"?`,
        onConfirm: async () => {
            try {
                await deleteCronJob(job.id, authStore)
                toast.showToast('Deleted', 'Cron job deleted', 'success')
                await loadCronJobs()
            } catch {
                toast.showToast('Error', 'Failed to delete cron job', 'error')
            } finally {
                dialog.closeDialog()
            }
        },
        onCancel: () => dialog.closeDialog(),
    })
}

const loadCronJobs = async () => {
    loading.value = true
    try {
        cronJobs.value = await getCronJobs(authStore)
    } catch {
        cronJobs.value = []
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadCronJobs()
})
</script>
