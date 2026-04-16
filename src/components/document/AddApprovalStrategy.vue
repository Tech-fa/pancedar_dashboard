<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crums" />
        <main id="main-content" class="p-4 sm:p-6 lg:p-8 bg-main">
            <div id="approval-form" class="max-w-3xl mx-auto bg-secondary rounded-lg shadow-sm">
                <div class="p-6 border-b">
                    <div class="flex items-center gap-4">
                        <div>
                            <h2 class="text-lg text-opposite">
                                {{ isEditing ? 'Edit Approval Strategy' : 'Add Approval Strategy' }}
                            </h2>
                            <p class="text-opposite/70 text-sm">
                                {{
                                    isEditing
                                        ? 'Update an existing approval strategy for documents'
                                        : 'Create a new approval strategy for documents'
                                }}
                            </p>
                        </div>
                    </div>
                </div>

                <Form @submit="submitForm" class="p-6 space-y-6" v-if="!loading">
                    <div class="space-y-4">
                        <AppInputForm v-if="!isEditing || (isEditing && strategy?.name)" :value="strategy?.name"
                            name="name" label="Strategy Name" type="text" placeholder="Enter strategy name"
                            :required="true" :rules="(v: any) => (!v ? 'Strategy name is required' : true)"
                            test-id="strategy-name-input" />
                    </div>


                    <div id="reviewers-section " class="space-y-4" test-id="reviewers-section">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg text-opposite">Reviewers</h3>
                            <div class="flex items-center">
                                <input type="checkbox" id="select-all-reviewers" v-model="selectAllReviewers"
                                    test-id="select-all-reviewers" />
                                <label for="select-all-reviewers" class="ml-2 text-sm text-opposite/70">
                                    Select all members ({{ searchResults.length }} members)
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input type="checkbox" id="no-review" v-model="noReview" />
                                <label for="no-review" class="ml-2 text-sm text-opposite/70    "
                                    test-id="no-review-needed">
                                    No Review needed
                                </label>
                            </div>
                        </div>
                        <template v-if="!noReview">
                            <span class="text-sm text-opposite/70">
                                Selected members will be able to review documents.
                            </span>
                            <SearcheableMultiSelect v-if="!selectAllReviewers" v-model="selectedReviewers"
                                :results="searchResults" :display="(user: User) => `${user.fname} ${user.lname}`"
                                placeholder="Search for reviewers..." test-id="reviewers-multiselect" />
                        </template>
                    </div>

                    <div id="approvers-section" class="space-y-4" test-id="approvers-section">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg text-opposite">Approvers</h3>
                            <div class="flex items-center">
                                <input type="checkbox" id="select-all-approvers" v-model="selectAllApprovers"
                                    test-id="select-all-approvers" />
                                <label for="select-all-approvers" class="ml-2 text-sm text-opposite/70">
                                    Select all members ({{ searchResults.length }} members)
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input type="checkbox" id="no-approve" v-model="noApprove" />
                                <label for="no-approve" class="ml-2 text-sm text-opposite/70"
                                    test-id="no-approval-needed">
                                    No Approval needed
                                </label>
                            </div>
                        </div>
                        <template v-if="!noApprove">
                            <span class="text-sm text-neutral-500">
                                Selected members will be able to approve documents.
                            </span>
                            <SearcheableMultiSelect v-if="!selectAllApprovers" v-model="selectedApprovers"
                                :results="searchResults" :display="(user: User) => `${user.fname} ${user.lname}`"
                                placeholder="Search for approvers..." test-id="approvers-multiselect" />
                        </template>
                    </div>

                    <div id="document-types-section" class="space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg text-opposite">Document Types</h3>
                            <button type="button" @click="addDocumentRow"
                                class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <i class="fa-solid fa-plus"></i>
                                Add Document Type
                            </button>
                        </div>

                        <div v-if="requiredDocuments.length === 0" class="text-sm text-opposite/50">
                            No document types added yet.
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
                                        :disabled="!doc.documentType" :optional="true" />
                                </div>
                            </div>
                            <button type="button" @click="removeDocumentRow(index)"
                                class="mt-6 text-red-400 hover:text-red-300">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div id="dates-section" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AppInputForm :value="strategy?.maxReviewDuration" v-if="
                            !noReview &&
                            (!isEditing ||
                                (isEditing && strategy?.maxReviewDuration !== undefined))
                        " name="maxReviewDuration" label="Maximum Review Duration (days)" type="number"
                            placeholder="Enter maximum review duration" />
                        <AppInputForm :value="strategy?.maxApprovalDuration" v-if="
                            !noApprove &&
                            (!isEditing ||
                                (isEditing && strategy?.maxApprovalDuration !== undefined))
                        " name="maxApprovalDuration" label="Maximum Approval Duration (days)" type="number"
                            placeholder="Enter maximum approval duration" />
                    </div>

                    <div id="minimum-requirements" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AppInputForm name="requiredReviews" label="Minimum Number of Reviewers" type="number" min="1"
                            v-if="!noReview && searchResults.length > 0" :value="strategy?.requiredReviews"
                            placeholder="Enter minimum number of reviewers" :rules="(v: any) => {
                                const reviewerCount = selectAllReviewers
                                    ? searchResults.length
                                    : selectedReviewers.length

                                if (+v > reviewerCount) {
                                    return 'Minimum reviewers must be less than or equal to the number of reviewers'
                                }
                                return true
                            }
                                " />
                        <AppInputForm name="requiredApprovals" label="Minimum Number of Approvers" type="number" min="1"
                            v-if="!noApprove && searchResults.length > 0" :value="strategy?.requiredApprovals"
                            placeholder="Enter minimum number of approvers" :rules="(v: any) => {
                                const approverCount = selectAllApprovers
                                    ? searchResults.length
                                    : selectedApprovers.length

                                if (+v > approverCount) {
                                    return 'Minimum approvers must be less than or equal to the number of approvers'
                                }
                                return true
                            }
                                " test-id="minimum-approvers-input" />
                    </div>

                    <div class="p-6 border-t bg-secondary flex items-center justify-end gap-4">
                        <AppButton buttonStyle="secondary" type="button" @click="cancel" test-id="cancel-button">
                            Cancel
                        </AppButton>
                        <AppButton buttonStyle="primary" type="submit" :loading="isSubmitting"
                            test-id="save-changes-button">
                            Save Changes
                        </AppButton>
                    </div>
                </Form>
                <div v-else>
                    <div class="flex items-center justify-center h-full">
                        <Spinner width="5" />
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Form } from 'vee-validate'
import { useRouter } from 'vue-router'
import AppInputForm from '@/components/AppInputForm.vue'
import AppButton from '@/components/AppButton.vue'
import { useAuthStore } from '../../stores/auth'
import { apiPost, apiGet, apiPut } from '../../util/api'
import { useToast } from '../../stores/notification'
import BreadCrums from '@/components/breadCrums.vue'
import SearcheableMultiSelect from '../SearcheableMultiSelect.vue'
import Select2 from '@/components/Select2.vue'
import type { ApprovalStrategy, User, DocumentType, DocumentCode } from '@/util/interfaces'
import { useRoute } from 'vue-router'
import Spinner from '../Spinner.vue'
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()
const isSubmitting = ref(false)
const searchResults = ref<User[]>([])
const selectedReviewers = ref<User[]>([])
const selectedApprovers = ref<User[]>([])
const selectAllReviewers = ref(false)
const selectAllApprovers = ref(false)
const includeChildren = ref(false)
const strategyId = route.params.id
const strategy = ref<ApprovalStrategy>()
const noReview = ref(false)
const noApprove = ref(false)
const loading = ref(true)

