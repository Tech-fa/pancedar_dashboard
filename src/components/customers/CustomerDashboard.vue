<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrumbs :crumbs="crumbs" />

        <!-- Customer Summary Cards -->
        <section class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Customers -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-opposite opacity-70">
                                Total Customers
                            </h3>
                            <div class="text-3xl font-bold text-opposite mt-2">
                                {{ customerSummary.totalCustomers }}
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <i class="fa-solid fa-building text-blue-500 text-xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Active Customers -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-opposite opacity-70">Active</h3>
                            <div class="text-3xl font-bold text-green-500 mt-2">
                                {{ customerSummary.activeCount }}
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <i class="fa-solid fa-check-circle text-green-500 text-xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Inactive Customers -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-opposite opacity-70">Inactive</h3>
                            <div class="text-3xl font-bold text-red-500 mt-2">
                                {{ customerSummary.inactiveCount }}
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <i class="fa-solid fa-times-circle text-red-500 text-xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Locations -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-medium text-opposite opacity-70">Locations</h3>
                            <div class="text-3xl font-bold text-opposite mt-2">
                                {{ customerSummary.cityCount }}
                                <span class="text-sm font-normal text-opposite opacity-70">cities</span>
                            </div>
                            <div class="text-sm text-opposite opacity-70">
                                {{ customerSummary.countryCount }} countries
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <i class="fa-solid fa-map-marker-alt text-purple-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Jobs Summary Cards -->
        <section class="px-6 pb-6">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-sm font-medium text-opposite opacity-70">Customers with Jobs</h3>
                    <div class="text-2xl font-bold text-blue-500 mt-2">
                        {{ jobsSummary.customersWithJobs }}
                    </div>
                </div>
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-sm font-medium text-opposite opacity-70">Total Jobs</h3>
                    <div class="text-2xl font-bold text-opposite mt-2">
                        {{ jobsSummary.totalJobs }}
                    </div>
                </div>
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-sm font-medium text-opposite opacity-70">Completed</h3>
                    <div class="text-2xl font-bold text-green-500 mt-2">
                        {{ jobsSummary.completedJobs }}
                    </div>
                </div>
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-sm font-medium text-opposite opacity-70">Scheduled</h3>
                    <div class="text-2xl font-bold text-yellow-500 mt-2">
                        {{ jobsSummary.scheduledJobs }}
                    </div>
                </div>
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-sm font-medium text-opposite opacity-70">In Progress</h3>
                    <div class="text-2xl font-bold text-blue-500 mt-2">
                        {{ jobsSummary.inProgressJobs }}
                    </div>
                </div>
            </div>
        </section>

        <!-- Charts Row -->
        <section class="px-6 pb-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Customer Status Distribution -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Customer Status</h3>
                    <PieChart :data="customerStatusChartData"
                        :loading="isDashboardKeyLoading('customer_status_distribution')" :options="pieChartOptions"
                        class="mb-4" />
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <span class="text-sm text-opposite opacity-70">Active</span>
                            </div>
                            <span class="text-sm font-medium text-opposite">{{
                                customerStatusCounts.Active
                                }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span class="text-sm text-opposite opacity-70">Inactive</span>
                            </div>
                            <span class="text-sm font-medium text-opposite">{{
                                customerStatusCounts.Inactive
                                }}</span>
                        </div>
                    </div>
                </div>

                <!-- Customers by Country -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Customers by Country</h3>
                    <PieChart :data="customerByCountryChartData" :loading="isDashboardKeyLoading('customer_by_country')"
                        :options="pieChartOptions" />
                </div>

                <!-- Jobs by Status -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Jobs by Status</h3>
                    <PieChart :data="jobsByStatusChartData" :loading="isDashboardKeyLoading('customer_jobs_by_status')"
                        :options="pieChartOptions" />
                </div>
            </div>
        </section>

        <!-- Bar Charts and Trends -->
        <section class="px-6 pb-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Customers by City -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Customers by City</h3>
                    <BarChart :data="customerByCityChartData" :loading="isDashboardKeyLoading('customer_by_city')"
                        :options="barChartOptions" />
                </div>

                <!-- Top Customers by Jobs -->
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Top Customers by Jobs</h3>
                    <BarChart :data="topCustomersByJobsChartData"
                        :loading="isDashboardKeyLoading('customer_top_by_jobs')" :options="barChartOptions" />
                </div>
            </div>
        </section>

        <!-- Jobs Trend -->
        <section class="px-6 pb-6">
            <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                <h3 class="text-lg font-semibold text-opposite mb-4">Jobs Trend (30d)</h3>
                <LineChart :data="jobsTrendChartData" :loading="isDashboardKeyLoading('customer_jobs_trend')"
                    :options="areaChartOptions" />
            </div>
        </section>

        <!-- Recent Customers -->
        <section class="px-6 pb-6">
            <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-opposite">Recently Added Customers</h2>
                    <button class="text-blue-500 hover:text-blue-400 text-sm font-medium"
                        @click="$router.push('/customers/list')">
                        View All
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-main">
                            <tr>

                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-opposite uppercase tracking-wider">
                                    Name
                                </th>

                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-opposite uppercase tracking-wider">
                                    Status
                                </th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-opposite uppercase tracking-wider">
                                    Added
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            <tr v-for="customer in recentCustomers" :key="customer.id"
                                class="hover:bg-main cursor-pointer" @click="$router.push('/customers/list')">

                                <td class="px-4 py-3 text-sm text-opposite font-medium">
                                    {{ customer.name }}
                                </td>

                                <td class="px-4 py-3">
                                    <span class="text-xs px-2 py-1 rounded" :class="customer.isActive
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                        ">
                                        {{ customer.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm text-opposite opacity-70">
                                    {{ formatDateToDay(customer.createdAt) }}
                                </td>
                            </tr>
                            <tr v-if="!recentCustomers.length">
                                <td colspan="7" class="px-4 py-6 text-center text-sm text-opposite opacity-70">
                                    No customers found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BreadCrumbs from '@/components/breadCrums.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { listDashboardConfigs, runDashboardQuery } from '@/components/dashboard/endpoints'
import type { DashboardWidgetConfig, DashboardWidgetQueryResult } from '@/util/interfaces'
import { formatDateToDay } from '@/util/util'
import PieChart from '@/components/common/charts/PieChart.vue'
import BarChart from '@/components/common/charts/BarChart.vue'
import LineChart from '@/components/common/charts/LineChart.vue'

const authStore = useAuthStore()
const toast = useToast()

const crumbs = [{ name: 'Customer Management', path: '/customers/list' }, { name: 'Dashboard' }]

const dashboardConfigs = ref<DashboardWidgetConfig[]>([])
const dashboardData = ref<Record<string, DashboardWidgetQueryResult>>({})
const dashboardLoading = ref(false)
const dashboardDataLoading = ref<Record<string, boolean>>({})

const numericField = (row: Record<string, unknown> | undefined, key: string, fallback = 0) => {
    const value = row?.[key]
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const stringField = (row: Record<string, unknown> | undefined, key: string, fallback = '') => {
    const value = row?.[key]
    if (value === null || value === undefined) {
        return fallback
    }
    return String(value)
}

const booleanField = (row: Record<string, unknown> | undefined, key: string, fallback = false) => {
    const value = row?.[key]
    if (value === null || value === undefined) {
        return fallback
    }
    return value === 1 || value === true || value === '1'
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

// Customer Summary
const customerSummary = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('customer_summary')
    return {
        totalCustomers: numericField(row, 'total_customers'),
        activeCount: numericField(row, 'active_count'),
        inactiveCount: numericField(row, 'inactive_count'),
        cityCount: numericField(row, 'city_count'),
        countryCount: numericField(row, 'country_count')
    }
})

// Jobs Summary
const jobsSummary = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('customer_jobs_summary')
    return {
        customersWithJobs: numericField(row, 'customers_with_jobs'),
        totalJobs: numericField(row, 'total_jobs'),
        completedJobs: numericField(row, 'completed_jobs'),
        scheduledJobs: numericField(row, 'scheduled_jobs'),
        inProgressJobs: numericField(row, 'in_progress_jobs')
    }
})

// Customer Status Counts
const customerStatusCounts = computed(() => {
    const rows = dashboardRows<Record<string, unknown>>('customer_status_distribution')
    const counts: Record<string, number> = { Active: 0, Inactive: 0 }
    rows.forEach((row) => {
        const category = stringField(row, 'category', '')
        const total = numericField(row, 'total')
        if (counts[category] !== undefined) {
            counts[category] = total
        }
    })
    return counts
})

// Recent Customers
const recentCustomers = computed(() => {
    return dashboardRows<Record<string, unknown>>('customer_recent').map((row) => ({
        id: stringField(row, 'id', ''),
        code: stringField(row, 'code', ''),
        name: stringField(row, 'name', ''),
        email: stringField(row, 'email', ''),
        phone: stringField(row, 'phone', ''),
        city: stringField(row, 'city', ''),
        country: stringField(row, 'country', ''),
        contactPerson: stringField(row, 'contact_person', ''),
        isActive: booleanField(row, 'is_active'),
        createdAt: numericField(row, 'created_at')
    }))
})

// Customers by City
const customersByCity = computed(() => {
    return dashboardRows<Record<string, unknown>>('customer_by_city').map((row) => ({
        category: stringField(row, 'category', ''),
        total: numericField(row, 'total')
    }))
})

// Customers by Country
const customersByCountry = computed(() => {
    return dashboardRows<Record<string, unknown>>('customer_by_country').map((row) => ({
        category: stringField(row, 'category', ''),
        total: numericField(row, 'total')
    }))
})

// Top Customers by Jobs
const topCustomersByJobs = computed(() => {
    return dashboardRows<Record<string, unknown>>('customer_top_by_jobs').map((row) => ({
        category: stringField(row, 'category', ''),
        total: numericField(row, 'total')
    }))
})

// Jobs Trend
const jobsTrend = computed(() => {
    return dashboardRows<Record<string, unknown>>('customer_jobs_trend').map((row) => {
        return {
            bucket: row.bucket as string,
            jobCount: numericField(row, 'job_count')
        }
    })
})

// Jobs by Status
const jobsByStatus = computed(() => {
    return dashboardRows<Record<string, unknown>>('customer_jobs_by_status').map((row) => ({
        category: stringField(row, 'category', ''),
        total: numericField(row, 'total')
    }))
})

// Chart Data
const customerStatusChartData = computed(() => {
    return {
        labels: ['Active', 'Inactive'],
        datasets: [
            {
                data: [customerStatusCounts.value.Active, customerStatusCounts.value.Inactive],
                backgroundColor: ['#22c55e', '#ef4444'],
                borderWidth: 0
            }
        ]
    }
})

const customerByCountryChartData = computed(() => {
    const data = customersByCountry.value
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
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

const jobsByStatusChartData = computed(() => {
    const data = jobsByStatus.value
    const statusColors: Record<string, string> = {
        Completed: '#22c55e',
        Scheduled: '#f59e0b',
        InProgress: '#3b82f6',
        Cancelled: '#ef4444',
        Unknown: '#6b7280'
    }
    return {
        labels: data.map((item) => item.category || 'Unknown'),
        datasets: [
            {
                data: data.map((item) => item.total),
                backgroundColor: data.map((item) => statusColors[item.category] || '#6b7280'),
                borderWidth: 0
            }
        ]
    }
})

const customerByCityChartData = computed(() => {
    const data = customersByCity.value
    return {
        labels: data.map((item) => item.category),
        datasets: [
            {
                label: 'Customers',
                data: data.map((item) => item.total),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }
        ]
    }
})

const topCustomersByJobsChartData = computed(() => {
    const data = topCustomersByJobs.value
    return {
        labels: data.map((item) => item.category),
        datasets: [
            {
                label: 'Jobs',
                data: data.map((item) => item.total),
                backgroundColor: '#10b981',
                borderRadius: 4
            }
        ]
    }
})

const jobsTrendChartData = computed(() => {
    const data = jobsTrend.value
    return {
        labels: data.map((item) => item.bucket),
        datasets: [
            {
                label: 'Jobs',
                data: data.map((item) => item.jobCount),
                fill: true,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                pointRadius: 0
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

// Data fetching
const fetchDashboardData = async (config: DashboardWidgetConfig) => {
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
        const configs = await listDashboardConfigs(authStore, 'customer')
        dashboardConfigs.value = configs ?? []
        await Promise.all(
            dashboardConfigs.value
                .filter((config) =>
                    authStore.hasPermissions({ subject: config.subject, actions: ['read'] })
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
