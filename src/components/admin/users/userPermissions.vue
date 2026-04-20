<template>

    <div id="permissions-content" class="bg-secondary  space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-lg text-opposite">Team Permissions</h2>
                <p class="text-sm text-opposite/70">
                    Assign one team and multiple permission groups per widget.
                </p>
            </div>
            <AppButton buttonStyle="primary" @click="addTeamAssignment" test-id="add-team-widget" type="button">
                <i class="fa-solid fa-plus mr-2"></i> Add Team Widget
            </AppButton>
        </div>

        <Notice
            description="Each team can have multiple groups. Every widget must include a team and at least one group."
            level="info" />
        <label for="set-admin-toggle" v-if="canSetAsAdmin"
            class="flex items-center justify-start bg-main border rounded-md px-3 py-2">
            <input id="set-admin-toggle" v-model="isAdminUser" type="checkbox"
                class="w-4 h-4 rounded border-neutral-300 text-opposite/30 focus:ring-neutral-900"
                test-id="set-admin-toggle" />
            <div class="text-sm text-opposite ml-2">Set user as admin (all teams)</div>

        </label>
        <Notice v-if="isAdminUser"
            description="This user will have access to all teams. Saving will add the user to all teams and assign the Admin permission group to each team."
            level="info" />

        <div v-if="!isAdminUser && teamAssignments.length === 0" class="text-opposite/70 text-sm">
            No team permissions assigned yet.
        </div>

        <div v-if="!isAdminUser" v-for="assignment in teamAssignments" :key="assignment.id"
            class="border rounded-lg p-4 space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-opposite font-medium">Team Widget</h3>
                <button class="text-opposite/80 hover:text-red-600 p-1 rounded"
                    @click="removeTeamAssignment(assignment.id)">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div>
                <label class="text-xs text-opposite/70 mb-1 block">Team</label>
                <Select2 placeholder="Select a team" v-model="assignment.team" :values="teams"
                    :display="(team: any) => team?.name" />
            </div>

            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs text-opposite/70">Permission Groups</span>
                    <AppButton buttonStyle="secondary" @click="openAddGroupDialog(assignment)" type="button"
                        :disabled="!assignment.team">
                        Select Groups
                    </AppButton>
                </div>
                <div v-if="assignment.groupIds.length" class="flex flex-wrap gap-2">
                    <span v-for="groupId in assignment.groupIds" :key="`${assignment.id}-${groupId}`"
                        class="px-2 py-1 rounded-full text-xs bg-main text-opposite border border-opposite/20 flex items-center gap-2">
                        {{ getGroupName(groupId) }}
                        <button class="text-opposite/80 hover:text-red-600"
                            @click="removeGroupFromAssignment(assignment, groupId)">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </span>
                </div>
                <p v-else class="text-xs text-opposite/60">No groups selected.</p>
            </div>
        </div>

        <div v-if="!embedded" id="action-buttons" class="pt-4 flex justify-end space-x-4">
            <AppButton buttonStyle="secondary" type="button" @click="router.push('/admin/users')"
                test-id="cancel-permissions">
                Cancel
            </AppButton>
            <AppButton buttonStyle="primary" type="submit" @click="savePermissions" test-id="save-permissions"
                :loading="isSubmitting">
                Save Changes
            </AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MemberIcon from '@/components/memberIcon.vue'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import AddGroupDialog from './AddGroupDialog.vue'
import { apiGet, apiPost } from '@/util/api'
import type { PermissionGroup } from '../permissions/permission.interface'
import type { Team } from '../teams/team.interface'
import type { User } from './user.interface'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/AppButton.vue'
import Notice from '@/components/Notice.vue'
import Select2 from '@/components/Select2.vue'
import type { PaginatedResponse } from '@/util/interfaces'

const props = withDefaults(
    defineProps<{
        userId?: string
        embedded?: boolean
    }>(),
    {
        embedded: false,
        isPilot: false
    }
)

const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()
const route = useRoute()
const userId = props.userId || route.params.userId
const router = useRouter()
const user = ref<User>({} as User)
const loading = ref(true)
const isSubmitting = ref(false)
const embedded = computed(() => props.embedded)
const availableGroups = ref<PermissionGroup[]>([])
const teams = ref<Team[]>([])
const isAdminUser = ref(false)

interface TeamAssignment {
    id: string
    team: Team
    groupIds: number[]
}
interface UserPermissionRecord {
    teamId: string
    permissionGroup: PermissionGroup
}
const teamAssignments = ref<TeamAssignment[]>([])
const canSetAsAdmin = computed(() =>
    authStore.hasPermissions({ subject: 'all', actions: ['manage'] })
)
const adminGroupId = computed(() => availableGroups.value.find((group) => group.name === 'Admin')?.id || null)


const createAssignment = (team: Team = undefined as any, groupIds: number[] = []): TeamAssignment => ({
    id: `${Date.now()}-${Math.random()}`,
    team,
    groupIds
})



const getGroupName = (groupId: number) =>
    availableGroups.value.find((group) => group.id === groupId)?.name || `Group #${groupId}`

const addTeamAssignment = () => {
    if (!isAdminUser.value) {
        teamAssignments.value.push(createAssignment())
    }
}

const removeTeamAssignment = (assignmentId: string) => {
    teamAssignments.value = teamAssignments.value.filter((assignment) => assignment.id !== assignmentId)
}

const removeGroupFromAssignment = (assignment: TeamAssignment, groupId: number) => {
    assignment.groupIds = assignment.groupIds.filter((id) => id !== groupId)
}