interface RequiredDocumentRow {
    documentType: DocumentType | null
    documentCode: DocumentCode | null
    availableCodes: DocumentCode[]
}
const allDocumentTypes = ref<DocumentType[]>([])
const requiredDocuments = ref<RequiredDocumentRow[]>([])

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
const isEditing = !!strategyId
const crums = [
    {
        name: 'Documents',
        path: '/qms/documents',
        icon: 'fa-solid fa-file-lines text-neutral-700 text-2xl'
    },
    {
        name: 'Settings',
        path: '/qms/documents/settings',
        icon: 'fa-solid fa-gear text-neutral-700 text-2xl'
    },
    {
        name: isEditing ? 'Edit Approval Strategy' : 'Add Approval Strategy',
        path: '',
        icon: ''
    }
]

watch(noReview, (value) => {
    if (value) {
        selectAllReviewers.value = false
        selectedReviewers.value = []
    }
})

watch(noApprove, (value) => {
    if (value) {
        selectAllApprovers.value = false
        selectedApprovers.value = []
    }
})

watch(selectAllReviewers, (value) => {
    if (value) {
        noReview.value = false
    }
})

watch(selectAllApprovers, (value) => {
    if (value) {
        noApprove.value = false
    }
})

onMounted(async () => {
    try {
        await loadDocumentTypes()

        if (isEditing) {
            const existingStrategy = await apiGet<any>(
                `/documents/approval-strategies/${strategyId}`,
                authStore
            )
            strategy.value = existingStrategy

            // Set form values
            selectAllReviewers.value = existingStrategy.allReviewers
            selectAllApprovers.value = existingStrategy.allApprovers

            // Set reviewers and approvers
            selectedReviewers.value = (existingStrategy.reviewers || [])
            selectedApprovers.value = (existingStrategy.approvers || [])
            noReview.value = existingStrategy.noReview
            noApprove.value = existingStrategy.noApprove

            // Populate document type/code rows
            if (existingStrategy.codes?.length) {
                const docRows: RequiredDocumentRow[] = []
                for (const code of existingStrategy.codes) {
                    const codes = code.documentType?.id
                        ? await fetchCodesForType(code.documentType.id)
                        : []
                    docRows.push({
                        documentType: code.documentType || null,
                        documentCode: code.documentCode || null,
                        availableCodes: codes
                    })
                }
                requiredDocuments.value = docRows
            }
        }
        searchResults.value = await apiGet<User[]>('permissions/access?subject=documents', authStore)
        loading.value = false
    } catch (error: any) {
        toast.showToast(
            'Error loading data',
            error?.response?.data?.message || 'An error occurred while loading data',
            'error'
        )
    }
})



