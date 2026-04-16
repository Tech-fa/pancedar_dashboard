<template>
    <div class="space-y-2">
        <label class="block text-sm leading-6 text-opposite" :for="props.name">
            {{ props.label }}<span class="text-red-700" v-if="props.required">*</span>
        </label>
        <div class="relative" :class="props.disabled ? 'opacity-50 pointer-events-none' : ''">
            <Field :validateOnChange="true" :validateOnInput="true" v-slot="{ field, meta }" :rules="props.rules"
                :name="props.name" :id="props.name">
                <SearcheableMultiSelect v-model="selected" :error="!meta.valid && meta.touched" :results="props.values"
                    :placeholder="props.placeholder" :display="props.display"
                    @update:modelValue="() => field.onChange(selected.map(getItemKey))" />
            </Field>
            <ErrorMessage :name="props.name" class="absolute text-red-600 text-xs top-full mt-1 w-full left-0" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage, type RuleExpression } from 'vee-validate'
import SearcheableMultiSelect from './SearcheableMultiSelect.vue'

const props = defineProps<{
    name: string
    label: string
    placeholder: string
    values: any[]
    display: (value: any) => string
    rules?: RuleExpression<any>
    required?: boolean
    disabled?: boolean
    valueKey?: string
}>()

const selected = defineModel<any[]>('modelValue', { default: () => [] })

const getItemKey = (item: any) => props.valueKey ? item[props.valueKey] : item.id
</script>
