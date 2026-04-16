<template>
    <Breadcrumb :crumbs="[
        {
            name: 'Documents',
            path: '/qms/documents',
            icon: 'fa-solid fa-file-alt'
        },
        // Only show this crumb in edit mode
        ...(isEdit
            ? [
                {
                    name: 'Document Details',
                    path: `/qms/documents/${documentId}`,
                    icon: ''
                }
            ]
            : []),
        {
            name: isEdit ? 'Edit Document' : 'Add Document',
            path: isEdit ? `/qms/documents/${documentId}/edit` : '/qms/documents/add',
            icon: isEdit ? 'fa-solid fa-edit' : 'fa-solid fa-plus'
        }
    ]">
    </Breadcrumb>
    <main id="main-content" class="p-6 bg-main">
        <div v-if="isLoading" class="flex items-center justify-center h-screen">
            <Spinner width="5" />
        </div>
        <Form v-else @submit="handleSubmit" ref="formRef" class="max-w-3xl mx-auto">
            <div class="bg-secondary border border-main rounded-lg p-6 space-y-6">
                <div id="document-info" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div v-if="!isEdit">
                            <div class="space-y-2">
                                <label class="block text-sm text-opposite/70" for="version">
                                    Version
                                </label>
                                <div class="relative">
                                    <AppInput name="version" id="version" v-model.number="formData.version"
                                        placeholder="Version (e.g., 1, 2)" type="number" :hide-icon="true" :min="1"
                                        step="1" @input="
                                            (e: any) => {
                                                const v = Number(e?.target?.value || 1)
                                                formData.version = v < 1 ? 1 : v
                                            }
                                        " />
                                </div>
                            </div>
                        </div>
                        <div :class="['space-y-2']">
                            <label class="block text-sm text-opposite/70" for="title">
                                Document Name
                            </label>
                            <div class="relative">
                                <AppInput name="title" v-model="formData.title" :placeholder="isEdit ? 'Document Name' : 'Upload a file to set name'
                                    " :disabled="true" id="title" :hide-icon="true" test-id="document-title-input" />
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <AppInputForm name="description" label="Description" :value="formData.description"
                            placeholder="Enter document description" type="textarea" :hide-icon="true"
                            test-id="document-description-input" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="relative">
                            <label class="block text-sm mb-1 text-opposite/70">
                                Document Category
                                <span @click="
                                    () =>
                                        router.push(redirect || '/qms/documents/settings?tab=1')
                                " class="cursor-pointer absolute top-0 right-0 text-green-600">
                                    <i class="fa-solid fa-plus"></i> add category
                                </span>
                            </label>
                            <Select2 v-model="optionsData.documentType" :values="optionsData.documentTypes?.length > 0
                                ? optionsData.documentTypes
                                : []
                                " :display="displayName" placeholder="Select Category" :optional="false"
                                @update:modelValue="(val) => handleFilterChange(val, 'category')"
                                test-id="category-select" />
                            <!-- Note: Ensure Select2 renders options with test-id="select-option" -->
                        </div>
                        <div v-if="optionsData.documentCodes?.length > 0">
                            <label class="block text-sm mb-1 text-opposite/70">
                                Category Code
                            </label>
                            <Select2 v-model="optionsData.documentCode" :values="optionsData.documentCodes || []"
                                :display="(item: any) =>
                                    item?.code
                                        ? `${item.code}${item.name ? ' - ' + item.name : ''}`
                                        : ''
                                    " placeholder="Select Code" :optional="false" @update:modelValue="
                                        (val) => {
                                            optionsData.documentCode = val
                                            formData.categoryId = val?.id
                                        }
                                    " test-id="code-select" />
                        </div>

                        <div v-if="!isEdit" class="flex items-center text-opposite/70 col-span-2">
                            <ToggleSwitch v-model="formData.isPersonal" label="Document for a specific user"
                                active-color="bg-blue-600" test-id="document-personal-toggle" @update:modelValue="
                                    async (val) => {
                                        if (val) {
                                            await fetchAvailableUsers()
                                            const currentUserId = authStore.state.userDetails.id
                                            const currentUser = optionsData.availableUsers?.find((u: any) => u.id === currentUserId)
                                            if (currentUser) {
                                                optionsData.createdForUser = currentUser
                                                formData.createdFor = currentUser.id
                                            }
                                        }
                                        else {
                                            optionsData.availableUsers = []
                                            formData.createdFor = null
                                            optionsData.createdForUser = null
                                        }
                                    }
                                " />
                        </div>
                        <div v-if="formData.isPersonal">
                            <label class="block text-sm mb-1 text-opposite/70">
                                Document for User
                            </label>
                            <Select2 v-model="optionsData.createdForUser" :values="optionsData.availableUsers || []"
                                :display="(item: any) =>
                                    item?.fname ? `${item.fname} ${item.lname}` : ''
                                    " placeholder="Select User" :optional="false" @update:modelValue="
                                        (val) => {
                                            optionsData.createdForUser = val
                                            formData.createdFor = val?.id
                                        }
                                    " test-id="created-for-select" />
                        </div>

                    </div>

                    <div v-if="!isEdit">
                        <label class="block text-sm mb-1 text-opposite/70">Document File</label>
                        <FileUploader v-model="formData.file" :current-file="formData.title || ''"
                            :download-url="downloadUrl" @update:modelValue="handleFileChange"
                            test-id="document-file-upload" accept="*/*" />
                    </div>
                </div>

                <div class="pt-1">
                    <div class="space-y-4">
                        <div class="flex items-center mb-4">
                            <ToggleSwitch v-model="formData.neverExpires" @update:modelValue="handleNeverExpiresChange"
                                :label="`${formData.neverExpires ? 'Never expires' : 'Expires'}`"
                                active-color="bg-blue-600" test-id="never-expires-toggle" />
                        </div>

                        <div v-if="!formData.neverExpires">
                            <label class="block text-sm mb-1 text-opposite/70">Valid until</label>
                            <AppInput name="dueDate" label="Due Date" :value="formData.dueDate" type="date"
                                placeholder="Select due date" v-model="formData.dueDate" :hide-icon="true"
                                test-id="document-due-date-input" />
                        </div>
                    </div>
                </div>

                <div class="pt-6 border-t border-neutral-200 flex justify-end gap-4">
                    <AppButton type="button" buttonStyle="secondary" :disabled="isSubmitting" v-if="!isSubmitting"
                        @click="router.push(redirect || '/qms/documents')" test-id="cancel-document-button">
                        Cancel
                    </AppButton>
                    <AppButton type="submit" buttonStyle="primary" :loading="isSubmitting"
                        test-id="create-document-button">
                        {{ isEdit ? 'Update Document' : 'Create Document' }}
                    </AppButton>
                </div>
            </div>
        </Form>
    </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Form } from 'vee-validate'
