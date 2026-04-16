<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="[{
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
            name: 'Asset Categories',
            path: '/fleet/asset-categories',
            icon: 'fa-solid fa-layer-group text-neutral-700 text-2xl'
        }
        ]">
            <div class="flex items-center gap-4">
                <Can :subject="'asset-categories'" :actions="['create']">
                    <AppButton test-id="asset-categories-add-category" buttonStyle="primary" @click="handleAddCategory">
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Category</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <!-- Asset Categories Table -->
        <div test-id="asset-categories-table-wrapper" class="px-6 pb-6">
            <Table :cols="['Name']" :rows="rows" :page="page" :total="total" :per-page="perPage"
                :total-pages="totalPages" :on-next-page="onNextPage" :on-previous-page="onPreviousPage"
                :set-page="setPage" :entities="categories" entity-name="Asset Category" :on-search="(val: string) => {
                        query = val
                    }
                    " :loading="loading" :subject="'asset-categories'" :search-placeholder="'Search by name'"
                :handleDelete="handleDelete" :view-path="(row: any) => `/fleet/asset-categories/${row.id}/edit`" />
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
    getAssetCategories,
    deleteAssetCategory,
} from './endpoints'
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
    return categories.filter(
        (category) =>
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
        message: `Are you sure you want to delete the asset category "${entity.name}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deleteAssetCategory(entity.id, authStore)
                toast.showToast('Success', 'Asset category deleted successfully', 'success')
                await onSuccess()
            } catch (error: any) {
                console.error('Error deleting asset category:', error)
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to delete asset category. Please try again.',
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
        const categoriesData = await getAssetCategories(authStore)
        allCategories.value = categoriesData
        updatePagination()
    } catch (err) {
        console.error('Error fetching asset categories:', err)
        toast.showToast('Error', 'Failed to fetch asset categories', 'error')
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
