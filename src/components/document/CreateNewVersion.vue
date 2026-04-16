<template>
    <div class="bg-secondary border-2 rounded-lg shadow-lg w-full max-w-xl" test-id="create-new-version-modal">
        <div class="p-6 border-b flex items-center justify-between" test-id="create-new-version-header">
            <div class="flex items-center gap-3" test-id="create-new-version-title">
                <i class="fa-solid fa-file-circle-plus text-opposite text-xl"></i>
                <h2 class="text-lg font-semibold text-opposite">Create New Version</h2>
            </div>
            <button @click="handleCancel" class="text-opposite hover:text-opposite-secondary" test-id="create-new-version-close-button">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>

        <form class="p-6 space-y-6" @submit.prevent="handleSubmit" test-id="create-new-version-form">
            <div class="space-y-2" test-id="upload-file-section">
                <label class="block text-sm font-medium text-opposite" test-id="upload-file-label">Upload File</label>
                <FileUploader
                    v-model="file"
                    inputId="create-version-file"
                    :maxSizeMB="15"
                    :accept="'*/*'"
                />
                <p class="text-xs text-opposite-secondary" test-id="upload-file-info">Maximum size 15MB. Accepted formats: PDF, Word, Excel, PowerPoint.</p>
            </div>

            <div class="space-y-2" test-id="summary-of-changes-section">
                <label class="block text-sm font-medium text-opposite" for="change-summary" test-id="summary-of-changes-label">Summary of Changes</label>
                <AppInput
                    id="change-summary"
                    :hide-icon="true"
                    v-model="changes"
                    placeholder="Briefly describe the updates in this version"
                    :disabled="loading"
                    test-id="summary-of-changes-input"
                />
            </div>

            <div class="border-t pt-4 flex justify-end gap-3" test-id="create-new-version-actions">
                <AppButton type="button" buttonStyle="secondary" @click="handleCancel" :disabled="loading" test-id="create-new-version-cancel-button">
                    Cancel
                </AppButton>
                <AppButton type="submit" buttonStyle="primary" :disabled="!file || loading" :loading="loading" test-id="create-new-version-submit-button">
                    <template v-if="!loading">
                        <i class="fa-solid fa-floppy-disk mr-2"></i>
                        Create Version
                    </template>
                    <template v-else>
                        Creating...
                    </template>
                </AppButton>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '../AppButton.vue'
import FileUploader from '../FileUploader.vue'
import AppInput from '../AppInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { apiPostFormData } from '@/util/api'

const props = defineProps<{
    documentId: string
    onConfirm: () => void
    onCancel: () => void
}>()

const authStore = useAuthStore()
const toast = useToast()

const file = ref<File | null>(null)
const changes = ref('')
const loading = ref(false)

const handleCancel = () => {
    if (!loading.value) {
        props.onCancel()
    }
}

const handleSubmit = async () => {
    if (!file.value) {
        toast.showToast('Error', 'Please select a file before creating a version', 'error')
        return
    }

    loading.value = true
    try {
        const formData = new FormData()
        formData.append('file', file.value)
        if (changes.value.trim()) {
            formData.append('changes', changes.value.trim())
        }

        await apiPostFormData(`/documents/${props.documentId}/versions`, formData, authStore)
        props.onConfirm()
    } catch (error: any) {
        console.error('Failed to create document version', error)
        toast.showToast('Error', error.response?.data?.message || 'Could not create the new version. Please try again.', 'error')
    } finally {
        loading.value = false
    }
}

</script>
