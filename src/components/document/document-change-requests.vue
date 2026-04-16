<template>
    <Breadcrumb
        :crumbs="[
            {
                name: 'Documents',
                path: '/qms/documents',
                icon: 'fa-solid fa-file-alt'
            },

            {
                name: 'Change Requests',
                icon: 'fa-solid fa-file-circle-plus'
            }
        ]"
    >
        <div class="flex items-center space-x-4">
            <div class="flex gap-4">
                <Can subject="documents" :actions="['create']">
                    <AppButton
                        buttonStyle="primary"
                        class="flex items-center gap-2"
                        @click="openCreateDialog"
                        test-id="create-change-request-button"
                    >
                        <i class="fa-solid fa-plus"></i>
                        Create Change Request
                    </AppButton>
                </Can>
            </div>
        </div>
    </Breadcrumb>

    <!-- Main Content -->
    <main id="main-content" class="p-6">
        <!-- Document Info -->
        <div v-if="documentTitle" class="mb-6 p-4 bg-main border border-main rounded-lg">
            <h2 class="text-lg font-semibold text-opposite mb-2">Change Requests for Document</h2>
            <p class="text-blue-700">{{ documentTitle }}</p>
        </div>

        <!-- Search and Filter -->
        <div id="search-filter" class="mb-6 px-1 sm:px-6 lg:px-8">
            <div class="flex gap-4">
                <div class="flex-1">
                    <div class="relative">
                        <AppInput
                            v-model="searchQuery"
                            @input="handleSearch"
                            type="text"
                            placeholder="Search change requests by title, reason..."
                            class="w-full px-4 py-2 pl-10 border border-neutral-200 rounded-md"
                            test-id="change-request-search"
                        />
                        <i class="fa-solid fa-search absolute left-3 top-3 text-neutral-400"></i>
                    </div>
                </div>
                <div class="flex gap-2">
                    <span style="min-width: 200px">
                        <Select2
                            v-model="filterData.status"
                            :values="filterData.statuses || []"
                            :display="(val?: any) => val?.name"
                            placeholder="All Statuses"
                            @update:modelValue="(val) => handleFilterChange(val, 'status')"
                            test-id="status-filter"
                        />
                    </span>
                </div>
            </div>
        </div>

        <!-- Change Request List -->
        <Table
            :cols="columns"
            :rows="rows"
            :entities="changeRequests.data"
            :total-pages="totalPages"
            :page="currentPage"
            :total="totalChangeRequests"
            :per-page="perPage"
            :on-next-page="handleNextPage"
            :on-previous-page="handlePreviousPage"
            :set-page="setPage"
            entity-name="Change Request"
            :on-success="handleSuccess"
            :loading="loading"
            subject="change_requests"
            :hide-edit="(row: any) => true"
            :hide-view="(row: any) => true"
            :map-status-style="mapChangeRequestStatusStyle"
        >
            <template #extra-field="{ entity }">
                <Can subject="change_requests" :actions="['read']">
                    <AppButton
                        type="button"
                        button-style="neutral"
                        @click="viewChangeRequest(entity)"
                        test-id="view-change-request-details-button"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </AppButton>
                </Can>
            </template>
        </Table>
    </main>

    <!-- Dialogs are handled by the dialog store -->
</template>

<script setup lang="ts">
import { ChangeRequestStatus, type ChangeRequest, type PaginatedResponse } from '@/util/interfaces'
import AppButton from '../AppButton.vue'
import Table from '../Table.vue'
import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiGet } from '@/util/api'
import { formatDate, mapChangeRequestStatus } from '@/util/util'
import Breadcrumb from '../breadCrums.vue'
import Select2 from '../Select2.vue'
import { useToast } from '@/stores/notification'
import AppInput from '../AppInput.vue'
import Can from '../Can.vue'
import ChangeRequestDialog from './ChangeRequestDialog.vue'
import { useRoute } from 'vue-router'
import { useDialog } from '@/stores/dialog'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()
const dialogStore = useDialog()

// Table data
const columns = [
    'Status',
    'Title',
    'Requested By',
    'Reason',
    'Reviewed By',
    'Review Comment',
    'Created Date',
    'Reviewed Date'
]

const changeRequests = ref<PaginatedResponse<ChangeRequest>>({
    data: [],
    currentPage: 1,
    totalCount: 0,
    perPage: 10
})
const rows = ref<{ [key: string]: any }[]>([])

