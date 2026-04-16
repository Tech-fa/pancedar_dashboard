<template>
    <div class="max-w-7xl mx-auto">
        <div class="bg-secondary rounded-lg border border-gray-800">
            <Form @submit="handleSubmit" :initialValues="initialValues" :key="formKey" class="p-6 space-y-6">
                <AppInputForm name="name" label="Name" placeholder="Enter job type name"
                    :rules="requiredRule('Name is required')" required />

                <AppInputForm name="description" label="Description" placeholder="Enter description (optional)"
                    type="textarea" />

                <SearcheableMultiSelectForm name="skillIds" label="Pilot Skills"
                    placeholder="Search and select skills..." :values="allSkills" :display="(s: any) => s.name"
                    v-model="selectedSkills" />

                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-opposite">Required Documents By
                            Pilot</label>
                        <button type="button" @click="addDocumentRow"
                            class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <i class="fa-solid fa-plus"></i>
                            Add Document
                        </button>
                    </div>

                    <div v-if="requiredDocuments.length === 0" class="text-sm text-opposite/50">
                        No required documents added yet.
                    </div>

                    <div v-for="(doc, index) in requiredDocuments" :key="index"
                        class="flex items-start gap-3 p-3 bg-main rounded-lg border border-gray-700">
                        <div class="flex-1 space-y-3">
                            <div>
                                <label class="block text-xs text-opposite/60 mb-1">Document Type</label>
                                <Select2 :modelValue="doc.documentType" :values="allDocumentTypes"
                                    :display="(dt: any) => dt?.name || ''" placeholder="Select document type..."
                                    @update:modelValue="(val: any) => onDocumentTypeChange(index, val)" />
                            </div>
                            <div>
                                <label class="block text-xs text-opposite/60 mb-1">Document Code</label>
                                <Select2 :modelValue="doc.documentCode" :values="doc.availableCodes || []"
                                    :display="(dc: any) => dc?.code ? `${dc.code}${dc.name ? ' - ' + dc.name : ''}` : ''"
                                    placeholder="Select document code..."
                                    @update:modelValue="(val: any) => onDocumentCodeChange(index, val)"
                                    :disabled="!doc.documentType" />
                            </div>
                        </div>
                        <button type="button" @click="removeDocumentRow(index)"
                            class="mt-6 text-red-400 hover:text-red-300">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <label class="text-sm font-medium text-opposite">Status</label>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="isActive" class="sr-only peer" />
                        <div
                            class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600">
                        </div>
                        <span class="ml-3 text-sm text-opposite/80">
                            {{ isActive ? 'Active' : 'Inactive' }}
                        </span>
                    </label>
                </div>

                <div class="flex items-center gap-3">
                    <AppButton buttonStyle="secondary" type="button" @click="$emit('cancel')">
                        Cancel
                    </AppButton>
                    <AppButton buttonStyle="primary" type="submit" :loading="isSubmitting">
                        {{ isEditMode ? 'Update Job Type' : 'Create Job Type' }}
                    </AppButton>
                </div>
            </Form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Form } from 'vee-validate'
import AppButton from '@/components/AppButton.vue'
import AppInputForm from '@/components/AppInputForm.vue'
import SearcheableMultiSelectForm from '@/components/SearcheableMultiSelectForm.vue'
import Select2 from '@/components/Select2.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getVehicleJobTypeById,
    createVehicleJobType,
    updateVehicleJobType,
} from '@/components/fleet/endpoints'
import { getSkills } from '@/components/operations/pilots/endpoints'
import type { Workflow } from '@/components/automation/endpoints'
import { apiGet } from '@/util/api'
import type { Skill, DocumentType, DocumentCode } from '@/util/interfaces'

const props = defineProps<{
    jobTypeId?: string
    isEditMode: boolean
}>()

const emit = defineEmits<{
    cancel: []
    saved: []
}>()

const authStore = useAuthStore()
const toast = useToast()

const isSubmitting = ref(false)
const isActive = ref(true)
const formKey = ref(0)

const initialValues = ref({
    name: '',
    description: ''
})

// Skills
const selectedSkills = ref<Skill[]>([])
const allSkills = ref<Skill[]>([])

