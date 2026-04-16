<template>
    <div class="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <h2 class="text-xl font-bold text-gray-800 mb-4">All Events</h2>

        <div class="border-b border-gray-200 mb-4 flex flex-wrap">
            <button
                v-for="(tab, index) in tabs"
                :key="index"
                @click="activeTab = index"
                :class="[
                    activeTab === index ? ' text-blue-600 border-primary' : '  border-gray-400',
                    '  font-medium text-sm flex flex-col items-center   border-dashed rounded-lg p-4 mx-1 my-1 border'
                ]"
            >
                <component :is="tab.icon" class="w-4 h-4 mr-1" />
                {{ tab.title }}
            </button>
        </div>

        <!-- Tab Content -->
        <div v-if="activeTab === 0">
            <table class="min-w-full divide-y divide-gray-200 max-h-[100px] overflow-y-auto">
                <div class="max-h-[600px] overflow-y-auto">
                    <thead class="bg-gray-50">
                        <tr>
                            <th
                                v-for="(header, hIndex) in headers[activeTab]"
                                :key="hIndex"
                                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {{ header }}
                            </th>
                        </tr>
                    </thead>

                    <tbody class="bg-white divide-y divide-gray-200 max-h-[100px] overflow-y-auto">
                        <tr v-for="(event, eIndex) in events" :key="eIndex">
                            <td class="px-4 py-2 text-sm text-gray-900">{{ event.summary }}</td>
                            <td class="px-4 py-2 text-sm text-gray-500">
                                {{ formatDate(event.start, "MMM do 'at' h:mm a") }}
                            </td>
                            <td class="px-4 py-2 text-sm text-gray-500">
                                {{ formatDate(event.end, "MMM do 'at' h:mm a") }}
                            </td>
                        </tr>
                    </tbody>
                </div>
            </table>
        </div>
        <div v-if="activeTab === 1">
            <table class="min-w-full divide-y divide-gray-200 max-h-[100px] overflow-y-auto">
                <div class="max-h-[600px] overflow-y-auto">
                    <thead class="bg-gray-50">
                        <tr>
                            <th
                                v-for="(header, hIndex) in headers[activeTab]"
                                :key="hIndex"
                                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {{ header }}
                            </th>
                        </tr>
                    </thead>

                    <tbody class="bg-white divide-y divide-gray-200 max-h-[100px] overflow-y-auto">
                        <tr v-for="(event, eIndex) in events" :key="eIndex">
                            <td class="px-4 py-2 text-sm text-gray-900">{{ event.summary }}</td>
                            <td class="px-4 py-2 text-sm text-gray-500">
                                {{ formatDate(event.start, "MMM do 'at' h:mm a") }}
                            </td>
                            <td class="px-4 py-2 text-sm text-gray-500">
                                {{ formatDate(event.end, "MMM do 'at' h:mm a") }}
                            </td>
                        </tr>
                    </tbody>
                </div>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatDate } from 'date-fns'
import {
    CalendarIcon,
    MagnifyingGlassIcon,
    ClipboardDocumentCheckIcon,
    ClockIcon
} from '@heroicons/vue/24/outline'
import { ref, computed } from 'vue'

const props = defineProps<{
    events: { [key: string]: any }[]
    audits: { [key: string]: any }[]
}>()

const tabs = ref([
    { title: 'Google Calendar', icon: CalendarIcon },
    { title: 'Audits', icon: ClipboardDocumentCheckIcon },
    { title: 'Meetings', icon: ClockIcon },
    { title: 'Pending Training', icon: MagnifyingGlassIcon },
    { title: 'Pending Requests', icon: MagnifyingGlassIcon }
])
const activeTab = ref(0)
const headers = [
    ['Event Title', 'Start Date', 'End Date'],
    ['Process/Department', 'Type', 'Date', 'Action']
    // ... other tab headers
]
</script>
