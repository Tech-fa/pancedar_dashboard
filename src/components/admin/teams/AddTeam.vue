<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums
            :crumbs="[
                {
                    name: 'Teams',
                    path: '/admin/teams',
                    icon: 'fa-solid fa-people-group text-neutral-700 text-2xl'
                },
                {
                    name: isEditMode ? 'Edit Team' : 'Add Team',
                    path: '',
                    icon: ''
                }
            ]"
        />

        <main id="main-content" class="p-4 sm:p-6 lg:p-8">
            <div id="edit-form" class="max-w-3xl mx-auto bg-secondary rounded-lg shadow-sm">
                <div class="p-6 border-b">
                    <div class="flex items-center gap-4">
                        <div v-if="!isEditMode">
                            <h2 class="text-lg text-opposite">Add New Team</h2>
                            <p class="text-neutral-500">Create a new team</p>
                        </div>
                        <div v-else>
                            <h2 class="text-lg text-opposite">Edit Team</h2>
                            <p class="text-neutral-500">Edit the team's information</p>
                        </div>
                    </div>
                </div>

                <div v-if="isEditMode && !initialValues.name" class="p-6 flex items-center justify-center h-60">
                    <Spinner width="30" height="30" />
                </div>

                <Form
                    v-else
                    @submit="submitForm"
                    class="p-6 space-y-6"
                >
                    <AppInputForm
                        test-id="team-name"
                        name="name"
                        label="Team Name"
                        placeholder="Enter team name"
                        :value="initialValues.name"
                        :rules="(v: any) => (!exists(v) ? 'Team name is required' : v.length > 255 ? 'Team name must be 255 characters or less' : true)"
                        :required="true"
                    />

                    <div class="p-6 border-t flex items-center justify-end gap-4">
                        <AppButton
                            test-id="cancel-team-button"
                            buttonStyle="secondary"
                            type="button"
                            @click="cancel"
                        >
                            Cancel
                        </AppButton>
                        <AppButton
                            test-id="save-team-button"
                            buttonStyle="primary"
                            type="submit"
                            :loading="isSubmitting"
                        >
                            Save Changes
                        </AppButton>
                    </div>
                </Form>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Form } from 'vee-validate'
import { useRouter, useRoute } from 'vue-router'
import AppInputForm from '@/components/AppInputForm.vue'
import { useAuthStore } from '@/stores/auth'
import { apiPost, apiGet, apiPut } from '@/util/api'
import { useToast } from '@/stores/notification'
import { exists } from '@/util/util'
import type { Team } from '@/util/interfaces'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import BreadCrums from '@/components/breadCrums.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSubmitting = ref(false)
const toast = useToast()
const teamId = route.params.teamId as string | undefined
const isEditMode = !!teamId
const initialValues = ref<{ name: string }>({ name: '' })

onMounted(async () => {
    if (isEditMode) {
        try {
            const response = await apiGet<Team>(`/teams/${teamId}`, authStore)
            initialValues.value = { name: response.name }
        } catch (error: any) {
            toast.showToast(
                'Error loading team',
                error?.response?.data?.message || 'An error occurred while loading the team',
                'error'
            )
            router.push('/admin/teams')
        }
    }
})

const submitForm = async (values: any) => {
    isSubmitting.value = true
    const teamData = { name: values.name }

    try {
        let response: any
        if (isEditMode) {
            response = await apiPut(`/teams/${teamId}`, teamData, authStore)
            toast.showToast('Team updated successfully', 'Team updated successfully', 'success')
        } else {
            response = await apiPost('/teams', teamData, authStore)
            toast.showToast('Team created successfully', 'Team created successfully', 'success')
        }
        router.push(`/admin/teams/${response.id}`)
    } catch (error: any) {
        isSubmitting.value = false
        toast.showToast(
            isEditMode ? 'Error updating team' : 'Error creating team',
            error?.response?.data?.message ||
                `An error occurred while ${isEditMode ? 'updating' : 'creating'} the team`,
            'error'
        )
    }
}

const cancel = () => {
    router.push('/admin/teams')
}
</script>