import Breadcrumb from '../breadCrums.vue'
import AppButton from '../AppButton.vue'
import Select2 from '../Select2.vue'
import AppInputForm from '../AppInputForm.vue'
import AppInput from '../AppInput.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import FileUploader from '../FileUploader.vue'
import { useAuthStore } from '@/stores/auth'
import { apiGet, apiPost } from '@/util/api'
import { useToast } from '@/stores/notification'
import type {
    Document,
    DocumentType,
    DocumentCode,
} from '@/util/interfaces'
import AppTextareaForm from '../AppTextareaForm.vue'
import Spinner from '../Spinner.vue'

// Define document interface

const formRef = ref()
const isEdit = ref(false)
const documentId = ref('')
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()
const redirect = route.query.redirect as string

const currentFile = ref('')
const downloadUrl = ref('')
const orgunitTitle = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)
// Form data
const formData = ref({
    code: undefined,
    title: '',
    description: '',
    version: 1,
    documentType: {
        id: 0,
        name: ''
    },
    isPersonal: false,
    createdFor: null as string | null,
    file: null as File | null,
    dueDate: '',
    changes: '',
    neverExpires: false,
    categoryId: null as number | null
})

const optionsData = ref<any>({})

const displayName = (item: any) => item?.name || ''

// Fetch document data for edit mode
const fetchDocument = async () => {
    if (!isEdit.value) return

    try {
        isLoading.value = true
        const document = await apiGet<Document>(`/documents/${documentId.value}`, authStore)

        // Format date from timestamp to YYYY-MM-DD
        let dueDate = ''
        if (document.dueDate) {
            try {
                const timestamp =
                    typeof document.dueDate === 'string'
                        ? parseInt(document.dueDate, 10)
                        : document.dueDate

                const date = new Date(timestamp)

                // Check if date is valid before calling toISOString
                if (!isNaN(date.getTime())) {
                    dueDate = date.toISOString().split('T')[0]
                }
            } catch (error) {
                console.error('Invalid date value:', document.dueDate, error)
            }
        }



        formData.value = {
            code: document.documentCode as any,
            title: document.title || '',
            description: document.description || '',
            version: document.currentVersion,
            documentType: {
                id: document.documentType?.id || 0,
                name: document.documentType?.name || ''
            },
            file: null,
            dueDate: dueDate,
            changes: '',
            neverExpires: !document.dueDate,
            categoryId: null,
            isPersonal: document.isPersonal,
            createdFor: document.createdFor?.id || null
        }
        currentFile.value = document.title || ''
        downloadUrl.value = document.versions?.[document.currentVersion - 1]?.file || ''
        if (document.createdFor) {
            optionsData.value.createdForUser = document.createdFor
        }
        // Set select values
        if (document.documentType) {
            optionsData.value.documentType = document.documentType
            await fetchDocumentCodes(document.documentType.id)
            if (document.category) {
                optionsData.value.documentCode = document.category
                formData.value.categoryId = document.category.id
            }
        }
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to fetch document',
            'error'
        )
    } finally {
        isLoading.value = false
    }
}

