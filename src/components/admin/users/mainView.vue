<template>
    <div id="root" class="min-h-screen bg-dark">
        <BreadCrums
            :crumbs="[
                {
                    name: 'User Management',
                    path: '/admin/users',
                    icon: 'fa-solid fa-users text-neutral-700 text-2xl'
                }
            ]"
        >
            <div class="flex items-center gap-4">
                <Can :subject="'users'" :actions="['create']">
                    <AppButton
                        test-id="user-management-add-user"
                        buttonStyle="primary"
                        href="/admin/users/add"
                    >
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add User</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <div test-id="user-management-table-wrapper" class="p-4">
            <Table
                :cols="['Name', 'Email', 'Phone', 'User Type', 'Status']"
                :rows="rows"
                :page="page"
                :total="total"
                :per-page="perPage"
                :total-pages="totalPages"
                :on-next-page="onNextPage"
                :on-previous-page="onPreviousPage"
                :set-page="setPage"
                :entities="users"
                entity-name="User"
                :on-success="onSuccess"
                :on-search="
                    (val: string) => {
                        query = val
                    }
                "
                :loading="loading"
                :subject="'users'"
                :search-placeholder="'Search by name or email'"
                :handleDelete="handleDelete"
            >
                <template #extra-field="{ entity }">
                    <Can
                        :subject="'users'"
                        :actions="['update']"
                        v-if="
                            +entity.failedLogins >= 3 &&
                            entity.id !== authStore.state?.userDetails?.id
                        "
                    >
                        <span
                            class="text-opposite hover:text-opposite/40 cursor-pointer ml-4"
                            @click="unlockUser(entity)"
                        >
                            <i class="fa-solid fa-unlock"></i>
                        </span>
                    </Can>
                </template>
            </Table>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Table from '@/components/Table.vue'
import type { User } from '@/util/interfaces'
import { apiGet, apiDelete, apiPut } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/AppButton.vue'
import { useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Can from '@/components/Can.vue'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const users = ref<User[]>([])
const page = ref(1)
const perPage = ref(15)
const total = ref(1)
const totalPages = ref(1)
const query = ref('')
const loading = ref(true)
const rows = ref<{ [key: string]: any }[]>([])
const allUsers = ref<User[]>([])
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const dialog = useDialog()

const mapRows = (users: User[]) => {
    return users.map((user) => ({
        id: user.id,
        Name: `${user.fname} ${user.lname}`,
        Email: user.email,
        Phone: user.phone,
        'User Type': user?.isAdmin ? 'Admin' : user?.userType,
        Status: user.isActive ? 'Active' : 'Inactive'
    }))
}

const unlockUser = (user: User) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to unlock the user "${user.fname} ${user.lname}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await apiPut(`/users/${user.id}/unlock`, {}, authStore)
                toast.showToast('Success', 'User unlocked successfully', 'success')
                onSuccess()
            } catch (error: any) {
                console.error('Error unlocking user:', error)
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to unlock user. Please try again.',
                    'error'
                )
            } finally {
                dialog.closeDialog()
            }
        },
        onCancel: () => {
            dialog.closeDialog()
        }
    })
}

const filterUsers = (users: User[], searchQuery: string) => {
    if (!searchQuery) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
        (user) =>
            user.fname.toLowerCase().includes(query) ||
            user.lname.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.phone?.toLowerCase().includes(query) ||
            `${user.fname} ${user.lname}`.toLowerCase().includes(query)
    )
}

const updatePagination = () => {
    const filteredUsers = filterUsers(allUsers.value, query.value)
    total.value = filteredUsers.length
    totalPages.value = Math.ceil(total.value / perPage.value)

    const startIndex = (page.value - 1) * perPage.value
    const endIndex = startIndex + perPage.value
    users.value = filteredUsers.slice(startIndex, endIndex)
    rows.value = mapRows(users.value)
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value = page.value + 1
        updatePagination()
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value = page.value - 1
        updatePagination()
    }
}

const setPage = (newPage: number) => {
    if (newPage != page.value) {
        page.value = newPage
        updatePagination()
    }
}

const extraFieldAction = (entity: User) => {
    router.push(`/admin/users/${entity.id}/permissions`)
}

const handleDelete = async (entity: User) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete the user "${entity.fname} ${entity.lname}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await apiDelete(`/users/${entity.id}`, authStore)
                toast.showToast('Success', 'User deleted successfully', 'success')
                await onSuccess()
            } catch (error: any) {
                console.error('Error deleting user:', error)
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to delete user. Please try again.',
                    'error'
                )
            } finally {
                dialog.closeDialog()
            }
        },
        onCancel: () => {
            dialog.closeDialog()
        }
    })
}

const onSuccess = () => {
    apiGet<User[]>(`/users`, authStore)
        .then((res) => {
            loading.value = false
            allUsers.value = res
            updatePagination()
        })
        .catch((err) => {
            loading.value = false
        })
}

onMounted(async () => {
    onSuccess()
})

watch(query, () => {
    page.value = 1
    onSuccess()
})
</script>
