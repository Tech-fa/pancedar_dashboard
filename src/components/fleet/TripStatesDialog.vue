<template>
    <div class="bg-secondary rounded-lg shadow-xl w-full max-w-3xl">
        <div class="flex justify-between items-center p-6 border-b border-gray-800">
            <div>
                <h3 class="text-lg font-semibold text-opposite">Trip Timeline</h3>
                <p class="text-sm text-opposite/60">Flight {{ trip.flightId }}</p>
            </div>
            <button @click="onCancel" class="text-opposite/60 hover:text-opposite">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>

        <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <span class="text-xs uppercase text-opposite/50">Started</span>
                    <p class="text-opposite font-medium">{{ formatTimestamp(trip.startedAt) }}</p>
                </div>
                <div>
                    <span class="text-xs uppercase text-opposite/50">Ended</span>
                    <p class="text-opposite font-medium">{{ formatTimestamp(resolvedEndTimestamp) }}</p>
                </div>
                <div>
                    <span class="text-xs uppercase text-opposite/50">Duration</span>
                    <p class="text-opposite font-medium">{{ duration }}</p>
                </div>
            </div>

            <div>
                <h4 class="text-md font-semibold text-opposite mb-4">State Changes</h4>
                <div v-if="displayStates.length" class="space-y-4 max-h-96 overflow-y-auto pr-2">
                    <div
                        v-for="state in displayStates"
                        :key="state.id"
                        class="rounded-lg border border-gray-800 bg-main/40 p-4 space-y-3"
                    >
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <span class="text-xs uppercase text-opposite/50">State</span>
                                <p class="text-opposite font-semibold">{{ state.state }}</p>
                            </div>
                            <div class="text-opposite/70 text-sm">
                                {{ formatTimestamp(state.recordedAt) }}
                            </div>
                        </div>
                        <div v-if="hasPayload(state.payload)" class="bg-secondary/60 rounded-md p-3">
                            <span class="text-xs uppercase text-opposite/50">Payload</span>
                            <pre class="text-xs text-opposite/80 whitespace-pre-wrap break-words mt-1">{{
                                formatPayload(state.payload)
                            }}</pre>
                        </div>
                    </div>
                </div>
                <p v-else class="text-sm text-opposite/60">No lifecycle events recorded for this trip yet.</p>
            </div>

            <div class="flex justify-end">
                <AppButton buttonStyle="secondary" @click="onCancel">Close</AppButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import type { Trip, TripState } from '@/util/interfaces'
import { formatDateToTime, formatDurationFromTimestamps } from '@/util/util'

const props = defineProps<{
    trip: Trip
    states: TripState[]
    onCancel: () => void
}>()

const displayStates = computed(() => {
    const base = props.states?.length ? props.states : props.trip.states || []
    return [...base].sort((a, b) => a.recordedAt - b.recordedAt)
})

const resolvedEndTimestamp = computed(() => {
    const completion = Number(props.trip.completedAt)
    if (Number.isFinite(completion) && completion > 0) {
        return completion
    }
    const halt = Number(props.trip.haltedAt)
    if (Number.isFinite(halt) && halt > 0) {
        return halt
    }
    return null
})

const duration = computed(() =>
    formatDurationFromTimestamps(props.trip.startedAt, resolvedEndTimestamp.value, {
        fallbackToNow: true
    })
)

const formatTimestamp = (value?: number | null) => {
    if (!value || !Number.isFinite(Number(value))) {
        return '—'
    }
    return formatDateToTime(Number(value))
}

const hasPayload = (payload: Record<string, any> | null) => {
    if (!payload) return false
    return Object.keys(payload).length > 0
}

const formatPayload = (payload: Record<string, any> | null) => {
    if (!payload) return ''
    try {
        return JSON.stringify(payload, null, 2)
    } catch (error) {
        console.error('Failed to stringify trip payload', error)
        return '[unavailable]'
    }
}

const onCancel = () => {
    props.onCancel()
}

const trip = props.trip
</script>

<style scoped>
pre {
    font-family: 'Fira Code', 'SFMono-Regular', ui-monospace, 'SFMono-Regular', Menlo, Monaco,
        Consolas, 'Liberation Mono', 'Courier New', monospace;
}
</style>
