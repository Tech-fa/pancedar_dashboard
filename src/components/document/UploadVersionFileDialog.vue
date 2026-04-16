<template>
    <div class="flex items-center justify-center z-50" @click.self="onCancel">
        <div class="bg-main rounded-lg p-6 max-w-md w-full mx-4 border border-main-border">
            <h2 class="text-xl font-bold mb-4">
                Upload File to Version {{ version?.versionNumber }}
            </h2>

            <div class="mb-4">
                <p class="text-sm text-opposite/70 mb-4">
                    Upload a file for version {{ version?.versionNumber }}. This file will be
                    associated with this version.
                </p>

                <FileUploader v-model="file" inputId="version-file-upload" :accept="'*/*'" />
                <div class="my-4">
                    <AppInput
                        v-model="changes"
                        placeholder="Changes"
                        :disabled="loading"
                        :hide-icon="true"
                    />
                </div>
            </div>

            <div class="flex gap-2 justify-end">
                <AppButton buttonStyle="secondary" @click="onCancel" :disabled="loading">
                    Cancel
                </AppButton>
                <AppButton
                    buttonStyle="primary"
                    @click="handleUpload"
                    :loading="loading"
                    :disabled="!file || loading"
                    test-id="upload-version-file-button"
                >
                    Upload File
                </AppButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '../AppButton.vue'
import FileUploader from '../FileUploader.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { apiPostFormData } from '@/util/api'
import AppInput from '../AppInput.vue'

const props = defineProps<{
    version: {
        id: number
        versionNumber: number
        changes?: string
    }
    documentId: string
    onConfirm: () => void
    onCancel: () => void
}>()

const authStore = useAuthStore()
const toast = useToast()
const file = ref<File | null>(null)
const loading = ref(false)
const changes = ref<string>('')
const handleUpload = async () => {
    if (!file.value) {
        toast.showToast('Error', 'Please select a file', 'error')
        return
    }

    loading.value = true
    try {
        const formData = new FormData()
        formData.append('file', file.value)
        formData.append('changes', changes.value)

        await apiPostFormData(
            `/documents/${props.documentId}/versions/${props.version.id}/upload-file`,
            formData,
            authStore
        )

        toast.showToast('Success', 'File uploaded successfully', 'success')
        props.onConfirm()
    } catch (error) {
        console.error('Error uploading file:', error)
        toast.showToast('Error', 'Failed to upload file', 'error')
    } finally {
        loading.value = false
    }
}
</script>
