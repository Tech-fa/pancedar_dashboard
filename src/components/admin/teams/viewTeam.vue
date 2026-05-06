<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="[
            {
                name: 'Teams',
                path: '/admin/teams',
                icon: 'fa-solid fa-people-group text-neutral-700 text-2xl'
            },
            { name: 'Team Details', path: '', icon: '' }
        ]">
            <div class="flex items-center gap-4">
                <Can :subject="'teams'" :actions="['update']">
                    <AppButton :href="`/admin/teams/${teamId}/edit`" button-style="secondary"
                        test-id="edit-team-button">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span class="ml-2">Edit</span>
                    </AppButton>
                </Can>
                <Can :subject="'teams'" :actions="['delete']">
                    <AppButton button-style="primary" @click="handleDeleteTeam" test-id="delete-team-button">
                        <i class="fa-solid fa-trash"></i>
                        <span class="ml-2">Delete Team</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <main id="main-content" class="p-4 sm:p-6 lg:p-8">
            <div v-if="loading" class="flex justify-center items-center py-12">
                <Spinner width="10" />
            </div>

            <template v-else>
                <!-- Team Info Card -->
                <div class="bg-secondary rounded-lg border p-6 mb-6">
                    <div class="flex items-center gap-4 mb-6">
                        <i class="fa-solid fa-people-group text-5xl text-opposite"></i>
                        <div>
                            <h2 class="text-2xl text-opposite">{{ team.name }}</h2>
                            <p class="text-opposite text-sm">
                                Created {{ formatDateToDay(team.createdAt) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Team Config Section -->
                <div class="bg-secondary rounded-lg border p-6 mb-6">
                    <div class="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h3 class="text-lg text-opposite">Team Config</h3>
                            <p class="text-opposite text-sm">
                                Store the chatbot API key for this team. The saved secret is never returned.
                            </p>
                        </div>
                        <Can v-if="teamConfig?.id" :subject="'teams'" :actions="['update']">
                            <AppButton buttonStyle="danger" :loading="deletingConfig" @click="handleDeleteConfig"
                                test-id="delete-team-config-button">
                                <i class="fa-solid fa-trash"></i>
                                <span class="ml-2">Delete Config</span>
                            </AppButton>
                        </Can>
                    </div>

                    <div v-if="loadingConfig" class="flex justify-center items-center py-8">
                        <Spinner width="8" />
                    </div>

                    <div v-else class="space-y-4">
                        <div v-if="teamConfig?.id" class="space-y-4">
                            <div v-for="field in secretFields" :key="field.path" class="space-y-2">
                                <label class="block text-sm text-opposite">Current {{ field.label }}</label>
                                <input type="password" value="********" disabled
                                    class="w-full px-4 py-2 border rounded-lg text-sm bg-main text-opposite opacity-80" />
                            </div>
                        </div>
                        <div v-else class="text-neutral-500 py-2 text-sm">
                            No team config has been saved yet.
                        </div>

                        <div v-if="secretFields.length === 0" class="text-neutral-500 py-2 text-sm">
                            No secret fields are defined for this team config template.
                        </div>

                        <Can :subject="'teams'" :actions="['update']">
                            <div v-if="secretFields.length > 0" class="space-y-4">
                                <div v-for="field in secretFields" :key="field.path" class="space-y-2">
                                    <label :for="`team-config-${field.path}`" class="block text-sm text-opposite">
                                        {{ teamConfig?.id ? `New ${field.label}` : field.label }}
                                    </label>
                                    <input :id="`team-config-${field.path}`" v-model="secretValues[field.path]"
                                        type="password" autocomplete="new-password"
                                        :placeholder="`Enter ${field.label.toLowerCase()}`"
                                        class="w-full px-4 py-2 border rounded-lg text-sm bg-secondary text-opposite focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <p v-if="teamConfig?.id" class="text-xs text-opposite/70">
                                    Enter the secret values you want to save. Existing secrets are not returned.
                                </p>
                            </div>

                            <div class="flex justify-end">
                                <AppButton buttonStyle="primary" :disabled="secretFields.length === 0"
                                    :loading="savingConfig" @click="handleSaveConfig" test-id="save-team-config-button">
                                    {{ teamConfig?.id ? 'Update Secrets' : 'Create Config' }}
                                </AppButton>
                            </div>
                        </Can>
                    </div>
                </div>

                <!-- Members Section -->
                <div class="bg-secondary rounded-lg border p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg text-opposite">
                            Members
                            <span class="text-opposite text-sm">({{ members.length }})</span>
                        </h3>
                        <Can :subject="'teams'" :actions="['update']">
                            <AppButton buttonStyle="primary" @click="openAddMember" test-id="add-member-button">
                                <i class="fa-solid fa-plus"></i>
                                <span class="ml-2">Add Member</span>
                            </AppButton>
                        </Can>
                    </div>

                    <div v-if="members.length === 0" class="text-neutral-500 py-8 text-center">
                        No members in this team yet.
                    </div>

                    <div v-else class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b">
                                    <th class="py-3 px-4 text-sm text-opposite font-medium">Name</th>
                                    <th class="py-3 px-4 text-sm text-opposite font-medium">Email</th>
                                    <th class="py-3 px-4 text-sm text-opposite font-medium">Joined At</th>
                                    <th class="py-3 px-4 text-sm text-opposite font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="member in members" :key="member.id"
                                    class="border-b last:border-0 hover:bg-main">
                                    <td class="py-3 px-4 text-sm text-opposite">
                                        {{ member.user.fname }} {{ member.user.lname }}
                                    </td>
                                    <td class="py-3 px-4 text-sm text-opposite">
                                        {{ member.user.email }}
                                    </td>

                                    <td class="py-3 px-4 text-sm text-opposite">
                                        {{ formatDateToDay(member.createdAt) }}
                                    </td>
                                    <td class="py-3 px-4 text-right">
                                        <Can :subject="'teams'" :actions="['update']"><span
                                                class="mr-4 text-opposite hover:text-opposite/70 cursor-pointer text-sm"
                                                @click="openAddMember(member)">
                                                <i class="fa-solid fa-pencil"></i>
                                            </span>
                                        </Can>
                                        <Can :subject="'teams'" :actions="['update']">
                                            <span
                                                class="text-accent-red hover:text-accent-red/70 cursor-pointer text-sm"
                                                @click="handleRemoveMember(member)">
                                                <i class="fa-solid fa-user-minus"></i>
                                                <span class="ml-1">Remove</span>
                                            </span>
                                        </Can>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
import { apiGet, apiDelete, apiPost, apiPut } from '@/util/api'
import type { Team, TeamConfig, TeamMember } from './team.interface'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import BreadCrums from '@/components/breadCrums.vue'
import Can from '@/components/Can.vue'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import AddMemberDialog from './AddMemberDialog.vue'
import { formatDateToDay } from '@/util/util'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()
const loading = ref(true)
const loadingConfig = ref(true)
const savingConfig = ref(false)
const deletingConfig = ref(false)
const secretValues = ref<Record<string, string>>({})

const team = ref<Team>({
    id: '',
    name: '',
    createdAt: 0,
    updatedAt: 0,
    members: []
})
const teamConfig = ref<TeamConfig | null>(null)

const teamId = computed(() => route.params.teamId as string)

const members = computed(() => team.value.members ?? [])

const existingMemberIds = computed(() =>
    members.value.map((m) => m.user.id)
)

interface SecretField {
    path: string
    pathParts: string[]
    label: string
}

const secretFields = computed<SecretField[]>(() =>
    collectSecretFields(teamConfig.value?.config ?? {})
)

function collectSecretFields(config: Record<string, any>, pathParts: string[] = []): SecretField[] {
    return Object.entries(config).flatMap(([key, value]) => {
        const nextPath = [...pathParts, key]
        if (value === '********') {
            return [
                {
                    path: nextPath.join('.'),
                    pathParts: nextPath,
                    label: formatConfigLabel(nextPath)
                }
            ]
        }

        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return collectSecretFields(value, nextPath)
        }

        return []
    })
}

function formatConfigLabel(pathParts: string[]) {
    return pathParts
        .map((part) =>
            part
                .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
                .replace(/[_-]+/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase())
        )
        .join(' ')
}

function setNestedConfigValue(config: Record<string, any>, pathParts: string[], value: string) {
    let current = config
    pathParts.forEach((part, index) => {
        if (index === pathParts.length - 1) {
            current[part] = value
            return
        }

        current[part] = current[part] || {}
        current = current[part]
    })
}

function buildConfigPayload() {
    const config: Record<string, any> = {}
    secretFields.value.forEach((field) => {
        setNestedConfigValue(config, field.pathParts, secretValues.value[field.path]?.trim() ?? '')
    })
    return { config }
}

async function fetchTeam() {
    loading.value = true
    try {
        const response = await apiGet<Team>(`/teams/${teamId.value}`, authStore)
        team.value = response
    } catch {
        toast.showToast('Error', 'Failed to load team data', 'error')
        router.push('/admin/teams')
    } finally {
        loading.value = false
    }
}

async function fetchTeamConfig() {
    loadingConfig.value = true
    try {
        const response = await apiGet<TeamConfig>(`/teams/${teamId.value}/config`, authStore)
        teamConfig.value = response
    } catch {
        teamConfig.value = null
    } finally {
        loadingConfig.value = false
    }
}

async function handleSaveConfig() {
 

    savingConfig.value = true
    try {
        const isUpdate = Boolean(teamConfig.value?.id)
        const payload = buildConfigPayload()
        const response = isUpdate
            ? await apiPut<TeamConfig>(`/teams/${teamId.value}/config`, payload, authStore)
            : await apiPost<TeamConfig>(`/teams/${teamId.value}/config`, payload, authStore)
        teamConfig.value = response
        secretValues.value = {}
        toast.showToast(
            'Success',
            isUpdate ? 'Team config updated successfully' : 'Team config created successfully',
            'success'
        )
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to save team config.',
            'error'
        )
    } finally {
        savingConfig.value = false
    }
}

