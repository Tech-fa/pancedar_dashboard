<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs">
            <div class="flex items-center gap-4">
                <Can :subject="'vehicle-job-type'" :actions="['create']">
                    <AppButton buttonStyle="primary" @click="router.push('/fleet/job-types/add')">
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Job Type</span>
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
                                placeholder="Search by name"
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
                :cols="['Name', 'Description', 'Status']"
                :rows="rows"
                :entities="jobTypes"
                entity-name="Job Type"
                :loading="loading"
                :subject="'vehicle-job-type'"
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
                :hide-view="(r)=>true"
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
import type { VehicleJobType } from '@/util/interfaces'
import {
    getVehicleJobTypes,
    deleteVehicleJobType
} from '@/components/fleet/endpoints'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const crumbs = [
    {
        name: 'Job Types',
        path: '/fleet/job-types',
        icon: 'fa-solid fa-tags text-neutral-700 text-2xl'
    }
]

const jobTypes = ref<VehicleJobType[]>([])
const allJobTypes = ref<VehicleJobType[]>([])
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

const mapRows = (entities: VehicleJobType[]) => {
    return entities.map((jobType) => ({
        id: jobType.id,
        Name: jobType.name,
        Description: jobType.description || 'N/A',
        Status: jobType.isActive ? 'Active' : 'Inactive'
    }))
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

const filterJobTypes = () => {
    let filtered = [...allJobTypes.value]

    if (query.value) {
        const q = query.value.toLowerCase()
        filtered = filtered.filter((jobType) => {
            return jobType.name.toLowerCase().includes(q)
        })
    }

    if (statusFilter.value && statusFilter.value !== 'All') {
        const isActive = statusFilter.value === 'Active'
        filtered = filtered.filter((jobType) => jobType.isActive === isActive)
    }

    total.value = filtered.length

    const startIndex = (page.value - 1) * perPage
    const endIndex = startIndex + perPage
    jobTypes.value = filtered.slice(startIndex, endIndex)
    rows.value = mapRows(jobTypes.value)
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value = page.value + 1
        filterJobTypes()
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value = page.value - 1
        filterJobTypes()
    }
}

const setPage = (newPage: number) => {
    if (newPage !== page.value) {
        page.value = newPage
        filterJobTypes()
    }
}

const clearFilters = () => {
    query.value = ''
    statusFilter.value = null
    page.value = 1
    filterJobTypes()
}

const openEditModal = (entity: VehicleJobType) => {
    router.push(`/fleet/job-types/${entity.id}/edit`)
}

const handleDelete = (entity: VehicleJobType) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Delete job type "${entity.name}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deleteVehicleJobType(entity.id, authStore)
                toast.showToast('Job type deleted', 'Job type removed successfully', 'success')
                await fetchJobTypes()
            } catch (error: any) {
                toast.showToast(
                    'Error deleting job type',
                    error?.response?.data?.message || 'Failed to delete job type. Please try again.',
                    'error'
                )
            } finally {
                dialog.closeDialog()
            }
        },
        onCancel: () => dialog.closeDialog()
    })
}

const fetchJobTypes = async () => {
    try {
        loading.value = true
        const data = await getVehicleJobTypes(authStore)
        allJobTypes.value = data
        total.value = allJobTypes.value.length
        page.value = 1
        filterJobTypes()
    } catch (error: any) {
        toast.showToast(
            'Error loading job types',
            error?.response?.data?.message || 'Failed to load job types. Please try again.',
            'error'
        )
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchJobTypes()
})

watch([query, statusFilter], () => {
    page.value = 1
    filterJobTypes()
})
</script>
