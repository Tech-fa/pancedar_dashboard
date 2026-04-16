<template>
    <div id="compliance-dashboard" class="min-h-screen">
        <!-- Header -->
        <BreadCrumbs :crumbs="[
            { name: 'Compliance Dashboard', path: '/qms', icon: 'fa-solid fa-shield-halved' }
        ]">
            <!-- <div class="flex items-center space-x-4">
                <div class="flex gap-4">
                    <Can :subjects="['documents']" :actions="['read']">
                        <AppButton
                            buttonStyle="secondary"
                            class="flex items-center gap-2"
                            href="/qms/documents"
                            test-id="view-documents-button"
                        >
                            <i class="fa-solid fa-file-lines"></i>
                            Documents
                        </AppButton>
                    </Can>
                    <Can :subjects="['trainings']" :actions="['read']">
                        <AppButton
                            buttonStyle="secondary"
                            class="flex items-center gap-2"
                            href="/qms/trainings"
                            test-id="view-trainings-button"
                        >
                            <i class="fa-solid fa-graduation-cap"></i>
                            Trainings
                        </AppButton>
                    </Can>
                    <Can :subjects="['audit_instances']" :actions="['read']">
                        <AppButton
                            buttonStyle="secondary"
                            class="flex items-center gap-2"
                            href="/qms/audits"
                            test-id="view-audits-button"
                        >
                            <i class="fa-solid fa-clipboard-check"></i>
                            Audits
                        </AppButton>
                    </Can>
                </div>
            </div> -->
        </BreadCrumbs>

        <main id="main-content" class="px-1 sm:px-6 lg:px-8 pt-6">
            <!-- Overview Cards -->
            <section id="overview-cards" class="mb-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Documents Card -->
                    <Can subject="documents" :actions="['read']">
                        <div class="bg-secondary rounded-xl p-6 border border-gray-800 cursor-pointer hover:border-blue-500 transition-colors"
                            @click="$router.push('/qms/documents')">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-opposite">
                                    Document Control
                                </h3>
                                <div class="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <i class="fa-solid fa-file-lines text-blue-500"></i>
                                </div>
                            </div>
                            <div class="text-3xl font-bold text-opposite mb-2">
                                {{ overviewData?.total_documents || 0 }}
                            </div>
                            <div class="text-sm text-opposite opacity-70 mb-4">Total Documents</div>
                            <div class="space-y-2">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-opposite opacity-70">Published</span>
                                    <span class="text-sm font-medium text-green-500">{{
                                        overviewData?.published_documents || 0
                                    }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-opposite opacity-70">Pending</span>
                                    <span class="text-sm font-medium text-yellow-500">{{
                                        overviewData?.pending_documents || 0
                                    }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-opposite opacity-70">Obsolete</span>
                                    <span class="text-sm font-medium text-red-500">{{
                                        overviewData?.obsolete_documents || 0
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </Can>
                    <Can subject="documents" :actions="['read']">
                        <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                            <h3 class="text-lg font-semibold text-opposite mb-4">
                                Document Status Distribution
                            </h3>
                            <div class="h-64">
                                <PieChart :data="documentChartData" :loading="documentStatusLoading"
                                    :options="pieChartOptions" />
                            </div>
                            <div class="mt-4 grid grid-cols-2 gap-2">
                                <div v-for="(item, index) in documentStatusData" :key="index" class="flex items-center">
                                    <div class="w-3 h-3 rounded-full mr-2"
                                        :style="{ backgroundColor: getStatusColor(item.category) }"></div>
                                    <span class="text-sm text-opposite opacity-70">{{ item.category }}: {{ item.total
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </Can>
                </div>
            </section>

            <!-- Additional Charts Section -->
            <section id="additional-charts" class="mb-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Documents by Type -->
                    <Can subject="documents" :actions="['read']">
                        <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                            <h3 class="text-lg font-semibold text-opposite mb-4">
                                Documents by Type
                            </h3>
                            <div class="h-64">
                                <BarChart :data="documentsByTypeChartData" :loading="documentsByTypeLoading"
                                    :options="barChartOptions" />
                            </div>
                        </div>
                    </Can>
                </div>
            </section>

            <!-- Recent Activity Section -->
            <section id="recent-activity" class="mb-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Recent Documents -->
                    <Can subject="documents" :actions="['read']">
                        <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-opposite">
                                    Recent Documents
                                </h3>
                                <button class="text-blue-500 hover:text-blue-400 text-sm font-medium"
                                    @click="$router.push('/qms/documents')">
                                    View All
                                </button>
                            </div>
                            <div class="space-y-3">
                                <div v-for="doc in recentDocumentsData" :key="doc.id"
                                    class="p-3 rounded-lg bg-main cursor-pointer hover:bg-gray-800 transition-colors"
                                    @click="$router.push(`/qms/documents/${doc.id}`)">
                                    <div class="flex items-center justify-between">
                                        <h4 class="font-medium text-opposite text-sm truncate">
                                            {{ doc.title }}
                                        </h4>
                                        <span class="text-xs px-2 py-1 rounded"
                                            :class="getDocumentStatusClass(doc.status)">
                                            {{ formatDocumentStatus(doc.status) }}
                                        </span>
                                    </div>
                                    <div class="flex justify-between mt-1">
                                        <p class="text-xs text-opposite opacity-70">
                                            {{ doc.type_name || 'Unknown Type' }}
                                        </p>
                                        <p class="text-xs text-opposite opacity-70">
                                            v{{ doc.current_version }}
                                        </p>
                                    </div>
                                </div>
                                <div v-if="!recentDocumentsData.length && !recentDocumentsLoading"
                                    class="text-sm text-opposite opacity-70 text-center py-4">
                                    No recent documents
                                </div>
                                <div v-if="recentDocumentsLoading"
                                    class="text-sm text-opposite opacity-70 text-center py-4">
                                    Loading...
                                </div>
                            </div>
                        </div>
                    </Can>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BreadCrumbs from '../breadCrums.vue'
import AppButton from '../AppButton.vue'
import Can from '../Can.vue'
import PieChart from '../common/charts/PieChart.vue'
import BarChart from '../common/charts/BarChart.vue'
import LineChart from '../common/charts/LineChart.vue'
import GaugeChart from '../common/charts/GaugeChart.vue'
import { apiGet } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import { formatDateToDay } from '@/util/util'

const authStore = useAuthStore()

// Loading states
const overviewLoading = ref(false)
const scoreLoading = ref(false)
const documentStatusLoading = ref(false)
const trainingStatusLoading = ref(false)
const auditStatusLoading = ref(false)
const documentsByTypeLoading = ref(false)
const findingsLoading = ref(false)
const trainingTrendLoading = ref(false)
const recentDocumentsLoading = ref(false)
const upcomingAuditsLoading = ref(false)

// Data
const overviewData = ref<any>(null)
const scoreData = ref<any>(null)
const documentStatusData = ref<any[]>([])
const trainingStatusData = ref<any[]>([])
const auditStatusData = ref<any[]>([])
const documentsByTypeData = ref<any[]>([])
const findingsData = ref<any[]>([])
const trainingTrendData = ref<any[]>([])
const recentDocumentsData = ref<any[]>([])
const upcomingAuditsData = ref<any[]>([])

// Status color mapping
const statusColors: Record<string, string> = {
    Published: '#10b981',
    Completed: '#10b981',
    'In Review': '#FF8C00', // orange
    'In Progress': '#f59e0b',
    'Pending Approval': '#f59e0b',
    Scheduled: '#3b82f6',
    Draft: '#6b7280',
    Created: '#6b7280',
    Obsolete: '#ef4444',
    'On Hold': '#f97316',
    Cancelled: '#ef4444',
    Other: '#9ca3af'
}


const getStatusColor = (status: string) => statusColors[status] || '#9ca3af'

// Chart data computations
const documentChartData = computed(() => ({
    labels: documentStatusData.value.map((d) => d.category),
    datasets: [
        {
            data: documentStatusData.value.map((d) => d.total),
            backgroundColor: documentStatusData.value.map((d) => getStatusColor(d.category)),
            borderWidth: 0
        }
    ]
}))



const documentsByTypeChartData = computed(() => ({
    labels: documentsByTypeData.value.map((d) => d.category),
    datasets: [
        {
            label: 'Documents',
            data: documentsByTypeData.value.map((d) => d.total),
            backgroundColor: '#3b82f6',
            borderRadius: 4
        }
    ]
}))




// Chart options
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
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1
            }
        }
    }
}


// Status formatting helpers
const formatDocumentStatus = (status: string) => {
    const mapping: Record<string, string> = {
        published: 'Published',
        in_review: 'In Review',
        ready_for_approval: 'Pending Approval',
        pending: 'Draft',
        obsolete: 'Obsolete'
    }
    return mapping[status] || status
}



const getDocumentStatusClass = (status: string) => {
    switch (status) {
        case 'published':
            return 'bg-green-100 text-green-800'
        case 'in_review':
            return 'bg-orange-200 text-orange-800'
        case 'ready_for_approval':
            return 'bg-yellow-100 text-yellow-800'
        case 'pending':
            return 'bg-gray-100 text-gray-800'
        case 'obsolete':
            return 'bg-red-100 text-red-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}


// Fetch dashboard data
const fetchDashboardData = async (key: string) => {
    try {
        const response = await apiGet<any>(`/dashboard/configs/${key}/data`, authStore)
        return response?.rows || []
    } catch (error) {
        console.error(`Error fetching dashboard data for ${key}:`, error)
        return []
    }
}

const fetchOverview = async () => {
    overviewLoading.value = true
    try {
        const rows = await fetchDashboardData('compliance_overview_summary')
        overviewData.value = rows[0] || null
    } finally {
        overviewLoading.value = false
    }
}



const fetchDocumentStatus = async () => {
    documentStatusLoading.value = true
    try {
        documentStatusData.value = await fetchDashboardData(
            'compliance_document_status_distribution'
        )
    } finally {
        documentStatusLoading.value = false
    }
}




const fetchDocumentsByType = async () => {
    documentsByTypeLoading.value = true
    try {
        documentsByTypeData.value = await fetchDashboardData('compliance_documents_by_type')
    } finally {
        documentsByTypeLoading.value = false
    }
}





const fetchRecentDocuments = async () => {
    recentDocumentsLoading.value = true
    try {
        recentDocumentsData.value = await fetchDashboardData('compliance_recent_documents')
    } finally {
        recentDocumentsLoading.value = false
    }
}


onMounted(async () => {
    // Fetch all dashboard data in parallel
    await Promise.all([
        fetchOverview(),
        fetchDocumentStatus(),
        fetchDocumentsByType(),
        fetchRecentDocuments(),
    ])
})
</script>
