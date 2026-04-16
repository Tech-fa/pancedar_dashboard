<template>
    <div class="pt-6">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-opposite">Vehicle Models</h2>
            <Can :subject="'asset-model'" :actions="['create']">
                <AppButton
                    test-id="vehicle-models-add-model"
                    buttonStyle="primary"
                    @click="handleAddModel"
                >
                    <i class="fa-solid fa-plus"></i>
                    <span class="ml-2">Add Model</span>
                </AppButton>
            </Can>
        </div>

        <Table
            :cols="['Name', 'Make']"
            :rows="rows"
            :page="page"
            :total="total"
            :per-page="perPage"
            :total-pages="totalPages"
            :on-next-page="onNextPage"
            :on-previous-page="onPreviousPage"
            :set-page="setPage"
            :entities="models"
            entity-name="Vehicle Model"
            :on-search="
                (val: string) => {
                    query = val
                }
            "
            :loading="loading"
            :subject="'asset-model'"
            :search-placeholder="'Search by name or make'"
            :handleDelete="handleDelete"
            :view-path="(row: any) => `/fleet/asset-models/${row.id}/edit`"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Table from '@/components/Table.vue'
import AppButton from '@/components/AppButton.vue'
import Can from '@/components/Can.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { getAssetModels, deleteAssetModel } from './endpoints'
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
    const queryLower = searchQuery.toLowerCase()
    return models.filter(
        (model) =>
            model.name.toLowerCase().includes(queryLower) ||
            model.make?.toLowerCase().includes(queryLower)
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
        message: `Are you sure you want to delete the vehicle model "${entity.name}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deleteAssetModel(entity.id, authStore)
                toast.showToast('Success', 'Vehicle model deleted successfully', 'success')
                await fetchModels()
            } catch (error: any) {
                console.error('Error deleting vehicle model:', error)
                toast.showToast(
                    'Error',
                    error?.response?.data?.message ||
                        'Failed to delete vehicle model. Please try again.',
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

const fetchModels = async () => {
    try {
        loading.value = true
        const modelsData = await getAssetModels(authStore)
        allModels.value = modelsData
        updatePagination()
    } catch (err) {
        console.error('Error fetching vehicle models:', err)
        toast.showToast('Error', 'Failed to fetch vehicle models', 'error')
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchModels()
})

watch(query, () => {
    page.value = 1
    updatePagination()
})
</script>
