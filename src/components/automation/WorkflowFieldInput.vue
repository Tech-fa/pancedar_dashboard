<template>
    <div>
        <label v-if="field.type !== 'boolean' && field.type !== 'json' && field.type !== 'array'"
            class="block text-xs text-opposite/60 mb-1 ml-1">
            {{ field.label }}
            <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
        </label>

        <label v-if="field.type === 'boolean'" class="flex items-center gap-x-2 text-sm text-opposite">
            <input type="checkbox" :checked="!!model"
                @change="(e: Event) => (model = (e.target as HTMLInputElement).checked)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            {{ field.label }}
            <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
        </label>

        <AppInput v-else-if="field.type === 'text' || field.type === 'string'" type="text" :hideIcon="true"
            :placeholder="field.placeholder || field.label" v-model="model" />
        <AppInput v-else-if="field.type === 'color'" type="color" :hideIcon="true" v-model="model" />
        <AppTextarea v-else-if="field.type === 'textarea'" :hideIcon="true"
            :placeholder="field.placeholder || field.label" v-model="model" />
        <AppInput v-else-if="field.type === 'number'" type="number" :hideIcon="true"
            :placeholder="field.placeholder || field.label" :value="model"
            @input="(e: Event) => (model = toNumber((e.target as HTMLInputElement).value))" />

        <Select2 v-else-if="field.type === 'select'" v-model="model" :values="field.options || []"
            :display="(v: any) => (v ?? '').toString()" :placeholder="field.placeholder || 'Select...'"
            :optional="!field.required" />

        <FileUploader v-else-if="field.type === 'files'" v-model="model" :accept="field.accept || '*/*'"
            :inputId="`wf-file-${field.name || field.label}`" />

        <div v-else-if="field.type === 'json'" class="space-y-3 rounded-lg border border-gray-800 bg-main/40 p-3">
            <div v-if="field.label" class="text-xs font-medium text-opposite">
                {{ field.label }}
                <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
            </div>
            <div class="space-y-3">
                <WorkflowFieldInput v-for="sub in field.fields || []" :key="nestedKey(sub)"
                    :field="normalizeWorkflowFieldForInput(sub)" :modelValue="jsonKeyValue(sub)"
                    @update:modelValue="(v: any) => setJsonKey(nestedKey(sub), v)" />
            </div>
        </div>

        <div v-else-if="field.type === 'array'" class="space-y-2">
            <div class="flex items-baseline justify-between gap-2">
                <label class="block text-xs text-opposite/60 mb-0 ml-1">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
                </label>
                <button type="button" class="text-xs text-primary hover:underline shrink-0" @click="addArrayRow">
                    Add entry
                </button>
            </div>
            <div v-if="!arrayRows.length" class="text-xs text-opposite/40 pl-1 py-1">
                No entries yet. Use “Add entry” to add one.
            </div>
            <div v-for="(row, index) in arrayRows" :key="index"
                class="rounded-lg border border-gray-800 bg-secondary p-3 space-y-3">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-xs text-opposite/50">Entry {{ index + 1 }}</span>
                    <button type="button" class="text-xs text-red-400 hover:underline"
                        @click="removeArrayRow(index)">
                        Remove
                    </button>
                </div>
                <template v-if="field.items?.type === 'json' && field.items.fields?.length">
                    <WorkflowFieldInput v-for="sub in field.items.fields" :key="`${index}-${nestedKey(sub)}`"
                        :field="normalizeWorkflowFieldForInput(sub)"
                        :modelValue="row[nestedKey(sub)]"
                        @update:modelValue="(v: any) => setArrayCell(index, nestedKey(sub), v)" />
                </template>
                <div v-else class="text-xs text-red-400">
                    Array item schema is missing or unsupported.
                </div>
            </div>
        </div>

        <div v-else class="text-xs text-red-400">
            Unsupported field type: {{ field.type }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppInput from '@/components/AppInput.vue'
import Select2 from '@/components/Select2.vue'
import FileUploader from '@/components/FileUploader.vue'
import type { WorkflowFieldConfig } from './workflow.interface'
import AppTextarea from '../AppTextarea.vue'
import {
    defaultRowForArrayField,
    fieldKey as nestedKey,
    normalizeWorkflowFieldForInput,
} from './workflowFieldHelpers'

const props = defineProps<{ field: WorkflowFieldConfig }>()
const model = defineModel<any>()

const jsonKeyValue = (sub: WorkflowFieldConfig) => {
    const key = nestedKey(sub)
    const root = model.value
    if (root && typeof root === 'object' && !Array.isArray(root)) {
        return (root as Record<string, any>)[key]
    }
    return undefined
}

const setJsonKey = (key: string, value: any) => {
    const cur =
        model.value && typeof model.value === 'object' && !Array.isArray(model.value)
            ? { ...(model.value as Record<string, any>) }
            : {}
    model.value = { ...cur, [key]: value }
}

const arrayRows = computed(() => (Array.isArray(model.value) ? model.value : []))

const addArrayRow = () => {
    const next = [...arrayRows.value, defaultRowForArrayField(props.field)]
    model.value = next
}

const removeArrayRow = (index: number) => {
    model.value = arrayRows.value.filter((_: unknown, i: number) => i !== index)
}

const setArrayCell = (index: number, key: string, value: any) => {
    const next = arrayRows.value.map((row: Record<string, any>, i: number) =>
        i === index ? { ...row, [key]: value } : row,
    )
    model.value = next
}

const toNumber = (value: string) => {
    if (value === '' || value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
}
</script>
