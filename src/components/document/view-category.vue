<template>
    <div id="root" class="min-h-screen bg-main">
        <Table :cols="['Name', 'Codes', 'Created Date', 'Documents Count']" :rows="paginatedTypes.map((type) => ({
            id: type.id,
            Name: type.name,
            Codes: type.documentCodes?.map(c => c.code).join(', ') || type.categoryCode,
            'Created Date': formatDate(type.createdAt),
            'Documents Count': type.documentsCount ?? 0
        }))
            " :entities="types" :on-edit="handleEdit" :total-pages="totalPages" :page="currentPage" :total="totalItems"
            :per-page="itemsPerPage" :on-next-page="handleNextPage" :on-previous-page="handlePreviousPage"
            :set-page="setPage" :entity-name="'Category'" :on-success="fetchTypes" :on-search="(val: string) => {
                search = val
            }
                " :loading="loading" :search-loading="false" :search-placeholder="'Search by name or code'"
            :page-loading="false" :handleDelete="handleDelete" :hide-view="() => true" :subject="'document_types'">
            <template #extra-search>
                <Can subject="document_types" :actions="['create']">
                    <AppButton type="button" button-style="secondary" @click="openAddModal">
                        <i class="fa-solid fa-plus"></i> Add Category
                    </AppButton>
                </Can>
            </template>
        </Table>
        <!-- // USE THE DIALOG WE HAVE IN APP!!! -->
        <!-- Add/Edit Category Modal -->
    </div>
</template>
<script setup lang="ts">
import AppButton from '../../components/AppButton.vue'
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue'
import { apiPost, apiPut, apiGet, apiDelete } from '../../util/api'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../stores/notification'
import { useDialog } from '../../stores/dialog'
import type { DocumentType } from '../../util/interfaces'
import DocumentTypeForm from './documentTypeForm.vue'
import Table from '../../components/Table.vue'
import Can from '../../components/Can.vue'
import ConfirmDialog from '../ConfirmDialog.vue'

const loading = ref(false)
const formLoading = ref(false)
const isEditMode = ref(false)
const entity = ref<DocumentType | null>(null)

const search = ref('')
const authStore = useAuthStore()
const toast = useToast()
const formKey = ref(0)
const dialogStore = useDialog()

// Model used by Table for the current (paginated) page
const types = defineModel<DocumentType[]>('types', { required: true })

// Store all categories fetched from backend (after applying backend search)
const allTypes = ref<DocumentType[]>([])

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Total items and total pages are based on allTypes (backend-filtered results)
const totalItems = computed(() => allTypes.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const handleEdit = (row: { id: number }) => {
    const type = types.value.find((t) => t.id === row.id)

    if (!type) {
        console.error('Could not find type for row:', row)
        toast.showToast('Error', 'Could not find category data to edit.', 'error')
        return
    }
    isEditMode.value = true
    entity.value = type
    dialogStore.openDialog(DocumentTypeForm, {
        isEditMode: true,
        initialValues: {
            documentTypeName: type.name,
            documentTypeCode: type.categoryCode,
            codes: type.documentCodes || []
        },
        formKey: formKey.value,
        loading: formLoading,
        onSubmit: onSubmit,
        onCancel: dialogStore.closeDialog
    })
}

const onSubmit = async (values: any) => {
    if (formLoading.value) return

    formLoading.value = true
    let response
    const body = {
        name: values.documentTypeName,
        documentCodes: values.documentCodes
    }
    try {
        let typeId: number
        if (isEditMode.value) {
            response = await apiPut<{ id: number }>(
                `/documents/types/${entity.value?.id}`,
                body,
                authStore
            )
            typeId = entity.value?.id!
        } else {
            response = await apiPost<{ id: number }>('/documents/types', body, authStore)
            typeId = response.id
        }


        toast.showToast(
            'Success',
            `Category ${isEditMode.value ? 'updated' : 'created'} successfully`,
            'success'
        )
        dialogStore.closeDialog()
        await fetchTypes()
    } catch (error: any) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'creating'} category:`, error)
        toast.showToast(
            'Error',
            error?.response?.data?.message ||
            `Failed to ${isEditMode.value ? 'update' : 'create'} category`,
            'error',
            5000,
            'duplicate-category-error'
        )
    } finally {
        formLoading.value = false
    }
}

const fetchTypes = async () => {
    try {
        loading.value = true
        const searchParam = search.value
            ? `?search=${encodeURIComponent(search.value)}`
            : ''
        const response = await apiGet<DocumentType[]>(
            `/documents/types${searchParam}`,
            authStore
        )
        allTypes.value = response || []

        // Ensure current page is in range
        if (currentPage.value > totalPages.value) {
            currentPage.value = totalPages.value || 1
        }
    } catch (error) {
        console.error('Error fetching document types:', error)
        toast.showToast('Error', 'Failed to load categories', 'error')
        allTypes.value = []
    } finally {
        loading.value = false
    }
}

const formatDate = (val: number | string | null | undefined) => {
    if (!val) return '-'
    const ms = typeof val === 'string' ? parseInt(val, 10) : val
    const date = new Date(ms)
    return isNaN(date.getTime())
        ? '-'
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Watch search term and debounce backend search
const searchTimeout = ref<any | null>(null)

watch(search, () => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }
    searchTimeout.value = setTimeout(() => {
        currentPage.value = 1
        fetchTypes()
    }, 300)
})

function openAddModal() {
    isEditMode.value = false
    formKey.value++
    dialogStore.openDialog(DocumentTypeForm, {
        isEditMode: false,
        initialValues: { documentTypeName: undefined, documentTypeCode: undefined },
        formKey: formKey.value,
        loading: formLoading,
        onSubmit: onSubmit,
        onCancel: dialogStore.closeDialog
    })
}

const paginatedTypes = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return allTypes.value.slice(start, end)
})

// Keep Table model (types) in sync with current page
watch(
    paginatedTypes,
    (newVal) => {
        types.value = newVal
    },
    { immediate: true }
)

const handleDelete = async (item: any) => {
    dialogStore.openDialog(ConfirmDialog, {
        message:
            'Are you sure you want to delete this category? This action cannot be undone.',
        onConfirm: async () => {
            try {
                await apiDelete(`/documents/types/${item.id}`, authStore)
                toast.showToast('Success', 'Category deleted successfully', 'success')
                await fetchTypes()
            } catch (error: any) {
                console.error('Error deleting category:', error)
                toast.showToast(
                    'Error',
                    error.response?.data?.message || 'Failed to delete category',
                    'error'
                )
            } finally {
                dialogStore.closeDialog()
            }
        },
        onCancel: dialogStore.closeDialog
    })
}

const handleNextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const handlePreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const setPage = (page: number) => {
    currentPage.value = page
}

// Cleanup debounce timeout on unmount
onUnmounted(() => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }
})

// Initial load - fetch categories when component mounts
onMounted(() => {
    fetchTypes()
})
</script>
