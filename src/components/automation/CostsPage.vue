<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />
        <div class="px-6 pb-6 pt-4">
            <div v-if="loading" class="flex items-center justify-center py-20">
                <Spinner width="3" height="3" />
            </div>

            <template v-else>
                <div class="max-w-5xl mx-auto">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-opposite">LLM costs</h3>
                        <p v-if="data" class="text-xs text-opposite/50">
                            Team · {{ data.teamId }}
                        </p>
                    </div>

                    <div v-if="!data || data.periods.length === 0"
                        class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                        No cost data recorded for this team yet.
                    </div>

                    <div v-else class="space-y-8">
                        <section v-for="period in data.periods" :key="`${period.year}-${period.month}`"
                            class="bg-main rounded-lg border border-gray-800 overflow-hidden">
                            <div class="px-5 py-3 border-b border-gray-800 bg-secondary/40">
                                <h4 class="text-opposite font-medium">{{ formatPeriodLabel(period) }}</h4>
                                <p class="text-xs text-opposite/50 mt-0.5">
                                    {{ periodSubtotal(period) }}
                                </p>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead>
                                        <tr class="text-left text-opposite/60 border-b border-gray-800">
                                            <th class="px-5 py-2 font-medium">Model</th>
                                            <th class="px-3 py-2 font-medium text-right">Calls</th>
                                            <th class="px-3 py-2 font-medium text-right">In / out / cache-hit</th>
                                            <th class="px-5 py-2 font-medium text-right">Cost (USD)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="m in period.models" :key="m.llmModelName"
                                            class="text-opposite border-b border-gray-800/60 last:border-0">
                                            <td class="px-5 py-3 font-mono text-xs">{{ m.llmModelName }}</td>
                                            <td class="px-3 py-3 text-right tabular-nums">{{ m.callCount }}</td>
                                            <td class="px-3 py-3 text-right text-xs text-opposite/80 tabular-nums">
                                                {{ formatTokens(m) }}
                                            </td>
                                            <td class="px-5 py-3 text-right tabular-nums font-medium">
                                                {{ formatUsd(m.totalCostUsd) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getTeamCostsAggregated,
    type TeamCostsAggregatedResponse,
    type CostByModelAggregate,
    type CostPeriodAggregate,
} from '@/components/automation/endpoints'

const authStore = useAuthStore()
const toast = useToast()

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Costs', path: '' },
]

const loading = ref(false)
const data = ref<TeamCostsAggregatedResponse | null>(null)

const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
})

function formatUsd(n: number) {
    return usd.format(n)
}

function formatPeriodLabel(period: CostPeriodAggregate) {
    const y = Number(period.year)
    const mo = Number(period.month) - 1
    if (!Number.isFinite(y) || !Number.isFinite(mo) || mo < 0 || mo > 11) {
        return `${period.month}/${period.year}`
    }
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(y, mo, 1))
}

function periodSubtotal(period: CostPeriodAggregate) {
    const sum = period.models.reduce((acc, m) => acc + m.totalCostUsd, 0)
    return `Subtotal ${formatUsd(sum)}`
}

function formatTokens(m: CostByModelAggregate) {
    return `${m.totalInputTokens.toLocaleString()} / ${m.totalOutputTokens.toLocaleString()} / ${m.totalCacheHitTokens.toLocaleString()}`
}

onMounted(async () => {
    loading.value = true
    try {
        data.value = await getTeamCostsAggregated(authStore)
    } catch (e) {
        console.error(e)
        toast.showToast('Error', 'Could not load costs', 'error')
    } finally {
        loading.value = false
    }
})
</script>
