<template>
    <div class="bg-main rounded-lg shadow-lg w-[400px] p-6 border border-main-border">
        <h3 class="text-lg font-medium mb-4 text-opposite" test-id="delete-confirm-title">Confirm Deletion</h3>
        <p class="text-sm text-opposite/70 mb-6">
            Are you sure you want to delete the category "{{ entity?.name }}"? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-4">
            <AppButton 
                type="button" 
                button-style="secondary"
                @click="() => {
                    props.onCancel()
                    dialog.closeDialog()
                }"
                test-id="delete-confirm-no"
            >
                No
            </AppButton>
            <AppButton 
                type="button" 
                button-style="danger" 
                :loading="loading"
                @click="onConfirm"
                test-id="delete-confirm-yes"
            >
                Yes
            </AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'
import { ref } from 'vue'
import type { DocumentType } from '@/util/interfaces'
import { apiDelete } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'

const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog() 

const props = defineProps<{
    entity: DocumentType
    onSuccess: () => void
    onCancel: () => void
}>()

const loading = ref(false)

const onConfirm = async () => {
    if (loading.value) return
    loading.value = true
    try {
        await apiDelete(`/documents/types/${props.entity.id}`, authStore)
        toast.showToast('Success', 'Category deleted successfully', 'success')
        props.onSuccess()
        dialog.closeDialog()
    } catch (error) {
        console.error('Error deleting category:', error)
        toast.showToast('Error', 'Failed to delete category', 'error')
    } finally {
        loading.value = false
    }
}
</script> 