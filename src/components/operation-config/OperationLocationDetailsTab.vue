<template>
    <div class="max-w-7xl mx-auto">
        <div class="bg-secondary rounded-lg border border-gray-800">
            <Form ref="formRef" @submit="handleSubmit" :initialValues="initialValues" :key="formKey"
                class="p-6 space-y-6" v-slot="{ values }">
                <SelectForm name="country" label="Country" placeholder="Select country..." :required="true"
                    :rules="(v: string) => !!v?.trim() ? true : 'Country is required'" :values="countries"
                    :display="countryDisplay" valueKey="name" @update:modelValue="onCountryFieldUpdate" />

                <SelectForm name="state" label="State / Region" placeholder="Select state..." optional
                    :values="filteredStates" :display="stateDisplay" valueKey="name" :disabled="!values.country"
                    @update:modelValue="onStateFieldUpdate" />

                <SelectForm name="city" label="City" placeholder="Select city..." optional :values="filteredCities"
                    :display="cityDisplay" valueKey="name" :disabled="!values.state" />

                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-opposite">Required Documents By Pilot</label>
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
                        {{ isEditMode ? 'Update Location' : 'Create Location' }}
                    </AppButton>
                </div>
            </Form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Form } from 'vee-validate'
import { Country, State, City } from 'country-state-city'
import type { ICountry, IState, ICity } from 'country-state-city'
import AppButton from '@/components/AppButton.vue'
import SelectForm from '@/components/SelectForm.vue'
import Select2 from '@/components/Select2.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getOperationLocationById,
    createOperationLocation,
    updateOperationLocation,
    getLocationFilters,
} from './endpoints'
import { apiGet } from '@/util/api'
import type { DocumentType, DocumentCode } from '@/util/interfaces'

const props = defineProps<{
    locationId?: string
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
const formRef = ref<InstanceType<typeof Form> | null>(null)

const allCountries = Country.getAllCountries()
const allowedCountryNames = ref<Set<string> | null>(null)
const allowedStateNames = ref<Set<string> | null>(null)
const allowedCityNames = ref<Set<string> | null>(null)

const countries = computed(() => {
    if (!allowedCountryNames.value) return allCountries
    return allCountries.filter((c) => allowedCountryNames.value!.has(c.name))
})

const states = ref<IState[]>([])
const cities = ref<ICity[]>([])

const filteredStates = computed(() => {
    if (!allowedStateNames.value) return states.value
    return states.value.filter((s) => allowedStateNames.value!.has(s.name))
})

const filteredCities = computed(() => {
    if (!allowedCityNames.value) return cities.value
    return cities.value.filter((c) => allowedCityNames.value!.has(c.name))
})

const countryDisplay = (c: ICountry | null) => (c ? `${c.flag} ${c.name}` : '')
const stateDisplay = (s: IState | null) => s?.name || ''
const cityDisplay = (c: ICity | null) => c?.name || ''

const syncLocationListsFromNames = (countryName: string, stateName: string) => {
    states.value = []
    cities.value = []
    if (!countryName?.trim()) return
    const match = allCountries.find((c) => c.name === countryName)
    if (match) {
        states.value = State.getStatesOfCountry(match.isoCode)
        if (stateName?.trim()) {
            const matchState = states.value.find((s) => s.name === stateName)
            if (matchState) {
                cities.value = City.getCitiesOfState(match.isoCode, matchState.isoCode)
            }
        }
    }
}

const onCountryFieldUpdate = (countryName: string | null) => {
    const name = countryName?.trim() || ''
    const match = name ? allCountries.find((c) => c.name === name) : null
    states.value = match ? State.getStatesOfCountry(match.isoCode) : []
    cities.value = []
    formRef.value?.setFieldValue('state', '')
    formRef.value?.setFieldValue('city', '')
}

const onStateFieldUpdate = (stateName: string | null) => {
    const countryName = formRef.value?.values?.country as string | undefined
    const matchCountry = countryName ? allCountries.find((c) => c.name === countryName) : null
    const stName = stateName?.trim() || ''
    const matchState = stName && matchCountry ? states.value.find((s) => s.name === stName) : null
    cities.value =
        matchCountry && matchState
            ? City.getCitiesOfState(matchCountry.isoCode, matchState.isoCode)
            : []
    formRef.value?.setFieldValue('city', '')
}

const initialValues = ref({
    country: '',
    state: '',
    city: ''
})

interface RequiredDocumentRow {
    documentType: DocumentType | null
    documentCode: DocumentCode | null
    availableCodes: DocumentCode[]
}
const allDocumentTypes = ref<DocumentType[]>([])
const requiredDocuments = ref<RequiredDocumentRow[]>([])

const loadLocationFilters = async () => {
    try {
        const filters = await getLocationFilters(authStore)
        if (filters.countries.length > 0) {
            allowedCountryNames.value = new Set(filters.countries)
            allowedStateNames.value = new Set(filters.states)
            allowedCityNames.value = new Set(filters.cities)
        }
    } catch {
        // If the endpoint fails, show all options (no filtering)
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

const loadLocation = async () => {
    if (!props.locationId) return
    try {
        const data = await getOperationLocationById(props.locationId, authStore)
        isActive.value = data.isActive
        initialValues.value = {
            country: data.country ?? '',
            state: data.state ?? '',
            city: data.city ?? ''
        }
        syncLocationListsFromNames(initialValues.value.country, initialValues.value.state)
        if (data.requiredDocuments?.length) {
            const docRows: RequiredDocumentRow[] = []
            for (const rd of data.requiredDocuments) {
                const codes = rd.documentType?.id
                    ? await fetchCodesForType(rd.documentType.id)
                    : []
                docRows.push({
                    documentType: rd.documentType || null,
                    documentCode: rd.documentCode || null,
                    availableCodes: codes
                })
            }
            requiredDocuments.value = docRows
        }
        formKey.value++
    } catch {
        toast.showToast('Error', 'Failed to load operation location', 'error')
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
            country: values.country || undefined,
            state: values.state || undefined,
            city: values.city || undefined,
            isActive: isActive.value,
            requiredDocuments: validDocs.map((d) => ({
                documentTypeId: d.documentType!.id,
                documentCodeId: d.documentCode?.id ?? null
            }))
        }

        if (props.isEditMode && props.locationId) {
            await updateOperationLocation(props.locationId, data, authStore)
            toast.showToast('Location updated', 'Operation location updated successfully', 'success')
        } else {
            await createOperationLocation(data, authStore)
            toast.showToast('Location created', 'Operation location created successfully', 'success')
        }
        emit('saved')
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Unable to save operation location. Please try again.',
            'error'
        )
    } finally {
        isSubmitting.value = false
    }
}

onMounted(async () => {
    await Promise.all([loadLocationFilters(), loadDocumentTypes()])
    await loadLocation()
})
</script>
