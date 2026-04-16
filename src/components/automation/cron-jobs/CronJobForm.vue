<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />
        <div class="px-6 pb-6 pt-4">
            <div class="max-w-3xl mx-auto">
                <h3 class="text-lg font-medium text-opposite mb-6">
                    {{ isEditing ? 'Edit Cron Job' : 'New Cron Job' }}
                </h3>

                <div v-if="pageLoading" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else class="bg-secondary rounded-lg border border-gray-800 p-6 space-y-4">
                    <div>
                        <label class="block text-xs text-opposite/60 mb-1">Name</label>
                        <input v-model="formName" type="text" placeholder="e.g. Nightly Email Report"
                            :class="[INPUT_CLASS, 'w-full']" />
                    </div>

                    <div>
                        <label class="block text-xs text-opposite/60 mb-1">Description</label>
                        <input v-model="formDescription" type="text" placeholder="Optional description"
                            :class="[INPUT_CLASS, 'w-full']" />
                    </div>

                    <ConnectorActionPicker
                        :connectors="connectors"
                        :selectedConnector="formConnector"
                        :selectedActionInstance="formActionInstance"
                        :variable-bindings="variableBindings"
                        :injection-modules="injectableModulesForCron"
                        :selected-injection-module="formInjectionModule"
                        @update:selectedConnector="onConnectorChanged"
                        @update:selectedActionInstance="onActionInstanceChanged"
                        @update:variableBindings="onPickerBindingsChanged"
                        @update:selectedInjectionModule="onInjectionModuleChanged"
                        @reload-connectors="loadDependencies"
                    />

                    <div v-if="formInjectionModule && conditionalPropsForSelectedModule.length > 0"
                        class="rounded-lg border border-gray-600 bg-secondary/50 p-3 space-y-3">
                        <label class="block text-xs text-opposite/60 font-medium">Module conditions</label>
                        <p class="text-[11px] text-opposite/45 -mt-2">
                            Choose a field, then operator and value. Operators and values follow the injectables config.
                            Add more conditions when the module exposes several conditional fields.
                        </p>
                        <div v-for="row in moduleConditionRows" :key="row.id"
                            class="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                            <div class="flex flex-col gap-2">
                                <div class="flex flex-col sm:flex-row gap-2 sm:items-end">
                                    <div class="flex-1 min-w-0">
                                        <Select2 :modelValue="findModuleConditionFieldOptionForKey(row.fieldKey)"
                                            :values="conditionFieldOptionsForRow(row.id)"
                                            :display="(o: ConditionFieldOption | null) => o?.label || ''"
                                            label="Field"
                                            placeholder="Field…"
                                            @update:modelValue="(val: ConditionFieldOption | null) => onModuleConditionFieldChange(row.id, val)" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <Select2 :modelValue="findModuleConditionOperatorOptionForRow(row)"
                                            :values="conditionOperatorOptionsForFieldKey(row.fieldKey)"
                                            :display="(o: ConditionOperatorOption | null) => o?.label || ''"
                                            label="Operator"
                                            placeholder="Operator…"
                                            @update:modelValue="(val: ConditionOperatorOption | null) => onModuleConditionOperatorChange(row.id, val)" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <Select2
                                            v-if="moduleConditionValueSelectProp(row)"
                                            :modelValue="findModuleConditionValueOptionForRow(row)"
                                            :values="conditionValueSelectOptions(moduleConditionValueSelectProp(row)!)"
                                            :display="(o: InjectableConditionOption | null) => o?.label || ''"
                                            label="Value"
                                            placeholder="Value…"
                                            @update:modelValue="(val: InjectableConditionOption | null) => onModuleConditionValueOptionSelected(row.id, val)" />
                                        <div v-else>
                                            <label class="block text-xs text-opposite/60 mb-1 ml-1">Value</label>
                                            <AppInput :modelValue="row.value"
                                                @update:modelValue="(v: string) => onModuleConditionValueChange(row.id, v)"
                                                type="text" placeholder="Value…" hideIcon
                                                class="w-full text-xs" />
                                        </div>
                                    </div>
                                    <button v-if="moduleConditionRows.length > 1" type="button"
                                        class="shrink-0 text-xs text-red-400 hover:text-red-300 py-2 sm:mb-0.5"
                                        @click="removeModuleConditionRow(row.id)">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                        <AppButton v-if="canAddModuleCondition" buttonStyle="secondary" type="button"
                            class="text-xs !py-1.5" @click="addModuleConditionRow">
                            Add condition
                        </AppButton>
                    </div>

                    <div>
                        <label class="block text-xs text-opposite/60 mb-1">Frequency</label>
                        <Select2 :modelValue="selectedFrequency" :values="FREQUENCY_OPTIONS"
                            :display="(f: FrequencyOption | null) => f?.label || ''" placeholder="Select frequency..."
                            @update:modelValue="onFrequencySelected" />
                    </div>

                    <div class="flex items-center gap-2">
                        <label class="text-xs text-opposite/60">Active</label>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" v-model="formIsActive" class="sr-only peer" />
                            <div
                                class="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600">
                            </div>
                        </label>
                    </div>

                    <div class="flex items-center gap-3 pt-2">
                        <AppButton buttonStyle="secondary" type="button" @click="cancel">
                            Cancel
                        </AppButton>
                        <AppButton buttonStyle="primary" type="button" @click="saveJob" :loading="isSaving">
                            {{ isEditing ? 'Update' : 'Create' }}
                        </AppButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import Select2 from '@/components/Select2.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getCronJobById,
    createCronJob,
    updateCronJob,
} from '@/components/automation/endpoints'
import type {
    CronJob,
    CronJobModuleCondition,
    CronJobVariableBinding,
} from '@/components/automation/endpoints'
import {
    getConnectors,
    getInjectables,
} from '@/components/fleet/endpoints'
import type {
    Connector,
    ConnectorActionInstance,
    InjectableConditionOption,
    InjectableConditionOperator,
    InjectableModule,
    InjectableProperty,
    VariableBinding,
} from '@/components/fleet/endpoints'
import AppInput from '@/components/AppInput.vue'
import ConnectorActionPicker from '@/components/ConnectorActionPicker.vue'
import { INPUT_CLASS } from '@/components/contants'
import { FREQUENCY_OPTIONS } from './frequencies'
import type { FrequencyOption } from './frequencies'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const cronJobId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!cronJobId.value)

