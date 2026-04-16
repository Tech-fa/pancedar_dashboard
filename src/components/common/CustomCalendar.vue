<template>
    <div class="custom-calendar h-full flex flex-col bg-[#111827] rounded-lg border border-[#1f2937]">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-[#1f2937]">
            <div class="flex items-center space-x-4">
                <h2 class="text-lg font-semibold text-white capitalize">
                    {{ periodLabel }}
                </h2>
                <div class="flex bg-[#1f2937] rounded-lg p-1">
                    <button
                        @click="move('prev')"
                        class="p-1 hover:bg-[#374151] rounded text-gray-400 hover:text-white"
                    >
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                        @click="goToday"
                        class="px-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#374151] rounded"
                    >
                        Today
                    </button>
                    <button
                        @click="move('next')"
                        class="p-1 hover:bg-[#374151] rounded text-gray-400 hover:text-white"
                    >
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            <div class="flex space-x-2">
                <slot name="controls"></slot>
            </div>
        </div>

        <!-- Day View -->
        <template v-if="view === 'day'">
            <div class="flex-1 overflow-y-auto bg-[#111827] p-6">
                <div v-if="dayViewItems.length === 0" class="flex items-center justify-center h-48 text-gray-500 text-sm">
                    No jobs scheduled for this day
                </div>
                <div v-else class="flex flex-wrap gap-4">
                    <div
                        v-for="item in dayViewItems"
                        :key="item.id"
                        class="w-64 rounded-lg cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg overflow-hidden"
                        @click="$emit('item-click', item)"
                    >
                        <slot name="item" :item="item">
                            <div class="p-3 bg-blue-600 text-white rounded-lg">
                                {{ item.title }}
                            </div>
                        </slot>
                    </div>
                </div>
            </div>
        </template>

        <!-- Month / Week View -->
        <template v-else>
            <!-- Days Header -->
            <div class="grid grid-cols-7 border-b border-[#1f2937] bg-[#0f172a]">
                <div
                    v-for="day in weekDays"
                    :key="day"
                    class="p-2 text-center text-xs font-semibold text-gray-400 uppercase"
                >
                    {{ day }}
                </div>
            </div>

            <!-- Calendar Grid -->
            <div class="flex-1 overflow-y-auto bg-[#111827]">
                <div class="calendar-grid">
                    <div
                        v-for="day in calendarDays"
                        :key="day.date.toString()"
                        class="min-h-[100px] p-2 border-b border-r border-[#1f2937] relative group transition-colors hover:bg-[#1f2937]/30"
                        :class="{
                            'bg-[#1f2937]/10': !day.isCurrentMonth,
                            'bg-[#1f2937]/50': day.isToday
                        }"
                        @click="$emit('date-click', day.date)"
                    >
                    <!-- Date Number -->
                    <div
                        class="flex justify-between items-start mb-1"
                    >
                        <span
                            class="text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full"
                            :class="[
                                day.isToday
                                    ? 'bg-blue-500 text-white'
                                    : day.isCurrentMonth
                                      ? 'text-gray-300'
                                      : 'text-gray-600'
                            ]"
                        >
                            {{ day.date.getDate() }}
                        </span>
                    </div>

                    <!-- Events/Items -->
                    <div class="space-y-1 overflow-y-auto ">
                        <div
                            v-for="item in day.items"
                            :key="item.id"
                            class="text-xs rounded cursor-pointer transition-opacity hover:opacity-80 overflow-hidden"
                            @click.stop="$emit('item-click', item)"
                        >
                            <slot name="item" :item="item">
                                <!-- Default Item Render -->
                                <div class="p-1 bg-blue-600 text-white truncate rounded">
                                    {{ item.title }}
                                </div>
                            </slot>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays
} from 'date-fns'

interface Props {
    modelValue: Date
    view?: 'month' | 'week' | 'day'
    items?: any[]
}

const props = withDefaults(defineProps<Props>(), {
    view: 'month',
    items: () => []
})

const emit = defineEmits(['update:modelValue', 'date-click', 'item-click'])

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const periodLabel = computed(() => {
    if (props.view === 'day') {
        return format(props.modelValue, 'EEEE, MMMM d, yyyy')
    }
    return format(props.modelValue, 'MMMM yyyy')
})

const dayViewItems = computed(() => {
    return props.items.filter((item) => {
        const itemDate = new Date(item.startDate || item.date)
        return isSameDay(itemDate, props.modelValue)
    })
})

const calendarDays = computed(() => {
    const start =
        props.view === 'month'
            ? startOfWeek(startOfMonth(props.modelValue))
            : startOfWeek(props.modelValue)
    
    const end =
        props.view === 'month'
            ? endOfWeek(endOfMonth(props.modelValue))
            : endOfWeek(props.modelValue)

    const days = eachDayOfInterval({ start, end })

    return days.map((date) => {
        // Filter items for this day
        const dayItems = props.items.filter((item) => {
            // Assuming item has startDate or date field
            const itemDate = new Date(item.startDate || item.date)
            return isSameDay(itemDate, date)
        })

        return {
            date,
            isCurrentMonth: isSameMonth(date, props.modelValue),
            isToday: isSameDay(date, new Date()),
            items: dayItems
        }
    })
})

const move = (direction: 'prev' | 'next') => {
    let newDateVal
    if (props.view === 'month') {
        newDateVal =
            direction === 'next'
                ? addMonths(props.modelValue, 1)
                : subMonths(props.modelValue, 1)
    } else if (props.view === 'week') {
        newDateVal =
            direction === 'next'
                ? addWeeks(props.modelValue, 1)
                : subWeeks(props.modelValue, 1)
    } else {
        newDateVal =
            direction === 'next'
                ? addDays(props.modelValue, 1)
                : subDays(props.modelValue, 1)
    }
    emit('update:modelValue', newDateVal)
}

const goToday = () => {
    emit('update:modelValue', newDate())
}

const newDate = () => new Date()
</script>

<style scoped>
/* Grid layout where each row sizes independently */
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: auto;
}

/* Custom scrollbar for event container */
::-webkit-scrollbar {
    width: 4px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
}
</style>

