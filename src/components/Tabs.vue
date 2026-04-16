<template>
    <div class="flex gap-4 border-b border-neutral-200 mb-6">
        <button 
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="$emit('update:modelValue', index)"
            class="px-4 py-2"
            :class="[
                modelValue === index 
                    ? 'border-b-2 border-blue-300 text-blue-500' 
                    : 'text-opposite/80 hover:text-blue-500'
            ]"
            :test-id="testIds && testIds[index] ? testIds[index] : undefined"
        >
            {{ tab }}
        </button>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    tabs: string[];
    modelValue: number;
    testIds?: string[];
}>();

defineEmits<{
    (e: 'update:modelValue', value: number): void;
}>();
</script>
