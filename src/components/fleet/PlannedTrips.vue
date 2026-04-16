<template>
    <BreadCrums
        :crumbs="[
            {
                name: 'Jobs',
                path: '/fleet/planned-jobs',
                icon: 'fa-solid fa-briefcase text-neutral-700 text-2xl'
            }
        ]"
    >
        <div class="flex items-center gap-4">
            <Can :subject="'vehicle-job'" :actions="['create']">
                <AppButton
                    test-id="fleet-trips-plan-job"
                    buttonStyle="primary"
                    @click="handlePlanJob"
                >
                    <i class="fa-solid fa-plus"></i>
                    <span class="ml-2">Plan Job</span>
                </AppButton>
            </Can>
        </div>
    </BreadCrums>
    <LoadingOverlay :show="loading" />

    <div class="calendar-container p-6 grid grid-cols-12 gap-4">
        <!-- Controls and Legend -->
        <div class="xl:col-span-2 col-span-3 space-y-4">
            <div class="bg-secondary rounded-xl p-4 border border-gray-800">
                <h3 class="text-sm font-semibold text-opposite mb-3">Job Stats</h3>
                <div class="space-y-2 text-xs text-opposite">
                    <div class="flex justify-between">
                        <span>Total Jobs</span>
                        <span class="font-semibold">{{ jobs.length }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>This Month</span>
                        <span class="font-semibold">{{ jobsThisMonth }}</span>
                    </div>
                </div>
            </div>

            <!-- View Controls -->
            <div class="bg-secondary rounded-xl p-4 border border-gray-800">
                <h3 class="text-sm font-semibold text-opposite mb-3">Calendar View</h3>
                <div class="flex flex-col space-y-2">
                    <button
                        @click="changeView('day')"
                        :class="[
                            'px-3 py-2 text-sm rounded-lg transition-colors text-left',
                            currentView === 'day'
                                ? 'bg-accent-blue text-opposite'
                                : 'text-opposite hover:bg-main'
                        ]"
                    >
                        <i class="fa-solid fa-calendar-day mr-2"></i>
                        Day View
                    </button>
                    <button
                        @click="changeView('week')"
                        :class="[
                            'px-3 py-2 text-sm rounded-lg transition-colors text-left',
                            currentView === 'week'
                                ? 'bg-accent-blue text-opposite'
                                : 'text-opposite hover:bg-main'
                        ]"
                    >
                        <i class="fa-solid fa-calendar-week mr-2"></i>
                        Week View
                    </button>
                    <button
                        @click="changeView('month')"
                        :class="[
                            'px-3 py-2 text-sm rounded-lg transition-colors text-left',
                            currentView === 'month'
                                ? 'bg-accent-blue text-opposite'
                                : 'text-opposite hover:bg-main'
                        ]"
                    >
                        <i class="fa-solid fa-calendar mr-2"></i>
                        Month View
                    </button>
                </div>
            </div>

            <!-- Status Legend (clickable filter) -->
            <div class="bg-secondary rounded-xl p-4 border border-gray-800">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-opposite">Job Status</h3>
                    <button
                        v-if="statusFilter"
                        class="text-[10px] text-opposite/50 hover:text-opposite transition-colors"
                        @click="statusFilter = null"
                    >
                        Clear
                    </button>
                </div>
                <div class="space-y-1 text-xs text-opposite">
                    <button
                        v-for="s in statusOptions"
                        :key="s.value"
                        class="flex items-center w-full px-2 py-1.5 rounded-md transition-colors"
                        :class="statusFilter === s.value
                            ? 'bg-main ring-1 ring-gray-600'
                            : statusFilter && statusFilter !== s.value
                                ? 'opacity-40 hover:opacity-70'
                                : 'hover:bg-main/50'"
                        @click="statusFilter = statusFilter === s.value ? null : s.value"
                    >
                        <div class="w-3 h-3 rounded mr-2 shrink-0" :style="{ backgroundColor: s.color }"></div>
                        <span class="flex-1 text-left">{{ s.label }}</span>
                        <span class="font-semibold">{{ s.count }}</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Calendar -->
        <div class="calendar-parent xl:col-span-10 col-span-9">
            <CustomCalendar
                v-model="showDate"
                :view="currentView"
                :items="calendarItems"
                @item-click="handleEventClick"
            >
                <template #item="{ item }">
                    <div
                        class="p-2 mb-1 rounded text-xs font-medium text-white overflow-hidden text-ellipsis border-l-4 shadow-sm transition-transform hover:scale-[1.02]"
                        :style="item.style"
                    >
                        <div class="truncate font-semibold">{{ item.title }}</div>
                        <div class="truncate text-[10px] opacity-90">{{ item.subtitle }}</div>
                        <div v-if="item.tripCount" class="truncate text-[10px] opacity-75">
                            {{ item.tripCount }} trip{{ item.tripCount !== 1 ? 's' : '' }}
                        </div>
                    </div>
                </template>
                <template #controls>
                    <!-- Optional controls if we want to put view switcher here instead -->
                </template>
            </CustomCalendar>
        </div>
    </div>