const pageLoading = ref(false)
const isSaving = ref(false)

const connectors = ref<Connector[]>([])

const formName = ref('')
const formDescription = ref('')
const formConnector = ref<Connector | null>(null)
const formActionInstance = ref<ConnectorActionInstance | null>(null)
const selectedFrequency = ref<FrequencyOption | null>(null)
const formIsActive = ref(true)

const injectableModulesForCron = ref<Record<string, InjectableModule>>({})
const formInjectionModule = ref<string | null>(null)
const moduleConditionRows = ref<ModuleConditionRow[]>([])
const variableBindings = ref<Record<string, VariableBinding>>({})

/** When a conditional property omits `operators`, cron UI uses these (backwards compatible). */
const DEFAULT_CONDITION_OPERATORS: InjectableConditionOperator[] = ['eq', 'lt', 'gt']

const CONDITION_OPERATOR_LABELS: Record<InjectableConditionOperator, string> = {
    eq: 'Equal',
    neq: 'Not equal',
    lt: 'Less than',
    gt: 'Greater than',
}

type ConditionOperatorOption = { value: InjectableConditionOperator; label: string }
type ConditionFieldOption = { value: string; label: string }

type ModuleConditionRow = {
    id: string
    fieldKey: string
    operator: CronJobModuleCondition['operator']
    value: string
}

function newModuleConditionRowId() {
    return crypto.randomUUID()
}

const conditionalPropsForSelectedModule = computed<InjectableProperty[]>(() => {
    const k = formInjectionModule.value
    if (!k) return []
    return injectableModulesForCron.value[k]?.conditionalProperties ?? []
})

const crumbs = computed(() => [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Cron Jobs', path: '/automation/cron-jobs' },
    { name: isEditing.value ? 'Edit' : 'Add', path: '' },
])

