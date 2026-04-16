<template>
    <div class="overflow-x-hidden overflow-y-hidden">
        <div class="hidden" v-if="devicesInfo.length > 0">
            <IconPopup
                v-for="deviceInfo in devicesInfo"
                @vue:mounted="
                    (e) => {
                        addPopup(deviceInfo, e.el)
                    }
                "
                :key="deviceInfo.id"
                :deviceInfo="deviceInfo"
            />
        </div>
        <div
            class="absolute top-0 h-[5rem] bg-main right-0 text-opposite z-[1000] shadow-lg border-b border-gray-700 px-6 py-3 flex items-center gap-6"
            :style="headerStyle"
        >
            <div class="max-w-md w-full">
                <SearcheableApiSelectForm
                    name="selectedVehicle"
                    label="Search Vehicle"
                    :values="filteredVehicles"
                    placeholder="Search by name or asset code"
                    :display="displayVehicle"
                    :change-query="handleSearchQuery"
                    :extra-action="handleVehicleSelection"
                    value-key="id"
                    v-model="selectedVehicleId"
                />
            </div>
            <!-- <div class="flex items-center gap-4 border-l border-gray-700 pl-6">
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-medium text-opposite whitespace-nowrap">
                        Live Tracking
                    </label>
                    <div class="flex items-center gap-2">
                        <button
                            @click="toggleAutoRefresh"
                            :class="[
                                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                autoRefreshEnabled ? 'bg-blue-600' : 'bg-gray-600'
                            ]"
                        >
                            <span
                                :class="[
                                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                    autoRefreshEnabled ? 'translate-x-6' : 'translate-x-1'
                                ]"
                            />
                        </button>
                        <span class="text-xs text-opposite/70" v-if="autoRefreshEnabled">
                            Updates every {{ refreshInterval / 1000 }}s
                        </span>
                    </div>
                </div>
            </div> -->
        </div>
        <div
            id="map"
            class="overflow-y-hidden overflow-x-hidden"
            :style="mapWidth"
        ></div>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'
import {
    map,
    latLng,
    tileLayer,
    control,
    layerGroup,
    type MapOptions,
    LayerGroup,
    Icon,
    marker,
    Popup
} from 'leaflet'
import { useAuthStore } from '@/stores/auth'
import type { AssetForMap } from '@/util/interfaces'
import IconPopup from './popup.vue'
import { getAssetsWithMap } from './endpoint'
import { useUiStore } from '@/stores/ui'
import SearcheableApiSelectForm from '@/components/SearcheableApiSelectForm.vue'
const mapRef = ref()
const markersMap = ref<{ [key: string]: any }>({})
const markerLayers = ref<LayerGroup>()
const devicesInfo = ref<AssetForMap[]>([])
const authStore = useAuthStore()
const uiStore = useUiStore()
const open = computed(() => uiStore.open )

// Responsive width handling
const windowWidth = ref(window.innerWidth)
const isSmallScreen = computed(() => windowWidth.value <= 1280)

const mapWidth = computed(() => {
    if (isSmallScreen.value || !open.value) {
        return { width: '100%' }
    }
    return { width: 'calc(100% - 14rem)' }
})

const headerStyle = computed(() => {
    if (isSmallScreen.value) {
        return { width: '100%', paddingLeft: '5rem' }
    }
    return open.value ? { width: 'calc(100% - 14rem)' } : { width: '100%', paddingLeft: '5rem' }
})

// Update window width on resize
const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
}

// Auto-refresh / Live tracking
const autoRefreshEnabled = ref(false)
const refreshInterval = ref(5000) // 5 seconds
const intervalId = ref<number | null>(null)

// Vehicle search and selection
const selectedVehicleId = ref<string | null>(null)
const searchQuery = ref<string>('')
const filteredVehicles = computed(() => {
    if (!searchQuery.value) {
        return devicesInfo.value
    }
    const query = searchQuery.value.toLowerCase()
    return devicesInfo.value.filter(
        (vehicle) =>
            vehicle.name?.toLowerCase().includes(query) ||
            vehicle.assetCode?.toLowerCase().includes(query)
    )
})

const displayVehicle = (vehicle: AssetForMap | null) => {
    if (!vehicle) return ''
    return `${vehicle.name} (${vehicle.assetCode})`
}

const handleSearchQuery = (query: string) => {
    searchQuery.value = query
}

const handleVehicleSelection = (vehicle: AssetForMap | null) => {
    if (!vehicle) return

    const vehicleMarker = markersMap.value[vehicle.id]
    if (vehicleMarker) {
        // Center the map on the selected vehicle
        mapRef.value.setView([vehicle.latitude, vehicle.longitude], 16)
        
        // Open the popup for the marker
        vehicleMarker.openPopup()
    }
}

