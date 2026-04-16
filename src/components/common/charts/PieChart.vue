<template>
    <div class="h-64">
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
        <vue-pie-chart v-else :chart-data="chartData" :options="chartOptions" style="height: 100%; width: 100%;" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PieChart as VuePieChart } from 'vue-chart-3'
import { ensureChartSetup } from '@/util/chartSetup'

ensureChartSetup()

interface PieChartProps {
    data: {
        labels: string[]
        datasets: Array<{
            data: number[]
            backgroundColor?: string | string[]
            borderWidth?: number
        }>
    }
    options?: any
    loading?: boolean
    loadingText?: string
    noDataText?: string
}

const props = withDefaults(defineProps<PieChartProps>(), {
    loading: false,
    loadingText: 'Loading chart data...',
    noDataText: 'No data available.'
})

const hasData = computed(() => 
    props.data?.datasets?.length > 0 && 
    props.data.datasets.some(dataset => dataset.data.length > 0)
)

const chartData = computed(() => props.data)
const chartOptions = computed(() => props.options || {
    responsive: true,
    maintainAspectRatio: false,
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
