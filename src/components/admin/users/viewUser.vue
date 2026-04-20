<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="[
            {
                name: 'User Management',
                path: '/admin/users',
                icon: 'fa-solid fa-users text-neutral-700 text-2xl'
            },
            { name: 'User Details', path: '', icon: '' }
        ]">
            <div class="flex items-center gap-4">
                <AppButton :href="`/admin/users/${user.id}/edit`" button-style="secondary"
                    :test-id="'edit-user-button'">
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span className="ml-2">Edit</span>
                </AppButton>
                <AppButton button-style="primary" @click="toggleUserStatus"
                    :test-id="user.isActive ? 'deactivate-user-button' : 'activate-user-button'">
                    <span v-if="user.isActive" class="flex items-center gap-2">
                        <i class="fa-solid fa-ban"></i>
                        <span>Deactivate User</span>
                    </span>
                    <span v-else class="flex items-center gap-2">
                        <i class="fa-solid fa-check"></i>
                        <span>Activate User</span>
                    </span>
                </AppButton>
            </div>
        </BreadCrums>

        <main id="main-content" class="p-4 sm:p-6 lg:p-8">
            <div v-if="loading" class="flex justify-center items-center py-12">
                <Spinner width="10" />
            </div>

            <template v-else>
                <div id="user-profile" class="bg-secondary rounded-lg shadow-sm p-6 mb-6">
                    <div class="flex items-center gap-4 mb-6">
                        <i class="fa-solid fa-user-circle text-5xl text-opposite"></i>
                        <div>
                            <h2 class="text-2xl text-opposite">
                                {{ fullName }}
                                <span class="text-opposite text-sm" v-if="user.createdBy">
                                    ( created by {{ user.createdBy.fname }}
                                    {{ user.createdBy.lname }} )
                                </span>
                                <span class="text-opposite text-sm" v-else>
                                    ( Company Admin )
                                </span>
                            </h2>
                            <span class="px-2 py-1 text-sm rounded-full" :class="user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-neutral-100 text-neutral-800'
                                ">
                                {{ user.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div id="personal-info" class="space-y-4">
                            <h3 class="text-lg mb-4 text-opposite">Personal Information</h3>

                            <div class="space-y-2">
                                <label class="text-sm text-opposite/40">First Name</label>
                                <p class="text-opposite">{{ user.fname }}</p>
                            </div>

                            <div class="space-y-2">
                                <label class="text-sm text-opposite/40">Last Name</label>
                                <p class="text-opposite">{{ user.lname }}</p>
                            </div>

                            <div class="space-y-2">
                                <label class="text-sm text-opposite/40">Email</label>
                                <p class="text-opposite">{{ user.email }}</p>
                            </div>
                        </div>

                        <div id="contact-info" class="space-y-4">
                            <h3 class="text-lg mb-4 text-opposite/40"  >Contact Information</h3>

                            <div class="space-y-2">
                                <label class="text-sm text-opposite/40">Mobile Phone</label>
                                <p class="text-opposite">
                                    {{ user.phone || 'Not provided' }}
                                </p>
                            </div>


                        </div>
                    </div>
                </div>

            </template>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiGet } from '@/util/api' 
import type { User } from './user.interface'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import { useDialog } from '@/stores/dialog'
import ActivateUser from './activateUser.vue'
import BreadCrums from '@/components/breadCrums.vue'
const user = ref<User>({
    id: '',
    fname: '',
    lname: '',
    email: '',
    phone: '',
    isActive: false,
    createdAt: '',
    updatedAt: '',
    createdBy: {
        id: 0,
        fname: '',
        lname: ''
    },
    verifiedAt: 0
})
const authStore = useAuthStore()
const loading = ref(true)
const error = ref('')
const route = useRoute()
const router = useRouter()
const { openDialog, onChangeDialog } = useDialog()

const userId = computed(() => {
    return route.params.userId
})

const fullName = computed(() => {
    return `${user.value.fname} ${user.value.lname}`
})

const avatarSeed = computed(() => {
    // Use userId or email as consistent seed for avatar
    return userId.value || user.value.email || '1'
})

async function fetchUserData() {
    loading.value = true
    try {
        // Replace with your actual API endpoint
        const response = await apiGet<User>(`/users/${userId.value}`, authStore)
        user.value = response
        // await fetchUserActivities()
    } catch (err) {
        error.value = 'Failed to load user data'
    } finally {
        loading.value = false
    }
}

// async function fetchUserActivities() {
//     try {
//         // Replace with your actual API endpoint
//         const response = await apiGet<Activity[]>(`/users/${userId.value}/activities`, authStore)
//         activities.value = response
//     } catch (err) {
//         console.error('Error fetching user activities:', err)
//     }
// }

function goBack() {
    router.push('/admin/users')
}

function toggleUserStatus() {
    openDialog(ActivateUser, {
        user: user.value,
        onSuccess: () => {
            fetchUserData()
            onChangeDialog(false)
        },
        onCancel: () => {
            onChangeDialog(false)
        },
        activate: !user.value.isActive
    })
}

function formatDate(timestamp: string) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// function getActivityIcon(type) {
//     const iconMap = {
//         create: 'fa-solid fa-user-plus',
//         update: 'fa-solid fa-user-pen',
//         activate: 'fa-solid fa-user-check',
//         deactivate: 'fa-solid fa-user-slash',
//         login: 'fa-solid fa-right-to-bracket',
//         logout: 'fa-solid fa-right-from-bracket'
//     }

//     return iconMap[type] || 'fa-solid fa-clock-rotate-left'
// }

onMounted(() => {
    fetchUserData()
})
</script>
