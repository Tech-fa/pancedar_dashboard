<template>
    <div class="space-y-1">
        <label class="block text-sm leading-6 text-opposite" :for="props.name">
            {{ props.label }}<span class="text-red-700" v-if="props.required">*</span>
        </label>
        <div class="relative" :class="props.disabled ? 'opacity-50 pointer-events-none' : ''">
            <Field
                :validateOnChange="true"
                :validateOnInput="true"
                v-slot="{ field,meta }"
                :rules="props.rules"
                :name="props.name"
                :id="props.name"
            >
                <SearcheableSelect
                    :values="props.values"
                    :placeholder="props.placeholder"
                    :display="props.display"
                    :error="!meta.valid && meta.touched"
                    :model-value="findOption(props.modelValue ?? field.value)"
                    @update:model-value="(val) => {
                        const nextValue = props.valueKey
                            ? val
                                ? val[props.valueKey as string]
                                : ''
                            : val ?? null
                        field.onChange(nextValue)
                        emit('update:modelValue', nextValue)
                    }"
                />
            </Field>
            <ErrorMessage
                :name="props.name"
                class="absolute text-red-600 text-xs top-full mt-1 w-full left-0"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage, type RuleExpression } from 'vee-validate'
import SearcheableApiSelect2 from './SearcheableApiSelect2.vue'
import SearcheableSelect from './SearcheableSelect.vue';

const props = defineProps<{
    name: string
    label: string
    placeholder: string
    values: Record<string, any>[]
    display: (value: any) => string
    rules?: RuleExpression<any>
    required?: boolean
    disabled?: boolean
    modelValue?: any
    valueKey?: string
    extraAction?: (payload: any) => void
    externalSelect?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>()

const findOption = (current: any) => {
    if (props.valueKey) {
        if (current === undefined || current === null) return null
        return (
            props.values.find(
                (item: Record<string, any>) => item?.[props.valueKey as string] === current
            ) || null
        )
    }

    return current ?? null
}
</script>