// Workflows
const selectedWorkflows = ref<Workflow[]>([])
const allWorkflows = ref<Workflow[]>([])

// Required Documents
interface RequiredDocumentRow {
    documentType: DocumentType | null
    documentCode: DocumentCode | null
    availableCodes: DocumentCode[]
}
const allDocumentTypes = ref<DocumentType[]>([])
const requiredDocuments = ref<RequiredDocumentRow[]>([])

const requiredRule = (message: string) => (value: string) => (value ? true : message)

const loadSkills = async () => {
    try {
        const result = await getSkills(authStore)
        allSkills.value = result
    } catch {
        allSkills.value = []
    }
}



const loadDocumentTypes = async () => {
    try {
        allDocumentTypes.value = await apiGet<DocumentType[]>('/documents/types', authStore)
    } catch {
        allDocumentTypes.value = []
    }
}

const fetchCodesForType = async (documentTypeId: number): Promise<DocumentCode[]> => {
    try {
        return await apiGet<DocumentCode[]>(`/documents/types/${documentTypeId}/codes`, authStore)
    } catch {
        return []
    }
}

const addDocumentRow = () => {
    requiredDocuments.value.push({
        documentType: null,
        documentCode: null,
        availableCodes: []
    })
}

const removeDocumentRow = (index: number) => {
    requiredDocuments.value.splice(index, 1)
}

const onDocumentTypeChange = async (index: number, val: DocumentType | null) => {
    const row = requiredDocuments.value[index]
    row.documentType = val
    row.documentCode = null
    if (val?.id) {
        row.availableCodes = await fetchCodesForType(val.id)
    } else {
        row.availableCodes = []
    }
}

const onDocumentCodeChange = (index: number, val: DocumentCode | null) => {
    requiredDocuments.value[index].documentCode = val
}

const loadJobType = async () => {
    if (!props.jobTypeId) return
    try {
        const data = await getVehicleJobTypeById(props.jobTypeId, authStore)
        isActive.value = data.isActive
        initialValues.value = {
            name: data.name ?? '',
            description: data.description ?? ''
        }
        if (data.jobTypeSkills?.length) {
            selectedSkills.value = data.jobTypeSkills.map((jts: any) => jts.skill).filter(Boolean)
        }
        if (data.workflowJobs?.length) {
            selectedWorkflows.value = data.workflowJobs.map((wj: any) => wj.workflow).filter(Boolean)
        }
        if (data.jobTypeDocuments?.length) {
            const docRows: RequiredDocumentRow[] = []
            for (const jtd of data.jobTypeDocuments) {
                const codes = jtd.documentType?.id
                    ? await fetchCodesForType(jtd.documentType.id)
                    : []
                docRows.push({
                    documentType: jtd.documentType || null,
                    documentCode: jtd.documentCode || null,
                    availableCodes: codes
                })
            }
            requiredDocuments.value = docRows
        }
        formKey.value++
    } catch {
        toast.showToast('Error', 'Failed to load job type', 'error')
    }
}

const handleSubmit = async (values: any) => {
    if (isSubmitting.value) return
    isSubmitting.value = true

    try {
        const validDocs = requiredDocuments.value.filter(
            (d) => d.documentType?.id
        )

        const data = {
            name: values.name,
            description: values.description || undefined,
            isActive: isActive.value,
            skillIds: selectedSkills.value.map((s) => s.id),
            requiredDocuments: validDocs.map((d) => ({
                documentTypeId: d.documentType!.id,
                documentCodeId: d.documentCode?.id
            })),
            workflowIds: selectedWorkflows.value.map((w) => w.id)
        }

        if (props.isEditMode && props.jobTypeId) {
            await updateVehicleJobType(props.jobTypeId, data, authStore)
            toast.showToast('Job type updated', 'Job type updated successfully', 'success')
        } else {
            await createVehicleJobType(data, authStore)
            toast.showToast('Job type created', 'Job type created successfully', 'success')
        }
        emit('saved')
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Unable to save job type. Please try again.',
            'error'
        )
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    loadSkills()
    loadDocumentTypes()
    loadJobType()
})
</script>
