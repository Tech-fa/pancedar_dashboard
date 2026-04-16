<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs" />

        <main id="main-content" class="p-4 sm:p-6 lg:p-8">
            <div id="edit-form" class="max-w-3xl mx-auto bg-secondary rounded-lg shadow-sm">
                <div class="p-6 border-b border-gray-800">
                    <div class="flex items-center gap-4">
                        <div v-if="!isEditMode">
                            <h2 class="text-lg text-opposite font-semibold">Add New Asset Model</h2>
                            <p class="text-opposite">Add a new asset model to your fleet</p>
                        </div>
                        <div v-else>
                            <h2 class="text-lg text-opposite font-semibold">Edit Asset Model</h2>
                            <p class="text-opposite">Edit the asset model's information</p>
                        </div>
                    </div>
                </div>

                <Form @submit="submitForm" class="p-6 space-y-6"
                    v-if="!isEditMode || (isEditMode && initialValues.name)" :initialValues="initialValues"
                    v-slot="{ values }">
                    <!-- Name and Make -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AppInputForm test-id="model-name" name="name" label="Model Name" placeholder="Enter model name"
                            :rules="(v: any) => (!exists(v) ? 'Model name is required' : true)" :required="true" />
                        <AppInputForm test-id="model-make" name="make" label="Make (Manufacturer)"
                            placeholder="Enter make/manufacturer" />
                    </div>

                    <div class="p-6 border-t border-gray-800 bg-secondary flex items-center justify-end gap-4">
                        <AppButton test-id="cancel-model-button" buttonStyle="secondary" type="button" @click="cancel">
                            Cancel
                        </AppButton>
                        <AppButton test-id="save-model-button" buttonStyle="primary" type="submit"
                            :loading="isSubmitting">
                            {{ isEditMode ? 'Update Model' : 'Create Model' }}
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
    getAssetModelById,
    createAssetModel,
    updateAssetModel,
} from './endpoints'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSubmitting = ref(false)
const toast = useToast()
const modelId = route.params.modelId as string
const isEditMode = !!modelId

const initialValues = ref<{ [key: string]: any }>({
    name: '',
    make: ''
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
        name: 'Asset Models',
        path: '/fleet/asset-models',
        icon: 'fa-solid fa-cubes text-neutral-700 text-2xl'
    },
    {
        name: isEditMode ? 'Edit Model' : 'Add Model',
        path: '',
        icon: ''
    }
]

// Fetch model data if in edit mode
onMounted(async () => {
    if (isEditMode) {
        try {
            const modelData = await getAssetModelById(modelId, authStore)

            initialValues.value = {
                name: modelData.name,
                make: modelData.make || ''
            }
        } catch (error: any) {
            toast.showToast(
                'Error loading model',
                error?.response?.data?.message || 'An error occurred while loading the model',
                'error'
            )
            router.push('/fleet/asset-models')
        }
    }
})

const submitForm = async (values: any) => {
    isSubmitting.value = true

    const modelData = {
        name: values.name,
        make: values.make || null
    }

    try {
        if (isEditMode) {
            await updateAssetModel(modelId, modelData, authStore)
            toast.showToast('Model updated', 'Asset model updated successfully', 'success')
        } else {
            await createAssetModel(modelData, authStore)
            toast.showToast('Model created', 'Asset model created successfully', 'success')
        }
        router.push('/fleet/asset-models')
    } catch (error: any) {
        isSubmitting.value = false
        toast.showToast(
            isEditMode ? 'Error updating model' : 'Error creating model',
            error?.response?.data?.message ||
            `An error occurred while ${isEditMode ? 'updating' : 'creating'} the model`,
            'error'
        )
    }
}

const cancel = () => {
    router.push('/fleet/asset-models')
}
</script>

<style scoped></style>
