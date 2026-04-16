<template>
    <textarea
        v-bind="$attrs"
        v-model="model"
        :class="[`${INPUT_CLASS} pl-2 py-2`, props.error ? 'ring-red-500' : '', 'h-auto']"
        rows="4"
    ></textarea>
</template>

<script setup lang="ts">
import { INPUT_CLASS } from './contants'

const props = defineProps<{
    error?: boolean
    value?: string
}>()
const model = defineModel<string>()
if (props.value !== undefined) {
    model.value = props.value
}
</script>

<style scoped>
.base-textarea {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
}

.base-textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}
</style>
