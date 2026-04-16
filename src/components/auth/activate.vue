<template>
    <div
        id="password-reset-code-page"
        class="min-h-screen bg-neutral-50 flex items-center justify-center p-4"
    >
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div id="reset-code-header" class="text-center mb-8">
                <div class="flex justify-center mb-4">
                    <i class="fa-solid fa-shield-halved text-4xl text-neutral-700"></i>
                </div>
                <h1 class="text-2xl text-neutral-900">Activate your account</h1>
                <p class="text-neutral-500 mt-2">
                    Choose a password to activate your account and login to your account.
                </p>
            </div>

            <form @submit.prevent="handleSubmit" id="reset-code-form" class="space-y-6">
                <div class="space-y-2">
                    <label for="new-password" class="block text-sm text-neutral-700"
                        >Password</label
                    >
                    <div class="relative">
                        <i
                            class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        ></i>
                        <AppInput
                            type="password"
                            v-model="newPassword"
                            id="new-password"
                            placeholder="Enter new password"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="confirm-password" class="block text-sm text-neutral-700"
                        >Confirm password</label
                    >
                    <div class="relative">
                        <i
                            class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        ></i>
                        <AppInput
                            type="password"
                            v-model="confirmPassword"
                            id="confirm-password"
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    class="w-full bg-neutral-900 text-white py-2 px-4 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center"
                >
                    <Spinner v-if="loading" />
                    <span v-else>Activate account</span>
                </button>
            </form>

            <div id="password-requirements" class="mt-6">
                <div class="bg-neutral-100 border border-neutral-200 rounded-lg p-4">
                    <p class="text-sm text-neutral-700 mb-2">Password requirements:</p>
                    <ul class="text-sm text-neutral-600 space-y-1">
                        <li class="flex items-center">
                            <XMarkIcon v-if="newPassword.length < 8" class="w-4 h-4 mr-2" />
                            <CheckCircleIcon v-else class="w-4 h-4 mr-2 text-green-600" />
                            At least 8 characters
                        </li>
                        <li class="flex items-center">
                            <XMarkIcon v-if="!newPassword.match(/[A-Z]/i)" class="w-4 h-4 mr-2" />
                            <CheckCircleIcon v-else class="w-4 h-4 mr-2 text-green-600" />
                            One uppercase letter
                        </li>
                        <li class="flex items-center">
                            <XMarkIcon v-if="!newPassword.match(/[0-9]/i)" class="w-4 h-4 mr-2" />
                            <CheckCircleIcon v-else class="w-4 h-4 mr-2 text-green-600" />
                            One number
                        </li>
                        <li class="flex items-center">
                            <XMarkIcon
                                v-if="!newPassword.match(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/i)"
                                class="w-4 h-4 mr-2"
                            />
                            <CheckCircleIcon v-else class="w-4 h-4 mr-2 text-green-600" />
                            One special character
                        </li>
                    </ul>
                </div>
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
import { onMounted, ref, watch } from 'vue'
import AppInput from '../AppInput.vue'
import { apiPostPublic } from '@/util/api'
import { useRouter, useRoute } from 'vue-router'
import Spinner from '../Spinner.vue'
import { XMarkIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useToast } from '@/stores/notification'

const router = useRouter()
const route = useRoute()
const code = route.query.code
const email = route.query.email
const newPassword = ref('')
const confirmPassword = ref('')


const loading = ref(false)
const loadingResend = ref(false)
const error = ref('')
const toast = useToast()
onMounted(() => {
    if (!code || !email) {
        router.push('/login')
    }
})

const handleSubmit = () => {
    loading.value = true
    if (newPassword.value !== confirmPassword.value) {
        toast.showToast('Password mismatch', 'Please check your password and try again', 'error')
        loading.value = false
        return
    }
    if (newPassword.value.length < 8 || !newPassword.value.match(/[A-Z]/i) || !newPassword.value.match(/[0-9]/i) || !newPassword.value.match(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/i)) { 
        toast.showToast('Password requirements', 'Please check your password and try again', 'error')
        loading.value = false
        return
    }
    apiPostPublic('/auth/activate', {
        code,
        email,
        password: newPassword.value
    })
        .then((res) => {
            toast.showToast('Activation successful', 'Your account has been activated', 'success')
            router.push('/login')
        })
        .catch((err) => {
            toast.showToast(
                'Activation failed',
                'Invalid or expired activation link, please contact your administrator',
                'error'
            )
        })
        .finally(() => {
            loading.value = false
        })
}
</script>
