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
        <div v-else class="flex flex-col h-full">
            <!-- X-axis labels at top -->
            <div class="flex mb-1" :style="{ paddingLeft: yAxisWidth + 'px' }">
                <div
                    v-for="(label, colIdx) in xLabels"
                    :key="'x-' + colIdx"
                    class="flex-1 text-center text-xs text-opposite/60 truncate px-0.5"
                >
                    {{ label }}
                </div>
            </div>
            <!-- Heatmap grid with Y-axis labels -->
            <div class="flex-1 flex">
                <!-- Y-axis labels -->
                <div class="flex flex-col justify-around" :style="{ width: yAxisWidth + 'px' }">
                    <div
                        v-for="(label, rowIdx) in yLabels"
                        :key="'y-' + rowIdx"
                        class="text-xs text-opposite/60 text-right pr-2 truncate"
                    >
                        {{ label }}
                    </div>
                </div>
                <!-- Grid -->
                <div class="flex-1 grid gap-0.5" :style="gridStyle">
                    <div
                        v-for="(cell, idx) in gridCells"
                        :key="idx"
                        class="flex items-center justify-center text-xs font-medium text-white rounded-sm transition-colors"
                        :style="{ backgroundColor: cell.color }"
                        :title="`${yLabels[cell.row]}, ${xLabels[cell.col]}: ${cell.value}`"
                    >
                        {{ showValues ? cell.value : '' }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface HeatmapDataPoint {
    x: number
    y: number
    value: number
}

interface HeatmapChartProps {
    data: HeatmapDataPoint[]
    xLabels: string[]
    yLabels: string[]
    loading?: boolean
    loadingText?: string
    noDataText?: string
    heightClass?: string
    showValues?: boolean
    yAxisWidth?: number
    colorStops?: { value: number; color: string }[]
}

const props = withDefaults(defineProps<HeatmapChartProps>(), {
    loading: false,
    loadingText: 'Loading chart data...',
    noDataText: 'No data available.',
    heightClass: 'h-64',
    showValues: true,
    yAxisWidth: 80,
    colorStops: () => [
        { value: 0, color: '#22c55e' },
        { value: 0.5, color: '#eab308' },
        { value: 1, color: '#ef4444' }
    ]
})

const hasData = computed(() => 
    props.data.length > 0 && props.xLabels.length > 0 && props.yLabels.length > 0
)

const maxValue = computed(() => {
    if (!props.data.length) return 1
    return Math.max(...props.data.map(d => d.value), 1)
})

const getColor = (value: number) => {
    const normalized = maxValue.value > 0 ? value / maxValue.value : 0
    const stops = [...props.colorStops].sort((a, b) => a.value - b.value)
    
    if (normalized <= stops[0].value) return stops[0].color
    if (normalized >= stops[stops.length - 1].value) return stops[stops.length - 1].color
    
    for (let i = 0; i < stops.length - 1; i++) {
        if (normalized >= stops[i].value && normalized <= stops[i + 1].value) {
            const range = stops[i + 1].value - stops[i].value
            const progress = range > 0 ? (normalized - stops[i].value) / range : 0
            return interpolateColor(stops[i].color, stops[i + 1].color, progress)
        }
    }
    return stops[stops.length - 1].color
}

const interpolateColor = (color1: string, color2: string, progress: number) => {
    const hex1 = color1.replace('#', '')
    const hex2 = color2.replace('#', '')
    
    const r1 = parseInt(hex1.substring(0, 2), 16)
    const g1 = parseInt(hex1.substring(2, 4), 16)
    const b1 = parseInt(hex1.substring(4, 6), 16)
    
    const r2 = parseInt(hex2.substring(0, 2), 16)
    const g2 = parseInt(hex2.substring(2, 4), 16)
    const b2 = parseInt(hex2.substring(4, 6), 16)
    
    const r = Math.round(r1 + (r2 - r1) * progress)
    const g = Math.round(g1 + (g2 - g1) * progress)
    const b = Math.round(b1 + (b2 - b1) * progress)
    
    return `rgb(${r}, ${g}, ${b})`
}

const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${props.xLabels.length}, 1fr)`,
    gridTemplateRows: `repeat(${props.yLabels.length}, 1fr)`
}))

const gridCells = computed(() => {
    const cells: { row: number; col: number; value: number; color: string }[] = []
    const dataMap = new Map<string, number>()
    
    props.data.forEach(d => {
        dataMap.set(`${d.y}-${d.x}`, d.value)
    })
    
    for (let row = 0; row < props.yLabels.length; row++) {
        for (let col = 0; col < props.xLabels.length; col++) {
            const value = dataMap.get(`${row}-${col}`) ?? 0
            cells.push({
                row,
                col,
                value,
                color: getColor(value)
            })
        }
    }
    
    return cells
})
</script>

