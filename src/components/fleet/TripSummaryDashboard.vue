<template>
    <div class="bg-secondary border border-gray-800 rounded-lg p-6 space-y-6">
        <div class="flex flex-col gap-2">
            <h3 class="text-lg font-semibold text-opposite">Trip Summary</h3>
            <p class="text-sm text-opposite/60">Key metrics and statistics for this trip</p>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-20">
            <Spinner />
        </div>

        <div v-else-if="!summary" class="text-sm text-opposite/60">No summary data available</div>

        <div v-else class="space-y-6">
            <!-- Trajectory Map -->
            <div
                v-if="hasTrajectory"
                class="rounded-lg border border-gray-800 bg-main/40 p-4 space-y-3"
            >
                <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-opposite">Trip Trajectory</span>
                    <span class="text-xs text-opposite/60">
                        {{ trajectory.length }} waypoints
                    </span>
                </div>
                <div
                    :id="mapId"
                    class="w-full h-[300px] rounded-lg overflow-hidden"
                ></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <!-- Battery Max/Min Gauges -->
                <div class="rounded-lg border border-gray-800 bg-main/40 p-4 space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-opposite">Battery Level</span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <GaugeChart
                                :value="+(summary.batteryMax || 0)"
                                :min="0"
                                :max="100"
                                label="Max"
                                height-class="h-32"
                            />
                        </div>
                        <div>
                            <GaugeChart
                                :value="+(summary.batteryMin || 0)"
                                :min="0"
                                :max="100"
                                label="Min"
                                height-class="h-32"
                            />
                        </div>
                    </div>
                </div>

                <!-- Miles Travelled with Progress Bar -->
                <div class="rounded-lg border border-gray-800 bg-main/40 p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-opposite">Distance Travelled</span>
                    </div>
                    <div class="flex flex-col items-center justify-center py-4 space-y-3">
                        <div class="text-3xl font-bold text-opposite">
                            {{ formatDistance(+(summary.milesTravelled || 0)) }}
                        </div>
                        <div class="text-xs text-opposite/60">kilometers</div>
                    </div>
                    <!-- Progress bar with gradient from green to red -->
                    <div class="w-full h-4 bg-gray-700 rounded-full overflow-hidden relative">
                        <div
                            class="h-full transition-all duration-300"
                            :style="{
                                width: `${progressPercentage}%`,
                                background: 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)'
                            }"
                        ></div>
                    </div>
                </div>

                <!-- Max Speed -->
                <div class="rounded-lg border border-gray-800 bg-main/40 p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-opposite">Max Speed</span>
                    </div>
                    <div class="flex flex-col items-center justify-center py-6">
                        <div class="text-3xl font-bold text-opposite">
                            {{ formatSpeed(summary.maxSpeed) }}
                        </div>
                        <div class="text-xs text-opposite/60 mt-1">m/s</div>
                    </div>
                </div>

                <!-- Distance from Home -->
                <div class="rounded-lg border border-gray-800 bg-main/40 p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-opposite">Distance from Home</span>
                    </div>
                    <div class="flex flex-col items-center justify-center py-6">
                        <div class="text-3xl font-bold text-opposite">
                            {{ formatDistance(+(summary.distanceFromHome || 0)) }}
                        </div>
                        <div class="text-xs text-opposite/60 mt-1">kilometers</div>
                    </div>
                </div>

                <!-- Start Location -->
                <div class="rounded-lg border border-gray-800 bg-main/40 p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-opposite">Start Location</span>
                    </div>
                    <div class="flex flex-col items-center justify-center py-4 space-y-2">
                        <template v-if="summary.takeoffLocation">
                            <div class="text-sm text-opposite">
                                <span class="text-opposite/60">Lat:</span>
                                {{ formatCoordinate(summary.takeoffLocation?.latitude) }}
                            </div>
                            <div class="text-sm text-opposite">
                                <span class="text-opposite/60">Lon:</span>
                                {{ formatCoordinate(summary.takeoffLocation?.longitude) }}
                            </div>
                        </template>
                        <div v-else class="text-sm text-opposite/60">—</div>
                    </div>
                </div>

                <!-- Drop-off Location -->
                <div class="rounded-lg border border-gray-800 bg-main/40 p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-opposite">Drop-off Location</span>
                    </div>
                    <div class="flex flex-col items-center justify-center py-4 space-y-2">
                        <template v-if="summary.landingLocation">
                            <div class="text-sm text-opposite">
                                <span class="text-opposite/60">Lat:</span>
                                {{ formatCoordinate(summary.landingLocation?.latitude) }}
                            </div>
                            <div class="text-sm text-opposite">
                                <span class="text-opposite/60">Lon:</span>
                                {{ formatCoordinate(summary.landingLocation?.longitude) }}
                            </div>
                        </template>
                        <div v-else class="text-sm text-opposite/60">—</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import {
    map as leafletMap,
    latLng,
    tileLayer,
    polyline,
    marker,
    Icon,
    latLngBounds,
    type Map as LeafletMap
} from 'leaflet'
import GaugeChart from '@/components/common/charts/GaugeChart.vue'
import Spinner from '@/components/Spinner.vue'
import type { Trip, TrajectoryPoint } from '@/util/interfaces'

