<template>
    <div class="space-y-6">
        <!-- Meter Readings Management -->
        <div class="bg-secondary rounded-lg border border-gray-800 p-6">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h3 class="text-lg font-semibold text-opposite">Usage Readings</h3>
                    <p class="text-sm text-opposite/60">Track usage recorded for this asset.</p>
                </div>
                <Can :subject="'assets'" :actions="['create']">
                    <AppButton buttonStyle="primary" @click="handleAddMeterReading">
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Usage</span>
                    </AppButton>
                </Can>
            </div>

            <Table
                :cols="meterReadingCols"
                :rows="meterReadingRows"
                :entities="meterReadings.data"
                :page="meterReadingsPage"
                :total="meterReadings.totalCount"
                :per-page="meterReadings.perPage"
                :total-pages="meterReadingsTotalPages"
                :on-next-page="onMeterReadingsNext"
                :on-previous-page="onMeterReadingsPrevious"
                :set-page="setMeterReadingsPage"
                :loading="meterReadingsLoading"
                :subject="'assets'"
                entity-name="Meter Reading"
                :hide-view="() => true"
                :on-edit="handleEditMeterReading"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import { deleteMeter, getMeters } from './endpoints'
import { ref, computed, onMounted, watch } from 'vue'
import type { PaginatedResponse, Meter, MeterReading } from '@/util/interfaces'
import { formatDateToDay } from '@/util/util'
import { useAuthStore } from '@/stores/auth'
import { useDialog } from '@/stores/dialog'
import { getMeterReadingsByAsset } from './endpoints'
import { useToast } from '@/stores/notification'
import MeterReadingFormModal from './MeterReadingFormModal.vue'
import MeterFormModal from './MeterFormModal.vue'
import ConfirmDialog from '../ConfirmDialog.vue'
import Table from '../Table.vue'
import AppButton from '../AppButton.vue'
import Can from '../Can.vue'

const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()
const props = defineProps<{
    assetId: string
}>()

const defaultPerPage = 10

const meterReadings = ref<PaginatedResponse<MeterReading>>({
    data: [],
    currentPage: 1,
    totalCount: 0,
    perPage: defaultPerPage
})
const meterReadingsLoading = ref(false)
const meterReadingsPage = ref(1)
const meterReadingsPerPage = ref(defaultPerPage)
const meterReadingCols = ['Meter', 'Value', 'Unit', 'Timestamp']
const meterReadingRows = computed(() =>
    meterReadings.value.data.map((reading) => ({
        id: reading.id,
        Meter: reading.meter?.name || '—',
        Value:
            typeof reading.value === 'number'
                ? reading.value.toString()
                : String(reading.value ?? ''),
        Unit: reading.meter?.unit || '—',
        Timestamp: formatDateToDay(reading.timestamp)
    }))
)
const meterReadingsTotalPages = computed(() => {
    const perPage = meterReadings.value.perPage || meterReadingsPerPage.value || defaultPerPage
    const total = meterReadings.value.totalCount || 0
    return perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1
})

const meters = ref<PaginatedResponse<Meter>>({
    data: [],
    currentPage: 1,
    totalCount: 0,
    perPage: defaultPerPage
})
const metersLoading = ref(false)
const meterPage = ref(1)
const meterPerPage = ref(defaultPerPage)
const meterCols = ['Name', 'Unit', 'Created At']
const meterRows = computed(() =>
    meters.value.data.map((meter) => ({
        id: meter.id,
        Name: meter.name,
        Unit: meter.unit,
        'Created At': formatDateToDay(meter.createdAt)
    }))
)
const meterTotalPages = computed(() => {
    const perPage = meters.value.perPage || meterPerPage.value || defaultPerPage
    const total = meters.value.totalCount || 0
    return perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1
})

