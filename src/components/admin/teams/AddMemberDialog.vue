<template>
    <div class="p-6 space-y-4 bg-secondary rounded-lg border">
        <h3 class="text-lg text-opposite">{{ existingMember ? 'Update Team Member' : 'Add Team Member' }}</h3>
        <p class="text-opposite text-sm">{{ existingMember ? 'Update the permissions for the selected user.' : 'Search and select a user to add to this team.' }}</p>

        <div class="relative" v-if="!existingMember">
            <input v-model="searchQuery" type="text" placeholder="Search by name or email..."
                class="w-full px-4 py-2 border rounded-lg text-sm bg-secondary text-opposite focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <i class="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"></i>
        </div>

        <div v-if="loadingUsers" class="flex justify-center py-8">
            <Spinner width="8" />
        </div>

        <div v-else-if="!existingMember" class="max-h-64 overflow-y-auto space-y-1">
            <div v-for="user in filteredUsers" :key="user.id"
                class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                :class="selectedUserId === user.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : ''"
                @click="selectedUserId = user.id">
                <div>
                    <p class="text-sm text-opposite">{{ user.fname }} {{ user.lname }}</p>
                    <p class="text-xs text-neutral-500">{{ user.email }}</p>
                </div>
                <i v-if="selectedUserId === user.id" class="fa-solid fa-check text-blue-500"></i>
            </div>
            <p v-if="filteredUsers.length === 0" class="text-neutral-500 text-sm text-center py-4">
                No users found.
            </p>
        </div>
        <div v-else-if="existingMember" class="border rounded-lg p-2">
            <p class=" text-sm text-opposite">User: {{ existingMember.user.fname }} {{ existingMember.user.lname }}</p>
        </div>

        <div class="space-y-2" v-if="selectedUserId">
            <p class="text-sm text-opposite">Permission Groups for Selected User</p>
            <div v-if="loadingGroups" class="flex justify-center py-4">
                <Spinner width="6" />
            </div>
            <div v-else class="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                <label v-if="selectedUser?.userType !== 'pilot'" v-for="group in availableGroups" :key="group.id"
                    class="flex items-center gap-2 px-2 py-1 rounded hover:bg-main cursor-pointer">
                    <input type="checkbox" :value="group.id" v-model="selectedGroupIds" class="w-4 h-4" />
                    <span class="text-sm text-opposite">{{ group.name }}</span>
                </label>
                <label v-else>
                    <span class="text-sm text-opposite">Drone Pilot</span>
                </label>

            </div>
            <p class="text-xs text-opposite/70">Select at least one permission group.</p>
        </div>

        <div class="flex items-center justify-end gap-4 pt-4 border-t">
            <AppButton buttonStyle="secondary" type="button" @click="onCancel">
                Cancel
            </AppButton>
            <AppButton buttonStyle="primary" type="button" :disabled="!selectedUserId || selectedGroupIds.length === 0"
                :loading="isSubmitting" @click="addMember">
                {{ existingMember ? 'Update Member' : 'Add Member' }}
            </AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiGet, apiPost } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import type { PermissionGroup, TeamMemberEntry, User } from '@/util/interfaces'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'

const props = defineProps<{
    teamId: string
    existingMemberIds: string[]
    onSuccess: () => void
    onCancel: () => void
    existingMember?: TeamMemberEntry
}>()

const authStore = useAuthStore()
const toast = useToast()
const allUsers = ref<User[]>([])
const availableGroups = ref<PermissionGroup[]>([])
const searchQuery = ref('')
const selectedUserId = ref<string | null>(null)
const selectedGroupIds = ref<number[]>([])
const loadingUsers = ref(true)
const loadingGroups = ref(true)
const isSubmitting = ref(false)

const filteredUsers = computed(() => {
    const available = allUsers.value.filter(
        (u) => !props.existingMemberIds.includes(u.id)
    )
    if (!searchQuery.value) return available
    const q = searchQuery.value.toLowerCase()
    return available.filter(
        (u) =>
            u.fname.toLowerCase().includes(q) ||
            u.lname.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            `${u.fname} ${u.lname}`.toLowerCase().includes(q)
    )
})
const selectedUser = computed(() => {
    return allUsers.value.find((u) => u.id === selectedUserId.value)
})
const selectedPilotGroup = computed(() => {
    return availableGroups.value.find((g) => g.name === 'Drone Pilot')
})
onMounted(async () => {
    try {
        const res = await apiGet<User[]>('/users', authStore)
        allUsers.value = res
    } catch {
        allUsers.value = []
    } finally {
        loadingUsers.value = false
    }

    try {
        const groups = await apiGet<PermissionGroup[]>('/permissions/groups', authStore)
        availableGroups.value = groups.filter((g) => g.name !== 'Admin')
    } catch {
        availableGroups.value = []
    } finally {
        loadingGroups.value = false
    }
    if (props.existingMember) {
        console.log(props.existingMember)
        selectedUserId.value = props.existingMember.user.id
        selectedGroupIds.value = props.existingMember.groupIds
    }
})

const addMember = async () => {
    if (!selectedUserId.value) return
    isSubmitting.value = true
    try {
        await apiPost(
            `/teams/${props.teamId}/members`,
            { userId: selectedUserId.value, groupIds: selectedUser?.value?.userType === 'pilot' ? [selectedPilotGroup?.value?.id] : selectedGroupIds.value },
            authStore
        )
        toast.showToast('Success', 'Member added successfully', 'success')
        props.onSuccess()
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to add member. Please try again.',
            'error'
        )
    } finally {
        isSubmitting.value = false
    }
}
</script>
