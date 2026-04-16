<template>
    <div :class="heightClass">
        <div
            v-if="loading"
            class="flex h-full items-center justify-center text-sm text-opposite/60"
        >
            {{ loadingText }}
        </div>
        <div
            v-else-if="!hasData"
            class="flex h-full items-center justify-center text-sm text-opposite/60"
        >
            {{ noDataText }}
        </div>
        <vue-bar-chart v-else :chart-data="chartData" :options="chartOptions" style="height: 100%; width: 100%;" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BarChart as VueBarChart } from 'vue-chart-3'
import { ensureChartSetup } from '@/util/chartSetup'

ensureChartSetup()

interface BarChartProps {
    data: {
        labels: string[]
        datasets: Array<{
            label: string
            data: number[]
            backgroundColor?: string | string[]
            borderColor?: string | string[]
            borderRadius?: number
            barPercentage?: number
        }>
    }
    options?: any
    loading?: boolean
    loadingText?: string
    noDataText?: string
    heightClass?: string
}

const props = withDefaults(defineProps<BarChartProps>(), {
    loading: false,
    loadingText: 'Loading chart data...',
    noDataText: 'No data available.',
    heightClass: 'h-64'
})

const hasData = computed(() => 
    props.data?.datasets?.length > 0 && 
    props.data.datasets.some(dataset => dataset.data.length > 0)
)

const chartData = computed(() => props.data)
const chartOptions = computed(() => props.options || {
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
            position: 'bottom',
            labels: {
                color: '#9ca3af'
            }
        }
    }
})
</script>
