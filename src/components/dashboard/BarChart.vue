<template>
    <div class="bg-white p-4 rounded-xl shadow-lg">
        <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
        <bar-chart :id="'sssss2'" :chart-data="chartData" :chart-options="chartOptions" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { BarChart } from 'vue-chart-3'

// Register all necessary Chart.js components
Chart.register(...registerables)

const props = defineProps({
    title: String,
    chartData: Object
})

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: { beginAtZero: true }
    }
})
onMounted(() => {
    // if (chartCanvas.value) {
    //     chartInstance = new Chart(chartCanvas.value, {
    //         type: 'bar',
    //         data: props.chartData,
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             scales: {
    //                 y: { beginAtZero: true }
    //             }
    //         }
    //     })
    // }
})

// watch(
//     () => props.chartData,
//     (newVal) => {
//         if (chartInstance) {
//             chartInstance.data = newVal
//             chartInstance.update()
//         }
//     }
// )
</script>
