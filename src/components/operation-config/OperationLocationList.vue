<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs">
            <div class="flex items-center gap-4">
                <Can :subject="'operation-config'" :actions="['create']">
                    <AppButton buttonStyle="primary" @click="router.push('/operation-config/locations/add')">
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Location</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <div class="px-6 pb-6">
            <div class="bg-secondary border border-gray-800 rounded-lg p-4 my-4">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap w-full">
                        <div class="min-w-[220px] flex-1">
                            <AppInput v-model="query" type="text" :hideIcon="true" placeholder="Search by country, state or city"
                                class="w-full bg-main border border-gray-700 text-opposite placeholder-opposite/40" />
                        </div>
                        <div class="min-w-[200px]">
                            <Select2 v-model="statusFilter" :values="statusOptions"
                                :display="(option: string) => (option === 'All' ? 'All Statuses' : option)"
                                :placeholder="'All Statuses'" optional />
                        </div>
                    </div>
                    <AppButton v-if="hasActiveFilters" buttonStyle="secondary" @click="clearFilters" class="self-start">
                        <i class="fa-solid fa-filter-circle-xmark mr-2"></i>
                        Clear Filters
                    </AppButton>
                </div>
            </div>

            <Table :cols="['Country', 'State', 'City', 'Required Docs', 'Status']" :rows="rows"
                :entities="locations" entity-name="Operation Location" :loading="loading"
                :subject="'operation-config'" :handleDelete="handleDelete" :per-page="perPage" :page="page"
                :total="total" :total-pages="totalPages" :on-next-page="onNextPage"
                :on-previous-page="onPreviousPage" :set-page="setPage" :handleEdit="openEditModal"
                :map-status-style="mapStatusStyle" :hide-view="() => true" />
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
import type { OperationLocation } from '@/util/interfaces'
import { getOperationLocations, deleteOperationLocation } from './endpoints'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const crumbs = [
    {
        name: 'Operation Locations',
        path: '/operation-config/locations',
        icon: 'fa-solid fa-globe text-neutral-700 text-2xl'
    }
]

const locations = ref<OperationLocation[]>([])
const allLocations = ref<OperationLocation[]>([])
const rows = ref<{ [key: string]: any }[]>([])
const loading = ref(true)
const query = ref('')
const statusOptions = ['All', 'Active', 'Inactive']
const statusFilter = ref<string | null>(null)
const page = ref(1)
const perPage = 15
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage) || 1))

const hasActiveFilters = computed(() => !!query.value || !!statusFilter.value)

const mapRows = (entities: OperationLocation[]) => {
    return entities.map((loc) => ({
        id: loc.id,
        Country: loc.country || 'N/A',
        State: loc.state || 'N/A',
        City: loc.city || 'N/A',
        'Required Docs': loc.requiredDocuments?.length ?? 0,
        Status: loc.isActive ? 'Active' : 'Inactive'
    }))
}

const mapStatusStyle = (status: string) => {
    if (status === 'Active') return 'bg-green-100 text-green-800'
    if (status === 'Inactive') return 'bg-neutral-100 text-neutral-800'
    return 'bg-neutral-100 text-neutral-800'
}

const filterLocations = () => {
    let filtered = [...allLocations.value]

    if (query.value) {
        const q = query.value.toLowerCase()
        filtered = filtered.filter((loc) => {
            return (
                (loc.country?.toLowerCase().includes(q)) ||
                (loc.state?.toLowerCase().includes(q)) ||
                (loc.city?.toLowerCase().includes(q))
            )
        })
    }

    if (statusFilter.value && statusFilter.value !== 'All') {
        const isActive = statusFilter.value === 'Active'
        filtered = filtered.filter((loc) => loc.isActive === isActive)
    }

    total.value = filtered.length
    const startIndex = (page.value - 1) * perPage
    const endIndex = startIndex + perPage
    locations.value = filtered.slice(startIndex, endIndex)
    rows.value = mapRows(locations.value)
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value++
        filterLocations()
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value--
        filterLocations()
    }
}

const setPage = (newPage: number) => {
    if (newPage !== page.value) {
        page.value = newPage
        filterLocations()
    }
}

const clearFilters = () => {
    query.value = ''
    statusFilter.value = null
    page.value = 1
    filterLocations()
}

const openEditModal = (entity: OperationLocation) => {
    router.push(`/operation-config/locations/${entity.id}/edit`)
}

const handleDelete = (entity: OperationLocation) => {
    const label = [entity.country, entity.state, entity.city].filter(Boolean).join(', ') || 'this location'
    dialog.openDialog(ConfirmDialog, {
        message: `Delete operation location "${label}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deleteOperationLocation(entity.id, authStore)
                toast.showToast('Location deleted', 'Operation location removed successfully', 'success')
                await fetchLocations()
            } catch (error: any) {
                toast.showToast(
                    'Error deleting location',
                    error?.response?.data?.message || 'Failed to delete location. Please try again.',
                    'error'
                )
            } finally {
                dialog.closeDialog()
            }
        },
        onCancel: () => dialog.closeDialog()
    })
}

const fetchLocations = async () => {
    try {
        loading.value = true
        const data = await getOperationLocations(authStore)
        allLocations.value = data
        total.value = allLocations.value.length
        page.value = 1
        filterLocations()
    } catch (error: any) {
        toast.showToast(
            'Error loading locations',
            error?.response?.data?.message || 'Failed to load operation locations. Please try again.',
            'error'
        )
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchLocations()
})

watch([query, statusFilter], () => {
    page.value = 1
    filterLocations()
})
</script>
