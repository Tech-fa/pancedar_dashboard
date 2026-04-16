<template>
    <div id="root" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs" />

        <main id="main-content" class="p-4 sm:p-6 lg:p-8">
            <div id="edit-form" class="max-w-3xl mx-auto bg-secondary rounded-lg shadow-sm">
                <div class="p-6 border-b border-gray-800">
                    <div class="flex items-center gap-4">
                        <div v-if="!isEditMode">
                            <h2 class="text-lg text-opposite font-semibold">Add New Vehicle</h2>
                            <p class="text-opposite">Add a new vehicle to your fleet</p>
                        </div>
                        <div v-else>
                            <h2 class="text-lg text-opposite font-semibold">Edit Asset</h2>
                            <p class="text-opposite">Edit the asset's information</p>
                        </div>
                    </div>
                </div>

                <Form @submit="submitForm" class="p-6 space-y-6"
                    v-if="!isEditMode || (isEditMode && initialValues.assetCode)" :initialValues="initialValues"
                    v-slot="{ values }">
                    <!-- Asset Code and Name -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AppInputForm test-id="asset-code" name="assetCode" label="Vehicle Id"
                            placeholder="Enter vehicle id"
                            :rules="(v: any) => (!exists(v) ? 'Vehicle id is required' : true)" :required="true" />
                        <AppInputForm test-id="asset-name" name="name" label="Vehicle Name"
                            placeholder="Enter vehicle name"
                            :rules="(v: any) => (!exists(v) ? 'Vehicle name is required' : true)" :required="true" />
                    </div>

                    <!-- Site and Location -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectForm test-id="model-select" name="assetModel" label="Model" :values="assetModels"
                            :placeholder="'Select model'" :display="(item: any) => item?.name || 'N/A'" :required="true"
                            :rules="(v: any) => (!exists(v) ? 'Model is required' : true)" />
                        <SelectForm test-id="criticality-select" name="assetCategory" label="Category"
                            :values="assetCategories" :placeholder="'Select category'"
                            :display="(item: any) => item?.name || 'N/A'" />
                    </div>

                    <!-- Class and Model -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <AppInputForm test-id="year" name="year" type="number" label="Year (Optional)"
                            placeholder="Enter year" />
                        </div>
                        <AppInputForm test-id="serial-no" name="serialNo" label="Serial Number"
                            placeholder="Enter serial number" :required="true"
                            :rules="(v: any) => (!exists(v) ? 'Serial number is required' : true)" />
                    </div>

                    <!-- Serial Number -->

                    

                    <!-- Criticality and Status -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectForm test-id="status-select" name="status" label="Status"
                            :values="['Active', 'Inactive', 'Retired']" :placeholder="'Active'"
                            :display="(item: any) => item" />
                    </div>

                    <!-- Purchase Date and Commission Date -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AppInputDateForm test-id="purchase-date" name="purchaseDate" type="date"
                            label="Purchase Date (Optional)" placeholder="Purchase date" />
                        <AppInputDateForm test-id="commission-date" name="commissionDate" type="date"
                            label="Entry of Service" placeholder="Commission date" />
                    </div>

                    <!-- Custom Data (JSON) -->
                    <JsonEditor test-id="custom-data" v-model="customData" label="Metadata" />

                    <div class="p-6 border-t border-gray-800 bg-secondary flex items-center justify-end gap-4">
                        <AppButton test-id="cancel-asset-button" buttonStyle="secondary" type="button" @click="cancel">
                            Cancel
                        </AppButton>
                        <AppButton test-id="save-asset-button" buttonStyle="primary" type="submit"
                            :loading="isSubmitting">
                            {{ isEditMode ? 'Update Asset' : 'Create Asset' }}
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
import { ref, onMounted, computed } from 'vue'
import { Form } from 'vee-validate'
import { useRouter, useRoute } from 'vue-router'
import AppInputForm from '@/components/AppInputForm.vue'
import SelectForm from '@/components/SelectForm.vue'
import { useAuthStore } from '@/stores/auth'
import { apiGet } from '@/util/api'
import { useToast } from '@/stores/notification'
import { exists, formatDateToInput } from '@/util/util'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import Select2 from '@/components/Select2.vue'
import BreadCrums from '@/components/breadCrums.vue'
import JsonEditor from '@/components/JsonEditor.vue'
import {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    getAssetModels,
    getWarehouses,
    getWarehouseBins,
    getAssetCategories
} from './endpoints'
import AppInputDateForm from '../AppInputDateForm.vue'
import type {
    Asset,
    AssetCategory,
    AssetModel,
    Department,
    Location,
    Warehouse,
    WarehouseBin
} from '@/util/interfaces'
import Can from '../Can.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSubmitting = ref(false)
const toast = useToast()
const assetId = route.params.assetId as string
const isEditMode = !!assetId

