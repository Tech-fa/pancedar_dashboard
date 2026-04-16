<template>
    <div class="bg-secondary rounded-lg shadow-xl w-full max-w-2xl">
        <div class="flex justify-between items-center p-6 border-b border-gray-800">
            <h3 class="text-lg font-semibold text-opposite">
                {{ reading ? 'Edit Meter Reading' : 'Add Meter Reading' }}
            </h3>
            <button @click="onCancel" class="text-opposite/60 hover:text-opposite">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>

        <Form @submit="handleSubmit" :initialValues="initialValues" class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectForm
                    name="meterId"
                    label="Usage"
                    placeholder="Select meter"
                    :values="meters"
                    :display="(meter) => meter?.name || ''"
                    :rules="requiredRule('Meter is required')"
                    required
                    valueKey="id"
                    :disabled="meters.length === 0"
                />

                <AppInputForm
                    name="value"
                    label="Reading Value"
                    placeholder="Enter reading value"
                    type="number"
                    :rules="requiredRule('Reading value is required')"
                    required
                />
            </div>

            <AppInputForm
                name="timestamp"
                label="Reading Timestamp"
                placeholder="Select timestamp"
                type="datetime-local"
                :rules="requiredRule('Timestamp is required')"
                required
            />

            <p v-if="meters.length === 0" class="text-sm text-accent-red">
                No meters available. Please create a meter before adding a reading.
            </p>

            <div class="flex justify-end gap-3 pt-2 border-t border-gray-800">
                <AppButton buttonStyle="secondary" type="button" @click="onCancel">
                    Cancel
                </AppButton>
                <AppButton
                    buttonStyle="primary"
                    type="submit"
                    :disabled="meters.length === 0"
                    :loading="isSubmitting"
                >
                    {{ reading ? 'Update Reading' : 'Create Reading' }}
                </AppButton>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Form } from 'vee-validate'
import AppButton from '@/components/AppButton.vue'
import AppInputForm from '@/components/AppInputForm.vue'
import SelectForm from '@/components/SelectForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { createMeterReading, updateMeterReading } from './endpoints'
import type { Meter, MeterReading } from '@/util/interfaces'
import { formatDateToInputWithTime } from '@/util/util'

const props = defineProps<{
    assetId: string
    meters: Meter[]
    reading?: MeterReading
    onCancel: () => void
    onSuccess: () => void
}>()

const authStore = useAuthStore()
const toast = useToast()
const isSubmitting = ref(false)

const initialValues = computed(() => ({
    meterId: props.reading?.meterId ?? undefined,
    value: props.reading ? String(props.reading.value) : undefined,
    timestamp: props.reading ? formatDateToInputWithTime(props.reading.timestamp) : undefined
}))

const requiredRule = (message: string) => (value: string) => (value ? true : message)

const handleSubmit = async (values: any) => {
    if (isSubmitting.value) return
    isSubmitting.value = true

    const payload = {
        meterId: values.meterId,
        value: Number(values.value),
        timestamp: new Date(values.timestamp).toISOString()
    }

    if (!Number.isFinite(payload.value)) {
        toast.showToast('Validation', 'Reading value must be a valid number', 'error')
        isSubmitting.value = false
        return
    }

    try {
        if (props.reading) {
            await updateMeterReading(props.assetId, props.reading.id, payload, authStore)
            toast.showToast('Reading updated', 'Meter reading updated successfully', 'success')
        } else {
            await createMeterReading(props.assetId, payload, authStore)
            toast.showToast('Reading created', 'Meter reading created successfully', 'success')
        }
        props.onSuccess()
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Unable to save meter reading. Please try again.',
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

<style >
input[type='datetime-local'] {
    color-scheme: dark;
}
</style>
