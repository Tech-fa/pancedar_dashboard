<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="[
            {
                name: 'Fleet',
                path: '/fleet/assets',
                icon: 'fa-solid fa-helicopter text-neutral-700 text-2xl'
            }
        ]">
            <div class="flex items-center gap-4">
                <AppButton buttonStyle="secondary" class="flex items-center gap-2" href="/fleet/settings">
                    <i class="fa-solid fa-gear"></i>
                    Settings
                </AppButton>
                <Can :subject="'asset'" :actions="['create']">

                    <AppButton test-id="fleet-assets-add-asset" buttonStyle="primary" @click="handleAddAsset">
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Asset</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <!-- Statistics Tiles -->


        <!-- Assets Table -->
        <div test-id="fleet-assets-table-wrapper" class="px-6 pb-6">
            <div class="bg-secondary border border-gray-800 rounded-lg p-4 mb-4">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap w-full">
                        <div class="min-w-[200px] flex-1">
                            <input v-model="query" type="text" placeholder="Search by vehicle id or name"
                                class="w-full px-3 py-2 bg-main border border-gray-700 rounded text-opposite placeholder-opposite/40 focus:outline-none focus:border-accent-blue" />
                        </div>
                        <div class="min-w-[200px]">
                            <Select2 :values="statusOptions" :display="(option: string) => option"
                                :placeholder="'All Statuses'" optional v-model="statusFilter" />
                        </div>
                        <div class="min-w-[200px]">
                            <Select2 :values="modelOptions" :display="(option: AssetModel) => option?.name"
                                :placeholder="'All Models'" optional v-model="modelFilter" />
                        </div>
                    </div>
                    <AppButton v-if="hasActiveFilters" buttonStyle="secondary" @click="clearFilters" class="self-start">
                        <i class="fa-solid fa-filter-circle-xmark mr-2"></i>
                        Clear Filters
                    </AppButton>
                </div>
            </div>
            <Table :cols="['Asset Id', 'Name', 'Site', 'Category', 'Model', 'Status']" :rows="rows"
                :entities="assets.data" entity-name="Asset" :loading="loading" :subject="'asset'"
                :handleDelete="handleDelete" :hide-search="true" :hide-pagination="true" :per-page="10" :page="page"
                :total="total" :total-pages="totalPages" :on-next-page="onNextPage" :on-previous-page="onPreviousPage"
                :set-page="setPage" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import Table from '@/components/Table.vue'
import AppButton from '@/components/AppButton.vue'
import BreadCrums from '@/components/breadCrums.vue'
import Can from '@/components/Can.vue'
import Select2 from '@/components/Select2.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import SelectTripLogModelModal from './SelectTripLogModelModal.vue'
import {
    getAssets,
    getAssetStatistics,
    deleteAsset,
    uploadTripLog,
    getSupportedModels,
    getAssetModels,
    type SupportedModel
} from './endpoints'
import type { Asset, AssetModel, AssetStatistics, Department, PaginatedResponse } from '@/util/interfaces'

const assets = ref<PaginatedResponse<Asset>>({
    data: [],
    currentPage: 1,
    totalCount: 0,
    perPage: 10
})
const query = ref('')
const loading = ref(true)
const rows = ref<{ [key: string]: any }[]>([])
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const dialog = useDialog()
const statusFilter = ref<string | null>(null)
const modelFilter = ref<AssetModel | null>(null)
const statusOptions = ref<string[]>(['Active', 'Inactive', 'Retired'])
const modelOptions = ref<AssetModel[]>([])
const page = ref(1)
const perPage = 15
const totalPages = computed(() => Math.ceil(total.value / perPage))
const hasActiveFilters = computed(() => !!(query.value || statusFilter.value || modelFilter.value))
const total = ref(0)
const uploadingTripLog = ref(false)
const supportedModels = ref<SupportedModel[]>([])



const mapRows = (assets: Asset[]) => {
    return assets.map((asset) => ({
        id: asset.id,
        'Asset Id': asset.assetCode,
        Name: asset.name,
        Site: asset.site?.name || '-',
        Category: asset.assetCategory?.name || '-',
        Model: asset.assetModel?.name || '-',
        Status: asset.status
    }))
}

const fetchAssets = async () => {
    try {
        loading.value = true

        const filters: any = {}
        if (query.value) filters.search = query.value
        if (statusFilter.value) filters.status = statusFilter.value
        if (modelFilter.value) filters.modelId = modelFilter.value.id
        filters.page = page.value
        filters.perPage = perPage

        const assetsData = (await getAssets(authStore, filters)) as PaginatedResponse<Asset>
        assets.value = assetsData
        total.value = assetsData.totalCount
        rows.value = mapRows(assetsData.data)
    } catch (err) {
        console.error('Error fetching assets:', err)
        toast.showToast('Error', 'Failed to fetch assets', 'error')
    } finally {
        loading.value = false
    }
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value++
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value--
    }
}

const setPage = (newPage: number) => {
    // Pagination removed since backend returns filtered results
}

const clearFilters = () => {
    query.value = ''
    statusFilter.value = null
    modelFilter.value = null
}

const handleAddAsset = () => {
    router.push('/fleet/assets/add')
}

const handleUploadTripLogs = async () => {
    // Fetch supported models if not loaded
    if (supportedModels.value.length === 0) {
        try {
            supportedModels.value = await getSupportedModels(authStore)
        } catch (error) {
            console.error('Error fetching supported models:', error)
            toast.showToast('Error', 'Failed to load supported vehicle models', 'error')
            return
        }
    }

    dialog.openDialog(SelectTripLogModelModal, {
        supportedModels: supportedModels.value,
        onConfirm: async (model: SupportedModel, file: File) => {
            try {
                uploadingTripLog.value = true
                await uploadTripLog(file, authStore, undefined, model)
                toast.showToast('Success', 'Trip log uploaded successfully', 'success')
                dialog.closeDialog()
            } catch (error: any) {
                console.error('Error uploading trip log:', error)
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to upload trip log. Please try again.',
                    'error'
                )
            } finally {
                uploadingTripLog.value = false
            }
        },
        onCancel: () => {
            dialog.closeDialog()
        }
    })
}


const handleDelete = async (entity: Asset) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete the asset "${entity.name}" (${entity.assetCode})? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deleteAsset(entity.id, authStore)
                toast.showToast('Success', 'Asset deleted successfully', 'success')
                await fetchAssets()
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



onMounted(async () => {
    getAssetModels(authStore).then(models => modelOptions.value = models).catch(() => { })
    await fetchAssets()
})

watch([query, statusFilter, modelFilter, page], () => {
    fetchAssets()
})
</script>

<style scoped></style>