const initialValues = ref<{ [key: string]: any }>({
    assetCode: undefined,
    name: undefined,
    class: undefined,
    manufacturer: undefined,
    model: undefined,
    serialNo: undefined,
    criticality: 'Low',
    status: 'Active',
    purchaseDate: undefined,
    commissionDate: undefined
})

const customData = ref<Record<string, any> | null>(null)

const departments = ref<Department[]>([])
const assetModels = ref<AssetModel[]>([])
const assetCategories = ref<AssetCategory[]>([])
const crumbs = [
    {
        name: 'Fleet Assets',
        path: '/fleet/assets',
        icon: 'fa-solid fa-helicopter text-neutral-700 text-2xl'
    },
    {
        name: isEditMode ? 'Edit Asset' : 'Add Asset',
        path: '',
        icon: ''
    }
]

onMounted(async () => {
    try {
        // Fetch departments, locations, assets, and models in parallel
        const [modelsData, assetCategoriesData] = await Promise.all([
            getAssetModels(authStore),
            getAssetCategories(authStore)
        ])

        assetModels.value = modelsData
        assetCategories.value = assetCategoriesData

        // If in edit mode, fetch the asset data
        if (isEditMode) {
            const assetData = await getAssetById(assetId, authStore)

            initialValues.value = {
                assetCode: assetData.assetCode,
                name: assetData.name,
                class: assetData.class || '',
                assetModel: assetData.assetModel,
                site: assetData.site,
                warehouse: assetData.warehouse,
                warehouseBin: assetData.warehouseBin,
                assetCategory: assetData.assetCategory,
                year: assetData.year,
                serialNo: assetData.serialNo || '',
                criticality: assetData.criticality,
                status: assetData.status,
                purchaseDate: formatDateToInput(assetData.purchaseDate) || '',
                commissionDate: formatDateToInput(assetData.commissionDate) || ''
            }

            // Set custom data
            customData.value = assetData.custom || null
        }
    } catch (error: any) {
        toast.showToast(
            'Error loading data',
            error?.response?.data?.message || 'An error occurred while loading data',
            'error'
        )
        if (isEditMode) {
            router.push('/fleet/assets')
        }
    }
})

const submitForm = async (values: any) => {
    isSubmitting.value = true
    // Prepare asset data for API
    const assetData = {
        assetCode: values.assetCode,
        name: values.name,
        modelId: values.assetModel?.id || null,
        assetCategoryId: values.assetCategory?.id || null,
        year: values.year || null,
        class: values.class || null,
        serialNo: values.serialNo || null,
        criticality: values.criticality,
        status: values.status,
        purchaseDate: values.purchaseDate ? new Date(values.purchaseDate).getTime() : undefined,
        commissionDate: values.commissionDate
            ? new Date(values.commissionDate).getTime()
            : undefined,
        custom: customData.value
    }

    try {
        if (isEditMode) {
            await updateAsset(assetId, assetData, authStore)
            toast.showToast('Asset updated', 'Asset updated successfully', 'success')
        } else {
            await createAsset(assetData, authStore)
            toast.showToast('Asset created', 'Asset created successfully', 'success')
        }
        router.push('/fleet/assets')
    } catch (error: any) {
        isSubmitting.value = false
        toast.showToast(
            isEditMode ? 'Error updating asset' : 'Error creating asset',
            error?.response?.data?.message ||
            `An error occurred while ${isEditMode ? 'updating' : 'creating'} the asset`,
            'error'
        )
    }
}

const cancel = () => {
    router.push('/fleet/assets')
}
</script>

<style scoped></style>
