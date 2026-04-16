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
            <vue-doughnut-chart 
                :chart-data="chartData" 
                :options="chartOptions" 
                style="height: 100%; width: 100%;" 
            />
            <div class="absolute inset-0 flex flex-col items-center justify-center" style="top: 25%">
                <span class="text-2xl font-bold" :class="valueColorClass">{{ displayValue }}</span>
                <span v-if="label" class="text-xs text-opposite/60">{{ label }}</span>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DoughnutChart as VueDoughnutChart } from 'vue-chart-3'
import { ensureChartSetup } from '@/util/chartSetup'

ensureChartSetup()

interface GaugeChartProps {
    value: number
    min?: number
    max?: number
    label?: string
    loading?: boolean
    loadingText?: string
    noDataText?: string
    heightClass?: string
    thresholds?: { low: number; medium: number }
    colors?: { low: string; medium: string; high: string; background: string }
}

const props = withDefaults(defineProps<GaugeChartProps>(), {
    min: 0,
    max: 100,
    loading: false,
    loadingText: 'Loading chart data...',
    noDataText: 'No data available.',
    heightClass: 'h-32',
    thresholds: () => ({ low: 30, medium: 70 }),
    colors: () => ({
        low: '#ef4444',
        medium: '#f59e0b',
        high: '#10b981',
        background: '#374151'
    })
})

const hasData = computed(() => props.value !== undefined && props.value !== null)

const normalizedValue = computed(() => {
    const range = props.max - props.min
    if (range <= 0) return 0
    const clamped = Math.max(props.min, Math.min(props.max, props.value))
    return ((clamped - props.min) / range) * 100
})

const displayValue = computed(() => `${Math.round(props.value)}%`)

const valueColor = computed(() => {
    const pct = normalizedValue.value
    if (pct <= props.thresholds.low) return props.colors.low
    if (pct <= props.thresholds.medium) return props.colors.medium
    return props.colors.high
})

const valueColorClass = computed(() => {
    const pct = normalizedValue.value
    if (pct <= props.thresholds.low) return 'text-red-500'
    if (pct <= props.thresholds.medium) return 'text-yellow-500'
    return 'text-green-500'
})

const chartData = computed(() => ({
    labels: ['Value', 'Remaining'],
    datasets: [
        {
            data: [normalizedValue.value, 100 - normalizedValue.value],
            backgroundColor: [valueColor.value, props.colors.background],
            borderWidth: 0,
            cutout: '70%',
            circumference: 180,
            rotation: 270
        }
    ]
}))

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled: false
        }
    }
}))
</script>

