<template>
    <div v-if="!props.activate" id="modal" class="bg-white rounded-lg shadow-lg w-full max-w-md"
        test-id="confirm-user-status-modal">
        <div id="modal-header" class="p-6 border-b">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-ban text-neutral-700 text-xl"></i>
                    <h2 class="text-lg">Deactivate User</h2>
                </div>
                <button @click="handleCancel" class="text-neutral-400 hover:text-neutral-600">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
        </div>

        <div id="modal-content" class="p-6">
            <div class="flex items-center gap-4 mb-6">
                <i class="fa-solid fa-user-circle text-neutral-700 text-5xl"></i>
                <div>
                    <h3>{{ userName }}</h3>
                    <p class="text-neutral-600 text-sm">{{ props.user.email }}</p>
                </div>
            </div>

            <div class="space-y-4">
                <p class="text-neutral-700">
                    Are you sure you want to deactivate this user? They will no longer be able to
                    access the system.
                </p>

                <div class="bg-neutral-50 p-4 rounded-md">
                    <label class="flex items-start gap-3">
                        <input v-model="sendEmail" type="checkbox" class="mt-1" />
                        <span class="text-sm text-neutral-600">Send email notification to user about account
                            deactivation</span>
                    </label>
                </div>
            </div>
        </div>

        <div id="modal-footer" class="p-6 border-t bg-neutral-50 rounded-b-lg">
            <div class="flex justify-end gap-3">
                <AppButton @click="handleCancel" buttonStyle="secondary">Cancel</AppButton>
                <AppButton @click="handleDeactivate" buttonStyle="danger" :loading="loading">
                    Confirm Deactivation
                </AppButton>
            </div>
        </div>
    </div>

    <div v-else id="modal" class="bg-white rounded-lg shadow-lg w-full max-w-lg" test-id="confirm-user-status-modal">
        <div id="modal-header" class="p-6 border-b">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-user-check text-neutral-700 text-xl"></i>
                    <h2 class="text-lg">Activate User</h2>
                </div>
                <button @click="handleCancel" class="text-neutral-400 hover:text-neutral-600">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
        </div>

        <div id="modal-content" class="p-6">
            <div class="flex items-center gap-4 mb-6">
                <i class="fa-solid fa-user-circle text-neutral-700 text-5xl"></i>
                <div>
                    <h3 class="text-lg">{{ userName }}</h3>
                    <p class="text-neutral-600">{{ props.user.email }}</p>
                </div>
            </div>

            <div class="bg-neutral-50 rounded-lg p-4 mb-6">
                <div class="flex items-center gap-2 mb-4">
                    <i class="fa-solid fa-circle-info text-neutral-600"></i>
                    <span class="text-neutral-800">User Details</span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-neutral-600 mb-1">Mobile Phone</p>
                        <p class="text-neutral-800">{{ props.user.phone || 'N/A' }}</p>
                    </div>

                    <div>
                        <p class="text-sm text-neutral-600 mb-1">Current Status</p>
                        <span class="px-2 py-1 text-sm rounded-full bg-neutral-200 text-neutral-800">Disabled</span>
                    </div>
                </div>
            </div>

            <p class="text-neutral-600 mb-6">
                Are you sure you want to activate this user? This will restore their access to the
                system.
            </p>
        </div>

        <div id="modal-footer" class="p-6 border-t bg-neutral-50 rounded-b-lg">
            <div class="flex justify-end gap-3">
                <AppButton @click="handleCancel" buttonStyle="secondary">Cancel</AppButton>
                <AppButton @click="handleActivate" buttonStyle="primary" :loading="loading">
                    Confirm Activation
                </AppButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import { apiPut } from '@/util/api'
import { useToast } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import type { User } from './user.interface'
const authStore = useAuthStore()
const props = defineProps<{
    activate: boolean
    user: User
    onSuccess: () => void
    onCancel: () => void
}>()

const toast = useToast()
const loading = ref(false)
const sendEmail = ref(true)

const userName = computed(() => {
    return `${props.user.fname} ${props.user.lname}`
})

const handleActivate = async () => {
    loading.value = true
    try {
        await apiPut(`users/${props.user.id}/activate`, {}, authStore)
        toast.showToast('Success', 'User has been activated successfully', 'success')
        props.onSuccess()
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to activate user. Please try again.',
            'error'
        )
        console.error('Error activating user:', error)
    } finally {
        loading.value = false
    }
}

const handleDeactivate = async () => {
    loading.value = true
    try {
        await apiPut(`users/${props.user.id}/deactivate`, {}, authStore)
        toast.showToast('Success', 'User has been deactivated successfully', 'success')
        props.onSuccess()
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to deactivate user. Please try again.',
            'error'
        )
        console.error('Error deactivating user:', error)
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    props.onCancel()
}
</script>
