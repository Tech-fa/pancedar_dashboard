<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs">
            <div class="flex items-center gap-4">
                <Can :subject="'customer'" :actions="['create']">
                    <AppButton buttonStyle="primary" @click="router.push('/customers/add')">
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Customer</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <div class="px-6 pb-6">
            <div class="bg-secondary border border-gray-800 rounded-lg p-4 my-4">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap w-full">
                        <div class="min-w-[220px] flex-1">
                            <AppInput
                                v-model="query"
                                type="text"
                                :hideIcon="true"
                                placeholder="Search by name, code, or email"
                                class="w-full bg-main border border-gray-700 text-opposite placeholder-opposite/40"
                            />
                        </div>
                        <div class="min-w-[200px]">
                            <Select2
                                v-model="statusFilter"
                                :values="statusOptions"
                                :display="
                                    (option: string) => (option === 'All' ? 'All Statuses' : option)
                                "
                                :placeholder="'All Statuses'"
                                optional
                            />
                        </div>
                    </div>
                    <AppButton
                        v-if="hasActiveFilters"
                        buttonStyle="secondary"
                        @click="clearFilters"
                        class="self-start"
                    >
                        <i class="fa-solid fa-filter-circle-xmark mr-2"></i>
                        Clear Filters
                    </AppButton>
                </div>
            </div>

            <Table
                :cols="['Name', 'Contact Person', 'Email', 'Phone', 'City', 'Status']"
                :rows="rows"
                :entities="customers"
                entity-name="Customer"
                :loading="loading"
                :subject="'customer'"
                :handleDelete="handleDelete"
                :per-page="perPage"
                :page="page"
                :total="total"
                :total-pages="totalPages"
                :on-next-page="onNextPage"
                :on-previous-page="onPreviousPage"
                :set-page="setPage"
                :handleEdit="openEditModal"
                :map-status-style="mapStatusStyle"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Table from '@/components/Table.vue'
import AppInput from '@/components/AppInput.vue'
import Select2 from '@/components/Select2.vue'
import Can from '@/components/Can.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import type { Customer } from '@/util/interfaces'
import { getCustomers, deleteCustomer } from '@/components/fleet/endpoints'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const crumbs = [
    {
        name: 'Customers',
        path: '/customers/list',
        icon: 'fa-solid fa-building text-neutral-700 text-2xl'
    }
]

const customers = ref<Customer[]>([])
const rows = ref<{ [key: string]: any }[]>([])
const loading = ref(true)
const query = ref('')
const statusOptions = ['All', 'Active', 'Inactive']
const statusFilter = ref<string | null>(null)
const page = ref(1)
const perPage = 15
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage) || 1))

const hasActiveFilters = computed(() => {
    return !!query.value || !!statusFilter.value
})

const mapRows = (entities: Customer[]) => {
    return entities.map((customer) => {
        return {
            id: customer.id,
            Name: customer.name,
            'Contact Person': customer.contacts?.map((contact) => `${contact.firstName} ${contact.lastName}`).join(', ') || 'N/A',
            Email: customer.contacts?.map((contact) => contact.email).join(', ') || 'N/A',
            Phone: customer.contacts?.map((contact) => contact.phone).join(', ') || 'N/A',
            City: customer.locations?.[0]?.location?.city || 'N/A',
            Status: customer.isActive ? 'Active' : 'Inactive'
        }
    })
}

const mapStatusStyle = (status: string) => {
    if (status === 'Active') {
        return 'bg-green-100 text-green-800'
    }
    if (status === 'Inactive') {
        return 'bg-neutral-100 text-neutral-800'
    }
    return 'bg-neutral-100 text-neutral-800'
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value = page.value + 1
        fetchCustomers()
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value = page.value - 1
        fetchCustomers()
    }
}

const setPage = (newPage: number) => {
    if (newPage !== page.value) {
        page.value = newPage
        fetchCustomers()
    }
}

const clearFilters = () => {
    query.value = ''
    statusFilter.value = null
    page.value = 1
    fetchCustomers()
}

const openEditModal = (entity: Customer) => {
    router.push(`/customers/list/${entity.id}/edit`)
}

const handleDelete = (entity: Customer) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Delete customer "${entity.name}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deleteCustomer(entity.id, authStore)
                toast.showToast('Customer deleted', 'Customer removed successfully', 'success')
                await fetchCustomers()
            } catch (error: any) {
                toast.showToast(
                    'Error deleting customer',
                    error?.response?.data?.message || 'Failed to delete customer. Please try again.',
                    'error'
                )
            } finally {
                dialog.closeDialog()
            }
        },
        onCancel: () => dialog.closeDialog()
    })
}

const fetchCustomers = async () => {
    try {
        loading.value = true
        const response = await getCustomers(authStore, {
            search: query.value || undefined,
            status: statusFilter.value || undefined,
            page: page.value,
            perPage,
        })
        customers.value = response.data
        total.value = response.totalCount
        rows.value = mapRows(customers.value)
    } catch (error: any) {
        toast.showToast(
            'Error loading customers',
            error?.response?.data?.message || 'Failed to load customers. Please try again.',
            'error'
        )
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchCustomers()
})

watch([query, statusFilter], () => {
    page.value = 1
    fetchCustomers()
})
</script>
