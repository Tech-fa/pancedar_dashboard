<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-2xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-opposite">New Workflow</h3>
                </div>

                <div v-if="loadingTypes" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else class="bg-secondary rounded-lg border border-gray-800 p-6 space-y-4">
                    <div>
                        <Select2 v-model="selectedType" :values="availableTypes"
                            :display="(t: AvailableWorkflow | null) => t?.name || ''"
                            placeholder="Select a workflow type..." label="Workflow Type"
                            @update:modelValue="onTypeSelected" />
                        <p v-if="selectedType?.description" class="text-xs text-opposite/60 mt-2 ml-1">
                            {{ selectedType.description }}
                        </p>
                    </div>

                    <div>
                        <label class="block text-xs text-opposite/60 mb-1 ml-1">Description</label>
                        <AppInput v-model="description" type="text" :hideIcon="true"
                            placeholder="Optional description for this workflow" />
                    </div>

                    <div v-if="selectedType && selectedType.steps?.length" class="pt-2 space-y-4">
                        <h4 class="text-sm font-medium text-opposite">Steps</h4>
                        <div v-for="(step, index) in selectedType.steps" :key="step.name"
                            class="bg-main rounded-lg border border-gray-800 p-4 space-y-3">
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-xs text-opposite/50 font-mono">{{ index + 1 }}.</span>
                                <div>
                                    <div class="text-sm font-medium text-opposite">{{ step.name }}</div>
                                    <div v-if="step.description"
                                        class="text-xs text-opposite/60 mt-0.5">
                                        {{ step.description }}
                                    </div>
                                </div>
                            </div>

                            <div v-if="step.fields?.length" class="space-y-3 pl-4 border-l border-gray-800">
                                <WorkflowFieldInput v-for="field in step.fields"
                                    :key="fieldKey(field)"
                                    :field="field"
                                    :modelValue="stepValues[step.name]?.[fieldKey(field)]"
                                    @update:modelValue="(v: any) => setFieldValue(step.name, field, v)" />
                            </div>
                            <div v-else class="text-xs text-opposite/40 pl-4">
                                No configuration needed for this step.
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 pt-2">
                        <AppButton buttonStyle="secondary" type="button" @click="cancel">
                            Cancel
                        </AppButton>
                        <AppButton buttonStyle="primary" type="button" @click="save" :loading="isSaving">
                            Create
                        </AppButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import Spinner from '@/components/Spinner.vue'
import Select2 from '@/components/Select2.vue'
import WorkflowFieldInput from './WorkflowFieldInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    createWorkflow,
    getAvailableWorkflows,
} from '@/components/automation/endpoints'
import type {
    AvailableWorkflow,
    WorkflowFieldConfig,
    WorkflowStep,
} from '@/components/automation/workflow.interface'

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflows', path: '/automation/workflows' },
    { name: 'New', path: '' },
]

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const availableTypes = ref<AvailableWorkflow[]>([])
const selectedType = ref<AvailableWorkflow | null>(null)
const description = ref('')
const loadingTypes = ref(false)
const isSaving = ref(false)

// Keyed by step name, then by field key (name ?? label) -> value
const stepValues = ref<Record<string, Record<string, any>>>({})

const fieldKey = (field: WorkflowFieldConfig) => field.name || field.label

const defaultValueFor = (field: WorkflowFieldConfig) => {
    switch (field.type) {
        case 'boolean': return false
        case 'number': return null
        case 'select': return null
        case 'files': return null
        default: return ''
    }
}

const onTypeSelected = (type: AvailableWorkflow | null) => {
    stepValues.value = {}
    if (!type) return
    for (const step of type.steps || []) {
        const initial: Record<string, any> = {}
        for (const field of step.fields || []) {
            initial[fieldKey(field)] = defaultValueFor(field)
        }
        stepValues.value[step.name] = initial
    }
}

const setFieldValue = (
    stepName: string,
    field: WorkflowFieldConfig,
    value: any,
) => {
    if (!stepValues.value[stepName]) stepValues.value[stepName] = {}
    stepValues.value[stepName][fieldKey(field)] = value
}

const loadAvailableTypes = async () => {
    loadingTypes.value = true
    try {
        availableTypes.value = await getAvailableWorkflows(authStore)
    } catch {
        availableTypes.value = []
        toast.showToast('Error', 'Failed to load workflow types', 'error')
    } finally {
        loadingTypes.value = false
    }
}

const cancel = () => {
    router.push('/automation/workflows')
}

// File objects can't be serialized by JSON; replace with a lightweight descriptor.
const serializeValue = (value: any) => {
    if (value instanceof File) {
        return { name: value.name, size: value.size, type: value.type }
    }
    return value
}

const buildSteps = (): WorkflowStep[] | undefined => {
    if (!selectedType.value) return undefined
    return selectedType.value.steps.map((step) => {
        const raw = stepValues.value[step.name] || {}
        const values: Record<string, any> = {}
        for (const [key, value] of Object.entries(raw)) {
            values[key] = serializeValue(value)
        }
        return { name: step.name, values }
    })
}

const validateRequired = (): string | null => {
    if (!selectedType.value) return 'Please select a workflow type'
    for (const step of selectedType.value.steps || []) {
        for (const field of step.fields || []) {
            if (!field.required) continue
            const value = stepValues.value[step.name]?.[fieldKey(field)]
            const missing =
                value === undefined ||
                value === null ||
                value === '' ||
                (field.type === 'boolean' && value === undefined)
            if (missing) {
                return `"${field.label}" is required in step "${step.name}"`
            }
        }
    }
    return null
}

const save = async () => {
    const err = validateRequired()
    if (err) {
        toast.showToast('Error', err, 'error')
        return
    }

    isSaving.value = true
    try {
        await createWorkflow({
            name: selectedType.value!.name,
            description: description.value.trim() || undefined,
            steps: buildSteps(),
        }, authStore)
        toast.showToast('Created', 'Workflow created successfully', 'success')
        router.push('/automation/workflows')
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to create workflow', 'error')
    } finally {
        isSaving.value = false
    }
}

onMounted(() => {
    loadAvailableTypes()
})
</script>
