<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crums" />

        <main id="main-content" class="p-4 sm:p-6 lg:p-8">
            <div id="edit-form" class="max-w-3xl mx-auto bg-secondary rounded-lg shadow-sm">
                <div class="p-6 border-b">
                    <div class="flex items-center gap-4">
                        <div v-if="!isEditMode">
                            <h2 class="text-lg text-opposite">Add New User</h2>
                            <p class="text-neutral-500">Add a new user to the system</p>
                        </div>
                        <div v-else>
                            <h2 class="text-lg text-opposite">Edit User</h2>
                            <p class="text-neutral-500">Edit the user's information</p>
                        </div>
                    </div>
                </div>
                <Tabs v-if="isEditMode && isPilotModule"
                    :tabs="tabLabels"
                    v-model="tab" class="px-6 pt-4" />

                <Form @submit="submitForm" :class="tab === 0 ? 'p-6 space-y-6' : 'hidden'"
                    v-if="!isEditMode || (isEditMode && initialValues.fname)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AppInputForm test-id="first-name" name="fname" label="First Name"
                            placeholder="Enter first name" :value="initialValues.fname"
                            :rules="(v: any) => (!exists(v) ? 'First name is required' : true)" :required="true" />
                        <AppInputForm test-id="last-name" name="lname" label="Last Name" placeholder="Enter last name"
                            :value="initialValues.lname"
                            :rules="(v: any) => (!exists(v) ? 'Last name is required' : true)" :required="true" />
                    </div>

                    <AppInputForm test-id="email" name="email" label="Email Address" placeholder="Enter email address"
                        :value="initialValues.email" :rules="(v: any) => (!exists(v) || !isEmail(v) ? 'Email is required' : true)
                            " :disabled="isEditMode && !!verifiedAt" :required="true" />

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AppInputForm test-id="phone" name="phone" label="Phone" placeholder="Enter phone"
                            :value="initialValues.phone" :rules="(v: any) =>
                                !exists(v) || !isPhone(v)
                                    ? 'Valid phone is required'
                                    : true
                                " :required="true" />
                    </div>

                    <SearcheableMultiSelectForm v-if="isPilotModule" name="skillIds" label="Skills"
                        placeholder="Search and select skills..." :values="allSkills" :display="(s: any) => s.name"
                        v-model="selectedSkills" />



                    <UserPermissions ref="permissionsRef" :userId="(userId as string)" :embedded="true"
                        :isPilot="isPilotModule" />

                    <div class="space-y-2">
                        <label class="block text-sm text-opposite/70">Status</label>
                        <Select2 test-id="status-select" v-if="isEditMode" v-model="isActive" :values="[true, false]"
                            :placeholder="isActive ? 'Active' : 'Disabled'"
                            :display="(item: any) => (item ? 'Active' : 'Disabled')" />
                        <p v-else class="text-neutral-500">
                            New users must manually activate their account to login
                        </p>
                    </div>

                    <AppButton v-if="isEditMode && !verifiedAt" buttonStyle="primary" type="button"
                        @click="sendActivationEmail" :loading="isSendingActivationEmail">
                        Send Activation Email
                    </AppButton>
                    <div class="p-6 border-t flex items-center justify-end gap-4">
                        <AppButton test-id="cancel-user-button" buttonStyle="secondary" type="button" @click="cancel">
                            Cancel
                        </AppButton>
                        <AppButton test-id="save-user-button" buttonStyle="primary" type="submit"
                            :loading="isSubmitting">
                            Save Changes
                        </AppButton>
                    </div>
                </Form>

                <div v-if="isEditMode && !initialValues.fname">
                    <div class="p-6 border-t bg-neutral-50 flex items-center justify-center gap-4 h-60">
                        <Spinner width="30" height="30" />
                    </div>
                </div>

                <!-- Permissions Tab -->

                <!-- Documents Tab (Pilots only) -->
                <UserDocuments v-if="isPilotModule && isEditMode && verifiedAt > 0 && tab == 1"
                    :userId="(userId as string)" />


                <!-- Availability Tab (Pilots only) -->
                <UserAvailability v-if="tab==(tabLabels.length - 1) && isPilotModule && isEditMode"
                    :userId="(userId as string)" />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Form } from 'vee-validate'