const conditionFieldOptions = computed<ConditionFieldOption[]>(() =>
    conditionalPropsForSelectedModule.value.map(p => ({
        value: p.key,
        label: p.label,
    }))
)

const canAddModuleCondition = computed(() => {
    const cps = conditionalPropsForSelectedModule.value
    return cps.length > 1 && moduleConditionRows.value.length < cps.length
})

function findModuleConditionFieldOptionForKey(fieldKey: string): ConditionFieldOption | null {
    if (!fieldKey) return null
    return conditionFieldOptions.value.find(o => o.value === fieldKey) ?? null
}

function conditionalPropByKey(fieldKey: string): InjectableProperty | null {
    if (!fieldKey) return null
    return conditionalPropsForSelectedModule.value.find(p => p.key === fieldKey) ?? null
}

/** Field options for a row: other rows' selected fields are hidden so each condition targets a distinct property. */
function conditionFieldOptionsForRow(rowId: string): ConditionFieldOption[] {
    const row = moduleConditionRows.value.find(r => r.id === rowId)
    if (!row) return conditionFieldOptions.value
    const takenElsewhere = new Set(
        moduleConditionRows.value
            .filter(r => r.id !== rowId && r.fieldKey.trim())
            .map(r => r.fieldKey),
    )
    return conditionFieldOptions.value.filter(
        o => !takenElsewhere.has(o.value) || o.value === row.fieldKey,
    )
}

function conditionOperatorsForDef(p: InjectableProperty): InjectableConditionOperator[] {
    if (Array.isArray(p.operators) && p.operators.length > 0) return [...p.operators]
    return [...DEFAULT_CONDITION_OPERATORS]
}

function conditionOperatorOptionsForFieldKey(fieldKey: string): ConditionOperatorOption[] {
    const p = conditionalPropByKey(fieldKey)
    const ops = p ? conditionOperatorsForDef(p) : [...DEFAULT_CONDITION_OPERATORS]
    return ops.map(value => ({
        value,
        label: CONDITION_OPERATOR_LABELS[value],
    }))
}

function emptyModuleConditionRow(): ModuleConditionRow {
    return {
        id: newModuleConditionRowId(),
        fieldKey: '',
        operator: 'eq',
        value: '',
    }
}

function recordsToModuleConditionRows(mc: Record<string, CronJobModuleCondition>): ModuleConditionRow[] {
    return Object.entries(mc).map(([fieldKey, cond]) => ({
        id: newModuleConditionRowId(),
        fieldKey,
        operator: cond.operator,
        value: String(cond.value ?? ''),
    }))
}

/** Single starter row; field is preset only when exactly one conditional property exists. */
function resetModuleConditionRowsForModule() {
    const cps = conditionalPropsForSelectedModule.value
    if (cps.length === 0) {
        moduleConditionRows.value = []
        return
    }
    if (cps.length === 1) {
        const p = cps[0]
        const ops = conditionOperatorsForDef(p)
        const first = (ops[0] ?? 'eq') as CronJobModuleCondition['operator']
        moduleConditionRows.value = [
            {
                id: newModuleConditionRowId(),
                fieldKey: p.key,
                operator: first,
                value: '',
            },
        ]
        return
    }
    moduleConditionRows.value = [emptyModuleConditionRow()]
}

function sanitizeModuleConditionRows(rows: ModuleConditionRow[]): ModuleConditionRow[] {
    const allowed = new Set(conditionalPropsForSelectedModule.value.map(p => p.key))
    return rows
        .filter(r => r.fieldKey && allowed.has(r.fieldKey))
        .map(r => {
            const p = conditionalPropByKey(r.fieldKey)!
            const ops = conditionOperatorsForDef(p)
            let op = r.operator
            if (!ops.includes(op as InjectableConditionOperator)) {
                op = (ops[0] ?? 'eq') as CronJobModuleCondition['operator']
            }
            return { ...r, operator: op }
        })
}

