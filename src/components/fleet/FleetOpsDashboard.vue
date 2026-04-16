<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrumbs :crumbs="crumbs" />



        <!-- Charts Row -->
        <section class="px-6 pb-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- VehicleStatus Distribution -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">VehicleStatus</h3>
                    <PieChart :data="assetStatusChartData"
                        :loading="isDashboardKeyLoading('fleet_ops_asset_status_distribution')"
                        :options="pieChartOptions" class="mb-4" />
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <span class="text-sm text-opposite opacity-70">Active</span>
                            </div>
                            <span class="text-sm font-medium text-opposite">{{
                                assetStatusCounts.Active
                            }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                <span class="text-sm text-opposite opacity-70">Inactive</span>
                            </div>
                            <span class="text-sm font-medium text-opposite">{{
                                assetStatusCounts.Inactive
                            }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span class="text-sm text-opposite opacity-70">Retired</span>
                            </div>
                            <span class="text-sm font-medium text-opposite">{{
                                assetStatusCounts.Retired
                            }}</span>
                        </div>
                    </div>
                </div>

                <!-- Assets by Category -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Vehicles by Category</h3>
                    <PieChart :data="assetCategoryChartData"
                        :loading="isDashboardKeyLoading('fleet_ops_assets_by_category')" :options="pieChartOptions" />
                </div>

                <!-- Trip Status Distribution -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Vehicles by Model</h3>
                    <BarChart :data="assetsByModelChartData"
                        :loading="isDashboardKeyLoading('fleet_ops_assets_by_model')" :options="barChartOptions" />
                </div>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BreadCrumbs from '@/components/breadCrums.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { listDashboardConfigs, runDashboardQuery } from '@/components/dashboard/endpoints'
import type { DashboardWidgetConfig, DashboardWidgetQueryResult } from '@/util/interfaces'
import { formatDateToDay } from '@/util/util'
import GaugeChart from '@/components/common/charts/GaugeChart.vue'
import PieChart from '@/components/common/charts/PieChart.vue'
import BarChart from '@/components/common/charts/BarChart.vue'
import LineChart from '@/components/common/charts/LineChart.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const crumbs = [
    { name: 'Fleet Ops', path: '/fleet/assets' },
    { name: 'Dashboard' }
]

const dashboardConfigs = ref<DashboardWidgetConfig[]>([])
const dashboardData = ref<Record<string, DashboardWidgetQueryResult>>({})
const dashboardLoading = ref(false)
const dashboardDataLoading = ref<Record<string, boolean>>({})

const numericField = (row: Record<string, unknown> | undefined, key: string, fallback = 0) => {
    const value = row?.[key]
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const numericFieldNullable = (row: Record<string, unknown> | undefined, key: string) => {
    const value = row?.[key]
    if (value === null || value === undefined) {
        return null
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const stringField = (row: Record<string, unknown> | undefined, key: string, fallback = '') => {
    const value = row?.[key]
    if (value === null || value === undefined) {
        return fallback
    }
    return String(value)
}

const formatHours = (value: number | null | undefined, digits = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—'
    }
    return `${value.toFixed(digits)}h`
}

const setDashboardLoading = (key: string, value: boolean) => {
    dashboardDataLoading.value = {
        ...dashboardDataLoading.value,
        [key]: value
    }
}

const isDashboardKeyLoading = (key: string) => {
    if (dashboardLoading.value) {
        return true
    }
    return dashboardDataLoading.value[key] ?? false
}

const dashboardRows = <T = Record<string, unknown>>(key: string): T[] => {
    return (dashboardData.value[key]?.rows as T[]) ?? []
}

const dashboardFirstRow = <T = Record<string, unknown>>(key: string): T | undefined => {
    const rows = dashboardRows<T>(key)
    if (!rows.length) {
        return undefined
    }
    return rows[0]
}

// Fleet Utilization
const fleetUtilization = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('fleet_ops_utilization')
    return {
        totalAssets: numericField(row, 'total_assets'),
        utilizedAssets: numericField(row, 'utilized_assets'),
        utilizationPct: numericField(row, 'utilization_pct'),
        totalTrips: numericField(row, 'total_trips'),
        totalFlightHours: numericField(row, 'total_flight_hours'),
        totalMiles: numericField(row, 'total_miles')
    }
})

// Flight Hours Summary
const flightHoursSummary = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('flight_hours_today')
    return {
        hoursToday: numericField(row, 'hours_today'),
        hoursYesterday: numericField(row, 'hours_yesterday'),
        percentChange: numericFieldNullable(row, 'percent_change'),
        plannedHoursAvg: numericField(row, 'planned_hours_avg')
    }
})

