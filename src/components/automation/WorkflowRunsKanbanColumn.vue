<template>
    <section class="automation-kanban-column space-y-3">
        <div class="automation-kanban-column__header">
            <h4 class="automation-kanban-column__title" :class="titleClass">{{ title }}</h4>
            <span class="text-xs text-opposite/50">{{ state.totalCount }}</span>
        </div>

        <div v-if="state.loading" class="flex justify-center py-8">
            <Spinner width="2.5" height="2.5" />
        </div>

        <div v-else-if="state.runs.length === 0" class="text-sm text-opposite/50 py-6 text-center">
            No runs.
        </div>

        <div v-else class="space-y-2">
            <WorkflowRunCard
                v-for="run in state.runs"
                :key="run.id"
                :run="run"
                mode="compact"
                :link-mode="linkMode"
            />
        </div>
    </section>
</template>

<script setup lang="ts">
import Spinner from '@/components/Spinner.vue'
import WorkflowRunCard from '@/components/automation/WorkflowRunCard.vue'
import type { WorkflowRun } from '@/components/automation/workflow.interface'
import type { WorkflowRunLinkMode } from '@/components/automation/workflowRunDisplay'

export type KanbanColumnState = {
    loading: boolean
    totalCount: number
    runs: WorkflowRun[]
}

defineProps<{
    title: string
    titleClass: string
    linkMode: WorkflowRunLinkMode
    state: KanbanColumnState
}>()
</script>