function syncModuleConditionRowsAfterLoad() {
    if (!formInjectionModule.value || conditionalPropsForSelectedModule.value.length === 0) {
        moduleConditionRows.value = []
        return
    }
    if (moduleConditionRows.value.length === 0) {
        resetModuleConditionRowsForModule()
    } else {
        moduleConditionRows.value = sanitizeModuleConditionRows(moduleConditionRows.value)
        if (moduleConditionRows.value.length === 0) {
            resetModuleConditionRowsForModule()
        }
    }
}

function addModuleConditionRow() {
    if (!canAddModuleCondition.value) return
    moduleConditionRows.value = [...moduleConditionRows.value, emptyModuleConditionRow()]
}

function removeModuleConditionRow(rowId: string) {
    if (moduleConditionRows.value.length <= 1) return
    moduleConditionRows.value = moduleConditionRows.value.filter(r => r.id !== rowId)
}

function onConnectorChanged(val: Connector | null) {
    formConnector.value = val
    formActionInstance.value = null
    variableBindings.value = {}
    formInjectionModule.value = null
    moduleConditionRows.value = []
}

function onActionInstanceChanged(val: ConnectorActionInstance | null) {
    formActionInstance.value = val
    formInjectionModule.value = null
    moduleConditionRows.value = []
}

function onPickerBindingsChanged(val: Record<string, VariableBinding>) {
    variableBindings.value = val
}

function onInjectionModuleChanged(val: string | null) {
    formInjectionModule.value = val
    if (!val) {
        moduleConditionRows.value = []
    } else {
        resetModuleConditionRowsForModule()
    }
}

function findModuleConditionOperatorOptionForRow(row: ModuleConditionRow): ConditionOperatorOption | null {
    const opts = conditionOperatorOptionsForFieldKey(row.fieldKey)
    return opts.find(o => o.value === row.operator) ?? null
}

function onModuleConditionFieldChange(rowId: string, opt: ConditionFieldOption | null) {
    const newKey = opt?.value?.trim() ?? ''
    const p = conditionalPropByKey(newKey)
    const ops = p ? conditionOperatorsForDef(p) : [...DEFAULT_CONDITION_OPERATORS]
    const first = (ops[0] ?? 'eq') as CronJobModuleCondition['operator']
    moduleConditionRows.value = moduleConditionRows.value.map(r =>
        r.id === rowId ? { ...r, fieldKey: newKey, operator: first, value: '' } : r,
    )
}

function onModuleConditionOperatorChange(rowId: string, opt: ConditionOperatorOption | null) {
    moduleConditionRows.value = moduleConditionRows.value.map(r => {
        if (r.id !== rowId) return r
        const allowedIds = conditionOperatorOptionsForFieldKey(r.fieldKey).map(o => o.value)
        const op = opt?.value && allowedIds.includes(opt.value)
            ? opt.value
            : ((allowedIds[0] ?? 'eq') as InjectableConditionOperator)
        return { ...r, operator: op as CronJobModuleCondition['operator'] }
    })
}

function onModuleConditionValueChange(rowId: string, value: string) {
    moduleConditionRows.value = moduleConditionRows.value.map(r =>
        r.id === rowId ? { ...r, value } : r,
    )
}

/** Non-empty `options` on the conditional property → Select2; otherwise free text (AppInput). */
function hasConditionValueOptions(cp: InjectableProperty): boolean {
    return Array.isArray(cp.options) && cp.options.length > 0
}

function conditionValueSelectOptions(cp: InjectableProperty): InjectableConditionOption[] {
    return hasConditionValueOptions(cp) ? cp.options! : []
}

function moduleConditionValueSelectProp(row: ModuleConditionRow): InjectableProperty | null {
    const p = conditionalPropByKey(row.fieldKey)
    return p && hasConditionValueOptions(p) ? p : null
}

function findModuleConditionValueOptionForRow(row: ModuleConditionRow): InjectableConditionOption | null {
    const cp = moduleConditionValueSelectProp(row)
    if (!cp) return null
    const opts = cp.options ?? []
    return opts.find(o => o.value === row.value) ?? null
}

function onModuleConditionValueOptionSelected(rowId: string, opt: InjectableConditionOption | null) {
    onModuleConditionValueChange(rowId, opt?.value ?? '')
}

