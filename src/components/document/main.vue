<template>
    <Breadcrumb :crumbs="[
        {
            name: 'Documents',
            path: '/documents',
            icon: 'fa-solid fa-file-alt'
        }
    ]">
        <div class="flex items-center space-x-4">
            <div class="flex gap-4">
                <Can :subjects="['document_types', 'document_approvals']" :actions="['read']">
                    <AppButton buttonStyle="secondary" class="flex items-center gap-2" href="/qms/documents/settings"
                        test-id="document-settings-button">
                        <i class="fa-solid fa-gear"></i>
                        Settings
                    </AppButton>
                </Can>

                <Can subject="documents" :actions="['create']">
                    <AppButton buttonStyle="primary" class="flex items-center gap-2" href="/qms/documents/add"
                        test-id="add-document-button">
                        <i class="fa-solid fa-plus"></i>
                        Add New Document
                    </AppButton>
                </Can>
                <Can subject="change_requests" :actions="['create']">
                    <AppButton buttonStyle="secondary" @click="createChangeRequest"
                        test-id="create-change-request-button">
                        <i class="fa-solid fa-file-circle-plus mr-2"></i>
                        Create Change Request
                    </AppButton>
                </Can>
                <Can subject="change_requests" :actions="['read']">
                    <AppButton buttonStyle="warning" href="/qms/documents/change-requests"
                        test-id="view-change-request-button">
                        <i class="fa-solid fa-eye mr-2"></i>
                        View Change Requests
                    </AppButton>
                </Can>
            </div>
        </div>
    </Breadcrumb>

    <!-- Main Content -->
    <main id="main-content" class="pt-6 sm:px-2 2xl:px-8">
        <!-- Search and Filter -->
        <div id="search-filter" class="mb-6">
            <div class="flex gap-4">
                <div class="flex-1">
                    <div class="relative">
                        <AppInput v-model="searchQuery" @input="handleSearch" type="text"
                            placeholder="Search documents by title or code..."
                            class="w-full px-4 py-2 pl-10 border border-neutral-200 rounded-md"
                            test-id="document-search" />
                        <i class="fa-solid fa-search absolute left-3 top-3 text-neutral-400"></i>
                    </div>
                </div>
                <div class="flex gap-2">
                    <span style="min-width: 250px">
                        <Select2 v-model="filterData.status" :values="filterData.statuses || []"
                            :display="(val?: any) => val?.name" placeholder="All Statuses"
                            @update:modelValue="(val) => handleFilterChange(val, 'status')" test-id="status-filter" />
                    </span>
                    <span style="min-width: 150px">
                        <Select2 v-model="filterData.category" :values="filterData.categories || []"
                            :display="displayName" placeholder="All Categories"
                            @update:modelValue="(val) => handleFilterChange(val, 'category')"
                            test-id="category-filter" />
                    </span>
                    <span v-if="filterData.codes?.length > 0" style="min-width: 150px">
                        <Select2 v-model="filterData.code" :values="filterData.codes || []"
                            :display="(item: any) => item?.code ? `${item.code}${item.name ? ' - ' + item.name : ''}` : item?.code || ''"
                            placeholder="All Codes" @update:modelValue="(val) => handleFilterChange(val, 'code')"
                            test-id="code-filter" />
                    </span>

                    <span style="min-width: 150px">
                        <Select2 v-model="filterData.createdFor" :values="filterData.availableUsers || []"
                            :display="(item: any) => item?.fname ? `${item.fname} ${item.lname}` : ''"
                            placeholder="All Users" @update:modelValue="(val) => handleFilterChange(val, 'createdFor')"
                            test-id="created-for-filter" />
                    </span>
                </div>
            </div>
        </div>

        <!-- Document List -->
        <Table :cols="columns" :rows="rows" :skip-padding="true" :entities="documents.data" :total-pages="totalPages"
            :page="currentPage" :total="totalDocuments" :per-page="perPage" :on-next-page="handleNextPage"
            :on-previous-page="handlePreviousPage" :set-page="setPage" entity-name="Document"
            :on-success="handleSuccess" :loading="loading" subject="documents" :hide-edit="(row: any) => true"
            :hide-view="(row: any) => true" :map-status-style="(status: string) => (status === 'Obsolete' ? 'bg-red-100 text-red-800' : '')
                " :sorting-columns="['Title', 'Upload Date']" :on-sort="handleSort">
            <template #extra-field="{ entity }">
                <div class="flex gap-4 flex-wrap items-center justify-center h-full">
                    <Can subject="documents" :actions="['read']">
                        <AppButton type="button" button-style="void" :href="`/qms/documents/${entity.id}`"
                            class="cursor-pointer hover:text-neutral-400" :test-id="`document-view-${entity.id}`">
                            <i class="fa-solid fa-eye"></i>
                        </AppButton>
                    </Can>
                    <Can subject="documents" :actions="['read']">
                        <AppButton type="button" button-style="void" class="cursor-pointer hover:text-neutral-400"
                            :download="entity.versions[0].file">
                            <i class="fa-solid fa-download"></i>
                        </AppButton>
                    </Can>
                    <Can subject="change_requests" :actions="['read']" v-if="entity.totalChangeRequests > 0">
                        <AppButton type="button" button-style="void"
                            :href="`/qms/documents/${entity.id}/change-requests`"
                            class="cursor-pointer hover:text-neutral-400">
                            <i class="fa-solid fa-file-circle-plus"></i>
                        </AppButton>
                    </Can>
                </div>
            </template>
        </Table>
    </main>