const flightHoursChangeMeta = computed(() => {
    const change = flightHoursSummary.value.percentChange
    if (change === null || change === undefined || Number.isNaN(change)) {
        return { icon: 'fa-minus', class: 'text-neutral-400', label: '—' }
    }
    const icon = change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'
    const className = change >= 0 ? 'text-green-500' : 'text-red-500'
    const label = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    return { icon, class: className, label }
})

// Fleet Summary
const fleetSummary = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('fleet_ops_summary')
    return {
        totalAssets: numericField(row, 'total_assets'),
        activeCount: numericField(row, 'active_count'),
        inactiveCount: numericField(row, 'inactive_count'),
        retiredCount: numericField(row, 'retired_count'),
        modelCount: numericField(row, 'model_count'),
        categoryCount: numericField(row, 'category_count')
    }
})

// VehicleStatus Distribution
const assetStatusCounts = computed(() => {
    const rows = dashboardRows<Record<string, unknown>>('fleet_ops_asset_status_distribution')
    const counts: Record<string, number> = { Active: 0, Inactive: 0, Retired: 0 }
    rows.forEach((row) => {
        const category = stringField(row, 'category', '')
        const total = numericField(row, 'total')
        if (counts[category] !== undefined) {
            counts[category] = total
        }
    })
    return counts
})

// Recent Trips
const recentTrips = computed(() => {
    return dashboardRows<Record<string, unknown>>('fleet_ops_recent_trips').map((row) => ({
        id: stringField(row, 'id', ''),
        displayId: stringField(row, 'display_id', ''),
        assetName: stringField(row, 'asset_name', '—'),
        currentState: stringField(row, 'current_state', ''),
        startedAt: numericField(row, 'started_at'),
        completedAt: numericFieldNullable(row, 'completed_at'),
        durationHours: numericField(row, 'duration_hours'),
        milesTravelled: numericFieldNullable(row, 'miles_travelled'),
        maxSpeed: numericFieldNullable(row, 'max_speed')
    }))
})

// Active Alerts
const activeAlerts = computed(() => {
    return dashboardRows<Record<string, unknown>>('fleet_ops_active_alerts').map((row) => {
        const createdAt = numericField(row, 'created_at', 0)
        return {
            id: stringField(row, 'id', ''),
            assetName: stringField(row, 'asset_name', '—'),
            description: stringField(row, 'description', ''),
            severity: stringField(row, 'severity', 'info').toLowerCase(),
            status: stringField(row, 'status', ''),
            createdAt,
            alertName: stringField(row, 'alert_name', ''),
            createdLabel: createdAt > 0 ? formatDateToDay(createdAt) : '—'
        }
    })
})

// Top Performing Assets
const topPerformingAssets = computed(() => {
    return dashboardRows<Record<string, unknown>>('fleet_ops_top_performing_assets').map((row) => ({
        id: stringField(row, 'id', ''),
        name: stringField(row, 'name', ''),
        assetCode: stringField(row, 'asset_code', ''),
        modelName: stringField(row, 'model_name', 'N/A'),
        status: stringField(row, 'status', ''),
        tripCount: numericField(row, 'trip_count'),
        flightHours: numericField(row, 'flight_hours'),
        totalMiles: numericField(row, 'total_miles')
    }))
})

// Flight Hours Trend
const flightHoursTrend = computed(() => {
    return dashboardRows<Record<string, unknown>>('flight_hours_trend').map((row) => ({
        bucket: stringField(row, 'bucket', ''),
        totalHours: numericField(row, 'total_hours')
    }))
})

// Daily Trips Trend
const dailyTripsTrend = computed(() => {
    return dashboardRows<Record<string, unknown>>('fleet_ops_daily_trips').map((row) => ({
        bucket: stringField(row, 'bucket', ''),
        tripCount: numericField(row, 'trip_count'),
        totalHours: numericField(row, 'total_hours')
    }))
})

// Assets by Model
const assetsByModel = computed(() => {
    return dashboardRows<Record<string, unknown>>('fleet_ops_assets_by_model').map((row) => ({
        category: stringField(row, 'category', ''),
        total: numericField(row, 'total')
    }))
})

// Assets by Category
const assetsByCategory = computed(() => {
    return dashboardRows<Record<string, unknown>>('fleet_ops_assets_by_category').map((row) => ({
        category: stringField(row, 'category', ''),
        total: numericField(row, 'total')
    }))
})

// Trips per Asset
const tripsPerVehicle= computed(() => {
    return dashboardRows<Record<string, unknown>>('fleet_ops_trips_per_asset').map((row) => ({
        category: stringField(row, 'category', ''),
        total: numericField(row, 'total')
    }))
})

// Trip Status Distribution
const tripStatusDistribution = computed(() => {
    return dashboardRows<Record<string, unknown>>('fleet_ops_trip_status_distribution').map(
        (row) => ({
            category: stringField(row, 'category', ''),
            total: numericField(row, 'total')
        })
    )
})