// File handling
const handleFileChange = (file: File | null) => {
    if (file) {
        // Set the title directly from the file name without extension
        formData.value.title = file.name.split('.').slice(0, -1).join('.')
        // Auto-increment version on new file in edit mode
        if (isEdit.value) {
            const current = Number(formData.value.version) || 0
            formData.value.version = (current + 1) as any
        }
    } else if (!file && !isEdit.value) {
        formData.value.title = ''
    }
}

// Handle never expires checkbox change
const handleNeverExpiresChange = () => {
    if (formData.value.neverExpires) {
        formData.value.dueDate = ''
    }
}

const removeFile = () => {
    formData.value.file = null
    if (!isEdit.value) {
        formData.value.title = ''
    }
}

// Fetch options
const fetchOptions = async () => {
    try {
        const [types] = await Promise.all([
            apiGet<DocumentType[]>('/documents/types', authStore),

        ])

        optionsData.value = {
            documentTypes: types,
            documentType: { id: '', name: 'Select Category' },
        }

        // Fetch document data for edit mode
        if (isEdit.value) {
            await fetchDocument()
        }
    } catch (error) {
        toast.showToast('Error', 'Failed to fetch options', 'error')
    }
}

// Submit form
const handleSubmit = async (values: any) => {
    try {
        let errors = []
        // Validate file upload for add mode
        if (!isEdit.value && !formData.value.file) {
            errors.push('Please upload a document file')
        }

        // Validate changes field when editing with new file
        if (isEdit.value && formData.value.file && !values.changes) {
            errors.push('Please describe the changes made')
        }

        const formDataToSend = new FormData()

        if (!formData.value.documentType?.id) {
            errors.push('Document Category is required')
        }
        if (!formData.value.categoryId) {
            errors.push('Category Code is required')
        }
        if (formData.value.isPersonal && !formData.value.createdFor) {
            errors.push('Please select a user for this document')
        }
        // if (!formData.value.dueDate) {
        //     errors.push('Valid until is required')
        // }
        if (errors.length > 0) {
            toast.showToast('Error', errors.join(', '), 'error')
            return
        }
        isSubmitting.value = true
        // Handle each field type appropriately
        formDataToSend.append('documentCode', values.code)
        formDataToSend.append('title', formData.value.title)
        formDataToSend.append('description', values.description)
        formDataToSend.append('documentTypeId', formData.value.documentType?.id.toString())
        if (formData.value.isPersonal) {
            formDataToSend.append('personalDocument', 'true')
            if (formData.value.createdFor) {
                formDataToSend.append('createdFor', formData.value.createdFor)
            }
        }
        formDataToSend.append('versionNumber', formData.value.version.toString())
        if (formData.value.categoryId) {
            formDataToSend.append('categoryId', formData.value.categoryId.toString())
        }

        if (formData.value.dueDate) {
            formDataToSend.append('dueDate', new Date(formData.value.dueDate).getTime().toString())
        }

        // Handle file separately
        if (formData.value.file) {
            formDataToSend.append('file', formData.value.file)
        }

        // Add changes field if editing with new file
        if (isEdit.value && formData.value.file && values.changes) {
            formDataToSend.append('changes', values.changes)
        }

        if (isEdit.value) {
            // Update existing document
            await apiPost(`/documents/${documentId.value}`, formDataToSend, authStore)
            toast.showToast('Success', 'Document updated successfully', 'success')
        } else {
            // Create new document
            await apiPost('/documents', formDataToSend, authStore)
            toast.showToast('Success', 'Document created successfully', 'success')
        }

        router.push(redirect || '/qms/documents')
    } catch (error: any) {
        console.error('Error submitting form:', error)
        toast.showToast(
            'Error',
            error?.response?.data?.message ||
            `Failed to ${isEdit.value ? 'update' : 'create'} document`,
            'error'
        )
    } finally {
        isSubmitting.value = false
    }
}