// Auto-refresh functions
const fetchAndUpdateVehicles = async () => {
    try {
        const data = await getAssetsWithMap(authStore)
        
        // Update devicesInfo
        devicesInfo.value = data
        
        // Update marker positions
        data.forEach((vehicle) => {
            const existingMarker = markersMap.value[vehicle.id]
            if (existingMarker) {
                // Update marker position with animation
                const newLatLng = latLng(+vehicle.latitude, +vehicle.longitude)
                existingMarker.setLatLng(newLatLng)
                
                // Update icon based on alert status
                const iconUrl = +vehicle.hasAlerts > 0 ? '/done-red.svg' : '/done.svg'
                const icon = new Icon({
                    iconUrl: iconUrl,
                    iconSize: [32, 52],
                    popupAnchor: [0, -25]
                })
                existingMarker.setIcon(icon)
            }
        })
    } catch (error) {
        console.error('Error fetching vehicle updates:', error)
    }
}

const toggleAutoRefresh = () => {
    autoRefreshEnabled.value = !autoRefreshEnabled.value
    
    if (autoRefreshEnabled.value) {
        // Start polling
        intervalId.value = window.setInterval(() => {
            fetchAndUpdateVehicles()
        }, refreshInterval.value)
    } else {
        // Stop polling
        if (intervalId.value !== null) {
            clearInterval(intervalId.value)
            intervalId.value = null
        }
    }
}

onMounted(() => {
    // Add resize listener
    window.addEventListener('resize', updateWindowWidth)
    
    // layers of map
    tileLayer('https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        tileSize: 512,
        attribution: '',
        detectRetina: true,
        zoomOffset: -1
    })
    const google_streets = tileLayer('https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        tileSize: 512,
        attribution: '',
        detectRetina: true,
        zoomOffset: -1
    })

    const google_satellite = tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        tileSize: 512,
        attribution: '',
        detectRetina: true,
        zoomOffset: -1
    })

    const google_hybrid = tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        tileSize: 512,
        attribution: '',
        detectRetina: true,
        zoomOffset: -1
    })

    const google_terrain = tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        tileSize: 512,
        attribution: '',
        detectRetina: true,
        zoomOffset: -1
    })
    const options: MapOptions = {
        center: latLng(39.82, -98.58),
        zoom: 4,
        layers: [google_streets],
        zoomAnimation: true
    }

    const mymap = map('map', options)
    mapRef.value = mymap
    const baseMaps = {
        Streets: google_streets,
        Satellite: google_satellite,
        Hybrid: google_hybrid,
        Terrain: google_terrain
    }
    const layers = layerGroup()
    layers.addTo(mymap)
    markerLayers.value = layers
    control.layers(baseMaps).addTo(mymap)
})
watch(mapRef, (newVal) => {
    if (newVal) {
        getAssetsWithMap(authStore).then((data) => {
            devicesInfo.value = data
        })
    }
})

const addPopup = (deviceInfo: AssetForMap, ref: any) => {
    const iconUrl = +deviceInfo.hasAlerts > 0 ? '/done-red.svg' : '/done.svg'
    const icon = new Icon({
        iconUrl: iconUrl,
        iconSize: [32, 52],
        popupAnchor: [0, -25]
    })

    const options = {
        zIndexOffset: 10000,
        radius: 26,
        icon,
        device_severity: 'Active'
    }
    const m = toRaw(marker({ lat: +deviceInfo.latitude, lng: +deviceInfo.longitude }, options))

    if (!markersMap.value[deviceInfo.id]) {
        markersMap.value = { ...markersMap.value, [deviceInfo.id]: m }
    }
    const popup = new Popup()
    popup.setContent(ref)

    m.on('click', () => {
        mapRef.value.setView([deviceInfo.latitude, deviceInfo.longitude], 16)
    })
    m.bindPopup(ref, { closeOnClick: false, closeOnEscapeKey: false })
    toRaw(markerLayers.value)?.addLayer(m)
    // if (selectedDevice.value && selectedDevice.value.id == deviceInfo.id) {
    //     selectedDevice.value = { ...deviceInfo }
    //     m.openPopup()
    // } else if (selectedVehicle.value && selectedVehicle.value.id == deviceInfo.id) {
    //     selectedVehicle.value = { ...deviceInfo }
    // }
}

// Cleanup interval on component unmount
onUnmounted(() => {
    // Remove resize listener
    window.removeEventListener('resize', updateWindowWidth)
    
    // Clear auto-refresh interval
    if (intervalId.value !== null) {
        clearInterval(intervalId.value)
        intervalId.value = null
    }
})
</script>
<style scoped></style>
