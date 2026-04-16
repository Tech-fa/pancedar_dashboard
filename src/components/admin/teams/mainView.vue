<template>
    <div id="root" class="min-h-screen bg-dark">
        <BreadCrums
            :crumbs="[
                {
                    name: 'Teams',
                    path: '/admin/teams',
                    icon: 'fa-solid fa-people-group text-neutral-700 text-2xl'
                }
            ]"
        >
            <div class="flex items-center gap-4">
                <Can :subject="'teams'" :actions="['create']">
                    <AppButton
                        test-id="teams-add-team"
                        buttonStyle="primary"
                        href="/admin/teams/add"
                    >
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Team</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <div test-id="teams-table-wrapper" class="p-4">
            <Table
                :cols="['Name', 'Members', 'Created At']"
                :rows="rows"
                :page="page"
                :total="total"
                :per-page="perPage"
                :total-pages="totalPages"
                :on-next-page="onNextPage"
                :on-previous-page="onPreviousPage"
                :set-page="setPage"
                :entities="teams"
                entity-name="Team"
                :on-success="fetchTeams"
                :on-search="
                    (val: string) => {
                        query = val
                    }
                "
                :loading="loading"
                :subject="'teams'"
                :search-placeholder="'Search by team name'"
                :handleDelete="handleDelete"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Table from '@/components/Table.vue'
import type { Team, PaginatedResponse } from '@/util/interfaces'
import { apiGet, apiDelete } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/AppButton.vue'
import BreadCrums from '@/components/breadCrums.vue'
import Can from '@/components/Can.vue'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { formatDateToDay } from '@/util/util'

const teams = ref<Team[]>([])
const page = ref(1)
const perPage = ref(15)
const total = ref(0)
const totalPages = ref(1)
const query = ref('')
const loading = ref(true)
const rows = ref<{ [key: string]: any }[]>([])
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()



const mapRows = (items: Team[]) => {
    return items.map((team) => ({
        id: team.id,
        Name: team.name,
        Members: team.memberCount ?? 0,
        'Created At': formatDateToDay(team.createdAt)
    }))
}

const handleDelete = async (entity: Team) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete the team "${entity.name}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await apiDelete(`/teams/${entity.id}`, authStore)
                toast.showToast('Success', 'Team deleted successfully', 'success')
                await fetchTeams()
            } catch (error: any) {
                toast.showToast(
                    'Error',
                    error?.response?.data?.message || 'Failed to delete team. Please try again.',
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

const fetchTeams = () => {
    loading.value = true
    const params: Record<string, any> = {
        page: page.value,
        perPage: perPage.value
    }
    if (query.value) {
        params.search = query.value
    }
    apiGet<PaginatedResponse<Team>>('/teams', authStore, params)
        .then((res) => {
            loading.value = false
            teams.value = res.data
            total.value = res.totalCount
            totalPages.value = Math.ceil(res.totalCount / perPage.value)
            rows.value = mapRows(teams.value)
        })
        .catch(() => {
            loading.value = false
        })
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value = page.value + 1
        fetchTeams()
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value = page.value - 1
        fetchTeams()
    }
}

const setPage = (newPage: number) => {
    if (newPage != page.value) {
        page.value = newPage
        fetchTeams()
    }
}

onMounted(() => {
    fetchTeams()
})

watch(query, () => {
    page.value = 1
    fetchTeams()
})
</script>
