<template>
    <div class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs">
            <AppButton buttonStyle="secondary" @click="goBackToAsset">
                <i class="fa-solid fa-arrow-left"></i>
                <span class="ml-2">Back to Asset</span>
            </AppButton>
        </BreadCrums>

        <div v-if="tripLoading" class="flex justify-center items-center py-20">
            <Spinner />
        </div>

        <div v-else class="p-6 space-y-6">
            <div v-if="trip" class="bg-secondary border border-gray-800 rounded-lg p-6 space-y-6">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p class="text-sm text-opposite/60">Flight</p>
                        <h2 class="text-2xl font-semibold text-opposite">
                            {{ trip.displayId }}
                        </h2>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-opposite/60">Status</span>
                        <span
                            :class="[
                                'px-3 py-1 rounded-full text-sm',
                                mapTripStatus(trip.currentState)
                            ]"
                        >
                            {{ trip.currentState }}
                        </span>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <span class="text-xs uppercase text-opposite/50">Planned Date</span>
                        <p class="text-opposite font-medium">
                            {{ formatTimestamp(trip.plannedDate) }}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs uppercase text-opposite/50">Job</span>
                        <p class="text-opposite font-medium">{{ trip.vehicleJob?.name || '—' }}</p>
                    </div>
                    <div>
                        <span class="text-xs uppercase text-opposite/50">Pilot</span>
                        <p class="text-opposite font-medium">
                            {{
                                trip.operator
                                    ? `${trip.operator.fname} ${trip.operator.lname}`
                                    : '—'
                            }}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs uppercase text-opposite/50">Started</span>
                        <p class="text-opposite font-medium">
                            {{ formatTimestamp(trip.startedAt) }}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs uppercase text-opposite/50">Ended</span>
                        <p class="text-opposite font-medium">
                            {{ formatTimestamp(resolvedEndTimestamp) }}
                        </p>
                    </div>
                    <div>
                        <span class="text-xs uppercase text-opposite/50">Duration</span>
                        <p class="text-opposite font-medium">{{ tripDuration }}</p>
                    </div>
                </div>
            </div>

            <div v-else class="bg-secondary border border-gray-800 rounded-lg p-6 text-opposite/60">
                Trip details are unavailable right now.
            </div>

            <TripSummaryDashboard :summary="trip" :loading="tripLoading" :max-distance="150" />

            <div class="bg-secondary border border-gray-800 rounded-lg p-6 space-y-6">
                <div class="flex flex-col gap-2">
                    <h3 class="text-lg font-semibold text-opposite">State Changes & Telemetry</h3>
                    <p class="text-sm text-opposite/60">
                        Lifecycle changes are shown as tiles, followed by telemetry aggregated every
                        five seconds.
                    </p>
                </div>

                <div
                    v-if="stateTiles.length"
                    class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                    <div
                        v-for="state in stateTiles"
                        :key="state.id"
                        class="rounded-lg border border-gray-800 bg-main/40 p-4 space-y-2"
                    >
                        <p class="text-sm font-semibold text-opposite">{{ state.state }}</p>
                        <p class="text-xs text-opposite/60">
                            {{ formatTimestamp(state.recordedAt) }}
                        </p>
                    </div>
                </div>
                <p v-else class="text-sm text-opposite/60">
                    No lifecycle transitions recorded yet.
                </p>
                <!-- 
                <Table
                    :cols="telemetryColumns"
                    :rows="telemetryRows"
                    :entities="telemetry.data"
                    entity-name="Telemetry sample"
                    :subject="'asset'"
                    :loading="telemetryLoading"
                    :hide-view="() => true"
                    :hide-edit="() => true"
                    :hide-delete="() => true"
                    :page="telemetryPage"
                    :total="telemetryTotal"
                    :per-page="telemetryPerPage"
                    :total-pages="telemetryTotalPages"
                    :on-next-page="onTelemetryNext"
                    :on-previous-page="onTelemetryPrevious"
                    :set-page="setTelemetryPage"
                    :sorting-columns="['Timestamp']"
                    :on-sort="handleTelemetrySort"
                /> -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import AppButton from '@/components/AppButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { getTripById, getTripTelemetry } from './endpoints'
