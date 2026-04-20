<template>
    <div id="login-page" class="min-h-screen bg-secondary flex lg:flex-row flex-col items-center justify-center p-4">
        <div class="max-w-xl w-full bg-main rounded-xl shadow-lg flex overflow-hidden text-opposite">
            <!-- Left Section - Image/Illustration -->

            <!-- Right Section - Login Form -->
            <div class="w-full p-8 lg:p-12">
                <div id="login-header" class="text-center mb-8">
                    <div class="flex justify-center mb-4">
                        <img src="@/assets/img/tech-fa-icon.png" alt="Tech Fa Logo" class="h-40" />
                    </div>
                    <h1 class="text-2xl text-opposite -900">Welcome to Tech FA Automation Hub</h1>
                    <p class="text-opposite mt-2">Please enter your details</p>
                </div>

                <Form @submit="handleLogin" id="login-form" class="space-y-6">
                    <div class="space-y-2">
                        <div class="relative">
                            <i
                                class="fa-regular fa-envelope absolute left-3 sm:top-[38px] top-[35px] z-10 text-neutral-400 sm:text-base text-sm"></i>
                            <AppInputForm name="username" label="Email" test-id="login-page-email"
                                placeholder="Enter your email" :rules="(v: any) => {
                                        return !exists(v) || !isEmail(v) ? 'Invalid email' : true
                                    }
                                    " :required="true" :show-icon="true" />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="relative">
                            <i
                                class="fa-solid fa-lock absolute left-3 sm:top-[38px] top-[35px] z-10 text-neutral-400 sm:text-base text-sm"></i>
                            <AppInputForm name="password" label="Password" test-id="login-page-password"
                                placeholder="Enter your password" :rules="(v: any) => {
                                        return !exists(v) ? 'Password is required' : true
                                    }
                                    " :required="true" :show-icon="true" type="password" />
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-sm text-opposite hover:text-opposite/70 cursor-pointer"
                            @click="router.push('/forgot-password')">
                            Forgot password?
                        </span>
                    </div>

                    <AppButton type="submit" :loading="loading" button-style="secondary" full-width
                        test-id="login-page-login-button">
                        <span>Sign in</span>
                    </AppButton>
                </Form>


            </div>
        </div>
    </div>
</template>
<style scoped>
::-webkit-scrollbar {
    display: none;
}

.highlighted-section {
    outline: 2px solid #3f20fb;
    background-color: rgba(63, 32, 251, 0.1);
}

.edit-button {
    position: absolute;
    z-index: 1000;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { apiPostPublic } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/stores/notification'
import { Form } from 'vee-validate'
import AppInputForm from '@/components/AppInputForm.vue'
import { exists, isEmail } from '@/util/util'
import AppButton from '../AppButton.vue'
const toast = useToast()

const backgroundImage = computed(
    () => new URL('@/assets/img/login-bg/bg-5.jpg', import.meta.url).href
)

const backgroundStyle = computed(() => ({
    backgroundImage: `url(${backgroundImage.value})`
}))

const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const handleLogin = async (values: any) => {
    try {
        loading.value = true
        const response = await apiPostPublic<{
            access_token: string
            user: any
        }>('/auth/login', {
            username: values.username,
            password: values.password
        })
        authStore.setLoginState(`Bearer ${response.access_token}`, response.user)
        if (router.currentRoute.value.query.redirect) {
            router.push(`${router.currentRoute.value.query.redirect}`)
        } else {
            router.push('/fleet/dashboard')
        }
    } catch (error: any) {
        toast.showToast(
            'Login error',
            `Login error: ${error.response?.data?.message || error.message}`,
            'error'
        )
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