const submitForm = async (values: any) => {
    isSubmitting.value = true

    try {
        // Prepare approval strategy data for API
        const validCodes = requiredDocuments.value.filter(d => d.documentType?.id)
        if (validCodes.length === 0) {
            toast.showToast(
                'Error creating approval strategy',
                'Please add at least one document type',
                'error'
            )
            isSubmitting.value = false

            return
        }
        const strategyData = {
            maxReviewDuration: values.maxReviewDuration || 0,
            maxApprovalDuration: values.maxApprovalDuration || 0,
            requiredReviews: noReview.value ? 0 : (values.requiredReviews || 0),
            requiredApprovals: noApprove.value ? 0 : (values.requiredApprovals || 0),

            allReviewers: selectAllReviewers.value,
            allApprovers: selectAllApprovers.value,
            includeChildren: includeChildren.value,
            reviewers: noReview.value || selectAllReviewers.value
                ? []
                : selectedReviewers.value.map((user) => ({ id: user.id })),
            approvers: noApprove.value || selectAllApprovers.value
                ? []
                : selectedApprovers.value.map((user) => ({ id: user.id })),
            codes: validCodes.map(d => ({
                documentTypeId: String(d.documentType!.id),
                documentCodeId: d.documentCode?.id ? String(d.documentCode.id) : undefined
            })),
            name: values.name,
            noReview: noReview.value,
            noApprove: noApprove.value
        }

        if (isEditing) {
            await apiPut(`/documents/approval-strategies/${strategyId}`, strategyData, authStore)
            toast.showToast(
                'Approval strategy updated successfully',
                'Approval strategy updated successfully',
                'success'
            )
        } else {
            await apiPost('/documents/approval-strategies', strategyData, authStore)
            toast.showToast(
                'Approval strategy created successfully',
                'Approval strategy created successfully',
                'success'
            )
        }
        router.push('/qms/documents/settings')
    } catch (error: any) {
        isSubmitting.value = false
        toast.showToast(
            `Error ${isEditing ? 'updating' : 'creating'} approval strategy`,
            error?.response?.data?.message ||
            `An error occurred while ${isEditing ? 'updating' : 'creating'} the approval strategy`,
            'error'
        )
    }
}

const cancel = () => {
    router.push('/qms/documents/settings')
}
</script>
