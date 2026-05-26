<template>
    <AutomationGlowCard tag="article" :interactive="false">
        <div class="min-w-0">
            <div class="automation-card-title">{{ capitalizeFirstLetter(workflow.name) }}</div>
            <div class="automation-card-subtitle">{{ workflow.workflowType }}</div>
        </div>

        <p v-if="workflow.description" class="text-sm text-white/75 leading-relaxed">
            {{ workflow.description }}
        </p>

        <hr class="automation-card-line" />

        <ul class="automation-card-list">
            <li v-if="workflow.createdAt" class="automation-card-list-item">
                <span class="automation-card-check" aria-hidden="true">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.2 11.2 3.4 8.4l-1 1 3.8 3.8 7.8-7.8-1-1z" />
                    </svg>
                </span>
                <span class="automation-card-meta">
                    <span class="automation-card-meta-label">Created:</span>
                    {{ formatDate(workflow.createdAt) }}
                </span>
            </li>
            <li v-if="workflow.updatedAt" class="automation-card-list-item">
                <span class="automation-card-check" aria-hidden="true">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.2 11.2 3.4 8.4l-1 1 3.8 3.8 7.8-7.8-1-1z" />
                    </svg>
                </span>
                <span class="automation-card-meta">
                    <span class="automation-card-meta-label">Updated:</span>
                    {{ formatDate(workflow.updatedAt) }}
                </span>
            </li>
        </ul>

        <div class="flex items-center gap-2 flex-wrap justify-end pt-1">
            <slot />
        </div>
    </AutomationGlowCard>
</template>

<script setup lang="ts">
import AutomationGlowCard from '@/components/automation/AutomationGlowCard.vue'
import type { Workflow } from '@/components/automation/workflow.interface'
import { capitalizeFirstLetter, formatDate } from '@/util/util'

defineProps<{
    workflow: Workflow
}>()
</script>
