<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums
            :crumbs="[
                {
                    name: 'Profile',
                    path: '/profile',
                    icon: 'fa-solid fa-user'
                }
            ]"
        />

        <div
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center"
            v-if="!profile?.fname"
        >
            <Spinner width="5" />
        </div>
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" v-else>
            <div class="bg-secondary shadow rounded-lg p-6">
                <div class="flex items-center space-x-4 mb-6">
                    <div
                        class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                        <i class="fa-solid fa-user text-3xl text-gray-500"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">
                            {{ profile?.fname }} {{ profile?.lname }}
                        </h1>
                    </div>
                </div>

                <Tabs v-if="isPilot" :tabs="['Profile', 'Documents']" v-model="tab" />

                <Form @submit="updateProfile" :class="tab === 0 ? 'space-y-6' : 'hidden'">
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <AppInputForm
                            name="fname"
                            label="First Name"
                            placeholder="Enter first name"
                            :value="profile?.fname"
                            :required="true"
                        />
                        <AppInputForm
                            name="lname"
                            label="Last Name"
                            placeholder="Enter last name"
                            :value="profile?.lname"
                            :required="true"
                        />
                        <AppInputForm
                            name="email"
                            label="Email Address"
                            placeholder="Enter email address"
                            :value="profile?.email"
                            :disabled="true"
                            type="email"
                        />
                        <AppInputForm
                            name="phone"
                            label="Phone"
                            placeholder="Enter phone"
                            :value="profile?.phone"
                            :required="true"
                            type="tel"
                        />

                    </div>

                    <div class="flex justify-end">
                        <AppButton buttonStyle="primary" type="submit" :loading="isSubmitting">
                            Save Changes
                        </AppButton>
                    </div>
                </Form>

                <UserDocuments v-if="isPilot && tab === 1" :userId="authStore.state.userDetails.id" />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Form } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'
import BreadCrums from '@/components/breadCrums.vue'
import { apiGet, apiPut } from '@/util/api'
import AppInputForm from '@/components/AppInputForm.vue'
import AppButton from '@/components/AppButton.vue'
import { useToast } from '@/stores/notification'
import type { User } from '@/util/interfaces'
import Spinner from '../Spinner.vue'
import Tabs from '@/components/Tabs.vue'
import UserDocuments from '@/components/admin/users/UserDocuments.vue'

const authStore = useAuthStore()
const toast = useToast()
const isSubmitting = ref(false)
const isLoading = ref(false)
const profile = ref<User>()
const isPilot = ref(false)
const tab = ref(0)

const loadProfile = async () => {
    isLoading.value = true
    try {
        const response = await apiGet<User>(`/users/profile`, authStore)
        profile.value = response
        isPilot.value = response.userType === 'pilot'
    } catch (error: any) {
        toast.showToast(
            'Error loading profile',
            error?.response?.data?.message || 'Failed to load profile data',
            'error'
        )
    } finally {
        isLoading.value = false
    }
}

const updateProfile = async (values: any) => {
    isSubmitting.value = true
    try {
        const response = await apiPut<User>(`/users`, { ...profile.value, ...values }, authStore)
        toast.showToast('Success', 'Profile updated successfully', 'success')
    } catch (error: any) {
        toast.showToast(
            'Error updating profile',
            error?.response?.data?.message || 'Failed to update profile',
            'error'
        )
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    loadProfile()
})
</script>