import { useRouter, useRoute } from 'vue-router'
import AppInputForm from '@/components/AppInputForm.vue'
import { useAuthStore } from '../../../stores/auth'
import { apiPost, apiGet, apiPut } from '../../../util/api'
import { useToast } from '../../../stores/notification'
import { exists, isEmail, isPhone } from '../../../util/util'
import type { Skill, User } from '../../../util/interfaces'
import AppButton from '../../AppButton.vue'
import Spinner from '../../Spinner.vue'
import Select2 from '@/components/Select2.vue'
import BreadCrums from '@/components/breadCrums.vue'
import SearcheableMultiSelectForm from '@/components/SearcheableMultiSelectForm.vue'
import UserPermissions from './userPermissions.vue'
import UserDocuments from './UserDocuments.vue'
import UserAvailability from './UserAvailability.vue'
import { getSkills } from '@/components/operations/pilots/endpoints'
import Tabs from '@/components/Tabs.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSubmitting = ref(false)
const isActive = ref(true)
const toast = useToast()
const userId = route.params.userId
const isEditMode = !!userId
const initialValues = ref<{ [key: string]: string }>({})
const verifiedAt = ref(0)
const isSendingActivationEmail = ref(false)
const tab = ref(0)

const selectedSkills = ref<Skill[]>([])
const allSkills = ref<Skill[]>([])
const permissionsRef = ref<InstanceType<typeof UserPermissions> | null>(null)

const isPilotModule = ref(route.meta?.module === 'pilots')
const crums =
    [
        {
            name: 'User Management',
            path: '/admin/users',
            icon: 'fa-solid fa-users text-neutral-700 text-2xl'
        },
        {
            name: isEditMode ? 'Edit User' : 'Add User',
            path: '',
            icon: ''
        }
    ]

const tabLabels = computed(() => {
    return ['Details', 'Documents', 'Availability'].filter((t) => t !== 'Documents' || (t === 'Documents' && verifiedAt.value > 0))
})
// Fetch user data if in edit mode
onMounted(async () => {

    if (isEditMode) {
        try {
            const response = await apiGet<User>(`/users/${userId}`, authStore)
            const userData = response

            // Set initial values for form
            initialValues.value = {
                fname: userData.fname,
                lname: userData.lname,
                email: userData.email,
                phone: userData.phone || '',
            }

            isActive.value = userData.isActive
            verifiedAt.value = userData.verifiedAt
            let isPilot = isPilotModule.value;
            if (userData.userType === 'pilot') {
                isPilotModule.value = true;
                isPilot = true;
            }
            if (isPilot) {
                try {
                    const result = await getSkills(authStore)
                    allSkills.value = result
                } catch {
                    allSkills.value = []
                }
                if (userData.skills) {
                    selectedSkills.value = userData.skills.map((us) => us.skill).filter(Boolean)
                }
            }
        } catch (error: any) {
            toast.showToast(
                'Error loading user',
                error?.response?.data?.message || 'An error occurred while loading the user',
                'error'
            )
            router.push('/admin/users')
        }
    }
})

const submitForm = async (values: any) => {
    const permPayload = permissionsRef.value?.getAssignmentsPayload()
    if (permPayload === null) return

    isSubmitting.value = true

    const userData: Record<string, any> = {
        fname: values.fname,
        lname: values.lname,
        email: values.email,
        phone: values.phone,
        isActive: isActive.value,
        ...permPayload
    }

    if (isPilotModule.value) {
        userData.userType = 'pilot'
        userData.skillIds = selectedSkills.value.map((s) => s.id)
    }
    try {
        let response: any
        const entityName = isPilotModule.value ? 'Pilot' : 'User'
        if (isEditMode) {
            response = await apiPut(`/users/${userId}`, userData, authStore)
            toast.showToast(
                `${entityName} updated successfully`,
                `${entityName} updated successfully`,
                'success'
            )
        } else {
            response = await apiPost('/users', userData, authStore)
            toast.showToast(
                `${entityName} created successfully`,
                `${entityName} created successfully`,
                'success'
            )
        }
        const redirectPath = isPilotModule.value
            ? `/fleet/pilots/${response.id}`
            : `/admin/users`
        router.push(redirectPath)
    } catch (error: any) {
        isSubmitting.value = false
        toast.showToast(
            isEditMode ? 'Error updating user' : 'Error creating user',
            error?.response?.data?.message ||
            `An error occurred while ${isEditMode ? 'updating' : 'creating'} the user`,
            'error'
        )
    }
}

const cancel = () => {
    router.push(isPilotModule.value ? '/fleet/pilots' : '/admin/users')
}

const sendActivationEmail = async () => {
    try {
        isSendingActivationEmail.value = true

        await apiGet(
            `/auth/activation?email=${encodeURIComponent(initialValues.value.email)}`,
            authStore
        )
        toast.showToast('Activation email sent', 'Activation email sent', 'success')
    } catch (error: any) {
        toast.showToast(
            'Error sending activation email',
            error?.response?.data?.message ||
            'An error occurred while sending the activation email',
            'error'
        )
    } finally {
        isSendingActivationEmail.value = false
    }
}
</script>
