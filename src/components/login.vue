<template>
    <div
        class="min-h-screen flex items-center justify-center bg-cover bg-center"
        :style="backgroundStyle"
    >
        <div class="w-full max-w-md px-4">
            <div class="bg-black bg-opacity-50 rounded-lg shadow-xl p-8">
                <!-- Logo -->

                <!-- Login Form -->
                <form @submit.prevent="handleLogin" class="space-y-6">
                    <div class="space-y-4">
                        <!-- Email Input -->
                        <div>
                            <label class="sr-only" for="email">Email</label>
                            <input
                                id="email"
                                v-model="loginForm.username"
                                type="email"
                                placeholder="Email"
                                :class="`${INPUT_CLASS}`"
                                required
                            />
                        </div>

                        <!-- Password Input -->
                        <div>
                            <label class="sr-only" for="password">Password</label>
                            <input
                                id="password"
                                v-model="loginForm.password"
                                type="password"
                                placeholder="Password"
                                :class="`${INPUT_CLASS}`"
                                required
                            />
                        </div>
                    </div>
                    <div v-if="errorText" class="text-red-200">{{ errorText }}</div>
                    <button
                        type="submit"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        :disabled="loading"
                    >
                        <span v-if="!loading">LOGIN</span>
                        <span v-else>Logging In...</span>
                    </button>
                </form>

                <!-- Incident Report Button -->
                <div class="mt-6">
                    <button
                        @click="handleIncidentReport"
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        :disabled="loading"
                    >
                        Report an Incident/Complaint
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { INPUT_CLASS } from '@/components/contants'
import { apiPostPublic } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const backgroundImage = computed(
    () => new URL('@/assets/img/login-bg/bg-5.jpg', import.meta.url).href
)

const backgroundStyle = computed(() => ({
    backgroundImage: `url(${backgroundImage.value})`
}))

const loginForm = ref({
    username: '',
    password: ''
})

const loading = ref(false)
const errorText = ref('')
const router = useRouter()
const authStore = useAuthStore()
const handleLogin = async () => {
    try {
        loading.value = true
        const response = await apiPostPublic<{
            access_token: string
            user: any
        }>('/auth/login', loginForm.value)
        authStore.setLoginState(`Bearer ${response.access_token}`, response.user)
        router.push('/dashboard')
    } catch (error: any) {
        errorText.value = `Login error: ${error.response?.data?.message || error.message}`
    } finally {
        loading.value = false
    }
}

const handleIncidentReport = async () => {
    try {
        loading.value = true
        const response = await axios.post('/api/incidents/report')

        if (response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl
        }
    } catch (error) {
        console.error('Incident report error:', error)
        alert('Failed to start incident report. Please try again.')
    } finally {
        loading.value = false
    }
}
</script>

<style>
/* Smooth transitions for form elements */
input {
    transition: all 0.3s ease;
}

/* Custom focus styles */
input:focus {
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}
</style>
