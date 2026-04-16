<template>
    <div id="modal" class="bg-main rounded-lg shadow-lg w-full max-w-md border-2 ">
        <div id="modal-header" class="p-6 border-b ">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 ">
                    <h2 class="text-lg text-opposite">Confirm your action</h2>
                </div>
                <button @click="onCancel" class="text-opposite hover:text-opposite">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
        </div>

        <div id="modal-content" class="p-6">
            <div class="flex items-center gap-4 mb-6">
                <div>
                    <p class="text-opposite">{{ message }}</p>
                </div>
            </div>
        </div>
        <div id="modal-footer" class="p-6 border-t  rounded-b-lg">
            <div class="flex justify-end gap-3">
                <AppButton @click="onCancel" buttonStyle="secondary" test-id="confirm-dialog-cancel">Cancel</AppButton>
                <AppButton @click="handleConfirm" buttonStyle="primary" :loading="loading" test-id="confirm-delete-button">
                    Confirm
                </AppButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppButton from './AppButton.vue';
const loading = ref(false)

const props = defineProps<{
    message: string
    onConfirm: () => void
    onCancel: () => void
}>()
const handleConfirm = async () => {
    loading.value = true
    await props.onConfirm()
}

</script>
