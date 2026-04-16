<template>
    <div v-for="(field, key) in fields" :key="key" class="mb-2">
        <label class="block text-xs text-opposite/60 mb-1">
            {{ field.label }}
            <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
        </label>
        <Select2
            v-if="field.type === 'select' && field.options"
            :modelValue="field.options.find((o: ActionOption) => o.value === modelValue[key]) || null"
            :values="field.options"
            :display="(o: ActionOption) => o?.label || ''"
            placeholder="Select..."
            @update:modelValue="(val: ActionOption | null) => emitUpdate(key, val?.value ?? '')"
        />
        <div v-else-if="field.type === 'json'" class="border border-gray-700 rounded-lg p-3 bg-main/50">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-opposite/50">{{ field.label }} (key-value pairs)</span>
                <AppButton buttonStyle="void" type="button" @click="addKeyValuePair(key)"
                    class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <i class="fa-solid fa-plus"></i>
                    Add
                </AppButton>
            </div>
            <div v-if="!getKeyValuePairs(key).length"
                class="text-center py-3 text-opposite/40 text-xs border border-dashed border-gray-600 rounded">
                No entries. Click "Add" to create key-value pairs.
            </div>
            <div v-else class="space-y-2">
                <div v-for="(pair, idx) in getKeyValuePairs(key)" :key="`${key}-${idx}`"
                    class="flex gap-2 items-center">
                    <AppInput v-model="pair.key" type="text" placeholder="Key" hideIcon
                        class="flex-1 text-sm" @update:modelValue="syncJsonToModel(key)" />
                    <AppInput v-model="pair.value" type="text" placeholder="Value" hideIcon
                        class="flex-1 text-sm" @update:modelValue="syncJsonToModel(key)" />
                    <AppButton buttonStyle="void" type="button" @click="removeKeyValuePair(key, idx)"
                        class="text-red-400 hover:text-red-300 shrink-0">
                        <i class="fa-solid fa-trash"></i>
                    </AppButton>
                </div>
            </div>
        </div>
        <AppInput
            v-else
            :type="field.type === 'number' ? 'number' : 'text'"
            :modelValue="modelValue[key]"
            @update:modelValue="(val: string | number) => emitUpdate(key, val)"
            :placeholder="field.label"
            hideIcon
            class="w-full text-sm"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import Select2 from '@/components/Select2.vue'

export interface ActionField {
    label: string
    type?: string
    required?: boolean
    options?: ActionOption[]
}

export interface ActionOption {
    value: string | number
    label: string
}

interface KeyValuePair {
    key: string
    value: string
}

const props = defineProps<{
    fields: Record<string, ActionField>
    modelValue: Record<string, any>
}>()

const emit = defineEmits<{
    'update:modelValue': [value: Record<string, any>]
}>()

const emitUpdate = (key: string, value: any) => {
    emit('update:modelValue', { ...props.modelValue, [key]: value })
}

// JSON field: key-value pairs per field key
const jsonRows = ref<Record<string, KeyValuePair[]>>({})

function objectToRows(obj: Record<string, any> | undefined): KeyValuePair[] {
    if (!obj || typeof obj !== 'object') return []
    return Object.entries(obj).map(([k, v]) => ({ key: k, value: String(v ?? '') }))
}

function rowsToObject(pairs: KeyValuePair[]): Record<string, string> {
    const result: Record<string, string> = {}
    for (const p of pairs) {
        if (p.key.trim()) result[p.key.trim()] = p.value
    }
    return result
}

function getKeyValuePairs(fieldKey: string): KeyValuePair[] {
    if (!jsonRows.value[fieldKey]) {
        jsonRows.value[fieldKey] = objectToRows(props.modelValue[fieldKey])
    }
    return jsonRows.value[fieldKey]
}

function addKeyValuePair(fieldKey: string) {
    if (!jsonRows.value[fieldKey]) {
        jsonRows.value[fieldKey] = objectToRows(props.modelValue[fieldKey])
    }
    jsonRows.value[fieldKey].push({ key: '', value: '' })
    syncJsonToModel(fieldKey)
}

function removeKeyValuePair(fieldKey: string, index: number) {
    jsonRows.value[fieldKey].splice(index, 1)
    syncJsonToModel(fieldKey)
}

function syncJsonToModel(fieldKey: string) {
    const obj = rowsToObject(jsonRows.value[fieldKey] || [])
    emitUpdate(fieldKey, obj)
}

// Sync jsonRows from modelValue when it changes externally (e.g. action switched)
watch(() => ({ model: props.modelValue, fields: props.fields }), ({ model: newVal }) => {
    const jsonFieldKeys = Object.keys(props.fields).filter(k => props.fields[k]?.type === 'json')
    for (const k of jsonFieldKeys) {
        const incoming = objectToRows(newVal?.[k])
        const current = jsonRows.value[k] || []
        if (JSON.stringify(rowsToObject(incoming)) !== JSON.stringify(rowsToObject(current))) {
            jsonRows.value[k] = incoming
        }
    }
}, { deep: true, immediate: true })
</script>
