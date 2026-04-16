<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="[
            {
                name: 'Fleet',
                path: '/fleet/assets',
                icon: 'fa-solid fa-helicopter text-neutral-700 text-2xl'
            },
            {
                name: 'Fleet Settings',
                path: '/fleet/settings',
                icon: 'fa-solid fa-gear text-neutral-700 text-2xl'
            },
            {
                name: 'Asset Models',
                path: '/fleet/asset-models',
                icon: 'fa-solid fa-cubes text-neutral-700 text-2xl'
            }
        ]">
            <div class="flex items-center gap-4">
                <Can :subject="'asset-models'" :actions="['create']">
                    <AppButton test-id="asset-models-add-model" buttonStyle="primary" @click="handleAddModel">
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Model</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <!-- Asset Models Table -->
        <div test-id="asset-models-table-wrapper" class="px-6 pb-6">
            <Table :cols="['Name', 'Make']" :rows="rows" :page="page" :total="total" :per-page="perPage"
                :total-pages="totalPages" :on-next-page="onNextPage" :on-previous-page="onPreviousPage"
                :set-page="setPage" :entities="models" entity-name="Asset Model" :on-search="(val: string) => {
                        query = val
                    }
                    " :loading="loading" :subject="'asset-models'" :search-placeholder="'Search by name or make'"
                :handleDelete="handleDelete" :view-path="(row: any) => `/fleet/asset-models/${row.id}/edit`" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { h, ref, watch, onMounted } from 'vue'
import Table from '@/components/Table.vue'
import AppButton from '@/components/AppButton.vue'
import BreadCrums from '@/components/breadCrums.vue'
import Can from '@/components/Can.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import {
    getAssetModels,
    deleteAssetModel,
} from './endpoints'
import type { AssetModel } from '@/util/interfaces'

const models = ref<AssetModel[]>([])
const page = ref(1)
const perPage = ref(15)
const total = ref(1)
const totalPages = ref(1)
const query = ref('')
const loading = ref(true)
const rows = ref<{ [key: string]: any }[]>([])
const allModels = ref<AssetModel[]>([])
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const dialog = useDialog()

const mapRows = (models: AssetModel[]) => {
    return models.map((model) => ({
        id: model.id,
        Name: model.name,
        Make: model.make || '-'
    }))
}

const filterModels = (models: AssetModel[], searchQuery: string) => {
    if (!searchQuery) return models
    const query = searchQuery.toLowerCase()
    return models.filter(
        (model) =>
            model.name.toLowerCase().includes(query) ||
            model.make?.toLowerCase().includes(query)
    )
}

const updatePagination = () => {
    const filteredModels = filterModels(allModels.value, query.value)
    total.value = filteredModels.length
    totalPages.value = Math.ceil(total.value / perPage.value)

    const startIndex = (page.value - 1) * perPage.value
    const endIndex = startIndex + perPage.value
    models.value = filteredModels.slice(startIndex, endIndex)
    rows.value = mapRows(models.value)
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value = page.value + 1
        updatePagination()
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value = page.value - 1
        updatePagination()
    }
}

const setPage = (newPage: number) => {
    if (newPage != page.value) {
        page.value = newPage
        updatePagination()
    }
}

const handleAddModel = () => {
    router.push('/fleet/asset-models/add')
}

const handleDelete = async (entity: AssetModel) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete the asset model "${entity.name}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deleteAssetModel(entity.id, authStore)
                toast.showToast('Success', 'Asset model deleted successfully', 'success')
                await onSuccess()
            } catch (error: any) {
                console.error('Error deleting asset model:', error)
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to delete asset model. Please try again.',
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

const onSuccess = async () => {
    try {
        loading.value = true
        const modelsData = await getAssetModels(authStore)
        allModels.value = modelsData
        updatePagination()
    } catch (err) {
        console.error('Error fetching asset models:', err)
        toast.showToast('Error', 'Failed to fetch asset models', 'error')
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await onSuccess()
})

watch(query, () => {
    page.value = 1
    updatePagination()
})
</script>

<style scoped></style>
