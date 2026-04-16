<template>
    <div
        id="registration-page"
        class="min-h-screen bg-secondary flex lg:flex-row flex-col items-center justify-center p-4"
    >
        <div
            class="max-w-xl w-full bg-main rounded-xl shadow-lg flex overflow-hidden text-opposite"
        >
            <div class="w-full p-8 lg:p-12">
                <div id="registration-header" class="text-center mb-8">
                    <div class="flex justify-center mb-4">
                        <img src="@/assets/img/logo-no-bg3.png" alt="Vigelon Logo" class="h-40" />
                    </div>
                    <h1 class="text-2xl text-opposite">Create your account</h1>
                    <p class="text-opposite mt-2">Join us today and get started</p>
                </div>

                <Form @submit="onSubmit" id="registration-form" class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <div class="relative">
                                <i
                                    class="fa-regular fa-user absolute left-3 sm:top-[38px] top-[35px] z-10 text-neutral-400 sm:text-base text-sm"
                                ></i>
                                <AppInputForm
                                    name="fname"
                                    label="First Name"
                                    placeholder="First name"
                                    :rules="
                                        (v: any) => {
                                            return !exists(v) ? 'First name is required' : true
                                        }
                                    "
                                    :required="true"
                                    :show-icon="true"
                                />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="relative">
                                <i
                                    class="fa-regular fa-user absolute left-3 sm:top-[38px] top-[35px] z-10 text-neutral-400 sm:text-base text-sm"
                                ></i>
                                <AppInputForm
                                    name="lname"
                                    label="Last Name"
                                    placeholder="Last name"
                                    :rules="
                                        (v: any) => {
                                            return !exists(v) ? 'Last name is required' : true
                                        }
                                    "
                                    :required="true"
                                    :show-icon="true"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="relative">
                            <i
                                class="fa-solid fa-building absolute left-3 sm:top-[38px] top-[35px] z-10 text-neutral-400 sm:text-base text-sm"
                            ></i>
                            <AppInputForm
                                name="companyName"
                                label="Business Name"
                                placeholder="Enter your business name"
                                :rules="
                                    (v: any) => {
                                        return !exists(v) ? 'Business name is required' : true
                                    }
                                "
                                :required="true"
                                :show-icon="true"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="relative">
                            <i
                                class="fa-regular fa-envelope absolute left-3 sm:top-[38px] top-[35px] z-10 text-neutral-400 sm:text-base text-sm"
                            ></i>
                            <AppInputForm
                                name="email"
                                label="Email"
                                placeholder="Enter your email"
                                :rules="
                                    (v: any) => {
                                        return !exists(v) || !isEmail(v) ? 'Invalid email' : true
                                    }
                                "
                                :required="true"
                                :show-icon="true"
                            />
                        </div>
                    </div>

                 

                 
<!-- 
                    <div class="flex items-start">
                        <input
                            type="checkbox"
                            id="terms"
                            class="mt-1 h-4 w-4 rounded border-neutral-300"
                            v-model="terms"
                        />
                        <label for="terms" class="ml-2 text-sm text-opposite"
                            >I agree to the
                            <span class="hover:underline cursor-pointer">Terms of Service</span>
                            and
                            <span class="hover:underline cursor-pointer">Privacy Policy</span>
                        </label>
                    </div> -->

                    <AppButton
                        type="submit"
                        :loading="isSubmitting"
                        button-style="secondary"
                        full-width
                    >
                        <span>Create Account</span>
                    </AppButton>
                </Form>

                <div class="mt-6 text-center">
                    <p class="text-sm text-opposite">
                        Already have an account?
                        <span
                            @click="router.push('/login')"
                            class="hover:underline cursor-pointer"
                            >Sign in</span
                        >
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { exists, isEmail } from '@/util/util'
import { Form } from 'vee-validate'
import AppInputForm from '@/components/AppInputForm.vue'
import { apiPostPublic } from '@/util/api'
import { useRouter } from 'vue-router'
import { useToast } from '@/stores/notification'
import AppButton from '../AppButton.vue'

const toast = useToast()
const router = useRouter()
const isSubmitting = ref(false)
const terms = ref(true)

const onSubmit = (values: any) => {
    if (!terms.value) {
        toast.showToast(
            'Please agree to the terms and conditions',
            'Please agree to the terms and conditions',
            'error'
        )
        return
    }
    isSubmitting.value = true

    apiPostPublic('/auth/register', values)
        .then((res) => {
            window.localStorage.setItem('registerData', 'done')
            router.push('/thank-you')
        })
        .catch((err) => {
            toast.showToast(
                'Something went wrong',
                err.response?.data?.message || 'Something went wrong',
                'error'
            )
        })
        .finally(() => {
            isSubmitting.value = false
        })
}
</script>

<style scoped>
::-webkit-scrollbar {
    display: none;
}
</style>