interface Props {
    summary: Trip | null
    loading?: boolean
    maxDistance?: number
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    maxDistance: 100
})

const mapRef = ref<LeafletMap | null>(null)
const mapId = computed(() => `trajectory-map-${props.summary?.id || 'default'}`)

const trajectory = computed<TrajectoryPoint[]>(() => {
    return props.summary?.metadata?.trajectory || []
})

const hasTrajectory = computed(() => {
    return trajectory.value.length >= 2
})

const progressPercentage = computed(() => {
    if (!props.summary) return 0
    const percentage = ((props.summary.milesTravelled || 0) / props.maxDistance) * 100
    return Math.min(100, Math.max(0, percentage))
})

const formatDistance = (value: number | null | undefined) => {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return '—'
    }
    return value.toFixed(2)
}

const formatSpeed = (value: number | null | undefined) => {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return '—'
    }
    return value.toFixed(2)
}

const formatCoordinate = (value: number | null | undefined) => {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return '—'
    }
    return value.toFixed(6)
}

const initMap = () => {
    if (!hasTrajectory.value) return

    // Destroy existing map if any
    if (mapRef.value) {
        mapRef.value.remove()
        mapRef.value = null
    }

    const mapElement = document.getElementById(mapId.value)
    if (!mapElement) return

    // Create map with satellite view
    const googleSatellite = tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 60,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        tileSize: 512,
        attribution: '',
        detectRetina: true,
        zoomOffset: -1
    })

    const trajectoryPoints = trajectory.value
    const firstPoint = trajectoryPoints[0]
    const lastPoint = trajectoryPoints[trajectoryPoints.length - 1]

    const myMap = leafletMap(mapId.value, {
        center: latLng(firstPoint.latitude, firstPoint.longitude),
        zoom: 45,
        layers: [googleSatellite]
    })

    mapRef.value = myMap

    // Create polyline from trajectory points
    const latlngs = trajectoryPoints.map((p) => latLng(p.latitude, p.longitude))
    const trajectoryLine = polyline(latlngs, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.8
    })
    trajectoryLine.addTo(myMap)

    // Add start marker (green)
    const startIcon = new Icon({
        iconUrl: '/done.svg',
        iconSize: [28, 44],
        iconAnchor: [14, 44],
        popupAnchor: [0, -44]
    })
    const startMarker = marker([firstPoint.latitude, firstPoint.longitude], { icon: startIcon })
    startMarker.bindPopup('Start Location')
    startMarker.addTo(myMap)

    // Add end marker (red)
    const endIcon = new Icon({
        iconUrl: '/done-red.svg',
        iconSize: [28, 44],
        iconAnchor: [14, 44],
        popupAnchor: [0, -44]
    })
    const endMarker = marker([lastPoint.latitude, lastPoint.longitude], { icon: endIcon })
    endMarker.bindPopup('End Location')
    endMarker.addTo(myMap)

    // Fit map to trajectory bounds
    const bounds = latLngBounds(latlngs)
    myMap.fitBounds(bounds, { padding: [30, 30] })
}

// Watch for changes in trajectory and reinitialize map
watch(
    () => [props.summary?.id, hasTrajectory.value],
    async () => {
        if (hasTrajectory.value) {
            await nextTick()
            initMap()
        }
    },
    { immediate: false }
)

onMounted(async () => {
    if (hasTrajectory.value) {
        await nextTick()
        initMap()
    }
})

onUnmounted(() => {
    if (mapRef.value) {
        mapRef.value.remove()
        mapRef.value = null
    }
})
</script>
