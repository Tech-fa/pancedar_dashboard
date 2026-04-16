<template>
    <div class="bg-main flex items-center justify-center py-10">
        <div class="bg-secondary rounded-lg shadow-xl w-full max-w-lg mx-4 border border-gray-800">
            <div class="flex justify-between items-center p-6 border-b border-gray-800">
                <h3 class="text-lg font-semibold text-opposite">
                    {{ meter ? 'Edit Meter' : 'Add Meter' }}
                </h3>
                <button @click="onCancel" class="text-opposite/60 hover:text-opposite">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <Form @submit="handleSubmit" :initialValues="initialValues" class="p-6 space-y-6">
                <AppInputForm
                    name="name"
                    label="Meter Name"
                    placeholder="Enter meter name"
                    :rules="requiredRule('Meter name is required')"
                    required
                />

                <AppInputForm
                    name="unit"
                    label="Unit"
                    placeholder="Enter unit (e.g. Hours, Cycles)"
                    :rules="requiredRule('Unit is required')"
                    required
                />

                <div class="flex justify-end gap-3 pt-2 border-t border-gray-800">
                    <AppButton buttonStyle="secondary" type="button" @click="onCancel">
                        Cancel
                    </AppButton>
                    <AppButton buttonStyle="primary" type="submit" :loading="isSubmitting">
                        {{ meter ? 'Update Meter' : 'Create Meter' }}
                    </AppButton>
                </div>
            </Form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Form } from 'vee-validate'
import AppButton from '@/components/AppButton.vue'
import AppInputForm from '@/components/AppInputForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { createMeter, updateMeter } from './endpoints'
import type { Meter } from '@/util/interfaces'

const props = defineProps<{
    meter?: Meter
    onCancel: () => void
    onSuccess: () => void
}>()

const authStore = useAuthStore()
const toast = useToast()
const isSubmitting = ref(false)

const initialValues = computed(() => ({
    name: props.meter?.name ?? '',
    unit: props.meter?.unit ?? ''
}))

const requiredRule = (message: string) => (value: string) => (value ? true : message)

const handleSubmit = async (values: any) => {
    if (isSubmitting.value) return
    isSubmitting.value = true

    try {
        if (props.meter) {
            await updateMeter(props.meter.id, values, authStore)
            toast.showToast('Meter updated', 'Meter updated successfully', 'success')
        } else {
            await createMeter(values, authStore)
            toast.showToast('Meter created', 'Meter created successfully', 'success')
        }
        props.onSuccess()
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Unable to save meter. Please try again.',
            'error'
        )
    } finally {
        isSubmitting.value = false
    }
}

const onCancel = () => {
    if (!isSubmitting.value) {
        props.onCancel()
    }
}
</script>

<style scoped></style>