function buildVariableBindingsPayload(): Record<string, CronJobVariableBinding> | null {
    const entries = Object.entries(variableBindings.value)
    if (entries.length === 0) return null
    const out: Record<string, CronJobVariableBinding> = {}
    for (const [k, b] of entries) {
        if (b.type === 'constant') {
            out[k] = { type: 'constant', value: (b as any).value ?? '' }
        } else if (b.type === 'injectable') {
            out[k] = { type: 'injectable', property: (b as any).property ?? '' }
        }
    }
    return Object.keys(out).length ? out : null
}

function buildModuleConditionsPayload(): Record<string, CronJobModuleCondition> | null {
    if (!formInjectionModule.value || conditionalPropsForSelectedModule.value.length === 0) {
        return null
    }
    const out: Record<string, CronJobModuleCondition> = {}
    for (const row of moduleConditionRows.value) {
        const fieldKey = row.fieldKey?.trim()
        if (!fieldKey) continue
        out[fieldKey] = { operator: row.operator, value: row.value }
    }
    return Object.keys(out).length ? out : null
}

function validateVariableBindings(): boolean {
    for (const [k, b] of Object.entries(variableBindings.value)) {
        if (b?.type === 'injectable') {
            if (!formInjectionModule.value) {
                toast.showToast('Error', 'Select an injection module or set all variables to constants', 'error')
                return false
            }
            if (!(b as any).property?.trim()) {
                toast.showToast('Error', `Variable @@${k}@@: choose a property to inject`, 'error')
                return false
            }
        }
    }
    const seenFields = new Set<string>()
    for (const row of moduleConditionRows.value) {
        const fieldKey = row.fieldKey?.trim()
        if (!fieldKey) continue
        if (seenFields.has(fieldKey)) {
            toast.showToast('Error', `Module conditions: duplicate field "${fieldKey}"`, 'error')
            return false
        }
        seenFields.add(fieldKey)
        const cp = conditionalPropByKey(fieldKey)
        if (!cp) {
            toast.showToast('Error', `Module conditions: unknown field "${fieldKey}"`, 'error')
            return false
        }
        const allowed = conditionOperatorsForDef(cp)
        if (
            !row.operator ||
            !allowed.includes(row.operator as InjectableConditionOperator) ||
            String(row.value ?? '').trim() === ''
        ) {
            toast.showToast(
                'Error',
                `Module condition "${cp.label}": operator and value are required`,
                'error',
            )
            return false
        }
    }
    if (seenFields.size === 0 && conditionalPropsForSelectedModule.value.length > 0) {
        toast.showToast('Error', 'Choose a field and complete each module condition', 'error')
        return false
    }
    return true
}

const onFrequencySelected = (val: FrequencyOption | null) => {
    selectedFrequency.value = val
}

const cancel = () => {
    router.push('/automation/cron-jobs')
}

const saveJob = async () => {
    if (!formName.value.trim()) {
        toast.showToast('Error', 'Name is required', 'error')
        return
    }
    if (!formConnector.value) {
        toast.showToast('Error', 'Connector is required', 'error')
        return
    }
    if (!formActionInstance.value) {
        toast.showToast('Error', 'Action instance is required', 'error')
        return
    }
    if (!selectedFrequency.value) {
        toast.showToast('Error', 'Frequency is required', 'error')
        return
    }
    if (!validateVariableBindings()) return

    isSaving.value = true
    try {
        const actionInstanceId = formActionInstance.value.id
        const vb = buildVariableBindingsPayload()
        const inj = formInjectionModule.value?.trim() || null
        const mc = buildModuleConditionsPayload()

        if (isEditing.value) {
            await updateCronJob(cronJobId.value!, {
                name: formName.value.trim(),
                description: formDescription.value.trim() || null,
                connectorId: formConnector.value.id,
                connectorActionInstanceId: actionInstanceId,
                variableBindings: vb,
                injectionModule: inj,
                moduleConditions: inj ? mc : null,
                frequency: selectedFrequency.value.value,
                isActive: formIsActive.value,
            }, authStore)
            toast.showToast('Updated', 'Cron job updated', 'success')
        } else {
            await createCronJob({
                name: formName.value.trim(),
                description: formDescription.value.trim() || undefined,
                connectorId: formConnector.value.id,
                connectorActionInstanceId: actionInstanceId,
                variableBindings: vb,
                injectionModule: inj,
                moduleConditions: inj ? mc : null,
                frequency: selectedFrequency.value.value,
                isActive: formIsActive.value,
            }, authStore)
            toast.showToast('Created', 'Cron job created', 'success')
        }
        router.push('/automation/cron-jobs')
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to save', 'error')
    } finally {
        isSaving.value = false
    }
}