// Chart Data
const assetStatusChartData = computed(() => {
    return {
        labels: ['Active', 'Inactive', 'Retired'],
        datasets: [
            {
                data: [
                    assetStatusCounts.value.Active,
                    assetStatusCounts.value.Inactive,
                    assetStatusCounts.value.Retired
                ],
                backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }
        ]
    }
})

const assetCategoryChartData = computed(() => {
    const data = assetsByCategory.value
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    return {
        labels: data.map((item) => item.category || 'Uncategorized'),
        datasets: [
            {
                data: data.map((item) => item.total),
                backgroundColor: data.map((_, i) => colors[i % colors.length]),
                borderWidth: 0
            }
        ]
    }
})

const tripStatusChartData = computed(() => {
    const data = tripStatusDistribution.value
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    return {
        labels: data.map((item) => item.category || 'Unknown'),
        datasets: [
            {
                data: data.map((item) => item.total),
                backgroundColor: data.map((_, i) => colors[i % colors.length]),
                borderWidth: 0
            }
        ]
    }
})

const dailyTripsChartData = computed(() => {
    const data = dailyTripsTrend.value
    return {
        labels: data.map((item) => item.bucket),
        datasets: [
            {
                label: 'Trips',
                data: data.map((item) => item.tripCount),
                fill: true,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                pointRadius: 0
            }
        ]
    }
})

const flightHoursChartData = computed(() => {
    const data = flightHoursTrend.value
    return {
        labels: data.map((item) => item.bucket),
        datasets: [
            {
                label: 'Flight Hours',
                data: data.map((item) => item.totalHours),
                fill: true,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.4,
                pointRadius: 0
            }
        ]
    }
})

const assetsByModelChartData = computed(() => {
    const data = assetsByModel.value
    return {
        labels: data.map((item) => item.category),
        datasets: [
            {
                label: 'Assets',
                data: data.map((item) => item.total),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }
        ]
    }
})



// Chart Options
const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    }
}

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
}

const areaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
}

// Helper functions
const alertSeverityMeta = (severity: string) => {
    const normalized = (severity || '').toLowerCase()
    if (normalized === 'critical') {
        return {
            wrapper: 'bg-red-900/20 border border-red-800',
            chip: 'bg-red-500 text-opposite',
            label: 'CRITICAL'
        }
    }
    if (normalized === 'warning') {
        return {
            wrapper: 'bg-yellow-900/20 border border-yellow-800',
            chip: 'bg-yellow-500 text-main',
            label: 'WARNING'
        }
    }
    return {
        wrapper: 'bg-blue-900/20 border border-blue-800',
        chip: 'bg-blue-500 text-opposite',
        label: 'INFO'
    }
}

const tripStateClass = (state: string) => {
    const normalized = (state || '').toLowerCase()
    if (normalized === 'completed' || normalized === 'landed') {
        return 'bg-green-500/20 text-green-400'
    }
    if (normalized === 'inflight' || normalized === 'in_flight' || normalized === 'active') {
        return 'bg-blue-500/20 text-blue-400'
    }
    if (normalized === 'cancelled' || normalized === 'halted') {
        return 'bg-red-500/20 text-red-400'
    }
    return 'bg-gray-500/20 text-gray-400'
}

const assetStatusClass = (status: string) => {
    if (status === 'Active') {
        return 'bg-green-500/20 text-green-400'
    }
    if (status === 'Inactive') {
        return 'bg-yellow-500/20 text-yellow-400'
    }
    return 'bg-red-500/20 text-red-400'
}

const navigateToTrip = (trip: { id: string }) => {
    // Navigate to trip details if needed
    router.push(`/fleet/assets`)
}

// Data fetching
const fetchDashboardData = async (config: DashboardWidgetConfig): Promise<void> => {
    setDashboardLoading(config.key, true)
    try {
        const response = await runDashboardQuery(authStore, config.key)
        if (response) {
            dashboardData.value = {
                ...dashboardData.value,
                [config.key]: response
            }
        }
    } catch (error) {
        console.error(`Failed to load dashboard data for ${config.key}`, error)
    } finally {
        setDashboardLoading(config.key, false)
    }
}

const loadDashboard = async () => {
    dashboardLoading.value = true
    try {
        const configs = await listDashboardConfigs(authStore, 'flight-ops')
        dashboardConfigs.value = configs ?? []
        await Promise.all(
            dashboardConfigs.value
                .filter((config) =>
                    ['fleet_ops_asset_status_distribution', 'fleet_ops_assets_by_category', 'fleet_ops_assets_by_model'].includes(config.key)
                )
                .map((config) => fetchDashboardData(config))
        )
    } catch (error) {
        console.error('Failed to load dashboard widgets', error)
        toast.showToast('Error', 'Failed to load dashboard', 'error')
    } finally {
        dashboardLoading.value = false
    }
}

onMounted(async () => {
    await loadDashboard()
})
</script>
