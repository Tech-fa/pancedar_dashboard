<template>
    <div :class="['relative', heightClass]">
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
        <template v-else>
            <vue-doughnut-chart :chart-data="chartData" :options="chartOptions" style="height: 100%; width: 100%;" :responsive="true" />
            <div v-if="centerText" class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-bold" :class="centerTextClass">{{ centerText }}</span>
                <span v-if="centerSubText" class="text-xs text-opposite/60">{{ centerSubText }}</span>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DoughnutChart as VueDoughnutChart } from 'vue-chart-3'
import { ensureChartSetup } from '@/util/chartSetup'

ensureChartSetup()

interface DoughnutChartProps {
    data: {
        labels: string[]
        datasets: Array<{
            data: number[]
            backgroundColor?: string | string[]
            borderWidth?: number
            cutout?: string
        }>
    }
    options?: any
    loading?: boolean
    loadingText?: string
    noDataText?: string
    centerText?: string
    centerSubText?: string
    centerTextClass?: string
    heightClass?: string
}

const props = withDefaults(defineProps<DoughnutChartProps>(), {
    loading: false,
    loadingText: 'Loading chart data...',
    noDataText: 'No data available.',
    centerTextClass: 'text-accent-green',
    heightClass: 'h-32'
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
            display: false
        }
    }
})
</script>
