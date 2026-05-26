<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium text-opposite">Workflow Runs Kanban</h3>
                    <div class="flex items-center gap-2">
                        <AppButton buttonStyle="secondary" type="button" @click="refreshColumns">
                            Refresh
                        </AppButton>
                        <AppButton buttonStyle="secondary" type="button" @click="goBack">
                            Back
                        </AppButton>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <WorkflowRunsKanbanColumn
                        v-for="column in kanbanColumns"
                        :key="column.id"
                        :title="column.title"
                        :title-class="column.titleClass"
                        :link-mode="column.linkMode"
                        :state="columns[column.id]"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { getWorkflowRunsByStatus } from '@/components/automation/endpoints'
import WorkflowRunsKanbanColumn, {
    type KanbanColumnState,
} from '@/components/automation/WorkflowRunsKanbanColumn.vue'
import type { WorkflowRunLinkMode } from '@/components/automation/workflowRunDisplay'

type KanbanColumnId = 'awaiting' | 'inProgress' | 'done'

type KanbanColumnConfig = {
    id: KanbanColumnId
    title: string
    titleClass: string
    status: 'awaiting_action' | 'pending' | 'completed'
    linkMode: WorkflowRunLinkMode
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const workflowId = computed(() => (route.params.id ? (route.params.id as string) : null))
const perPage = 20

const kanbanColumns: KanbanColumnConfig[] = [
    {
        id: 'awaiting',
        title: 'Awaiting Action',
        titleClass: 'automation-kanban-column__title--awaiting',
        status: 'awaiting_action',
        linkMode: 'awaiting',
    },
    {
        id: 'inProgress',
        title: 'In Progress',
        titleClass: 'automation-kanban-column__title--pending',
        status: 'pending',
        linkMode: 'none',
    },
    {
        id: 'done',
        title: 'Done',
        titleClass: 'automation-kanban-column__title--completed',
        status: 'completed',
        linkMode: 'completed',
    },
]

const columns = reactive<Record<KanbanColumnId, KanbanColumnState>>({
    awaiting: { loading: false, totalCount: 0, runs: [] },
    inProgress: { loading: false, totalCount: 0, runs: [] },
    done: { loading: false, totalCount: 0, runs: [] },
})

const crumbs = computed(() => ([
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '/automation/workflows' },
    { name: 'Workflow Runs Kanban', path: '' },
]))

const loadColumn = async (column: KanbanColumnConfig) => {
    columns[column.id].loading = true
    try {
        const res = await getWorkflowRunsByStatus(
            workflowId.value,
            authStore,
            column.status,
            { page: 1, perPage },
        )
        columns[column.id].runs = res.data
        columns[column.id].totalCount = res.totalCount
    } finally {
        columns[column.id].loading = false
    }
}

const refreshColumns = async () => {
    try {
        await Promise.all(kanbanColumns.map((column) => loadColumn(column)))
    } catch {
        toast.showToast('Error', 'Failed to load workflow kanban runs', 'error')
    }
}

const goBack = () => {
    router.push('/automation/workflows')
}

onMounted(() => {
    refreshColumns()
})
</script>
