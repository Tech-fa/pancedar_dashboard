<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs">
            <div class="flex items-center gap-4">
                <Can :subject="'pilot'" :actions="['create']">
                    <AppButton buttonStyle="primary" @click="handleAddPilot">
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Pilot</span>
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
                                placeholder="Search by name, email, or phone"
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
                :cols="['Name', 'Email', 'Phone', 'Status']"
                :rows="rows"
                :entities="pilots"
                entity-name="Pilot"
                :loading="loading"
                :subject="'pilot'"
                :handleDelete="handleDelete"
                :per-page="perPage"
                :page="page"
                :total="total"
                :total-pages="totalPages"
                :on-next-page="onNextPage"
                :on-previous-page="onPreviousPage"
                :set-page="setPage"
                :view-path="(row: any) => `/fleet/pilots/${row.id}`"
                :edit-path="(row: any) => `/fleet/pilots/${row.id}/edit`"
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
import type { User } from '@/util/interfaces'
import { browsePilots, deletePilot } from '@/components/operations/pilots/endpoints'

const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()
const router = useRouter()

const crumbs = [
    {
        name: 'Pilots',
        path: '/fleet/pilots',
        icon: 'fa-solid fa-user text-neutral-700 text-2xl'
    }
]

const pilots = ref<User[]>([])
const allPilots = ref<User[]>([])
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

const mapRows = (entities: User[]) => {
    return entities.map((pilot) => ({
        id: pilot.id,
        Name: `${pilot.fname} ${pilot.lname}`,
        Email: pilot.email,
        Phone: pilot.phone || 'N/A',
        Status: pilot.isActive ? 'Active' : 'Inactive'
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

const filterPilots = () => {
    let filtered = [...allPilots.value]

    if (query.value) {
        const q = query.value.toLowerCase()
        filtered = filtered.filter((pilot) => {
            return (
                `${pilot.fname} ${pilot.lname}`.toLowerCase().includes(q) ||
                pilot.email?.toLowerCase().includes(q) ||
                pilot.phone?.toLowerCase().includes(q)
            )
        })
    }

    if (statusFilter.value && statusFilter.value !== 'All') {
        const isActive = statusFilter.value === 'Active'
        filtered = filtered.filter((pilot) => pilot.isActive === isActive)
    }

    total.value = filtered.length

    const startIndex = (page.value - 1) * perPage
    const endIndex = startIndex + perPage
    pilots.value = filtered.slice(startIndex, endIndex)
    rows.value = mapRows(pilots.value)
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value = page.value + 1
        filterPilots()
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value = page.value - 1
        filterPilots()
    }
}

const setPage = (newPage: number) => {
    if (newPage !== page.value) {
        page.value = newPage
        filterPilots()
    }
}

const clearFilters = () => {
    query.value = ''
    statusFilter.value = null
    page.value = 1
    filterPilots()
}

const handleAddPilot = () => {
    router.push('/fleet/pilots/add')
}

const handleDelete = (entity: User) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Delete pilot "${entity.fname} ${entity.lname}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await deletePilot(entity.id, authStore)
                toast.showToast('Pilot deleted', 'Pilot removed successfully', 'success')
                await fetchPilots()
            } catch (error: any) {
                toast.showToast(
                    'Error deleting pilot',
                    error?.response?.data?.message || 'Failed to delete pilot. Please try again.',
                    'error'
                )
            } finally {
                dialog.closeDialog()
            }
        },
        onCancel: () => dialog.closeDialog()
    })
}

const fetchPilots = async () => {
    try {
        loading.value = true
        const data = await browsePilots(authStore)
        allPilots.value = data as User[]
        total.value = allPilots.value.length
        page.value = 1
        filterPilots()
    } catch (error: any) {
        toast.showToast(
            'Error loading pilots',
            error?.response?.data?.message || 'Failed to load pilots. Please try again.',
            'error'
        )
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchPilots()
})

watch([query, statusFilter], () => {
    page.value = 1
    filterPilots()
})
</script>
