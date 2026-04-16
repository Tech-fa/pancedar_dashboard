<template>
    <div class="space-y-2 flex flex-col justify-between">
        <label class="block text-sm text-opposite" :for="name"
            >{{ label }} <span class="text-red-700" v-if="required">*</span></label
        >
        <div class="relative">
            <Field
                :validateOnChange="true"
                :validateOnInput="true"
                :validateOnBlur="!ignoreBlur"
                v-slot="{ meta, field }"
                :rules="rules"
                :type="type || 'text'"
                :name="name"
                :id="name"
                :value="value"
                :disabled="disabled"
            >
                <AppInput
                    :hide-icon="!showIcon"
                    :type="type || 'text'"
                    v-bind="field"
                    :disabled="disabled"
                    :id="name"
                    :placeholder="placeholder"
                    :error="!props.hideBorderError && !meta.valid && meta.touched"
                    :test-id="testID"
                    :min="min"
                    :max="max"
                />
            </Field>
            <ErrorMessage 
                :name="name" 
                class="absolute text-red-600 text-xs top-10 w-full left-0" 
                :test-id="`${name}-error`"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ErrorMessage, Field, type RuleExpression } from 'vee-validate'
import AppInput from './AppInput.vue'


const props = defineProps<{
    rules?: RuleExpression<any>
    name: string
    placeholder: string
    value?: any
    label: string
    required?: boolean
    type?: string
    disabled?: boolean
    ignoreBlur?: boolean
    hideBorderError?: boolean
    showIcon?: boolean
    testID?: string
    min?: string
    max?: string
}>()
</script>
<style >
input {
    color-scheme: dark;
}

</style>