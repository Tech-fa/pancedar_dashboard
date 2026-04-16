<template>
    <input
        v-bind="$attrs"
        v-model="model"
        :class="[INPUT_CLASS, props.error ? 'ring-red-500' : '', props.hideIcon ? 'pl-2' : 'pl-10']"
    />
</template>

<script setup lang="ts">
import { INPUT_CLASS } from './contants'

const props = defineProps<{
    error?: boolean
    hideIcon?: boolean
    value?: any
}>()
const model = defineModel<any>()
if (props.value !== undefined) {
    model.value = props.value
}
</script>

<style scoped>
.base-input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    width: 100%;
    box-sizing: border-box;
}

.base-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}
</style>
