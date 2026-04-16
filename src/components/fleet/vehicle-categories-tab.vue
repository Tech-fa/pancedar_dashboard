<template>
    <div class="pt-6">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-opposite">Vehicle Categories</h2>
            <Can :subject="'asset-category'" :actions="['create']">
                <AppButton
                    test-id="vehicle-categories-add-category"
                    buttonStyle="primary"
                    @click="handleAddCategory"
                >
                    <i class="fa-solid fa-plus"></i>
                    <span class="ml-2">Add Category</span>
                </AppButton>
            </Can>
        </div>

        <Table
            :cols="['Name']"
            :rows="rows"
            :page="page"
            :total="total"
            :per-page="perPage"
            :total-pages="totalPages"
            :on-next-page="onNextPage"
            :on-previous-page="onPreviousPage"
            :set-page="setPage"
            :entities="categories"
            entity-name="Vehicle Category"
            :on-search="
                (val: string) => {
                    query = val
                }
            "
            :loading="loading"
            :subject="'asset-category'"
            :search-placeholder="'Search by name'"
            :handleDelete="handleDelete"
            :view-path="(row: any) => `/fleet/asset-categories/${row.id}/edit`"
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
import { getAssetCategories, deleteAssetCategory } from './endpoints'
import type { AssetCategory } from '@/util/interfaces'

const categories = ref<AssetCategory[]>([])
const page = ref(1)
const perPage = ref(15)
const total = ref(1)
const totalPages = ref(1)
const query = ref('')
const loading = ref(true)
const rows = ref<{ [key: string]: any }[]>([])
const allCategories = ref<AssetCategory[]>([])
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const dialog = useDialog()

const mapRows = (categories: AssetCategory[]) => {
    return categories.map((category) => ({
        id: category.id,
        Name: category.name
    }))
}

const filterCategories = (categories: AssetCategory[], searchQuery: string) => {
    if (!searchQuery) return categories
    const queryLower = searchQuery.toLowerCase()
    return categories.filter((category) =>
        category.name.toLowerCase().includes(queryLower)
    )
}

const updatePagination = () => {
    const filteredCategories = filterCategories(allCategories.value, query.value)
    total.value = filteredCategories.length
    totalPages.value = Math.ceil(total.value / perPage.value)

    const startIndex = (page.value - 1) * perPage.value
    const endIndex = startIndex + perPage.value
    categories.value = filteredCategories.slice(startIndex, endIndex)
    rows.value = mapRows(categories.value)
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

const handleAddCategory = () => {
    router.push('/fleet/asset-categories/add')
}

const handleDelete = async (entity: AssetCategory) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete the vehicle category "${entity.name}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deleteAssetCategory(entity.id, authStore)
                toast.showToast('Success', 'Vehicle category deleted successfully', 'success')
                await fetchCategories()
            } catch (error: any) {
                console.error('Error deleting vehicle category:', error)
                toast.showToast(
                    'Error',
                    error?.response?.data?.message ||
                        'Failed to delete vehicle category. Please try again.',
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

const fetchCategories = async () => {
    try {
        loading.value = true
        const categoriesData = await getAssetCategories(authStore)
        allCategories.value = categoriesData
        updatePagination()
    } catch (err) {
        console.error('Error fetching vehicle categories:', err)
        toast.showToast('Error', 'Failed to fetch vehicle categories', 'error')
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchCategories()
})

watch(query, () => {
    page.value = 1
    updatePagination()
})
</script>
