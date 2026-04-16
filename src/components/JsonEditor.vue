<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <label v-if="label" class="block text-sm text-opposite">
                {{ label }}
                <span v-if="required" class="text-red-500">*</span>
            </label>
            <AppButton
                :test-id="`${testId}-add-field`"
                buttonStyle="secondary"
                type="button"
                @click="addField"
                class="text-sm"
            >
                <i class="fa-solid fa-plus"></i>
                <span class="ml-2">Add Field</span>
            </AppButton>
        </div>

        <div v-if="fields.length === 0" class="text-opposite/60 text-sm p-4 bg-secondary/50 rounded border border-gray-800">
            No custom fields added. Click "Add Field" to create one.
        </div>

        <div v-else class="space-y-3">
            <div
                v-for="(field, index) in fields"
                :key="index"
                class="grid grid-cols-12 gap-3 items-start p-3 bg-secondary rounded border border-gray-800"
            >
                <div class="col-span-5">
                    <input
                        :test-id="`${testId}-key-${index}`"
                        v-model="field.key"
                        type="text"
                        placeholder="Key"
                        @input="updateValue"
                        class="w-full px-3 py-2 bg-main border border-gray-700 rounded text-opposite placeholder-opposite/40 focus:outline-none focus:border-accent-blue"
                    />
                </div>
                <div class="col-span-6">
                    <select
                        v-if="field.type === 'boolean'"
                        :test-id="`${testId}-value-${index}`"
                        v-model="field.value"
                        @change="updateValue"
                        class="w-full px-3 py-2 bg-main border border-gray-700 rounded text-opposite focus:outline-none focus:border-accent-blue"
                    >
                        <option value="true">true</option>
                        <option value="false">false</option>
                    </select>
                    <input
                        v-else-if="field.type === 'number'"
                        :test-id="`${testId}-value-${index}`"
                        v-model.number="field.value"
                        type="number"
                        placeholder="Value"
                        @input="updateValue"
                        class="w-full px-3 py-2 bg-main border border-gray-700 rounded text-opposite placeholder-opposite/40 focus:outline-none focus:border-accent-blue"
                    />
                    <input
                        v-else
                        :test-id="`${testId}-value-${index}`"
                        v-model="field.value"
                        type="text"
                        placeholder="Value"
                        @input="updateValue"
                        class="w-full px-3 py-2 bg-main border border-gray-700 rounded text-opposite placeholder-opposite/40 focus:outline-none focus:border-accent-blue"
                    />
                    <select
                        :test-id="`${testId}-type-${index}`"
                        v-model="field.type"
                        @change="onTypeChange(index)"
                        class="w-full px-3 py-1 mt-1 bg-main border border-gray-700 rounded text-opposite text-xs focus:outline-none focus:border-accent-blue"
                    >
                        <option value="string">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                    </select>
                </div>
                <div class="col-span-1 flex items-center justify-center pt-2">
                    <button
                        :test-id="`${testId}-remove-${index}`"
                        type="button"
                        @click="removeField(index)"
                        class="text-accent-red hover:text-accent-red/80"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="error" class="text-accent-red text-sm">
            {{ error }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import AppButton from './AppButton.vue'

interface JsonField {
    key: string
    value: any
    type: 'string' | 'number' | 'boolean'
}

interface Props {
    modelValue?: Record<string, any> | null
    label?: string
    required?: boolean
    testId?: string
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    label: '',
    required: false,
    testId: 'json-editor'
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, any> | null): void
}>()

const fields = ref<JsonField[]>([])
const error = ref('')

// Initialize fields from modelValue
onMounted(() => {
    if (props.modelValue) {
        fields.value = Object.entries(props.modelValue).map(([key, value]) => ({
            key,
            value,
            type: inferType(value)
        }))
    }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        const currentJson = fieldsToJson()
        if (JSON.stringify(currentJson) !== JSON.stringify(newValue)) {
            fields.value = Object.entries(newValue).map(([key, value]) => ({
                key,
                value,
                type: inferType(value)
            }))
        }
    } else if (!newValue || Object.keys(newValue).length === 0) {
        if (fields.value.length > 0) {
            fields.value = []
        }
    }
}, { deep: true })

const inferType = (value: any): 'string' | 'number' | 'boolean' => {
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    return 'string'
}

const addField = () => {
    fields.value.push({
        key: '',
        value: '',
        type: 'string'
    })
    error.value = ''
}

const removeField = (index: number) => {
    fields.value.splice(index, 1)
    updateValue()
}

const onTypeChange = (index: number) => {
    const field = fields.value[index]
    if (field.type === 'boolean') {
        field.value = 'false'
    } else if (field.type === 'number') {
        field.value = 0
    } else {
        field.value = ''
    }
    updateValue()
}

const fieldsToJson = (): Record<string, any> | null => {
    if (fields.value.length === 0) return null

    const result: Record<string, any> = {}
    for (const field of fields.value) {
        if (!field.key.trim()) continue

        if (field.type === 'boolean') {
            result[field.key] = field.value === 'true' || field.value === true
        } else if (field.type === 'number') {
            result[field.key] = Number(field.value)
        } else {
            result[field.key] = field.value
        }
    }

    return Object.keys(result).length > 0 ? result : null
}

const updateValue = () => {
    error.value = ''

    // Check for duplicate keys
    const keys = fields.value.map(f => f.key.trim()).filter(k => k !== '')
    const uniqueKeys = new Set(keys)
    if (keys.length !== uniqueKeys.size) {
        error.value = 'Duplicate keys are not allowed'
        return
    }

    const jsonValue = fieldsToJson()
    emit('update:modelValue', jsonValue)
}
</script>
