<template>
    <div class="space-y-2">
        <label class="block text-sm leading-6 text-opposite" :for="name"
            >{{ label }} <span class="text-red-700" v-if="required">*</span></label
        >
        <div class="relative">
            <Field
                :validateOnChange="true"
                :validateOnInput="true"
                v-slot="{ meta, field }"
                :rules="rules"
                :type="inputType"
                :name="name"
                :id="name"
                :value="value"
                :disabled="disabled"
            >
                <AppInput
                    :type="inputType"
                    v-bind="field"
                    :disabled="disabled"
                    :id="name"
                    :placeholder="placeholder"
                    :hide-icon="true"
                    :error="!meta.valid && meta.touched"
                />
            </Field>
            <ErrorMessage :name="name" class="absolute text-red-600 text-xs top-10 w-full left-0" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ErrorMessage, Field, type RuleExpression } from 'vee-validate'
import AppInput from './AppInput.vue'

const props = withDefaults(
    defineProps<{
        rules?: RuleExpression<any>
        name: string
        placeholder: string
        value?: string
        label: string
        required?: boolean
        type?: 'date' | 'datetime-local'
        disabled?: boolean
    }>(),
    { type: 'date' }
)
const inputType = computed(() => props.type)
</script>
<style scoped>
input[type="date"],
input[type="datetime-local"] {
    color-scheme: dark;
}
</style>