const meterOptions = ref<Meter[]>([])
const syncMeterOptions = async (response: PaginatedResponse<Meter>) => {
    const total = response.totalCount ?? response.data.length
    if (!total) {
        meterOptions.value = []
        return
    }

    if (total <= response.data.length) {
        meterOptions.value = response.data
        return
    }

    if (meterOptions.value.length === total) {
        return
    }

    try {
        const fullResponse = await getMeters(authStore, { page: 1, perPage: total })
        meterOptions.value = fullResponse.data
    } catch (error) {
        console.warn('Unable to load full meter list; falling back to current page.', error)
        meterOptions.value = response.data
    }
}

const fetchMeterReadings = async () => {
    try {
        meterReadingsLoading.value = true
        const response = await getMeterReadingsByAsset(props.assetId, authStore, {
            page: meterReadingsPage.value,
            perPage: meterReadingsPerPage.value
        })
        meterReadings.value = response
        meterReadingsPerPage.value = response.perPage || meterReadingsPerPage.value
        meterReadingsPage.value = response.currentPage || meterReadingsPage.value

        if (
            meterReadingsPage.value > 1 &&
            response.data.length === 0 &&
            (response.totalCount || 0) > 0
        ) {
            meterReadingsPage.value = meterReadingsPage.value - 1
            await fetchMeterReadings()
        }
    } catch (error: any) {
        console.error('Error fetching meter readings:', error)
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to load meter readings.',
            'error'
        )
    } finally {
        meterReadingsLoading.value = false
    }
}

const onMeterReadingsNext = async () => {
    if (meterReadingsPage.value < meterReadingsTotalPages.value) {
        meterReadingsPage.value += 1
        await fetchMeterReadings()
    }
}

const onMeterReadingsPrevious = async () => {
    if (meterReadingsPage.value > 1) {
        meterReadingsPage.value -= 1
        await fetchMeterReadings()
    }
}

const setMeterReadingsPage = async (page: number) => {
    if (page !== meterReadingsPage.value) {
        meterReadingsPage.value = page
        await fetchMeterReadings()
    }
}

const fetchMeters = async () => {
    try {
        metersLoading.value = true
        const response = await getMeters(authStore, {
            page: meterPage.value,
            perPage: meterPerPage.value
        })

        meters.value = response
        meterPerPage.value = response.perPage || meterPerPage.value
        meterPage.value = response.currentPage || meterPage.value

        if (meterPage.value > 1 && response.data.length === 0 && (response.totalCount || 0) > 0) {
            meterPage.value = meterPage.value - 1
            await fetchMeters()
            return
        }

        await syncMeterOptions(response)
    } catch (error: any) {
        console.error('Error fetching meters:', error)
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to load meters.',
            'error'
        )
    } finally {
        metersLoading.value = false
    }
}

const onMetersNext = async () => {
    if (meterPage.value < meterTotalPages.value) {
        meterPage.value += 1
        await fetchMeters()
    }
}

const onMetersPrevious = async () => {
    if (meterPage.value > 1) {
        meterPage.value -= 1
        await fetchMeters()
    }
}

const setMeterPage = async (page: number) => {
    if (page !== meterPage.value) {
        meterPage.value = page
        await fetchMeters()
    }
}

const handleAddMeterReading = () => {
    if (!meterOptions.value.length) {
        toast.showToast('Meters required', 'Create a meter before adding readings.', 'error')
        return
    }

    dialog.openDialog(MeterReadingFormModal, {
        assetId: props.assetId,
        meters: meterOptions.value,
        onCancel: () => dialog.closeDialog(),
        onSuccess: async () => {
            dialog.closeDialog()
            await fetchMeterReadings()
        }
    })
}

const handleEditMeterReading = (reading: MeterReading) => {
    dialog.openDialog(MeterReadingFormModal, {
        assetId: props.assetId,
        meters: meterOptions.value,
        reading,
        onCancel: () => dialog.closeDialog(),
        onSuccess: async () => {
            dialog.closeDialog()
            await fetchMeterReadings()
        }
    })
}



onMounted(async () => {
    await Promise.allSettled([fetchMeterReadings(), fetchMeters()])
})

watch(
    () => props.assetId,
    async (newId, oldId) => {
        if (newId && newId !== oldId) {
            meterReadingsPage.value = 1
            await fetchMeterReadings()
        }
    }
)
</script>