</template>

<script setup lang="ts">
import { DocumentStatus, type Document, type DocumentCode, type PaginatedResponse } from '@/util/interfaces'
import AppButton from '../AppButton.vue'
import Table from '../Table.vue'
import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiGet, apiPost } from '@/util/api'
import { formatDate, flattenTree, mapDocumentStatus } from '@/util/util'
import Breadcrumb from '../breadCrums.vue'
import Select2 from '../Select2.vue'
import { useToast } from '@/stores/notification'
import AppInput from '../AppInput.vue'
import Can from '../Can.vue'
import { useDialog } from '@/stores/dialog'
import ChangeRequestDialog from './ChangeRequestDialog.vue'
const authStore = useAuthStore()
const toast = useToast()
const dialogStore = useDialog()
// Table data
const columns = [
    'Title',
    'Creator',
    'Category',
    'Category Code',
    'Status',
    'Upload Date',
    'Version',
    'New Version'
]
const documents = ref<PaginatedResponse<Document>>({
    data: [],
    currentPage: 1,
    totalCount: 0,
    perPage: 10
})
const rows = ref<{ [key: string]: any }[]>([])

// Pagination and Search
const currentPage = ref(1)
const totalPages = ref(1)
const totalDocuments = ref(1)
const perPage = ref(10)
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const searchTimeout = ref()
const filterData = ref<any>({})
const sortBy = ref<string>('')
const sortDir = ref<'asc' | 'desc' | null>(null)

const displayName = (item: any) => item?.name || ''

const mapRows = (documents: Document[]) => {
    return documents.map((doc) => ({
        id: doc.id,
        Title: doc.title,
        Creator: doc.createdBy.fname + ' ' + doc.createdBy.lname,
        Category: doc.documentType.name,
        'Category Code': doc.category?.code,
        Status: mapDocumentStatus(doc.versions[0].status),
        'Upload Date': formatDate(doc.createdAt),
        Version: doc.currentVersion, //show only latest version
        'New Version': mapDocumentStatus((doc as any).newVersions[0]?.status || 'None')
    }))
}

watch(
    [filterData, currentPage],
    () => {
        fetchDocuments()
    },
    { deep: true }
)

const fetchDocuments = async () => {
    loading.value = true
    error.value = null
    try {
        const searchParam = searchQuery.value ? `&search=${searchQuery.value}` : ''
        const statusParam = filterData.value.status?.id
            ? `&status=${filterData.value.status.id}`
            : ''
        const categoryParam = filterData.value.category?.id
            ? `&category=${filterData.value.category.id}`
            : ''
        const codeParam = filterData.value.code?.id ? `&code=${filterData.value.code.id}` : ''
        const createdForParam = filterData.value.createdFor?.id
            ? `&createdFor=${filterData.value.createdFor.id}`
            : ''
        const sortParams =
            sortBy.value && sortDir.value
                ? `&sortBy=${encodeURIComponent(sortBy.value)}&sortDir=${encodeURIComponent(sortDir.value)}`
                : ''

        const response = await apiGet<PaginatedResponse<Document>>(
            `/documents?perPage=${perPage.value}&page=${currentPage.value}${searchParam}${statusParam}${categoryParam}${codeParam}${createdForParam}${sortParams}`,
            authStore
        )
        rows.value = mapRows(response.data)
        documents.value = response
        totalPages.value = Math.ceil(response.totalCount / perPage.value)
        totalDocuments.value = response.totalCount
    } catch (err) {
        console.error(err)
        if (authStore.state.isLoggedIn) {
            toast.showToast('Error', 'Failed to fetch documents', 'error')
        }
    } finally {
        loading.value = false
    }
}