</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CustomCalendar from '@/components/common/CustomCalendar.vue'
import BreadCrums from '@/components/breadCrums.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import AppButton from '@/components/AppButton.vue'
import Can from '@/components/Can.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { getVehicleJobs } from './endpoints'
import type { VehicleJob } from '@/util/interfaces'

interface CalendarItem {
    id: string
    title: string
    subtitle: string
    tripCount: number
    startDate: Date
    endDate: Date
    classes: string[]
    style: string
    job: VehicleJob
}

const authStore = useAuthStore()
const router = useRouter()

const jobs = ref<VehicleJob[]>([])
const loading = ref(false)
const showDate = ref(new Date())
const currentView = ref<'month' | 'week' | 'day'>('day')
const statusFilter = ref<string | null>(null)

const stats = computed(() => {
    const all = jobs.value
    return {
        draft: all.filter((j) => j.status === 'Draft').length,
        planned: all.filter((j) => j.status === 'Planned').length,
        inProgress: all.filter((j) => j.status === 'InProgress').length,
        executed: all.filter((j) => j.status === 'Executed').length,
        postExecution: all.filter((j) => j.status === 'PostExecution').length,
        completed: all.filter((j) => j.status === 'Completed').length,
        cancelled: all.filter((j) => j.status === 'Cancelled').length,
    }
})

const statusOptions = computed(() => [
    { value: 'Draft', label: 'Draft', color: '#6b7280', count: stats.value.draft },
    { value: 'Planned', label: 'Planned', color: '#8b5cf6', count: stats.value.planned },
    { value: 'InProgress', label: 'In Progress', color: '#3b82f6', count: stats.value.inProgress },
    { value: 'Executed', label: 'Executed', color: '#06b6d4', count: stats.value.executed },
    { value: 'PostExecution', label: 'Post Execution', color: '#f97316', count: stats.value.postExecution },
    { value: 'Completed', label: 'Completed', color: '#10b981', count: stats.value.completed },
    { value: 'Cancelled', label: 'Cancelled', color: '#ef4444', count: stats.value.cancelled },
])

const jobsThisMonth = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return jobs.value.filter((job) => {
        const start = job.startDate
        if (!start) return false
        const eventDate = new Date(start)
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
    }).length
})

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Draft':
            return '#6b7280'
        case 'Planned':
            return '#8b5cf6'
        case 'InProgress':
            return '#3b82f6'
        case 'Executed':
            return '#06b6d4'
        case 'PostExecution':
            return '#f97316'
        case 'Completed':
            return '#10b981'
        case 'Cancelled':
            return '#ef4444'
        default:
            return '#6b7280'
    }
}

const calendarItems = computed<CalendarItem[]>(() => {
    return jobs.value
        .filter((job) => job.startDate)
        .filter((job) => !statusFilter.value || job.status === statusFilter.value)
        .map((job) => {
            const start = job.startDate!
            const end = job.endDate || start + 24 * 60 * 60 * 1000 // Default to 1 day if no end date

            const color = getStatusColor(job.status)
            const jobTypeName = job.jobType ? job.jobType.name : ''
            const pilotName = job.assignedPilot
                ? `${job.assignedPilot.fname} ${job.assignedPilot.lname}`
                : 'No pilot assigned'

            return {
                id: job.id,
                title: job.name,
                subtitle: jobTypeName ? `${jobTypeName} - ${pilotName}` : pilotName,
                tripCount: job.trips?.length || 0,
                startDate: new Date(start),
                endDate: new Date(end),
                classes: [`status-${job.status.toLowerCase()}`],
                style: `background-color: ${color}; border-color: ${color}; color: #fff;`,
                job: job
            }
        })
})

const changeView = (view: 'month' | 'week' | 'day') => {
    currentView.value = view
}

const handlePlanJob = () => {
    router.push('/fleet/plan-job')
}

const handleEventClick = (calendarItem: CalendarItem) => {
    router.push(`/fleet/jobs/${calendarItem.job.id}`)
}

const fetchJobs = async () => {
    try {
        loading.value = true
        const res = await getVehicleJobs(authStore)
        jobs.value = res || []
    } catch (err) {
        console.error('Error fetching jobs:', err)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchJobs()
})
</script>

<style scoped>
.calendar-container {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    min-height: 100vh;
}
</style>
