<template>
    <div class="bg-main rounded-lg shadow-lg w-full max-w-lg border-2">
        <div class="p-6 border-b">
            <div class="flex items-center justify-between">
                <h2 class="text-lg text-opposite">Run {{ workflowName }}</h2>
                <button type="button" @click="onCancel" class="text-opposite hover:text-opposite/80">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <p class="text-sm text-opposite/60 mt-2">
                Fill in the details below to start this workflow run.
            </p>
        </div>

        <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <WorkflowFieldInput
                v-for="field in fields"
                :key="fieldKey(field)"
                :field="normalizeWorkflowFieldForInput(field)"
                v-model="fieldValues[fieldKey(field)]"
            />
        </div>

        <div class="p-6 border-t rounded-b-lg">
            <div class="flex justify-end gap-3">
                <AppButton buttonStyle="secondary" @click="onCancel">Cancel</AppButton>
                <AppButton buttonStyle="primary" :loading="loading" @click="handleSubmit">
                    Run Workflow
                </AppButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppButton from '@/components/AppButton.vue'
import WorkflowFieldInput from '@/components/automation/WorkflowFieldInput.vue'
import type { WorkflowFieldConfig } from '@/components/automation/workflow.interface'
import {
    defaultValueForWorkflowField,
    fieldKey,
    isRequiredWorkflowFieldMissing,
    normalizeWorkflowFieldForInput,
} from '@/components/automation/workflowFieldHelpers'
import { useToast } from '@/stores/notification'

const props = defineProps<{
    workflowName: string
    fields: WorkflowFieldConfig[]
    onConfirm: (values: Record<string, unknown>) => void | Promise<void>
    onCancel: () => void
}>()

const toast = useToast()
const loading = ref(false)

const fieldValues = reactive<Record<string, unknown>>(
    Object.fromEntries(
        props.fields.map((field) => [fieldKey(field), defaultValueForWorkflowField(field)]),
    ),
)

function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {}
    for (const field of props.fields) {
        const key = fieldKey(field)
        const value = fieldValues[key]
        if (value === null || value === undefined || value === '') {
            if (!field.required) continue
        }
        payload[key] = value
    }
    return payload
}

const handleSubmit = async () => {
    for (const field of props.fields) {
        const value = fieldValues[fieldKey(field)]
        if (isRequiredWorkflowFieldMissing(field, value)) {
            toast.showToast('Error', `"${field.label}" is required`, 'error')
            return
        }
    }

    loading.value = true
    try {
        await props.onConfirm(buildPayload())
    } finally {
        loading.value = false
    }
}
</script>