function handleDeleteConfig() {
    dialog.openDialog(ConfirmDialog, {
        message: 'Are you sure you want to delete this team config? The saved chatbot API key will be removed.',
        onConfirm: async () => {
            deletingConfig.value = true
            try {
                await apiDelete(`/teams/${teamId.value}/config`, authStore)
                await fetchTeamConfig()
                secretValues.value = {}
                toast.showToast('Success', 'Team config deleted successfully', 'success')
            } catch (error: any) {
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to delete team config.',
                    'error'
                )
            } finally {
                deletingConfig.value = false
                dialog.closeDialog()
            }
        },
        onCancel: () => {
            dialog.closeDialog()
        }
    })
}

function openAddMember(member?: TeamMember) {
    dialog.openDialog(AddMemberDialog, {
        teamId: teamId.value,
        existingMemberIds: existingMemberIds.value,
        existingMember: member,
        onSuccess: () => {
            dialog.closeDialog()
            fetchTeam()
        },
        onCancel: () => {
            dialog.closeDialog()
        }
    })
}

function handleRemoveMember(member: TeamMember) {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to remove "${member.user.fname} ${member.user.lname}" from this team?`,
        onConfirm: async () => {
            try {
                await apiDelete(`/teams/${teamId.value}/members/${member.user.id}`, authStore)
                toast.showToast('Success', 'Member removed successfully', 'success')
                await fetchTeam()
            } catch (error: any) {
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to remove member.',
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

function handleDeleteTeam() {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete the team "${team.value.name}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await apiDelete(`/teams/${teamId.value}`, authStore)
                toast.showToast('Success', 'Team deleted successfully', 'success')
                router.push('/admin/teams')
            } catch (error: any) {
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to delete team.',
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

onMounted(() => {
    fetchTeam()
    fetchTeamConfig()
})
</script>
