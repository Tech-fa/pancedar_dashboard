<template>
    <Form
        :key="formKey"
        @submit="handleSubmit"
        :initial-values="initialValues"
        id="add-category-modal"
    >
        <div class="bg-secondary rounded-lg shadow-lg w-[500px] border border-main">
            <div class="p-6 border-b border-main-border flex justify-between items-center">
                <h2 class="text-xl text-opposite">
                    {{ isEditMode ? 'Edit Category' : 'Add Category' }}
                </h2>
                <button
                    type="button"
                    class="p-2 hover:bg-neutral-100 rounded-lg"
                    @click="onCancel"
                    test-id="close-category-modal-button"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <AppInputForm
                        name="documentTypeName"
                        placeholder="Enter category name"
                        label="Category Name"
                        :required="true"
                        :rules="(v) => (!exists(v) ? 'Category Name is required' : true)"
                        test-id="category-name-input"
                    />
                </div>

                <div>
                    <label class="block text-sm text-opposite/70 mb-1">Document Codes</label>
                    <div class="space-y-2">
                        <div
                            v-for="(code, index) in codes"
                            :key="index"
                            class="flex items-center gap-2"
                        >
                            <input
                                v-model="codes[index].code"
                                placeholder="Code"
                                :class="`${INPUT_CLASS} flex-1`"
                                test-id="code-input"
                            />

                            <button
                                v-if="codes.length > 1"
                                type="button"
                                class="p-2 text-red-500 hover:text-red-700"
                                @click="removeCode(index)"
                                test-id="remove-code-button"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="mt-2 text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                        @click="addCode"
                        test-id="add-code-button"
                    >
                        <i class="fa-solid fa-plus"></i> Add Code
                    </button>
                </div>
            </div>
            <div class="p-6 border-t border-neutral-200 flex justify-end gap-4">
                <AppButton
                    type="button"
                    button-style="secondary"
                    @click="onCancel"
                    test-id="cancel-category-button"
                >
                    Cancel
                </AppButton>
                <AppButton
                    type="submit"
                    button-style="primary"
                    :loading="loading"
                    test-id="save-category-button"
                >
                    {{ isEditMode ? 'Update Category' : 'Save Category' }}
                </AppButton>
            </div>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form } from 'vee-validate'
import AppButton from '@/components/AppButton.vue'
import AppInputForm from '@/components/AppInputForm.vue'
import { exists } from '@/util/util'
import { INPUT_CLASS } from '../contants'

const props = defineProps<{
    isEditMode: boolean
    initialValues: any
    formKey: number
    loading: boolean
    onSubmit: (values: any) => Promise<void>
    onCancel: () => void
}>()

const codes = ref<{ code: string; name: string }[]>(
    props.initialValues?.codes?.map((c: any) => ({ code: c.code, name: c.name || '' })) || []
)

const addCode = () => {
    codes.value.push({ code: '', name: '' })
}

const removeCode = (index: number) => {
    codes.value.splice(index, 1)
}

const handleSubmit = (values: any) => {
    props.onSubmit({
        ...values,
        documentCodes: codes.value.filter((c) => c.code.trim() !== '')
    })
}
</script>