const loadDependencies = async () => {
    try {
        const [c, inj] = await Promise.all([
            getConnectors(authStore),
            getInjectables('cronjobs', authStore),
        ])
        connectors.value = c
        injectableModulesForCron.value = inj.modules
    } catch {
        connectors.value = []
        injectableModulesForCron.value = {}
    }
}

function applyLegacyInjectionFromJob(job: CronJob) {
    let mod = job.injectionModule ?? null
    let mc: Record<string, CronJobModuleCondition> = job.moduleConditions
        ? { ...job.moduleConditions }
        : {}
    const vb = job.variableBindings
    if (!mod && vb) {
        for (const b of Object.values(vb)) {
            if (
                b &&
                typeof b === 'object' &&
                (b as { type?: string }).type === 'injectable' &&
                'module' in b &&
                (b as { module?: string }).module
            ) {
                mod = (b as { module: string }).module
                break
            }
        }
    }
    if (vb && Object.keys(mc).length === 0) {
        for (const b of Object.values(vb)) {
            const raw = b as {
                type?: string
                property?: string
                condition?: { operator: 'eq' | 'neq' | 'lt' | 'gt'; value: string }
            }
            if (raw?.type === 'injectable' && raw.condition && raw.property) {
                mc[raw.property] = {
                    operator: raw.condition.operator,
                    value: String(raw.condition.value ?? ''),
                }
            }
        }
    }
    formInjectionModule.value = mod
    moduleConditionRows.value = Object.keys(mc).length > 0 ? recordsToModuleConditionRows(mc) : []
}

function normalizeBindingsFromJob(job: CronJob): Record<string, VariableBinding> {
    const raw = job.variableBindings || {}
    const mod = formInjectionModule.value || ''
    const out: Record<string, VariableBinding> = {}
    for (const [k, v] of Object.entries(raw)) {
        if (!v || typeof v !== 'object') continue
        const t = (v as { type?: string }).type
        if (t === 'constant') {
            out[k] = { type: 'constant', value: String((v as { value?: string }).value ?? '') }
        } else if (t === 'injectable') {
            out[k] = {
                type: 'injectable',
                module: mod || (v as any).module || '',
                property: String((v as { property?: string }).property ?? ''),
            }
        }
    }
    return out
}

const loadExisting = async () => {
    if (!cronJobId.value) return
    pageLoading.value = true
    try {
        const job = await getCronJobById(cronJobId.value, authStore)
        if (!job) {
            toast.showToast('Error', 'Cron job not found', 'error')
            router.push('/automation/cron-jobs')
            return
        }
        formName.value = job.name
        formDescription.value = job.description || ''
        applyLegacyInjectionFromJob(job)
        variableBindings.value = normalizeBindingsFromJob(job)
        formConnector.value = connectors.value.find(c => c.id === job.connectorId) || null
        const instances = formConnector.value?.actionInstances ?? []
        formActionInstance.value =
            instances.find(i => i.id === job.connectorActionInstanceId) || null
        if (formInjectionModule.value) {
            syncModuleConditionRowsAfterLoad()
        }
        selectedFrequency.value = FREQUENCY_OPTIONS.find(o => o.value === job.frequency) || null
        formIsActive.value = job.isActive
    } catch {
        toast.showToast('Error', 'Failed to load cron job', 'error')
        router.push('/automation/cron-jobs')
    } finally {
        pageLoading.value = false
    }
}

onMounted(async () => {
    pageLoading.value = true
    await loadDependencies()
    await loadExisting()
    pageLoading.value = false
})
</script>
