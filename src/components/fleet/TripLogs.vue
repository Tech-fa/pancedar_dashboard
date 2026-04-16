<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs" />

        <div class="p-6">
            <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                <div
                    class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
                >
                    <div>
                        <h3 class="text-lg font-semibold text-opposite">Upload History</h3>
                        <p class="text-sm text-opposite/60">
                            View all trip log files that have been uploaded to the system.
                        </p>
                    </div>
                </div>

                <Table
                    :cols="cols"
                    :rows="rows"
                    :entities="tripLogs"
                    :page="page"
                    :total="total"
                    :per-page="perPage"
                    :total-pages="totalPages"
                    :on-next-page="onNextPage"
                    :on-previous-page="onPreviousPage"
                    :set-page="setPage"
                    :loading="loading"
                    entity-name="Upload"
                    :subject="'asset'"
                    :hide-view="() => true"
                    :hide-edit="() => true"
                    :hide-delete="() => true"
                    :map-status-style="mapStateStyle"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import BreadCrums from '@/components/breadCrums.vue'
import Table from '@/components/Table.vue'
import { getTripLogs } from './endpoints'
import type { TripLog } from '@/util/interfaces'
import { formatDate, formatDateToTime } from '@/util/util'

const authStore = useAuthStore()
const toast = useToast()

const crumbs = computed(() => [
    {
        name: 'Fleet',
        path: '/fleet/assets',
        icon: 'fa-solid fa-helicopter text-neutral-700 text-2xl'
    },
    {
        name: 'Upload History',
        path: '',
        icon: ''
    }
])

const tripLogs = ref<TripLog[]>([])
const loading = ref(false)
const page = ref(1)
const perPage = ref(10)
const total = ref(0)

const cols = ['Filename', 'Vehicle Model', 'Status', 'Uploaded At']

const rows = computed(() =>
    tripLogs.value.map((log) => ({
        id: log.id,
        Filename: log.filename || '—',
        'Vehicle Model': log.model ? `${log.model.make || ''} ${log.model.name}`.trim() : '—',
        Status: log.state || 'Unknown',
        'Uploaded At': formatDateToTime(log.createdAt)
    }))
)

const totalPages = computed(() => {
    if (total.value === 0 || perPage.value <= 0) {
        return 1
    }
    return Math.max(1, Math.ceil(total.value / perPage.value))
})

const mapStateStyle = (state: string) => {
    const classes: Record<string, string> = {
        uploaded: 'bg-blue-500/20 text-blue-300',
        processing: 'bg-yellow-500/20 text-yellow-300',
        processed: 'bg-accent-green/20 text-accent-green',
        failed: 'bg-red-500/20 text-red-300'
    }
    return classes[state] || 'bg-neutral-600/20 text-neutral-200'
}

const fetchTripLogs = async () => {
    try {
        loading.value = true
        const response = await getTripLogs(authStore, {
            page: page.value,
            perPage: perPage.value
        })
        tripLogs.value = response.data || []
        total.value = response.totalCount || 0
        if (response.currentPage) {
            page.value = response.currentPage
        }
        if (response.perPage) {
            perPage.value = response.perPage
        }
    } catch (error: any) {
        console.error('Error fetching trip logs:', error)
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to load upload history.',
            'error'
        )
        tripLogs.value = []
        total.value = 0
    } finally {
        loading.value = false
    }
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value += 1
        fetchTripLogs()
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value -= 1
        fetchTripLogs()
    }
}

const setPage = (newPage: number) => {
    if (newPage === page.value) return
    if (newPage >= 1 && newPage <= totalPages.value) {
        page.value = newPage
        fetchTripLogs()
    }
}

onMounted(() => {
    fetchTripLogs()
})
</script>

<style scoped></style>

