<template>
    <main class=" ">
        <!-- Strategies List -->
        <Table :cols="tableCols" :rows="tableRows" :page="page" :total="total" :per-page="perPage"
            :total-pages="totalPages" :on-next-page="onNextPage" :on-previous-page="onPreviousPage" :set-page="setPage"
            :entities="strategies" entity-name="Approval Strategy" :on-success="fetchStrategies" :on-search="(val: string) => {
                query = val
            }" :loading="loading" :subject="'approval_strategies'" search-placeholder="Search by name"
            :hide-view="() => true" :edit-path="(entity: any) => `/qms/documents/approval-strategies/${entity.id}/edit`"
            :handleDelete="handleDelete">
            <template #extra-search>
                <Can subject="approval_strategies" :actions="['create']">
                    <AppButton type="button" button-style="neutral" href='/qms/documents/approval-strategies/add' ,>
                        <i class="fa-solid fa-plus"></i> Add Approval Strategy
                    </AppButton>
                </Can>
            </template>
        </Table>

        <!-- Add Strategy Button -->
    </main>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiGet, apiDelete } from '@/util/api'
import Table from '../Table.vue'
import type { ApprovalStrategy } from '@/util/interfaces'
import AppButton from '../AppButton.vue'
import Can from '../Can.vue'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '../ConfirmDialog.vue'
import { useToast } from '@/stores/notification'
const loading = ref(true)
const dialogStore = useDialog()
const toast = useToast()
const authStore = useAuthStore()

// Pagination state
const page = ref(1)
const perPage = ref(10)
const query = ref('')
const searchTimeout = ref<any | null>(null)

// Store all strategies from backend (after search filtering)
const allStrategies = ref<ApprovalStrategy[]>([])

// Replace the above with defineModel
const strategies = defineModel<ApprovalStrategy[]>('strategies', { required: true })

const tableCols = ['Name', 'Review Requirements', 'Approval Requirements']

// Paginate allStrategies for display
const paginatedStrategies = computed(() => {
    const start = (page.value - 1) * perPage.value
    const end = start + perPage.value
    return allStrategies.value.slice(start, end)
})

// Update strategies model with paginated results
watch(paginatedStrategies, (newVal) => {
    strategies.value = newVal
}, { immediate: true })

// Computed pagination values
const total = computed(() => allStrategies.value.length)
const totalPages = computed(() => Math.ceil(total.value / perPage.value))

const tableRows = computed(() => {
    return paginatedStrategies.value.map((strategy) => ({
        id: strategy.id,
        Name: strategy.name,
        'Review Requirements': `${strategy.requiredReviews} required reviewers | ${strategy.maxReviewDuration} days`,
        'Approval Requirements': `${strategy.requiredApprovals} required approvers | ${strategy.maxApprovalDuration} days`
    }))
})

// Watch for query changes and debounce search
watch(query, () => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }
    searchTimeout.value = setTimeout(() => {
        page.value = 1 // Reset to first page when searching
        fetchStrategies()
    }, 300) // Debounce search for 300ms
})

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value = page.value + 1
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value = page.value - 1
    }
}

const setPage = (newPage: number) => {
    if (newPage != page.value) {
        page.value = newPage
    }
}

// Fetch strategies from backend with search query
const fetchStrategies = async () => {
    try {
        loading.value = true
        const authStore = useAuthStore()
        const searchParam = query.value ? `?search=${encodeURIComponent(query.value)}` : ''
        const response = await apiGet<ApprovalStrategy[]>(
            `/documents/approval-strategies${searchParam}`,
            authStore
        )
        allStrategies.value = response || []
        // Reset to page 1 if current page is out of bounds
        if (page.value > totalPages.value) {
            page.value = totalPages.value || 1
        }
    } catch (error) {
        console.error('Failed to fetch strategies:', error)
        allStrategies.value = []
    } finally {
        loading.value = false
    }
}

const handleDelete = async (item: any) => {
    dialogStore.openDialog(ConfirmDialog, {
        message:
            'Are you sure you want to delete this approval strategy? This action cannot be undone.',
        onConfirm: async () => {
            try {
                await apiDelete(`/documents/approval-strategies/${item.id}`, authStore)
                toast.showToast('Success', 'Approval strategy deleted successfully', 'success')
                await fetchStrategies()
            } catch (error: any) {
                console.error('Error deleting approval strategy:', error)
                toast.showToast(
                    'Error',
                    error.response?.data?.message || 'Failed to delete approval strategy',
                    'error'
                )
            } finally {
                dialogStore.closeDialog()
            }
        },
        onCancel: dialogStore.closeDialog
    })
}

// Cleanup timeout on unmount
onUnmounted(() => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }
})

// Load strategies on component mount
onMounted(() => {
    if (allStrategies.value.length === 0 && strategies.value.length === 0) {
        fetchStrategies()
    } else if (strategies.value.length > 0) {
        // If strategies are passed from parent, use them
        allStrategies.value = strategies.value
        loading.value = false
    } else {
        loading.value = false
    }
})
</script>
