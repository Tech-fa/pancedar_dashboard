<template>
    <section class="bg-secondary border border-gray-800 rounded-lg">
        <div class="px-6 py-4 border-b border-gray-800">
            <h2 class="text-lg font-semibold text-opposite">
                Checklist Actions ({{ totalItemCount }})
            </h2>
            <p v-if="subtitle" class="text-sm text-opposite/60 mt-0.5">{{ subtitle }}</p>
        </div>

        <div class="p-6">
            <div v-if="!groups.length" class="text-opposite/60 text-sm text-center py-8">
                No checklist items to display
            </div>

            <div v-else class="space-y-8">
                <div v-for="group in groups" :key="group.type" class="space-y-3">
                    <div class="flex flex-wrap items-center gap-2 gap-y-1 pb-2 border-b border-gray-800/80">
                        <span class="px-2 py-0.5 rounded text-xs font-medium shrink-0" :class="group.type === 'PRE_JOB'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-teal-500/20 text-teal-400'">
                            {{ group.type === 'PRE_JOB' ? 'Pre-Job' : 'Post-Job' }}
                        </span>
                        <h3 class="text-base font-medium text-opposite">
                            {{ group.checklistName }}
                        </h3>
                        <span class="text-xs text-opposite/45">
                            {{ sortedGroupItems(group).length }}
                            {{ sortedGroupItems(group).length === 1 ? 'step' : 'steps' }}
                        </span>
                    </div>
                    <p v-if="group.description" class="text-sm text-opposite/55 -mt-1 mb-1">
                        {{ group.description }}
                    </p>

                    <div v-for="(item, idx) in sortedGroupItems(group)" :key="item.id"
                        class="flex gap-4 p-4 rounded-lg border border-gray-800 bg-main/30 hover:bg-main/50 transition-colors">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            :class="isItemCompleted(item)
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-700 text-gray-400'">
                            <i v-if="isItemCompleted(item)" class="fa-solid fa-check"></i>
                            <span v-else>{{ idx + 1 }}</span>
                        </div>

                        <div class="flex-1 min-w-0">
                            <span class="text-opposite font-medium">{{ item.name }}</span>
                            <p v-if="item.description" class="text-sm text-opposite/60 mt-1">
                                {{ item.description }}
                            </p>
                            <div v-if="isItemCompleted(item) && item.instance?.confirmedBy"
                                class="mt-2 text-xs text-opposite/50">
                                <i class="fa-solid fa-user-check mr-1"></i>
                                Confirmed
                                <span v-if="item.instance?.confirmedAt">
                                    at {{ formatDate(item.instance.confirmedAt) }} by {{ item.instance?.confirmedBy }}
                                </span>
                            </div>
                            <div v-else class="mt-2 text-xs text-opposite/50">
                                <i class="fa-solid fa-user-check mr-1"></i>
                                Not confirmed yet
                            </div>

                            <div v-if="item.inputType === 'connector' && item.instance"
                                class="mt-3 border-t border-gray-800/80 pt-3">
                                <button type="button"
                                    class="w-full flex items-center justify-between gap-2 text-left text-sm font-medium text-opposite/85 hover:text-opposite"
                                    @click="onToggleResponses(item)">
                                    <span class="flex items-center gap-2 min-w-0">
                                        <i class="fa-solid fa-bolt text-accent-blue shrink-0"></i>
                                        Action response
                                    </span>
                                    <i class="fa-solid fa-chevron-down text-[10px] text-opposite/50 shrink-0 transition-transform"
                                        :class="{ 'rotate-180': responsesOpen[item.id] }" />
                                </button>
                                <div v-show="responsesOpen[item.id]" class="mt-2 space-y-2 pl-0.5">
                                    <div v-if="responsesLoading[item.id]"
                                        class="flex items-center gap-2 text-xs text-opposite/50 py-2">
                                        <Spinner width="4" height="4" />
                                        Loading…
                                    </div>
                                    <template v-else-if="(responsesByItem[item.id] ?? []).length">
                                        <ExecutionResponseDisplay v-for="r in responsesByItem[item.id]" :key="r.id"
                                            variant="compact" :response="r" />
                                    </template>
                                    <p v-else class="text-xs text-opposite/45 py-1">No saved response for this step.</p>
                                </div>
                            </div>

                            <div v-if="item.dynamicFields?.length" class="mt-3 border-t border-gray-800/80 pt-3">
                                <button type="button"
                                    class="w-full flex items-center justify-between gap-2 text-left text-sm font-medium text-opposite/85 hover:text-opposite"
                                    @click="toggleFields(item.id)">
                                    <span class="flex items-center gap-2 min-w-0">
                                        <i class="fa-solid fa-list-ul text-teal-400/90 shrink-0"></i>
                                        Dynamic fields
                                        <span class="text-xs font-normal text-opposite/40">
                                            ({{ item.dynamicFields.length }})
                                        </span>
                                    </span>
                                    <i class="fa-solid fa-chevron-down text-[10px] text-opposite/50 shrink-0 transition-transform"
                                        :class="{ 'rotate-180': fieldsOpen[item.id] }" />
                                </button>
                                <div v-show="fieldsOpen[item.id]" class="mt-2 space-y-3 pl-0.5">
                                    <div v-for="field in sortedDynamicFields(item)" :key="field.id"
                                        class="rounded-md border border-gray-800/80 bg-main/20 px-3 py-2">
                                        <div class="text-xs text-opposite/50 mb-0.5 flex items-center gap-1">
                                            {{ field.name }}
                                            <span v-if="field.required" class="text-red-400">*</span>
                                            <span class="text-opposite/35 font-mono text-[10px]">{{ field.type }}</span>
                                        </div>
                                        <div v-if="field.type === 'image' || field.type === 'video' || field.type === 'file'"
                                            class="text-sm text-opposite break-words whitespace-pre-wrap">
                                            <DownloadButton :filePath="formatDynamicFieldValue(field, item)" />
                                        </div>
                                        <div v-else class="text-sm text-opposite break-words whitespace-pre-wrap">
                                            {{ formatDynamicFieldValue(field, item) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
    getResponses,
    type ChecklistActionsGroup,
    type ChecklistItemForJob,
    type DynamicField,
    type ResponseEntity,
} from './endpoints'
import Spinner from '@/components/Spinner.vue'
import ExecutionResponseDisplay from '@/components/ExecutionResponseDisplay.vue'
import DownloadButton from '../download-button.vue';

const CHECKLIST_ITEM_INSTANCE_SOURCE = 'checklist_item_instances'

const props = withDefaults(
    defineProps<{
        groups: ChecklistActionsGroup[]
        subtitle?: string
        completedItemIds?: Set<string> | string[]
    }>(),
    { subtitle: '', completedItemIds: undefined }
)

const authStore = useAuthStore()

const responsesOpen = ref<Record<string, boolean>>({})
const fieldsOpen = ref<Record<string, boolean>>({})
const responsesLoading = ref<Record<string, boolean>>({})
const responsesByItem = ref<Record<string, ResponseEntity[]>>({})
const responsesFetched = ref<Record<string, boolean>>({})

const totalItemCount = computed(() =>
    props.groups.reduce((n, g) => n + (g.items?.length ?? 0), 0)
)

const sortedGroupItems = (group: ChecklistActionsGroup): ChecklistItemForJob[] => {
    if (!group.items?.length) return []
    return [...group.items].sort((a, b) => a.order - b.order)
}

const isItemCompleted = (item: ChecklistItemForJob): boolean => {
    if (props.completedItemIds) {
        const ids = props.completedItemIds instanceof Set
            ? Array.from(props.completedItemIds)
            : props.completedItemIds
        return ids.includes(item.id)
    }
    return !!item.instance?.confirmedAt
}

const sortedDynamicFields = (item: ChecklistItemForJob): DynamicField[] => {
    if (!item.dynamicFields?.length) return []
    return [...item.dynamicFields].sort((a, b) => a.order - b.order)
}

const formatDynamicFieldValue = (field: DynamicField, item: ChecklistItemForJob): string => {
    const inst = item.instance?.dynamicFieldInstances?.find((d) => d.dynamicFieldId === field.id)
    if (!inst || inst.value === null || inst.value === undefined) {
        return '—'
    }

    const v = inst.value
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
    if (typeof v === 'object') return JSON.stringify(v, null, 2)
    return String(v)
}

const toggleFields = (itemId: string) => {
    const next = !fieldsOpen.value[itemId]
    fieldsOpen.value = { ...fieldsOpen.value, [itemId]: next }
}

const onToggleResponses = async (item: ChecklistItemForJob) => {
    const id = item.id
    const next = !responsesOpen.value[id]
    responsesOpen.value = { ...responsesOpen.value, [id]: next }

    if (!next || !item.instance || responsesFetched.value[id]) {
        return
    }

    responsesLoading.value = { ...responsesLoading.value, [id]: true }
    try {
        const list = await getResponses(authStore, {
            sourceId: item.instance.id,
            sourceType: CHECKLIST_ITEM_INSTANCE_SOURCE,
        })
        const arr = Array.isArray(list) ? list : []
        responsesByItem.value = { ...responsesByItem.value, [id]: arr }
    } catch {
        responsesByItem.value = { ...responsesByItem.value, [id]: [] }
    } finally {
        responsesFetched.value = { ...responsesFetched.value, [id]: true }
        responsesLoading.value = { ...responsesLoading.value, [id]: false }
    }
}

const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>
