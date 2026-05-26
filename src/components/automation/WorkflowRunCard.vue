<template>
    <AutomationGlowCard
        :tag="href ? 'a' : 'article'"
        :href="href ?? undefined"
        :target="href ? '_blank' : undefined"
        :interactive="!!href"
    >
        <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
                <div class="automation-card-title">{{ run.workflow?.name || 'Workflow run' }}</div>
                <div v-if="mode === 'full'" class="automation-card-subtitle">{{ run.id }}</div>
            </div>
            <span
                v-if="showStatus"
                class="automation-status-badge shrink-0"
                :class="workflowRunStatusBadgeClass(run.status)"
            >
                {{ run.status }}
            </span>
        </div>

        <hr class="automation-card-line" />

        <ul v-if="contextEntries.length" class="automation-card-list">
            <li
                v-for="entry in contextEntries"
                :key="entry.key"
                class="automation-card-list-item"
            >
                <span class="automation-card-check" aria-hidden="true">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.2 11.2 3.4 8.4l-1 1 3.8 3.8 7.8-7.8-1-1z" />
                    </svg>
                </span>
                <span class="min-w-0 break-all">
                    <span class="automation-card-meta-label">{{ entry.key }}:</span>
                    {{ formatDisplayValue(entry.value) }}
                </span>
            </li>
        </ul>

        <div v-if="metaLines.length" class="space-y-1">
            <div
                v-for="line in metaLines"
                :key="line.label"
                class="automation-card-meta"
            >
                <span class="automation-card-meta-label">{{ line.label }}:</span>
                {{ line.value }}
            </div>
        </div>

        <div class="automation-card-meta">
            <span class="automation-card-meta-label">Updated:</span>
            {{ formatDate(run.updatedAt) }}
        </div>

        <div v-if="mode === 'full'" class="automation-card-meta">
            <span class="automation-card-meta-label">Created:</span>
            {{ formatDate(run.createdAt) }}
        </div>

        <div v-if="mode === 'full' && run.explanation?.explanation" class="text-sm">
            <span class="automation-card-meta-label">Explanation:</span>
            <span class="text-opposite/90 font-medium">{{ run.explanation.explanation }}</span>
        </div>

        <div v-if="mode === 'full' && actionLinks.length" class="flex flex-wrap gap-2 pt-1">
            <a
                v-for="link in actionLinks"
                :key="link.href"
                :href="link.href"
                target="_blank"
                class="automation-card-action"
                @click.stop
            >
                <i class="fa-solid fa-arrow-up-right-from-square text-[0.65rem]" />
                {{ link.label }}
            </a>
        </div>
    </AutomationGlowCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AutomationGlowCard from '@/components/automation/AutomationGlowCard.vue'
import type { WorkflowRun } from '@/components/automation/workflow.interface'
import { formatDate, formatIfTimestamp } from '@/util/util'
import {
    workflowRunActionLinks,
    workflowRunCardHref,
    workflowRunDisplayContextEntries,
    workflowRunMetaLines,
    workflowRunStatusBadgeClass,
    type WorkflowRunCardMode,
    type WorkflowRunLinkMode,
} from '@/components/automation/workflowRunDisplay'

const props = withDefaults(
    defineProps<{
        run: WorkflowRun
        mode?: WorkflowRunCardMode
        linkMode?: WorkflowRunLinkMode
        showStatus?: boolean
    }>(),
    {
        mode: 'compact',
        linkMode: 'auto',
        showStatus: false,
    },
)

const href = computed(() => workflowRunCardHref(props.run, props.linkMode))
const contextEntries = computed(() => workflowRunDisplayContextEntries(props.run))
const metaLines = computed(() => workflowRunMetaLines(props.run, props.mode))
const actionLinks = computed(() =>
    props.mode === 'full' ? workflowRunActionLinks(props.run) : [],
)

function formatDisplayValue(value: unknown): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return formatIfTimestamp(value)
    }
    return String(value)
}
</script>