// Pagination and Search
const currentPage = ref(1)
const totalPages = ref(1)
const totalChangeRequests = ref(1)
const perPage = ref(10)
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const searchTimeout = ref()
const filterData = ref<any>({})

// Dialog states
const selectedChangeRequest = ref<ChangeRequest | undefined>(undefined)
const documentTitle = ref<string>('')

const mapRows = (changeRequests: ChangeRequest[]) => {
    return changeRequests.map((cr) => ({
        id: cr.id,
        Status: mapChangeRequestStatus(cr.status),
        'Title': cr.title || 'No title',
        'Requested By': `${cr.requestedBy.fname} ${cr.requestedBy.lname}`,
        Reason: cr.reason || 'No reason provided',
        'Reviewed By': cr.reviewedBy
            ? `${cr.reviewedBy.fname} ${cr.reviewedBy.lname}`
            : 'Not reviewed',
        'Review Comment': cr.reviewComment || 'No comment',
        'Created Date': formatDate(cr.createdAt),
        'Reviewed Date': cr.reviewedAt ? formatDate(cr.reviewedAt) : 'Not reviewed'
    }))
}

const mapChangeRequestStatusStyle = (status: string) => {
    switch (status) {
        case 'Active':
            return 'bg-yellow-100 text-yellow-800'
        case 'Accepted':
            return 'bg-green-100 text-green-800'
        case 'Rejected':
            return 'bg-red-100 text-red-800'
        default:
            return ''
    }
}

watch(
    [filterData, currentPage],
    () => {
        fetchChangeRequests()
    },
    { deep: true }
)

const fetchChangeRequests = async () => {
    loading.value = true
    error.value = null
    try {
        const searchParam = searchQuery.value ? `&search=${searchQuery.value}` : ''
        const statusParam = filterData.value.status?.id
            ? `&status=${filterData.value.status.id}`
            : ''

        const response = await apiGet<PaginatedResponse<ChangeRequest>>(
            `/documents/change-requests?perPage=${perPage.value}&page=${currentPage.value}${searchParam}${statusParam}`,
            authStore
        )
        rows.value = mapRows(response.data)
        changeRequests.value = response
        totalPages.value = Math.ceil(response.totalCount / perPage.value)
        totalChangeRequests.value = response.totalCount
    } catch (err) {
        console.error(err)
        if (authStore.state.isLoggedIn) {
            toast.showToast('Error', 'Failed to fetch change requests', 'error')
        }
    } finally {
        loading.value = false
    }
}



const fetchFilterOptions = async () => {
    loading.value = true
    error.value = null
    try {
        filterData.value = {
            statuses: [
                { id: '', name: 'All Statuses' },
                {
                    id: ChangeRequestStatus.ACTIVE,
                    name: mapChangeRequestStatus(ChangeRequestStatus.ACTIVE)
                },
                {
                    id: ChangeRequestStatus.ACCEPTED,
                    name: mapChangeRequestStatus(ChangeRequestStatus.ACCEPTED)
                },
                {
                    id: ChangeRequestStatus.REJECTED,
                    name: mapChangeRequestStatus(ChangeRequestStatus.REJECTED)
                }
            ],
            status: { id: '', name: 'All Statuses' }
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
        fetchChangeRequests()
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
    fetchChangeRequests()
}

const handleFilterChange = (value: any, type: 'status') => {
    filterData.value[type] = value || {
        id: '',
        name: `All ${type}s`
    }
    currentPage.value = 1
}

// Dialog handlers
const openCreateDialog = () => {
    dialogStore.openDialog(ChangeRequestDialog, {
        onConfirm: handleChangeRequestCreated,
        onCancel: dialogStore.closeDialog
    })
}

const viewChangeRequest = (changeRequest: ChangeRequest) => {
    selectedChangeRequest.value = changeRequest
    dialogStore.openDialog(ChangeRequestDialog, {
        changeRequestId: changeRequest.id,
        isViewMode: true,
        onConfirm: handleChangeRequestUpdated,
        onCancel: dialogStore.closeDialog
    })
}

const handleChangeRequestCreated = () => {
    dialogStore.closeDialog()
    fetchChangeRequests()
}

const handleChangeRequestUpdated = () => {
    dialogStore.closeDialog()
    selectedChangeRequest.value = undefined
    fetchChangeRequests()
}

onMounted(() => {
    fetchFilterOptions()
    fetchChangeRequests()
})
</script>
