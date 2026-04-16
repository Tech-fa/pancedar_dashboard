<template>
    <div class="border border-gray-800 rounded-lg overflow-hidden">
        <div class="px-6 py-4 bg-main/30 border-b border-gray-800">
            <div class="flex items-center gap-3">
                <div
                    class="w-9 h-9 rounded-full bg-accent-blue flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {{ stepNumber }}
                </div>
                <div>
                    <p class="text-opposite font-semibold">{{ item.name }}</p>
                    <p v-if="item.description" class="text-xs text-opposite/50 mt-0.5">
                        {{ item.description }}
                    </p>
                </div>
            </div>
        </div>

        <div class="px-6 py-5 space-y-4">
            <!-- Connector action execution -->
            <div v-if="item.inputType === 'connector'" class="space-y-4">
                <!-- Action details (what will run) -->
                <div v-if="connectorActionSummary" class="rounded-lg border border-gray-700 bg-main/40 p-4 space-y-3">
                    <h4 class="text-sm font-semibold text-opposite flex items-center gap-2">
                        <i class="fa-solid fa-bolt text-accent-blue"></i>
                        Action details
                    </h4>
                    <dl class="space-y-2.5 text-sm">
                        <div v-if="connectorActionSummary.actionName">
                            <dt class="text-opposite/50 text-xs uppercase tracking-wide">Action</dt>
                            <dd class="text-opposite font-medium mt-0.5">{{ connectorActionSummary.actionName }}</dd>
                        </div>
                        <div v-if="connectorActionSummary.connectorName">
                            <dt class="text-opposite/50 text-xs uppercase tracking-wide">Connector</dt>
                            <dd class="text-opposite mt-0.5">{{ connectorActionSummary.connectorName }}</dd>
                        </div>

                    </dl>
                </div>

                <!-- Pre-execution: show execute button when action instance exists -->
                <div v-if="!connectorExecuted && !connectorLoading && !connectorError">
                    <p class="text-sm text-opposite/60 mb-3">
                        This step requires executing an automated action.
                    </p>
                    <button type="button"
                        class="px-5 py-2.5 text-sm font-medium rounded-lg bg-accent-blue text-white hover:bg-accent-blue/80 transition-colors flex items-center gap-2"
                        @click="runConnectorAction">
                        <i class="fa-solid fa-bolt"></i>
                        Execute Action
                    </button>
                </div>

                <div v-if="connectorLoading" class="flex items-center gap-2 text-opposite/60 text-sm">
                    <Spinner width="4" height="4" />
                    Executing action...
                </div>
                <div v-else-if="connectorError" class="space-y-3">
                    <div class="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <i class="fa-solid fa-circle-exclamation mr-1"></i>
                        {{ connectorError }}
                    </div>
                    <button type="button"
                        class="px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 text-opposite/70 hover:bg-gray-600 transition-colors"
                        @click="runConnectorAction">
                        <i class="fa-solid fa-rotate-right mr-1"></i>
                        Retry
                    </button>
                </div>
                <div v-else-if="connectorResult" class="space-y-3">
                    <div v-if="priorExecutionLoaded"
                        class="text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 flex gap-2">
                        <i class="fa-solid fa-clock-rotate-left shrink-0 mt-0.5 text-amber-400"></i>
                        <span>
                            This step was already executed. The payload below is from the last saved run (e.g. after using <strong>Previous</strong>).
                            Use <strong>Run action again</strong> if you need a fresh response, then confirm when ready.
                        </span>
                    </div>
                    <ExecutionResponseDisplay :response="connectorResult" />

                    <button type="button"
                        class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-600 text-opposite/80 hover:bg-gray-800 hover:text-opposite transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        :disabled="connectorLoading" @click="runConnectorAction">
                        <i class="fa-solid fa-rotate"></i>
                        Run action again
                    </button>

                    <p class="text-sm text-opposite/60">
                        Review the result above. You can proceed to confirm this step or abort the mission.
                    </p>
                </div>
            </div>

            <!-- Dynamic fields -->
            <div v-if="item.dynamicFields && item.dynamicFields.length > 0" class="space-y-4">
                <div v-for="field in sortedFields" :key="field.id">
                    <label class="block text-sm text-opposite/70 mb-1">
                        {{ field.name }}
                        <span v-if="field.required" class="text-red-500">*</span>
                    </label>
                    <input v-if="field.type === 'text'" type="text" :class="inputClass(field)" :placeholder="field.name"
                        :data-field-id="field.id" :data-required="field.required" :value="fieldValues[field.id] ?? ''"
                        @input="onFieldInput(field.id, ($event.target as HTMLInputElement).value)" />
                    <textarea v-else-if="field.type === 'textarea'" :class="textareaClass(field)" rows="3"
                        :placeholder="field.name" :data-field-id="field.id" :data-required="field.required"
                        :value="fieldValues[field.id] ?? ''"
                        @input="onFieldInput(field.id, ($event.target as HTMLTextAreaElement).value)"></textarea>
                    <select v-else-if="field.type === 'options' && field.options" :class="inputClass(field)"
                        :data-field-id="field.id" :data-required="field.required" :value="fieldValues[field.id] ?? ''"
                        @change="onFieldInput(field.id, ($event.target as HTMLSelectElement).value)">
                        <option value="">Select...</option>
                        <option v-for="opt in field.options" :key="opt" :value="opt">
                            {{ opt }}
                        </option>
                    </select>
                    <div v-else-if="['image', 'video', 'file'].includes(field.type)">
                        <input type="file" :accept="field.type === 'image'
                            ? 'image/*'
                            : field.type === 'video'
                                ? 'video/*'
                                : '*'
                            "
                            class="block w-full text-sm text-opposite/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-opposite hover:file:bg-gray-600"
                            :data-field-id="field.id" :data-required="field.required"
                            @change="onFileChange(field.id, $event)" />
                        <p v-if="field.required && !fileSelections[field.id]" class="text-xs text-red-500 mt-1">
                            Required
                        </p>
                        <p v-else-if="fileSelections[field.id]" class="text-xs text-green-500 mt-1">
                            {{ fileSelections[field.id]?.name }}
                        </p>
                    </div>
                    <p v-if="field.required && fieldErrors[field.id]" class="text-xs text-red-500 mt-1">
                        {{ fieldErrors[field.id] }}
                    </p>
                </div>
            </div>
            <div v-else-if="item.inputType !== 'connector'" class="text-sm text-opposite/50 py-2">
                No fields for this step. Confirm to proceed.
            </div>

            <!-- Abort mission section -->
            <div v-if="showAbortSection" class="border-t border-gray-800 pt-4 space-y-3">
                <div v-if="!showAbortForm" class="flex justify-end">
                    <button type="button"
                        class="px-4 py-2 text-sm font-medium rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                        @click="showAbortForm = true">
                        <i class="fa-solid fa-ban mr-1"></i>
                        Abort Mission
                    </button>
                </div>
                <div v-else class="space-y-3 bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                    <p class="text-sm font-medium text-red-400">
                        <i class="fa-solid fa-triangle-exclamation mr-1"></i>
                        Abort Mission
                    </p>
                    <p class="text-xs text-opposite/60">
                        This will cancel the entire job. Please provide a reason.
                    </p>
                    <textarea v-model="abortReason" rows="3" placeholder="Reason for cancellation..."
                        class="w-full rounded-lg bg-main border border-red-500/30 text-opposite text-sm px-3 py-2 focus:outline-none focus:border-red-500"></textarea>
                    <div class="flex items-center gap-2 justify-end">
                        <button type="button"
                            class="px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 text-opposite/70 hover:bg-gray-600 transition-colors"
                            @click="showAbortForm = false; abortReason = ''">
                            Cancel
                        </button>
                        <button type="button"
                            class="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="!abortReason.trim() || aborting" @click="onAbortMission">
                            <Spinner v-if="aborting" width="4" height="4" class="inline mr-1" />
                            <i v-else class="fa-solid fa-ban mr-1"></i>
                            Confirm Abort
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-800">
                <button v-if="showPrevious" type="button"
                    class="px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 text-opposite/70 hover:bg-gray-600 transition-colors"
                    @click="$emit('previous')">
                    <i class="fa-solid fa-arrow-left mr-1"></i>
                    Previous
                </button>
                <div v-else></div>

                <button type="button"
                    class="px-5 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="canConfirm
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'" :disabled="!canConfirm" @click="onConfirm">
                    <i class="fa-solid fa-check mr-1"></i>
                    {{ isLastStep ? 'Complete Checklist' : 'Confirm & Next' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { createOrGetChecklistItemInstance, changeVehicleJobStatus, executeActionFromChecklist, getResponses } from './endpoints'
import type { ChecklistItemForJob, ChecklistItemConfirmStoreFields, DynamicField } from './endpoints'
import Spinner from '@/components/Spinner.vue'
import ExecutionResponseDisplay from '@/components/ExecutionResponseDisplay.vue'

/** Matches backend `executeActionFromChecklist` / Response rows */
const CHECKLIST_ITEM_INSTANCE_SOURCE = 'checklist_item_instances'

const props = defineProps<{
    item: ChecklistItemForJob
    stepNumber: number
    fieldValues: Record<string, string>
    jobId: string
    showPrevious?: boolean
    isLastStep?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:fieldValues', v: Record<string, string>): void
    (e: 'confirm', payload: { instanceId: string; storeFields: ChecklistItemConfirmStoreFields }): void
    (e: 'previous'): void
    (e: 'aborted'): void
}>()

const authStore = useAuthStore()
const toast = useToast()
const fileSelections = ref<Record<string, File | null>>({})
const fieldErrors = ref<Record<string, string>>({})
const connectorLoading = ref(false)
const connectorError = ref<string | null>(null)
const connectorResult = ref<Record<string, any> | null>(null)
const connectorExecuted = ref(false)
/** True when result UI was filled from GET /responses (navigating back), not from a new run in this session */
const priorExecutionLoaded = ref(false)
const currentInstanceId = ref<string | null>(null)
const showAbortForm = ref(false)
const abortReason = ref('')
const aborting = ref(false)

const hasActionInstance = computed(() => {
    return props.item.inputType === 'connector' && !!props.item.actionInstance
})

/** What will run when the user clicks Execute — from action instance + connector type action */
const connectorActionSummary = computed(() => {
    const ai = props.item.actionInstance
    if (!ai || props.item.inputType !== 'connector') return null

    const cta = ai.connectorTypeAction
    const conn = ai.connector ?? props.item.connector

    const actionName = (ai.name || cta?.name || props.item.name || '').trim()
    const connectorName = (conn?.name ?? '').trim()
    const integrationType = (conn?.connectorType?.name ?? '').trim()
    const description = cta?.description?.trim() || null
    const functionName = (cta?.functionName ?? '').trim()

    const cfg = ai.actionConfig
    const configEntries: { key: string; value: string }[] = []
    if (cfg && typeof cfg === 'object' && !Array.isArray(cfg)) {
        for (const [key, val] of Object.entries(cfg)) {
            if (val === null || val === undefined || val === '') continue
            configEntries.push({
                key,
                value: typeof val === 'object' ? JSON.stringify(val) : String(val)
            })
        }
    }

    const hasAny =
        actionName ||
        connectorName ||
        integrationType ||
        description ||
        functionName ||
        configEntries.length > 0

    if (!hasAny) return null

    return {
        actionName,
        connectorName,
        integrationType,
        description,
        functionName,
        configEntries
    }
})

const showAbortSection = computed(() => {
    return hasActionInstance.value && connectorExecuted.value && !connectorLoading.value
})

const runConnectorAction = async () => {
    if (!currentInstanceId.value) return
    connectorLoading.value = true
    connectorError.value = null
    connectorResult.value = null
    priorExecutionLoaded.value = false
    try {
        const result = await executeActionFromChecklist(
            { checklistItemInstanceId: currentInstanceId.value },
            authStore
        )
        connectorResult.value = result && typeof result === 'object' ? result : { result }
        connectorExecuted.value = true
    } catch (err: any) {
        const errMsg = err?.response?.data?.message || err?.message || 'Failed to execute connector action'
        connectorError.value = errMsg
        toast.showToast('Error', errMsg, 'error')
    } finally {
        connectorLoading.value = false
    }
}

const onAbortMission = async () => {
    if (!abortReason.value.trim()) return
    aborting.value = true
    try {
        await changeVehicleJobStatus(props.jobId, 'Cancelled', authStore, abortReason.value.trim())
        toast.showToast('Mission Aborted', 'The job has been cancelled.', 'success')
        emit('aborted')
    } catch (err: any) {
        toast.showToast('Error', err?.response?.data?.message || 'Failed to abort mission', 'error')
    } finally {
        aborting.value = false
    }
}

const sortedFields = computed(() => {
    if (!props.item.dynamicFields?.length) return []
    return [...props.item.dynamicFields].sort((a, b) => a.order - b.order)
})

const isRequiredFieldFilled = (field: DynamicField): boolean => {
    if (!field.required) return true
    if (['image', 'video', 'file'].includes(field.type)) {
        return !!fileSelections.value[field.id]
    }
    const val = props.fieldValues[field.id]
    if (typeof val !== 'string') return false
    return val.trim().length > 0
}

const canConfirm = computed(() => {
    if (hasActionInstance.value && !connectorExecuted.value) return false
    if (!props.item.dynamicFields?.length) return true
    return sortedFields.value.every((f) => isRequiredFieldFilled(f))
})

const inputClass = (field: DynamicField): string => {
    const base = 'w-full rounded-lg bg-main border text-opposite text-sm px-3 py-2 focus:outline-none focus:border-accent-blue'
    const border = field.required && fieldErrors.value[field.id] ? 'border-red-500' : 'border-gray-700'
    return `${base} ${border}`
}

const textareaClass = (field: DynamicField): string => inputClass(field)

const onFieldInput = (fieldId: string, value: string) => {
    const next = { ...props.fieldValues, [fieldId]: value }
    emit('update:fieldValues', next)
    if (fieldErrors.value[fieldId]) {
        const { [fieldId]: _, ...rest } = fieldErrors.value
        fieldErrors.value = rest
    }
}

const onFileChange = (fieldId: string, event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0] ?? null
    fileSelections.value = { ...fileSelections.value, [fieldId]: file }
}

const onConfirm = () => {
    if (!canConfirm.value || !currentInstanceId.value) return
    let hasError = false
    const errors: Record<string, string> = {}
    for (const field of sortedFields.value) {
        if (field.required && !isRequiredFieldFilled(field)) {
            errors[field.id] = `${field.name} is required`
            hasError = true
        }
    }
    fieldErrors.value = errors
    if (hasError) return

    const files: Record<string, File> = {}
    for (const field of sortedFields.value) {
        if (['image', 'video', 'file'].includes(field.type)) {
            const f = fileSelections.value[field.id]
            if (f) files[field.id] = f
        }
    }
    const fieldValuesForStep: Record<string, string> = {}
    for (const field of sortedFields.value) {
        if (!['image', 'video', 'file'].includes(field.type)) {
            fieldValuesForStep[field.id] = props.fieldValues[field.id] ?? ''
        }
    }

    emit('confirm', {
        instanceId: currentInstanceId.value,
        storeFields: { fieldValues: fieldValuesForStep, files },
    })
}

const resetConnectorState = () => {
    connectorLoading.value = false
    connectorError.value = null
    connectorResult.value = null
    connectorExecuted.value = false
    priorExecutionLoaded.value = false
    showAbortForm.value = false
    abortReason.value = ''
}

const loadStoredConnectorResponses = async (instanceId: string) => {
    priorExecutionLoaded.value = false
    if (
        props.item.inputType !== 'connector' ||
        !props.item.actionInstance ||
        !instanceId
    ) {
        return
    }
    try {
        const list = await getResponses(authStore, {
            sourceId: instanceId,
            sourceType: CHECKLIST_ITEM_INSTANCE_SOURCE,
        })
        const latest = list?.[0]
        if (!latest) return
        connectorResult.value = {
            responseJson: latest.responseJson ?? {},
            mappedResponseJson: latest.mappedResponseJson ?? {},
        }
        connectorExecuted.value = true
        priorExecutionLoaded.value = true
    } catch {
        /* ignore: pilot can still run the action fresh */
    }
}

const initInstance = async () => {
    const instance = await createOrGetChecklistItemInstance(
        props.jobId,
        { checklistItemId: props.item.id },
        authStore
    )
    currentInstanceId.value = instance.id
    await loadStoredConnectorResponses(instance.id)
    return instance
}

/** Previous / Next must both re-fetch instance + stored connector responses; stepNumber changes on Previous even when relying on parent updates. */
watch(
    [() => props.jobId, () => props.item.id, () => props.stepNumber],
    async () => {
        if (!props.jobId) return
        fileSelections.value = {}
        fieldErrors.value = {}
        resetConnectorState()
        await initInstance()
    },
    { immediate: true },
)
</script>
