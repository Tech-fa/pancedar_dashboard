<template>
    <div class="rounded-lg border border-gray-700 bg-main/40 overflow-hidden" :class="depth > 0 ? 'ml-6 mt-2' : ''">
        <div class="px-4 py-3 flex flex-wrap items-center gap-3 border-b border-gray-800/80">
            <span v-if="depth > 0"
                class="text-xs text-opposite/40 flex items-center gap-1">
                <i class="fa-solid fa-code-branch"></i>
                Branch
            </span>
            <span class="text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded"
                :class="instanceStatusClass(run.status)">
                {{ run.status }}
            </span>
            <span class="text-xs text-opposite/50">
                Started {{ formatDate(run.startedAt) }}
            </span>
            <span v-if="run.finishedAt" class="text-xs text-opposite/50">
                Finished {{ formatDate(run.finishedAt) }}
            </span>
            <span v-if="run.trigger" class="text-xs text-opposite/60 flex items-center gap-1">
                <i class="fa-solid fa-bolt text-yellow-500/80"></i>
                {{ snakeToCamelCase(run.trigger as string) }}
            </span>
            
        </div>

        <div v-if="run.errorMessage"
            class="px-4 py-2 text-xs text-red-400 border-b border-gray-800/80 bg-red-950/20">
            {{ run.errorMessage }}
        </div>

        <div class="px-4 py-3 space-y-4">
            <div v-for="step in run.stepInstances" :key="step.id"
                class="border border-gray-700/80 rounded-md p-3 space-y-2">
                <div class="flex flex-wrap items-baseline gap-2 text-sm">
                    <span class="text-opposite/50 text-xs">#{{ step.order }}</span>
                    <span class="font-medium text-opposite">{{ stepNameFn(step.workflowStep.name) }}</span>
                    <span v-if="step.status"
                        class="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-opposite/70">
                        {{ step.status }}
                    </span>
                </div>
                <ul v-if="variableBindingEntryTuples(step.workflowStep.variableBindings).length"
                    class="text-xs text-opposite/45 list-disc list-inside space-y-0.5 pl-1">
                    <li v-for="[paramKey, binding] in variableBindingEntryTuples(step.workflowStep.variableBindings)"
                        :key="paramKey">
                        {{ describeVariableBinding(paramKey, binding) }}
                    </li>
                </ul>
                <p v-if="step.errorMessage" class="text-xs text-red-400">{{ step.errorMessage }}</p>
                <CollapsibleJsonBlock
                    :collapsible="false"
                    label="Step payload"
                    :value="step.responseJson"
                />
                <div v-if="step.responses?.length" class="space-y-2 pt-1">
                    <span class="text-xs text-opposite/50">Responses</span>
                    <ExecutionResponseDisplay
                        v-for="resp in step.responses"
                        :key="resp.id"
                        variant="compact"
                        :response="resp"
                    />
                </div>
                <p v-if="!hasStepOutput(step)" class="text-xs text-opposite/40">No recorded output for this step.</p>
            </div>
        </div>

        <div v-if="run.childInstances?.length" class="px-4 pb-4 space-y-2">
            <InstanceNode v-for="child in run.childInstances" :key="child.id"
                :run="child" :depth="depth + 1" :step-name-fn="stepNameFn" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { WorkflowInstanceRun, WorkflowStepInstanceRun } from './endpoints'
import CollapsibleJsonBlock from '@/components/CollapsibleJsonBlock.vue'
import ExecutionResponseDisplay from '@/components/ExecutionResponseDisplay.vue'
import { formatDate, snakeToCamelCase } from '@/util/util'

defineProps<{
    run: WorkflowInstanceRun
    depth: number
    stepNameFn: (stepId: string) => string
}>()

function instanceStatusClass(status: string): string {
    const s = status?.toLowerCase() ?? ''
    if (s === 'completed') return 'bg-emerald-900/50 text-emerald-300'
    if (s === 'failed') return 'bg-red-900/50 text-red-300'
    if (s === 'running') return 'bg-amber-900/50 text-amber-200'
    return 'bg-gray-800 text-opposite/70'
}

/** e.g. VehicleJob → Vehicle Job */
function humanizeModuleName(moduleId: string): string {
    if (!moduleId) return ''
    return moduleId
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .trim()
}

function fieldFromMappedTo(mappedTo: string): string {
    if (!mappedTo) return ''
    const i = mappedTo.lastIndexOf(':')
    return i >= 0 ? mappedTo.slice(i + 1) : mappedTo
}

function describeVariableBinding(paramKey: string, raw: unknown): string {
    if (raw == null || typeof raw !== 'object') {
        return `${paramKey} — (unknown binding)`
    }
    const b = raw as Record<string, unknown>
    const type = b.type
    if (type === 'injectable') {
        const module = String(b.module ?? '')
        const property = String(b.property ?? '')
        const label = humanizeModuleName(module) || module
        return `${paramKey} — from ${label}'s ${property}`
    }
    if (type === 'response') {
        const step = b.step != null && String(b.step).length ? String(b.step) : ''
        const mappedTo = String(b.mappedTo ?? '')
        const field = fieldFromMappedTo(mappedTo)
        if (step) {
            return `${paramKey} — from step “${step}”${field ? `, field ${field}` : ''}`
        }
        return `${paramKey} — from a previous step${field ? ` (${field})` : ''}`
    }
    if (type === 'constant') {
        return `${paramKey} — constant value`
    }
    return `${paramKey} — ${String(type ?? 'binding')}`
}

function variableBindingEntryTuples(
    bindings: Record<string, unknown> | null | undefined,
): [string, unknown][] {
    if (!bindings || typeof bindings !== 'object') return []
    return Object.entries(bindings)
}

function hasStepOutput(step: WorkflowStepInstanceRun): boolean {
    if (step.errorMessage) return true
    if (step.responses?.length) return true
    if (step.responseJson && typeof step.responseJson === 'object' && Object.keys(step.responseJson).length > 0) return true
    return false
}
</script>
