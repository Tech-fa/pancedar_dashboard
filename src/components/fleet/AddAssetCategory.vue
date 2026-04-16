<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs" />

        <main id="main-content" class="p-4 sm:p-6 lg:p-8">
            <div id="edit-form" class="max-w-3xl mx-auto bg-secondary rounded-lg shadow-sm">
                <div class="p-6 border-b border-gray-800">
                    <div class="flex items-center gap-4">
                        <div v-if="!isEditMode">
                            <h2 class="text-lg text-opposite font-semibold">Add New Asset Category</h2>
                            <p class="text-opposite">Add a new asset category to your fleet</p>
                        </div>
                        <div v-else>
                            <h2 class="text-lg text-opposite font-semibold">Edit Asset Category</h2>
                            <p class="text-opposite">Edit the asset category's information</p>
                        </div>
                    </div>
                </div>

                <Form
                    @submit="submitForm"
                    class="p-6 space-y-6"
                    v-if="!isEditMode || (isEditMode && initialValues.name)"
                    :initialValues="initialValues"
                    v-slot="{ values }"
                >
                    <!-- Name -->
                    <div class="grid grid-cols-1 gap-6">
                        <AppInputForm
                            test-id="category-name"
                            name="name"
                            label="Category Name"
                            placeholder="Enter category name"
                            :rules="(v: any) => (!exists(v) ? 'Category name is required' : true)"
                            :required="true"
                        />
                    </div>

                    <div class="p-6 border-t border-gray-800 bg-secondary flex items-center justify-end gap-4">
                        <AppButton
                            test-id="cancel-category-button"
                            buttonStyle="secondary"
                            type="button"
                            @click="cancel"
                        >
                            Cancel
                        </AppButton>
                        <AppButton
                            test-id="save-category-button"
                            buttonStyle="primary"
                            type="submit"
                            :loading="isSubmitting"
                        >
                            {{ isEditMode ? 'Update Category' : 'Create Category' }}
                        </AppButton>
                    </div>
                </Form>

                <div v-else>
                    <div class="p-6 border-t border-gray-800 bg-secondary flex items-center justify-center gap-4 h-60">
                        <Spinner width="30" height="30" />
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Form } from 'vee-validate'
import { useRouter, useRoute } from 'vue-router'
import AppInputForm from '@/components/AppInputForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { exists } from '@/util/util'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import BreadCrums from '@/components/breadCrums.vue'
import {
    getAssetCategoryById,
    createAssetCategory,
    updateAssetCategory
} from './endpoints'
import type { AssetCategory } from '@/util/interfaces'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSubmitting = ref(false)
const toast = useToast()
const categoryId = route.params.categoryId as string
const isEditMode = !!categoryId

const initialValues = ref<{ [key: string]: any }>({
    name: ''
})

const crumbs = [
    {
        name: 'Fleet',
        path: '/fleet/assets',
        icon: 'fa-solid fa-helicopter text-neutral-700 text-2xl'
    },
    {
        name: 'Fleet Settings',
        path: '/fleet/settings',
        icon: 'fa-solid fa-gear text-neutral-700 text-2xl'
    },
    {
        name: 'Asset Categories',
        path: '/fleet/asset-categories',
        icon: 'fa-solid fa-layer-group text-neutral-700 text-2xl'
    },
    {
        name: isEditMode ? 'Edit Category' : 'Add Category',
        path: '',
        icon: ''
    }
]

// Fetch category data if in edit mode
onMounted(async () => {
    if (isEditMode) {
        try {
            const categoryData = await getAssetCategoryById(categoryId, authStore)

            initialValues.value = {
                name: categoryData.name
            }
        } catch (error: any) {
            toast.showToast(
                'Error loading category',
                error?.response?.data?.message || 'An error occurred while loading the category',
                'error'
            )
            router.push('/fleet/asset-categories')
        }
    }
})

const submitForm = async (values: any) => {
    isSubmitting.value = true

    const categoryData = {
        name: values.name
    }

    try {
        if (isEditMode) {
            await updateAssetCategory(categoryId, categoryData, authStore)
            toast.showToast('Category updated', 'Asset category updated successfully', 'success')
        } else {
            await createAssetCategory(categoryData, authStore)
            toast.showToast('Category created', 'Asset category created successfully', 'success')
        }
        router.push('/fleet/asset-categories')
    } catch (error: any) {
        isSubmitting.value = false
        toast.showToast(
            isEditMode ? 'Error updating category' : 'Error creating category',
            error?.response?.data?.message ||
                `An error occurred while ${isEditMode ? 'updating' : 'creating'} the category`,
            'error'
        )
    }
}

const cancel = () => {
    router.push('/fleet/asset-categories')
}
</script>

<style scoped></style>