const syncIsAdminToggle = () => {
    if (!adminGroupId.value || teams.value.length === 0) {
        isAdminUser.value = false
        return
    }

    const assignmentByTeam = teamAssignments.value.reduce(
        (acc, assignment) => {
            acc[assignment.team.id] = assignment
            return acc
        },
        {} as Record<string, TeamAssignment>
    )

    isAdminUser.value = teams.value.every((team) =>
        assignmentByTeam[team.id]?.groupIds.includes(adminGroupId.value as number)
    )
    if (!userId) {
        teamAssignments.value.push(createAssignment(teams.value.find((team) => team.id === authStore.state.teamId), []))
        return;
    }
}

const savePermissions = async () => {
    try {
        isSubmitting.value = true
        if (isAdminUser.value) {
            await apiPost(
                `/teams/set-as-admin`,
                {
                    userId
                },
                authStore
            )
        } else {
            if (teamAssignments.value.some((assignment) => !assignment.team)) {
                toast.showToast(
                    'Error',
                    'Please select a team for every widget.',
                    'error'
                )
                return
            }

            if (teamAssignments.value.some((assignment) => assignment.groupIds.length === 0)) {
                toast.showToast('Error', 'Please select at least one group for every team widget.', 'error')
                return
            }

            const teamIds = teamAssignments.value.map((assignment) => assignment.team.id)
            if (new Set(teamIds).size !== teamIds.length) {
                toast.showToast(
                    'Error',
                    'Each team can only be assigned once. Remove duplicate team widgets.',
                    'error'
                )
                return
            }

            await apiPost(
                `/teams/set-teams`,
                {
                    userId,
                    assignments: teamAssignments.value.map((assignment) => ({
                        teamId: assignment.team.id,
                        groupIds: assignment.groupIds
                    }))
                },
                authStore
            )
        }
        toast.showToast('Success', 'User permissions updated successfully', 'success')
    } catch (error: any) {
        console.error('Error saving permissions:', error)
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to save permissions. Please try again.',
            'error'
        )
        await fetchUserPermissions()
    } finally {
        isSubmitting.value = false
    }
}

const fetchAvailableGroups = async () => {
    try {
        const response = await apiGet<PermissionGroup[]>('/permissions/groups', authStore)
        availableGroups.value = response
    } catch (error) {
        console.error('Error fetching available groups:', error)
        toast.showToast('Error', 'Failed to fetch available groups', 'error')
    }
}

const fetchTeams = async () => {
    try {
        let page = 1
        let allTeams: Team[] = []
        let hasMore = true

        while (hasMore) {
            const response = await apiGet<PaginatedResponse<Team>>('/teams', authStore, {
                page,
                perPage: 100
            })
            allTeams = [...allTeams, ...response.data]
            hasMore = allTeams.length < response.totalCount
            page++
        }

        teams.value = allTeams

    } catch (error) {
        console.error('Error fetching teams:', error)
        toast.showToast('Error', 'Failed to fetch teams', 'error')
    }
}

const openAddGroupDialog = (assignment: TeamAssignment) => {
    const existingGroups = availableGroups.value.filter((group) => assignment.groupIds.includes(group.id))
    dialog.openDialog(AddGroupDialog, {
        availableGroups: availableGroups.value.filter((group) => group.name !== 'Admin'),
        existingGroups,
        onSuccess: (groups: PermissionGroup[]) => {
            assignment.groupIds = [...new Set([...assignment.groupIds, ...groups.map((group) => group.id)])]
            dialog.closeDialog()
        },
        onCancel: () => {
            dialog.closeDialog()
        }
    })
}

const fetchUserPermissions = async () => {
    try {
        if (!userId) {
            return;
        }
        const response = await apiGet<any>(`/permissions/users/${userId}`, authStore)
        const groups: UserPermissionRecord[] = Array.isArray(response)
            ? response
            : (response.groups || [])

        if (Array.isArray(response)) {
            user.value = await apiGet<User>(`/users/${userId}`, authStore)
        } else if (response.user) {
            user.value = response.user
        }

        const groupedByTeam = groups.reduce(
            (acc: Record<string, number[]>, item: UserPermissionRecord) => {
                const groupList = acc[item.teamId] || []
                groupList.push(item.permissionGroup.id)
                acc[item.teamId] = groupList
                return acc
            },
            {}
        )

        teamAssignments.value = Object.entries(groupedByTeam).map(([teamId, groupIds]) =>
            createAssignment(teams.value.find((team) => team.id === teamId), [...new Set(groupIds)])
        )
        syncIsAdminToggle()
    } catch (error) {
        console.error('Error fetching user permissions:', error)
        toast.showToast('Error', 'Failed to fetch user permissions', 'error')
    }
}

const getAssignmentsPayload = (): { isAdmin: true } | { assignments: { teamId: string; groupIds: number[] }[] } | null => {
    if (isAdminUser.value) {
        return { isAdmin: true }
    }

    if (teamAssignments.value.some((a) => !a.team)) {
        toast.showToast('Error', 'Please select a team for every widget.', 'error')
        return null
    }
    if (teamAssignments.value.some((a) => a.groupIds.length === 0)) {
        toast.showToast('Error', 'Please select at least one group for every team widget.', 'error')
        return null
    }
    const teamIds = teamAssignments.value.map((a) => a.team.id)
    if (new Set(teamIds).size !== teamIds.length) {
        toast.showToast('Error', 'Each team can only be assigned once. Remove duplicate team widgets.', 'error')
        return null
    }

    return {
        assignments: teamAssignments.value.map((a) => ({
            teamId: a.team.id,
            groupIds: a.groupIds
        }))
    }
}

defineExpose({ getAssignmentsPayload })

onMounted(async () => {
    try {
        await Promise.all([fetchAvailableGroups(), fetchTeams(), fetchUserPermissions()])
        syncIsAdminToggle()
    } finally {
        loading.value = false
    }
})
</script>
