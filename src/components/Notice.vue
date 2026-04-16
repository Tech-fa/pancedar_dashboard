<template>
    <div
        :class="
            level === 'warning'
                ? 'bg-yellow-500 text-black'
                : level === 'info'
                  ? 'text-opposite bg-blue-500'
                  : 'bg-red-500 text-black'
        "
        class="bg-opacity-50 text-black p-2 rounded-md flex items-center gap-2"
    >
        <ExclamationCircleIcon class="h-6 w-6 text-black shrink-0" aria-hidden="true" />
        <div class="text-sm">
            {{ description }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline'

defineProps<{
    description: string
    level: 'info' | 'warning' | 'error'
}>()
</script>