import type {
    PaginatedResponse,
    Trip,
    TripState,
    TripTelemetryPoint,
    TripSummary
} from '@/util/interfaces'
import { formatDateToTime, formatDurationFromTimestamps } from '@/util/util'
import TripSummaryDashboard from './TripSummaryDashboard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const assetId = route.params.assetId as string
const tripId = route.params.tripId as string

const trip = ref<Trip | null>(null)
const tripLoading = ref(true)

const telemetryPerPage = 25
const telemetry = ref<PaginatedResponse<TripTelemetryPoint>>({
    data: [],
    currentPage: 1,
    totalCount: 0,
    perPage: telemetryPerPage
})
const telemetryPage = ref(1)
const telemetryTotal = ref(0)
const telemetryLoading = ref(false)

const telemetryColumns = [
    'Timestamp',
    'Latitude',
    'Longitude',
    'Altitude (m)',
    'Battery (%)',
    'Speed (horizontal) (m/s)',
    'Speed (vertical) (m/s)',
    'Yaw (°)',
    'Pitch (°)',
    'Roll (°)'
]

const sortState = ref<{ column: string | null; direction: 'asc' | 'desc' | null }>({
    column: null,
    direction: null
})

const sortedTelemetryData = computed(() => {
    if (sortState.value.column !== 'Timestamp' || !sortState.value.direction) {
        return telemetry.value.data
    }
    const sorted = [...telemetry.value.data].sort((a, b) => a.bucket - b.bucket)
    return sortState.value.direction === 'asc' ? sorted : sorted.reverse()
})

const telemetryRows = computed(() =>
    sortedTelemetryData.value.map((point) => {
        const metrics = point.metrics || {}
        const latitude = formatMetric(metrics.latitude, 5)
        const longitude = formatMetric(metrics.longitude, 5)
        const altitude = formatMetric(metrics.alt_m, 1)
        const battery = formatMetric(metrics.battery_percent, 1)
        const yaw = formatMetric(metrics.yaw, 2)
        const pitch = formatMetric(metrics.pitch, 2)
        const roll = formatMetric(metrics.roll, 2)
        const velocity = formatMetric(metrics.max_horiz_speed, 2)
        const verticalVelocity = formatMetric(metrics.max_vert_speed, 2)
        return {
            id: point.bucket,
            Timestamp: formatTimestamp(point.bucket),
            Latitude: latitude,
            Longitude: longitude,
            'Altitude (m)': altitude,
            'Battery (%)': battery,
            'Speed (horizontal) (m/s)': velocity,
            'Speed (vertical) (m/s)': verticalVelocity,
            'Yaw (°)': yaw,
            'Pitch (°)': pitch,
            'Roll (°)': roll
        }
    })
)

const telemetryTotalPages = computed(() => {
    if (!telemetryPerPage) return 1
    return Math.max(1, Math.ceil(telemetryTotal.value / telemetryPerPage))
})

const crumbs = computed(() => [
    {
        name: 'Fleet',
        path: '/fleet/assets',
        icon: 'fa-solid fa-helicopter text-neutral-700 text-2xl'
    },
    {
        name: trip.value?.asset?.name || 'Asset Details',
        path: assetId ? `/fleet/assets/${assetId}` : ''
    },
    {
        name: trip.value ? `Trip ${trip.value.flightId}` : 'Trip Details',
        path: ''
    }
])

const stateTiles = computed<TripState[]>(() => {
    if (!trip.value?.states?.length) {
        return []
    }
    return [...trip.value.states].sort((a, b) => a.recordedAt - b.recordedAt)
})

const resolvedEndTimestamp = computed(() => {
    if (!trip.value) return null
    if (Number.isFinite(trip.value.completedAt) && trip.value.completedAt) {
        return trip.value.completedAt
    }
    if (Number.isFinite(trip.value.haltedAt) && trip.value.haltedAt) {
        return trip.value.haltedAt
    }
    return null
})

