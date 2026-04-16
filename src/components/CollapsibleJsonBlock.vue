<template>
    <div v-if="hasContent" :class="collapsible ? '' : 'space-y-1'">
        <details v-if="collapsible" class="group">
            <summary
                class="text-xs text-opposite/50 cursor-pointer select-none hover:text-opposite/70 list-none flex items-center gap-1 [&::-webkit-details-marker]:hidden">
                <i class="fa-solid fa-chevron-right text-[10px] transition-transform group-open:rotate-90"></i>
                {{ label }}
            </summary>
            <pre
                class="mt-1 text-xs text-opposite/90 bg-black/20 rounded p-2 overflow-x-auto max-h-36 overflow-y-auto font-mono">{{ formatted }}</pre>
        </details>
        <template v-else>
            <span class="text-xs text-opposite/50">{{ label }}</span>
            <pre
                class="text-xs text-opposite/90 bg-black/30 rounded p-2 overflow-x-auto max-h-40 overflow-y-auto font-mono">{{ formatted }}</pre>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatJson } from '@/util/util'

const props = withDefaults(
    defineProps<{
        label: string
        value: unknown
        /** When false, label + pre only (expanded). Matches workflow step payload style. */
        collapsible?: boolean
    }>(),
    { collapsible: true }
)

const formatted = computed(() => formatJson(props.value))

const hasContent = computed(() => {
    const v = props.value
    if (v == null) return false
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0) {
        return false
    }
    return formatted.value.length > 0
})
</script>