const fetchFilterOptions = async () => {
    loading.value = true
    error.value = null
    try {
        const [categories, availableUsers] = await Promise.all([
            apiGet<any>('/documents/types', authStore),

            apiGet<any[]>(
                'permissions/access?subject=documents',
                authStore
            ),
        ])

        filterData.value = {
            categories: [{ id: '', name: 'All Categories' }, ...categories],
            availableUsers: [
                { id: '', fname: 'All', lname: 'Users' },
                ...(availableUsers || [])
            ],
            statuses: [
                { id: '', name: 'All Statuses' },
                { id: DocumentStatus.PENDING, name: mapDocumentStatus(DocumentStatus.PENDING) },
                {
                    id: DocumentStatus.READY_FOR_APPROVAL,
                    name: mapDocumentStatus(DocumentStatus.READY_FOR_APPROVAL)
                },
                { id: DocumentStatus.PUBLISHED, name: mapDocumentStatus(DocumentStatus.PUBLISHED) },
                { id: DocumentStatus.OBSOLETE, name: mapDocumentStatus(DocumentStatus.OBSOLETE) }
            ],
            status: { id: '', name: 'All Statuses' },
            category: { id: '', name: 'All Categories' },
            organizationUnit: { id: '', title: { en: 'All Organization Units' } },
            createdFor: { id: '', fname: 'All', lname: 'Users' }
        }
    } catch (err) {
        toast.showToast('Error', 'Failed to fetch filter options', 'error')
    } finally {
        loading.value = false
    }
}

// Handlers
const handleSearch = () => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }

    searchTimeout.value = setTimeout(() => {
        currentPage.value = 1 // Reset to first page when searching
        fetchDocuments()
    }, 300) // Debounce search for 300ms
}

onUnmounted(() => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }
})

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

const handleSuccess = () => {
    fetchDocuments()
}

const fetchFilterCodes = async (documentTypeId: number) => {
    try {
        const codes = await apiGet<DocumentCode[]>(
            `/documents/types/${documentTypeId}/codes`,
            authStore
        )
        filterData.value.codes = [{ id: '', code: 'All Codes' }, ...(codes || [])]
        filterData.value.code = { id: '', code: 'All Codes' }
    } catch {
        filterData.value.codes = []
        filterData.value.code = null
    }
}

const handleFilterChange = (value: any, type: 'category' | 'status' | 'organizationUnit' | 'code' | 'createdFor') => {
    filterData.value[type] = value || {
        id: '',
        name: type === 'organizationUnit' ? { title: { en: `All ${type}s` } } : `All ${type}s`
    }
    if (type === 'category') {
        if (value?.id) {
            fetchFilterCodes(value.id)
        } else {
            filterData.value.codes = []
            filterData.value.code = null
        }
    }
    currentPage.value = 1
}

const createChangeRequest = () => {
    dialogStore.openDialog(ChangeRequestDialog, {
        onConfirm: async () => {
            dialogStore.closeDialog()
            toast.showToast('Success', 'Change request created successfully', 'success')
        },
        onCancel: dialogStore.closeDialog
    })
}

const handleSort = ({ column, direction }: { column: string; direction: 'asc' | 'desc' | null }) => {
    // Map table column names to backend sort keys
    const columnMap: Record<string, string> = {
        Title: 'title',
        'Upload Date': 'createdAt'
    }
    const key = columnMap[column]
    if (!key) return
    sortBy.value = key
    sortDir.value = direction
    currentPage.value = 1
    fetchDocuments()
}

onMounted(() => {
    fetchFilterOptions()
    fetchDocuments()
})
</script>