const tripDuration = computed(() =>
    resolvedEndTimestamp.value
        ? formatDurationFromTimestamps(trip.value?.startedAt, resolvedEndTimestamp.value, {
              fallbackToNow: true
          })
        : '—'
)

const fetchTripDetails = async () => {
    try {
        tripLoading.value = true
        const response = await getTripById(assetId, tripId, authStore)
        trip.value = response
    } catch (error: any) {
        console.error('Failed to load trip', error)
        toast.showToast('Trip unavailable', 'Unable to load trip details right now.', 'error')
    } finally {
        tripLoading.value = false
    }
}

const fetchTelemetry = async () => {
    if (!assetId || !tripId) {
        telemetry.value = { data: [], currentPage: 1, totalCount: 0, perPage: telemetryPerPage }
        telemetryTotal.value = 0
        return
    }
    try {
        telemetryLoading.value = true
        const response = await getTripTelemetry(assetId, tripId, authStore, {
            page: telemetryPage.value,
            perPage: telemetryPerPage
        })
        telemetry.value = response
        telemetryTotal.value = response.totalCount
    } catch (error: any) {
        console.error('Failed to load telemetry', error)
        toast.showToast('Telemetry unavailable', 'Unable to load telemetry data.', 'error')
    } finally {
        telemetryLoading.value = false
    }
}

const onTelemetryNext = () => {
    if (telemetryPage.value < telemetryTotalPages.value) {
        telemetryPage.value += 1
    }
}

const onTelemetryPrevious = () => {
    if (telemetryPage.value > 1) {
        telemetryPage.value -= 1
    }
}

const setTelemetryPage = (page: number) => {
    if (page >= 1 && page <= telemetryTotalPages.value) {
        telemetryPage.value = page
    }
}

const handleTelemetrySort = (payload: { column: string; direction: 'asc' | 'desc' | null }) => {
    sortState.value = {
        column: payload.direction ? payload.column : null,
        direction: payload.direction
    }
}

const goBackToAsset = () => {
    if (assetId) {
        router.push(`/fleet/assets/${assetId}`)
    } else {
        router.push('/fleet/assets')
    }
}

const mapTripStatus = (status: string) => {
    const classes: Record<string, string> = {
        Started: 'bg-blue-500/20 text-blue-300',
        Takeoff: 'bg-purple-500/20 text-purple-300',
        Completed: 'bg-accent-green/20 text-accent-green',
        Halted: 'bg-red-500/20 text-red-300',
        Unknown: 'bg-neutral-600/20 text-neutral-200'
    }
    return classes[status] || 'bg-neutral-600/20 text-neutral-200'
}

const formatTimestamp = (value?: number | null) => {
    if (!value || !Number.isFinite(Number(value))) {
        return '—'
    }
    return formatDateToTime(Number(value))
}

const formatMetric = (value: number | null | undefined, fractionDigits = 2) => {
    if (value === null || value === undefined) {
        return '—'
    }
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) {
        return '—'
    }
    return numeric.toFixed(fractionDigits)
}

const formatVelocity = (vx?: number | null, vy?: number | null, vz?: number | null) => {
    if (
        vx === undefined ||
        vy === undefined ||
        vz === undefined ||
        vx === null ||
        vy === null ||
        vz === null
    ) {
        return '—'
    }
    const numericVx = Number(vx)
    const numericVy = Number(vy)
    const numericVz = Number(vz)
    if (![numericVx, numericVy, numericVz].every((value) => Number.isFinite(value))) {
        return '—'
    }
    const magnitude = Math.sqrt(numericVx ** 2 + numericVy ** 2 + numericVz ** 2)
    return magnitude.toFixed(2)
}

watch(telemetryPage, () => {
    fetchTelemetry()
})

onMounted(async () => {
    await fetchTripDetails()
    // await fetchTelemetry()
})
</script>