const fetchDocumentCodes = async (documentTypeId: number) => {
    try {
        const codes = await apiGet<DocumentCode[]>(
            `/documents/types/${documentTypeId}/codes`,
            authStore
        )
        optionsData.value.documentCodes = codes || []
        if (codes.length === 1) {
            optionsData.value.documentCode = codes[0]
            formData.value.categoryId = codes[0].id
        } else {
            optionsData.value.documentCode = { id: '', code: 'Select Code' }
            formData.value.categoryId = null
        }
    } catch (error) {
        optionsData.value.documentCodes = []
        optionsData.value.documentCode = null
        formData.value.categoryId = null
    }
}

const fetchAvailableUsers = async () => {
    try {
        const users = await apiGet<any[]>(
            'permissions/access?subject=documents',
            authStore
        )
        optionsData.value.availableUsers = users || []
        if (users?.length === 1) {
            optionsData.value.createdForUser = users[0]
            formData.value.createdFor = users[0].id
        }
    } catch (error) {
        optionsData.value.availableUsers = []
    }
}

const handleFilterChange = (value: any, type: 'category') => {
    optionsData.value[type] = value || {
        id: '',
        name: `All ${type}s`
    }
    if (type === 'category') {
        formData.value.documentType = value
        if (value?.id) {
            fetchDocumentCodes(value.id)
        } else {
            optionsData.value.documentCodes = []
            optionsData.value.documentCode = null
            formData.value.categoryId = null
        }
    }
}

const preSelectCreatedFor = async () => {
    const createdForId = route.query.createdFor as string
    if (!createdForId) return

    formData.value.isPersonal = true
    await fetchAvailableUsers()
    const user = optionsData.value.availableUsers?.find((u: any) => u.id === createdForId)
    if (user) {
        optionsData.value.createdForUser = user
        formData.value.createdFor = user.id
    }
}

onMounted(async () => {
    const routeId = route.params.id as string
    if (routeId) {
        isEdit.value = true
        documentId.value = routeId
    }

    await fetchOptions()
    await preSelectCreatedFor()
})
</script>
