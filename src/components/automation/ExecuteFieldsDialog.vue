<template>
    <div class="bg-main rounded-lg shadow-lg w-full max-w-md">
        <div class="p-6 border-b">
            <div class="flex items-center justify-between">
                <h2 class="text-lg text-opposite">Fill Required Fields</h2>
                <button @click="handleCancel" class="text-opposite hover:text-opposite">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <p class="text-sm text-opposite/50 mt-1">
                This action requires the following fields before execution.
            </p>
        </div>

        <div class="p-6 space-y-4">
            <div v-for="variable in variables" :key="variable">
                <label class="block text-xs text-opposite/60 mb-1">
                    {{ formatLabel(variable) }}
                    <span class="text-red-400 ml-0.5">*</span>
                </label>
                <input
                    v-model="fieldValues[variable]"
                    type="text"
                    :placeholder="formatLabel(variable)"
                    :class="[INPUT_CLASS, 'w-full text-sm']"
                />
            </div>
        </div>

        <div class="p-6 border-t rounded-b-lg">
            <div class="flex justify-end gap-3">
                <AppButton @click="handleCancel" buttonStyle="secondary">Cancel</AppButton>
                <AppButton @click="handleSubmit" buttonStyle="primary" :loading="loading">
                    Execute
                </AppButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppButton from '@/components/AppButton.vue'
import { INPUT_CLASS } from '@/components/contants'
import { useToast } from '@/stores/notification'

const toast = useToast()

const props = defineProps<{
    variables: string[]
    onConfirm: (fields: Record<string, string>) => Promise<void>
    onCancel: () => void
}>()

const loading = ref(false)
const fieldValues = reactive<Record<string, string>>(
    Object.fromEntries(props.variables.map(v => [v, '']))
)

const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^\w/, c => c.toUpperCase()).trim()

const handleCancel = () => {
    props.onCancel()
}

const handleSubmit = async () => {
    const missing = props.variables.filter(v => !fieldValues[v]?.trim())
    if (missing.length > 0) {
        toast.showToast('Error', `Please fill in: ${missing.map(formatLabel).join(', ')}`, 'error')
        return
    }
    loading.value = true
    try {
        await props.onConfirm({ ...fieldValues })
    } finally {
        loading.value = false
    }
}
</script>
