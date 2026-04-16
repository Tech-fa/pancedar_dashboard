<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs">
            <div class="flex items-center gap-4">
                <Can :subject="'pilot'" :actions="['update']">
                    <AppButton buttonStyle="secondary" :href="`/fleet/pilots/${pilot?.id}/edit`" :disabled="!pilot">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span class="ml-2">Edit</span>
                    </AppButton>
                </Can>
                <Can :subject="'pilot'" :actions="['update']">
                    <AppButton buttonStyle="primary" type="button" :disabled="!pilot" @click="openStatusDialog">
                        <span v-if="pilot?.isActive" class="flex items-center gap-2">
                            <i class="fa-solid fa-ban"></i>
                            <span>Deactivate</span>
                        </span>
                        <span v-else class="flex items-center gap-2">
                            <i class="fa-solid fa-check"></i>
                            <span>Activate</span>
                        </span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <main class="p-4 sm:p-6 lg:p-8">
            <div v-if="loading" class="flex justify-center items-center py-12">
                <Spinner width="30" height="30" />
            </div>

            <div v-else-if="pilot" class="space-y-6">
                <section class="bg-secondary text-opposite rounded-lg shadow-sm p-6">
                    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                        <div class="flex items-center gap-4">
                            <i class="fa-solid fa-user text-5xl"></i>
                            <div>
                                <h2 class="text-2xl font-semibold">{{ fullName }}</h2>
                                <div class="flex items-center gap-2 mt-2">
                                    <span :class="[
                                        'px-2 py-1 text-xs rounded-full',
                                        pilot.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-neutral-200 text-neutral-800'
                                    ]">
                                        {{ pilot.isActive ? 'Active' : 'Inactive' }}
                                    </span>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div class="space-y-3">
                            <h3 class="text-lg font-medium">Contact</h3>
                            <div>
                                <p class="text-sm text-opposite/60">Email</p>
                                <p class="text-opposite">
                                    {{ pilot.email || 'Not provided' }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-opposite/60">Phone</p>
                                <p class="text-opposite">
                                    {{ pilot.phone || 'Not provided' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


            </div>

            <div v-else class="flex flex-col items-center justify-center py-12 text-opposite/60">
                <i class="fa-solid fa-triangle-exclamation text-3xl mb-4"></i>
                <p>Unable to load pilot details.</p>
                <AppButton buttonStyle="secondary" class="mt-4" @click="goBack">Go Back</AppButton>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import Can from '@/components/Can.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ActivateUser from '@/components/admin/users/activateUser.vue'
import type { User } from '@/util/interfaces'
import { getPilotById } from '@/components/operations/pilots/endpoints'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const loading = ref(true)
const pilot = ref<User | null>(null)

const crumbs = [
    {
        name: 'Pilots',
        path: '/fleet/pilots',
        icon: 'fa-solid fa-user text-neutral-700 text-2xl'
    },
    {
        name: 'Pilot Details',
        path: '',
        icon: ''
    }
]

const fullName = computed(() => {
    if (!pilot.value) return ''
    return `${pilot.value.fname} ${pilot.value.lname}`
})


const goBack = () => {
    router.push('/fleet/pilots')
}

const fetchPilot = async () => {
    try {
        loading.value = true
        const data = await getPilotById(route.params.pilotId as string, authStore)
        pilot.value = data as User
    } catch (error: any) {
        toast.showToast(
            'Error loading pilot',
            error?.response?.data?.message ||
            'Unable to load pilot details. Please try again.',
            'error'
        )
    } finally {
        loading.value = false
    }
}

const openStatusDialog = () => {
    if (!pilot.value) return

    dialog.openDialog(ActivateUser, {
        activate: !pilot.value.isActive,
        user: pilot.value,
        onSuccess: async () => {
            dialog.closeDialog()
            await fetchPilot()
        },
        onCancel: () => dialog.closeDialog()
    })
}

onMounted(async () => {
    await fetchPilot()
})
</script>
