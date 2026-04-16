<template>
    <div
        id="password-reset-page"
        class="min-h-screen bg-neutral-50 flex items-center justify-center p-4"
    >
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div id="reset-header" class="text-center mb-8">
                <div class="flex justify-center mb-4">
                    <i class="fa-solid fa-key text-4xl text-neutral-700"></i>
                </div>
                <h1 class="text-2xl text-neutral-900">Reset your password</h1>
                <p class="text-neutral-500 mt-2">
                    Enter your email to receive a password reset link
                </p>
            </div>

            <form @submit.prevent="handleSubmit" id="reset-form" class="space-y-6">
                <div class="space-y-2">
                    <label for="reset-email" class="block text-sm text-neutral-700"
                        >Email address</label
                    >
                    <div class="relative">
                        <i
                            class="fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        ></i>
                        <AppInput
                            type="email"
                            v-model="email"
                            id="reset-email"
                            class="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    class="w-full bg-neutral-900 text-white py-2 px-4 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center"
                >
                    <Spinner v-if="loading" />
                    <span v-else>Send reset code</span>
                </button>
            </form>

            <div class="mt-6">
                <div id="info-box" class="bg-neutral-100 border border-neutral-200 rounded-lg p-4">
                    <div class="flex items-start space-x-3">
                        <i class="fa-solid fa-circle-info text-neutral-600 mt-1"></i>
                        <div class="text-sm text-neutral-600">
                            <p>
                                You'll receive an email with a code to reset your password. The code
                                will expire in 10 minutes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-6 text-center">
                <p class="text-sm text-neutral-600">
                    Remember your password?
                    <span
                        class="text-neutral-900 hover:underline cursor-pointer"
                        @click="router.push('/login')"
                        >Back to login</span
                    >
                </p>
            </div>

            <div id="support-section" class="mt-8 pt-6 border-t border-neutral-200">
                <div class="text-center">
                    <p class="text-sm text-neutral-500">Need help?</p>
                    <div class="mt-2 space-x-4">
                        <span class="text-sm text-neutral-700 hover:underline cursor-pointer"
                            >Contact Support</span
                        >
                        <span class="text-sm text-neutral-700 hover:underline cursor-pointer"
                            >FAQ</span
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppInput from '../AppInput.vue'
import { useRouter } from 'vue-router'
import { apiGetPublic } from '@/util/api'
import Spinner from '../Spinner.vue'
import { useToast } from '@/stores/notification'
const toast = useToast()

const email = ref('')
const router = useRouter()
const loading = ref(false)
const handleSubmit = async () => {
    loading.value = true
    apiGetPublic(`/auth/code?email=${email.value}`)
        .then((res) => {
            window.localStorage.setItem('reset_email', email.value)
            router.push('/reset-password')
        })
        .catch((err) => {
            toast.showToast('User not found', 'User with this email does not exist', 'error')
        })
        .finally(() => {
            loading.value = false
        })
}
</script>
