import { Chart, registerables } from 'chart.js'

let chartRegistered = false

export const ensureChartSetup = () => {
    if (!chartRegistered) {
        Chart.register(...registerables)
        chartRegistered = true
    }
}
