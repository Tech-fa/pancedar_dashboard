<template>
    <div>
        <h4 class="text-sm font-medium text-opposite mb-4 flex items-center gap-2">
            <i class="fa-solid fa-bolt text-yellow-400"></i> Configure Trigger
        </h4>
        <div class="grid grid-cols-2 gap-4">
            <div v-if="ancestors?.length > 0">
                <label class="block text-xs text-opposite/60 mb-1">Injection From Step</label>
                <Select2 v-model="triggerModule" :values="triggerModules" :display="(t: any) => t?.sourceLabel || ''"
                    placeholder="Select trigger..." optional />
            </div>
            <template v-else>
                <div>
                    <label class="block text-xs text-opposite/60 mb-1">Trigger</label>
                    <Select2 v-model="currentTrigger" :values="sourceModules"
                        :display="(t: any) => snakeToCamelCase(t?.source || '') || ''" placeholder="Select trigger..."
                        optional />
                </div>
                <div v-if="sourceModules.find((m) => m.sourceType === currentTrigger?.sourceType)?.mustchoose">
                    <label class="block text-xs text-opposite/60 mb-1">Entity</label>
                    <Select2 v-model="currentTriggerEntity" :values="triggerEntities"
                        :display="(e: any) => e?.name || ''" placeholder="Select entity..." optional
                        @update:modelValue="onTriggerEntitySelected" />
                </div>
            </template>
            <!-- Condition Within -->
            <div class="col-span-2 border-t border-gray-700 pt-4 mt-2">
                <label class="block text-xs text-opposite/60 mb-1 font-medium">Trigger Conditions</label>
                <p class="text-[11px] text-opposite/45 mb-3">
                    Only trigger when all conditions below are met (AND logic).
                </p>

                <div v-if="conditionProperties.length === 0" class="text-xs text-opposite/40 py-2">
                    <span v-if="node.meta?.sourceType">Loading fields...</span>
                    <span v-else>Select a trigger to see available fields.</span>
                </div>

                <div v-else class="space-y-2">
                    <div v-for="row in localConditionRows" :key="row.id"
                        class="rounded-lg border border-gray-700 bg-secondary/50 p-3">
                        <div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                            <div>
                                <label class="block text-xs text-opposite/60 mb-1">Field</label>
                                <Select2 :modelValue="getSelectedField(row)" :values="conditionProperties"
                                    :display="(f: any) => f?.label || ''" placeholder="Select field..." optional
                                    @update:modelValue="(val: any) => onFieldChanged(row.id, val)" />
                            </div>
                            <div>
                                <label class="block text-xs text-opposite/60 mb-1">Operator</label>
                                <select :value="row.operator"
                                    @change="onOperatorChanged(row.id, ($event.target as HTMLSelectElement).value)"
                                    :class="[INPUT_CLASS, 'w-full']" :disabled="!row.field">
                                    <option value="">Select...</option>
                                    <option v-for="op in getOperatorsForField(row.field)" :key="op.value"
                                        :value="op.value">
                                        {{ op.label }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs text-opposite/60 mb-1">Value</label>
                                <input type="text" :value="row.value"
                                    @input="onValueChanged(row.id, ($event.target as HTMLInputElement).value)"
                                    placeholder="Value" :class="[INPUT_CLASS, 'w-full']" :disabled="!row.field" />
                            </div>
                            <div class="pb-1">
                                <button v-if="localConditionRows.length > 1" type="button"
                                    class="shrink-0 text-xs text-red-400 hover:text-red-300 p-1"
                                    @click="removeConditionRow(row.id)">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="text-xs text-indigo-400 hover:text-indigo-300 mt-1"
                        @click="addConditionRow"
                        v-if="(!currentTrigger?.mustchoose || currentTriggerEntity) && currentTrigger">
                        + Add condition
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { SourceModule, TriggerModule } from './dtos';
import type { FlowchartNode } from './flowchartTypes';
import Select2 from '../Select2.vue';
import { getSourceModules, getTriggerEntities, getWorkflowConditionFields, type ConditionField } from './endpoints';
import { useAuthStore } from '@/stores/auth';
import { INPUT_CLASS } from '@/components/contants';
import { snakeToCamelCase } from '@/util/util';

const props = defineProps<{
    node: FlowchartNode;
    ancestors: FlowchartNode[];
    updateNodeMeta: (nodeId: string, meta: Record<string, any>) => void;
    updateNodeLabel: (nodeId: string, label: string) => void;
    refreshSelectedNode: () => void;
    deleteFromMeta: (nodeId: string, keys: string[]) => void;
}>();

const currentTriggerEntity = ref<{ id: string; name: string } | null>(props.node.meta?.sourceId ? { id: props.node.meta?.sourceId || '', name: '' } : null);
const triggerModule = ref<TriggerModule | null>(props.node.meta?.sourceType && props.ancestors.length ? { sourceType: props.node.meta?.sourceType || '', source: props.node.meta?.source || '', sourceId: props.node.meta?.sourceId || '', step: props.node.meta?.step || '', sourceLabel: props.node.meta?.step || '' } : null)
const currentTrigger = ref<SourceModule | null>(props.node.meta?.sourceType && !props.ancestors.length ? { sourceType: props.node.meta?.sourceType || '', source: props.node.meta?.source || '', mustchoose: false } : null)
const triggerEntities = ref<{ id: string; name: string }[]>([])
const localConditionRows = ref<LocalConditionRow[]>([newConditionRow()])
const loading = ref(true)
const sourceModules = ref<SourceModule[]>([])
const authStore = useAuthStore()
function onTriggerEntitySelected(entity: { id: string; name: string } | null) {
    props.updateNodeMeta(props.node.id, {
        sourceId: entity?.id || undefined,
    })
    props.refreshSelectedNode()
}
watch(triggerModule, async (newVal) => {
    if (newVal) {
        props.updateNodeMeta(props.node.id, {
            sourceType: newVal.sourceType,
            source: newVal.source,
            sourceId: newVal.sourceId || undefined,
            step: newVal.step || undefined,
            sourceLabel: newVal.sourceLabel || undefined,
        })
        props.updateNodeLabel(props.node.id, newVal.sourceLabel || '')
        props.refreshSelectedNode();
        try {
            conditionProperties.value =
                (await getWorkflowConditionFields([
                    {
                        sourceType: newVal.sourceType || '',
                        sourceId: newVal.sourceId || undefined,
                        source: newVal.source,
                    }], authStore)).find((s) => s.sourceType === newVal.sourceType)?.properties || []
        } catch (error) {
            console.log('error getting condition properties', error)

        }
        localConditionRows.value = [newConditionRow()]
        syncConditionRowsToMeta()
    } else {

        props.deleteFromMeta(props.node.id, ['step', 'sourceLabel', 'sourceType', 'source', 'sourceId'])
        props.updateNodeLabel(props.node.id, 'Sub Trigger')
        props.refreshSelectedNode();
        localConditionRows.value = [newConditionRow()]
        syncConditionRowsToMeta()
    }
})

watch(currentTrigger, async (newVal) => {
    console.log('currentTrigger', newVal)
    if (newVal) {
        props.updateNodeMeta(props.node.id, {
            sourceType: newVal?.sourceType,
            source: newVal?.source,
        })
        props.updateNodeLabel(props.node.id, snakeToCamelCase(newVal?.source || '') || props.node?.label || 'Start')
        props.refreshSelectedNode()
        if (!newVal?.mustchoose && newVal) {
            conditionProperties.value =
                (await getWorkflowConditionFields([
                    {
                        sourceType:newVal?.sourceType,
                        source: newVal?.source
                    }], authStore)).find((s) => s.sourceType === props.node.meta?.sourceType)?.properties || []
            localConditionRows.value = [newConditionRow()]
            syncConditionRowsToMeta()
        } else {
            localConditionRows.value = [newConditionRow()]
            syncConditionRowsToMeta()
            triggerEntities.value = await getTriggerEntities(newVal?.source || '', authStore)
            if (props.node.meta?.sourceId) {
                currentTriggerEntity.value = triggerEntities.value.find((e) => e.id === props.node.meta?.sourceId) ?? null
            }
        }
    } else {
        props.updateNodeLabel(props.node.id, 'Start')
        props.refreshSelectedNode()
        localConditionRows.value = []
        syncConditionRowsToMeta()
    }


})
const triggerModules = computed(() => {
    return props.ancestors.filter((a) => a.kind == 'step').map((a) => ({ sourceLabel: a.label, sourceType: a.meta?.sourceType, step: a.label, sourceId: a.meta?.sourceId, source: a.meta?.source }))
})
watch(currentTriggerEntity, async (newVal, oldVal) => {
    if (oldVal?.id === newVal?.id) return
    props.refreshSelectedNode()
    props.updateNodeMeta(props.node.id, {
        sourceType: currentTrigger.value?.sourceType,
        source: currentTrigger.value?.source,
        sourceId: newVal?.id || undefined,
    })
    localConditionRows.value = [newConditionRow()]
    syncConditionRowsToMeta()
    conditionProperties.value =
        (await getWorkflowConditionFields([
            {
                sourceType: props.node.meta?.sourceType || '',
                sourceId: newVal?.id || undefined,
                source: props.node.meta?.source || '',
            }], authStore)).find((s) => s.sourceType === props.node.meta?.sourceType)?.properties || []
})

// ─── Condition Within ───

interface LocalConditionRow {
    id: string
    field: string
    operator: string
    value: string
}

const STRING_OPERATORS = [
    { value: 'eq', label: 'Equals' },
    { value: 'neq', label: 'Not equals' },
    { value: 'contains', label: 'Contains' },
]

const NUMBER_OPERATORS = [
    { value: 'eq', label: 'Equals' },
    { value: 'neq', label: 'Not equals' },
    { value: 'lt', label: 'Less than' },
    { value: 'gt', label: 'Greater than' },
]

const conditionProperties = ref<ConditionField[]>([])

function newConditionRow(): LocalConditionRow {
    return { id: crypto.randomUUID(), field: '', operator: '', value: '' }
}


function getSelectedField(row: LocalConditionRow) {
    if (!row.field) return null
    return conditionProperties.value.find((p: any) => p.key === row.field) || null
}

function getFieldType(fieldKey: string): string {
    const prop = conditionProperties.value.find((p: any) => p.key === fieldKey)
    return prop?.type || 'string'
}

function getOperatorsForField(fieldKey: string) {
    if (!fieldKey) return []
    return getFieldType(fieldKey) === 'number' ? NUMBER_OPERATORS : STRING_OPERATORS
}

function onFieldChanged(rowId: string, field: any) {
    localConditionRows.value = localConditionRows.value.map((r) =>
        r.id === rowId ? { ...r, field: field?.key || '', operator: '', value: '' } : r,
    )
    syncConditionRowsToMeta()
}

function onOperatorChanged(rowId: string, op: string) {
    localConditionRows.value = localConditionRows.value.map((r) =>
        r.id === rowId ? { ...r, operator: op } : r,
    )
    syncConditionRowsToMeta()
}

function onValueChanged(rowId: string, val: string) {
    localConditionRows.value = localConditionRows.value.map((r) =>
        r.id === rowId ? { ...r, value: val } : r,
    )
    syncConditionRowsToMeta()
}

function addConditionRow() {
    localConditionRows.value = [...localConditionRows.value, newConditionRow()]
    syncConditionRowsToMeta()
}

function removeConditionRow(rowId: string) {
    if (localConditionRows.value.length <= 1) return
    localConditionRows.value = localConditionRows.value.filter((r) => r.id !== rowId)
    syncConditionRowsToMeta()
}

function syncConditionRowsToMeta() {
    const rows = localConditionRows.value
        .filter((r) => r.field)
        .map((r) => ({ field: r.field, operator: r.operator, value: r.value }))
    props.updateNodeMeta(props.node.id, { conditionRows: rows })
    props.refreshSelectedNode()
}

watch(
    () => props.node.meta?.conditionRows,
    (metaRows) => {
        console.log('metaRows', metaRows)
        if (!metaRows || metaRows.length === 0) return
        const currentFields = localConditionRows.value
            .filter((r) => r.field)
            .map((r) => `${r.field}|${r.operator}|${r.value}`)
            .join(',')
        const metaFields = metaRows
            .map((r) => `${r.field}|${r.operator}|${r.value}`)
            .join(',')
        if (currentFields !== metaFields) {
            localConditionRows.value = metaRows.map((r) => ({
                id: crypto.randomUUID(),
                field: r.field,
                operator: r.operator,
                value: r.value || '',
            }))
        }
    },
    { immediate: true },
)

watch(() => props.node.id, async () => {
    try {
        const res = await getSourceModules(authStore)
        sourceModules.value = res
        const currentModule = res.find((m) => m.source === props.node.meta?.source);
        if (props.node.meta?.sourceType && currentModule) {
            conditionProperties.value =
                (await getWorkflowConditionFields([
                    {
                        sourceType: props.node.meta?.sourceType || '',
                        sourceId: props.node.meta?.sourceId || undefined,
                        source: props.node.meta?.source || '',
                    }], authStore)).find((s) => s.sourceType === props.node.meta?.sourceType)?.properties || []
            if (currentModule.mustchoose) {
                triggerEntities.value = await getTriggerEntities(currentModule.source || '', authStore)
                if (props.node.meta?.sourceId) {
                    currentTriggerEntity.value = triggerEntities.value.find((e) => e.id === props.node.meta?.sourceId) ?? null
                }
            }
        }
    } catch {
        sourceModules.value = []
    } finally {
        loading.value = false
    }


}, { immediate: true })


</script>
