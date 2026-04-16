<template>
    <div class="rounded-lg w-80 bg-white shadow-2xl border border-gray-200 overflow-y-auto h-[450px]">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-lg">{{ deviceInfo.name }}</h3>
                    <p class="text-blue-100 text-sm">ID: {{ deviceInfo.assetCode }}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full" :class="statusColor"></div>
                    <span class="text-sm font-medium">{{ deviceInfo.status }}</span>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-4">
            <!-- Location Info -->
            <div class="bg-gray-50 rounded-lg p-3">
                <div class="flex items-center mb-2">
                    <MapPinIcon class="h-5 w-5 text-gray-600 mr-2" />
                    <span class="font-semibold text-gray-800">Location</span>
                </div>
                <div class="text-sm text-gray-600 space-y-1">
                    <p>Lat: {{ (+deviceInfo.latitude).toFixed(6) }}</p>
                    <p>Lng: {{ (+deviceInfo.longitude).toFixed(6) }}</p>
                </div>
            </div>


            <!-- Last Update -->
            <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span>Last update: {{ formatTime(deviceInfo.lastUpdate) }}</span>
                <span class="flex items-center">
                    <div class="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    Live
                </span>
            </div>

            <!-- View Details Button -->
            <button @click="navigateToAssetDetails"
                class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg">
                <span>View Full Details</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AssetForMap } from '@/util/interfaces'
import { MapPinIcon } from '@heroicons/vue/24/solid'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ deviceInfo: AssetForMap }>()
const router = useRouter()

const navigateToAssetDetails = () => {
    router.push(`/fleet/assets/${props.deviceInfo.id}`)
}

const statusColor = computed(() => {
    switch (props.deviceInfo.status?.toLowerCase()) {
        case 'active':
            return 'bg-green-400'
        case 'warning':
            return 'bg-yellow-400'
        case 'error':
            return 'bg-red-400'
        case 'offline':
            return 'bg-gray-400'
        default:
            return 'bg-blue-400'
    }
})

const getAlertClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
        case 'high':
        case 'critical':
            return 'bg-red-50 border border-red-200 text-red-800'
        case 'medium':
        case 'warning':
            return 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        case 'low':
        case 'info':
            return 'bg-blue-50 border border-blue-200 text-blue-800'
        default:
            return 'bg-gray-50 border border-gray-200 text-gray-800'
    }
}

const getAlertDotClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
        case 'high':
        case 'critical':
            return 'bg-red-400'
        case 'medium':
        case 'warning':
            return 'bg-yellow-400'
        case 'low':
        case 'info':
            return 'bg-blue-400'
        default:
            return 'bg-gray-400'
    }
}

const formatTime = (timestamp: string | number | Date | null | undefined) => {
    if (timestamp == null) return 'N/A'
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}
</script>
