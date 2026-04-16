<template>
    <div :class="wrapperClass">
        <div v-if="hasExecutedAt" class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <span class="text-opposite/40">Executed at: {{ formatDate(response.createdAt!) }}</span>
        </div>
        <CollapsibleJsonBlock label="Parameters" :value="response.parameters" />
        <CollapsibleJsonBlock label="Raw Response" :value="response.responseJson" />
        <CollapsibleJsonBlock label="Mapped Response" :value="response.mappedResponseJson" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CollapsibleJsonBlock from '@/components/CollapsibleJsonBlock.vue'
import { formatDate } from '@/util/util'

/** Connector / workflow step execution payload for display (extra fields allowed). */
export interface ExecutionResponseViewModel {
    parameters?: Record<string, any> | null
    responseJson?: Record<string, any> | null
    mappedResponseJson?: Record<string, any> | null
    createdAt?: number | null
}

const props = withDefaults(
    defineProps<{
        response: ExecutionResponseViewModel
        /** default: checklist / full panel; compact: nested workflow run history card */
        variant?: 'default' | 'compact'
    }>(),
    { variant: 'default' },
)

const hasExecutedAt = computed(
    () => props.response.createdAt != null && Number.isFinite(Number(props.response.createdAt)),
)

const wrapperClass = computed(() =>
    props.variant === 'compact'
        ? 'rounded border border-gray-700/60 bg-secondary/60 p-2 space-y-1.5'
        : 'rounded-lg bg-main/50 border border-gray-700 p-4 space-y-3',
)
</script>
