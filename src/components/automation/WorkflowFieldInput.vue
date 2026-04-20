<template>
    <div>
        <label
            v-if="field.type !== 'boolean'"
            class="block text-xs text-opposite/60 mb-1 ml-1">
            {{ field.label }}
            <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
        </label>

        <label
            v-if="field.type === 'boolean'"
            class="flex items-center gap-x-2 text-sm text-opposite">
            <input
                type="checkbox"
                :checked="!!model"
                @change="(e: Event) => (model = (e.target as HTMLInputElement).checked)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            {{ field.label }}
            <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
        </label>

        <AppInput
            v-else-if="field.type === 'text'"
            type="text"
            :hideIcon="true"
            :placeholder="field.placeholder || field.label"
            v-model="model" />

        <AppInput
            v-else-if="field.type === 'number'"
            type="number"
            :hideIcon="true"
            :placeholder="field.placeholder || field.label"
            :value="model"
            @input="(e: Event) => (model = toNumber((e.target as HTMLInputElement).value))" />

        <Select2
            v-else-if="field.type === 'select'"
            v-model="model"
            :values="field.options || []"
            :display="(v: any) => (v ?? '').toString()"
            :placeholder="field.placeholder || 'Select...'"
            :optional="!field.required" />

        <FileUploader
            v-else-if="field.type === 'files'"
            v-model="model"
            :accept="field.accept || '*/*'"
            :inputId="`wf-file-${field.name || field.label}`" />

        <div v-else class="text-xs text-red-400">
            Unsupported field type: {{ field.type }}
        </div>
    </div>
</template>

<script setup lang="ts">
import AppInput from '@/components/AppInput.vue'
import Select2 from '@/components/Select2.vue'
import FileUploader from '@/components/FileUploader.vue'
import type { WorkflowFieldConfig } from './workflow.interface'

defineProps<{ field: WorkflowFieldConfig }>()
const model = defineModel<any>()

const toNumber = (value: string) => {
    if (value === '' || value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
}
</script>
