<script setup lang="ts">
import { Field } from 'vee-validate'
import { onMounted, ref } from 'vue'

const props = defineProps<{
    name: string
    label: string
    value: boolean
}>()
</script>

<template>
    <label class="ml-2 text-sm text-opposite flex items-center gap-x-2">
        <Field :name="name" v-slot="{ field }">
            <input
                :checked="value"
                @change="(e: any) => field.onChange(e.target?.checked)"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
        </Field>
        {{ label }}
    </label>
</template>
