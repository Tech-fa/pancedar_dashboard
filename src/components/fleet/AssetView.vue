<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs">
            <div class="flex items-center gap-4">
                <Can :subject="'assets'" :actions="['update']">
                    <AppButton test-id="edit-asset-button" buttonStyle="secondary" @click="handleEdit">
                        <i class="fa-solid fa-edit"></i>
                        <span class="ml-2">Edit</span>
                    </AppButton>
                </Can>
                <Can :subject="'assets'" :actions="['delete']">
                    <AppButton test-id="delete-asset-button" buttonStyle="danger" @click="handleDelete">
                        <i class="fa-solid fa-trash"></i>
                        <span class="ml-2">Delete</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <div v-if="loading" class="p-6 flex items-center justify-center h-60">
            <Spinner />
        </div>

        <div v-else-if="asset" class="p-6">
            <!-- Asset Header -->
            <div class="bg-secondary rounded-lg border border-gray-800 p-6 mb-6">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4">
                        <div class="w-16 h-16 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                            <i class="fa-solid fa-helicopter text-accent-blue text-2xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-opposite mb-1">{{ asset.name }}</h2>
                            <p class="text-opposite/60 mb-2">{{ asset.assetCode }}</p>
                            <div class="flex items-center space-x-4">
                                <span class="text-opposite">
                                    <i class="fa-solid fa-circle mr-1 text-xs"></i>{{ asset.status }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs :tabs="['Details', 'Jobs']" v-model="activeTab" />

            <!-- Details Tab -->
            <div v-if="activeTab === 0" class="space-y-6">
                <!-- Asset Details -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Main Details Card -->
                    <div class="lg:col-span-2 bg-secondary rounded-lg border border-gray-800 p-6"
                        v-if="asset.lastLocation">
                        <h3 class="text-lg font-semibold text-opposite mb-4">Last Location</h3>
                        <p class="text-opposite">{{ asset.lastLocation.address }}</p>
                        <p class="text-opposite">{{ asset.lastLocation.city }}</p>
                        <p class="text-opposite">{{ asset.lastLocation.state }}</p>
                        <p class="text-opposite">{{ asset.lastLocation.country }}</p>
                    </div>
                    <div class="lg:col-span-2 bg-secondary rounded-lg border border-gray-800 p-6">
                        <h3 class="text-lg font-semibold text-opposite mb-4">Asset Details</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-sm font-medium text-opposite/60">Asset Code</label>
                                <p class="text-opposite font-medium">{{ asset.assetCode }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-opposite/60">Name</label>
                                <p class="text-opposite">{{ asset.name }}</p>
                            </div>


                            <!-- <div>
                                <label class="text-sm font-medium text-opposite/60">Model</label>
                                <p class="text-opposite">{{ getModelDisplay() }}</p>
                            </div> -->
                            <div>
                                <label class="text-sm font-medium text-opposite/60">Serial Number</label>
                                <p class="text-opposite">{{ asset.serialNo || '-' }}</p>
                            </div>

                            <div>
                                <label class="text-sm font-medium text-opposite/60">Purchase Date</label>
                                <p class="text-opposite">
                                    {{ formatDateToDay(asset.purchaseDate) }}
                                </p>
                            </div>
                            <div v-if="asset.commissionDate">
                                <label class="text-sm font-medium text-opposite/60">Entry of Service</label>
                                <p class="text-opposite">
                                    {{ formatDateToDay(asset.commissionDate) }}
                                </p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-opposite/60">Status</label>
                                <p class="text-opposite">{{ asset.status }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Custom Data Card -->
                    <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                        <h3 class="text-lg font-semibold text-opposite mb-4">Metadata</h3>
                        <div v-if="asset.custom && Object.keys(asset.custom).length > 0" class="space-y-3">
                            <div v-for="(value, key) in asset.custom" :key="key">
                                <label class="text-sm font-medium text-opposite/60">{{
                                    key
                                    }}</label>
                                <p class="text-opposite">{{ value }}</p>
                            </div>
                        </div>
                        <p v-else class="text-opposite/60 text-sm">No custom data available</p>
                    </div>
                </div>

                <!-- Timestamps -->
                <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Timestamps</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-medium text-opposite/60">Created At</label>
                            <p class="text-opposite">{{ formatDateToDay(asset.createdAt) }}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-opposite/60">Updated At</label>
                            <p class="text-opposite">{{ formatDateToDay(asset.updatedAt) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Jobs Tab -->
            <div v-else-if="activeTab === 1">
                <div v-if="loadingJobs" class="flex items-center justify-center h-40">
                    <Spinner />
                </div>
                <div v-else>
                    <!-- Future Jobs -->
                    <div class="mb-8">
                        <h3 class="text-lg font-semibold text-opposite mb-4">Upcoming Jobs</h3>
                        <div v-if="futureJobs?.length === 0"
                            class="bg-secondary rounded-lg border border-gray-800 p-6 text-opposite/60 text-sm">
                            No upcoming jobs
                        </div>
                        <div v-else class="space-y-3">
                            <div v-for="job in futureJobs" :key="job.id"
                                class="bg-secondary rounded-lg border border-gray-800 p-4 cursor-pointer hover:border-blue-500 transition-colors"
                                @click="router.push(`/fleet/jobs/${job.id}`)">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-opposite font-medium">{{ job.name }}</p>
                                        <p class="text-opposite/60 text-sm">{{ job.displayId }}</p>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-xs px-2 py-1 rounded-full"
                                            :class="jobStatusClass(job.status)">
                                            {{ job.status }}
                                        </span>
                                        <p v-if="job.startDate" class="text-opposite/60 text-sm mt-1">
                                            {{ formatDateToDay(job.startDate) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Past Jobs -->
                    <div>
                        <h3 class="text-lg font-semibold text-opposite mb-4">Past Jobs</h3>
                        <div v-if="pastJobs?.length === 0"
                            class="bg-secondary rounded-lg border border-gray-800 p-6 text-opposite/60 text-sm">
                            No past jobs
                        </div>
                        <div v-else class="space-y-3">
                            <div v-for="job in pastJobs" :key="job.id"
                                class="bg-secondary rounded-lg border border-gray-800 p-4 cursor-pointer hover:border-blue-500 transition-colors"
                                @click="router.push(`/fleet/jobs/${job.id}`)">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-opposite font-medium">{{ job.name }}</p>
                                        <p class="text-opposite/60 text-sm">{{ job.displayId }}</p>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-xs px-2 py-1 rounded-full"
                                            :class="jobStatusClass(job.status)">
                                            {{ job.status }}
                                        </span>
                                        <p v-if="job.endDate" class="text-opposite/60 text-sm mt-1">
                                            {{ formatDateToDay(job.endDate) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import AppButton from '@/components/AppButton.vue'
import BreadCrums from '@/components/breadCrums.vue'
import Can from '@/components/Can.vue'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { formatDateToDay } from '@/util/util'
import type { Asset, VehicleJob, VehicleJobStatus } from '@/util/interfaces'
import { deleteAsset, getAssetById, getVehicleJobs } from './endpoints'
import Tabs from '../Tabs.vue'


const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const assetId = route.params.assetId as string
const asset = ref<Asset | null>(null)
const loading = ref(true)
const activeTab = ref(0)
const loadingJobs = ref(false)

const now = Date.now()

const pastJobs = computed(() =>
    asset.value?.jobs?.filter(j => {
        const endedStatuses: VehicleJobStatus[] = ['Completed', 'Cancelled']
        if (endedStatuses.includes(j.status)) return true
        if (j.endDate && j.endDate < now) return true
        return false
    })
)

const futureJobs = computed(() =>
    asset.value?.jobs?.filter(j => !pastJobs.value?.includes(j))
)

const jobStatusClass = (status: VehicleJobStatus) => {
    const map: Record<VehicleJobStatus, string> = {
        Draft: 'bg-gray-500/20 text-gray-400',
        Planned: 'bg-blue-500/20 text-blue-400',
        InProgress: 'bg-yellow-500/20 text-yellow-400',
        Executed: 'bg-purple-500/20 text-purple-400',
        PostExecution: 'bg-indigo-500/20 text-indigo-400',
        Completed: 'bg-green-500/20 text-green-400',
        Cancelled: 'bg-red-500/20 text-red-400',
    }
    return map[status] || 'bg-gray-500/20 text-gray-400'
}



const crumbs = computed(() => [
    {
        name: 'Fleet',
        path: '/fleet/assets',
        icon: 'fa-solid fa-helicopter text-neutral-700 text-2xl'
    },
    {
        name: asset.value?.name || 'Asset Details',
        path: '',
        icon: ''
    }
])

const handleEdit = () => {
    router.push(`/fleet/assets/${assetId}/edit`)
}
const handleDelete = async () => {
    if (!asset.value) return

    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete the asset "${asset.value.name}" (${asset.value.assetCode})? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deleteAsset(assetId, authStore)
                toast.showToast('Success', 'Asset deleted successfully', 'success')
                router.push('/fleet/assets')
            } catch (error: any) {
                console.error('Error deleting asset:', error)
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to delete asset. Please try again.',
                    'error'
                )
            } finally {
                dialog.closeDialog()
            }
        },
        onCancel: () => {
            dialog.closeDialog()
        }
    })
}
const loadAsset = async () => {
    try {
        asset.value = await getAssetById(assetId, authStore)
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to load asset', 'error')
    }
}



onMounted(async () => {
    await loadAsset()
    loading.value = false
})


</script>

<style scoped></style>
