<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs">
            <AppButton buttonStyle="primary" @click="addService">
                <i class="fa-solid fa-plus mr-2"></i> Add Service
            </AppButton>
        </BreadCrums>

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-6xl mx-auto space-y-4">
                <div v-if="services.length === 0"
                    class="bg-secondary border border-gray-800 rounded-lg p-12 text-center">
                    <i class="fa-solid fa-concierge-bell text-4xl text-opposite/30 mb-4"></i>
                    <p class="text-opposite/60">No services configured yet. Click "Add Service" to get started.</p>
                </div>

                <div v-for="(service, sIndex) in services" :key="sIndex"
                    class="bg-secondary border border-gray-800 rounded-lg">
                    <!-- Service Header -->
                    <div class="flex justify-between items-center px-6 py-4 border-b border-gray-800 relative">
                        <div class="flex-1 mr-4">
                            <AppInput v-model="service.name" type="text" placeholder="Service Name" :hide-icon="true" />
                            <div class="h-2" />
                            <AppInput v-model="service.description" type="text" placeholder="Service description (optional)" :hide-icon="true"  />
                            <div class="mt-2">
                                <Select2 v-model="service.jobTypeId" :values="jobTypes" :display="(jt: any) => jt?.name"
                                    placeholder="Select job type..." />
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <button @click="service.expanded = !service.expanded"
                                class="text-opposite/60 hover:text-opposite p-2">
                                <span v-if="service.expanded">
                                    <i class="fa-solid fa-chevron-up"></i>
                                </span>
                                <span v-else>
                                    <i class="fa-solid fa-chevron-down"></i>
                                </span>
                            </button>

                        </div>
                        <button @click="removeService(sIndex)"
                            class="text-red-400 hover:text-red-300 p-2 absolute right-1 top-1 ">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>

                    <!-- Custom Fields -->
                    <div v-if="service.expanded" class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="text-sm font-semibold text-opposite/80">Custom Fields</h4>
                            <AppButton buttonStyle="secondary" @click="addField(sIndex)">
                                <i class="fa-solid fa-plus mr-1"></i> Add Field
                            </AppButton>
                        </div>

                        <div v-if="service.fields.length === 0"
                            class="text-center py-6 text-opposite/40 border border-dashed border-gray-700 rounded-lg">
                            No custom fields. Click "Add Field" to add one.
                        </div>

                        <div v-for="(field, fIndex) in service.fields" :key="fIndex"
                            class="bg-main border border-gray-700 rounded-lg p-4 mb-3">
                            <div class="flex justify-between items-start mb-3">
                                <span class="text-xs font-medium text-opposite/50">Field {{ fIndex + 1 }}</span>
                                <button @click="removeField(sIndex, fIndex)"
                                    class="text-red-400 hover:text-red-300 text-sm">
                                    <i class="fa-solid fa-times"></i>
                                </button>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label class="block text-sm font-medium text-opposite/80 mb-1">Label *</label>
                                    <AppInput v-model="field.label" type="text" placeholder="Field label" :hide-icon="true" />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-opposite/80 mb-1">Type *</label>
                                    <Select2 v-model="field.type" :values="fieldTypes" :display="(ft: any) => ft?.label || ft" placeholder="Select type..." />
                                </div>

                                <div class="flex items-center gap-4 pt-5">
                                    <label class="flex items-center gap-2 text-sm text-opposite/80 cursor-pointer">
                                        <input type="checkbox" v-model="field.required"
                                            class="rounded border-gray-600" />
                                        Required
                                    </label>
                                </div>
                            </div>

                            <!-- Options for dropdown, radio, checkbox -->
                            <div v-if="['dropdown', 'radio', 'checkbox'].includes(field.type?.value)" class="mt-3">
                                <label class="block text-sm font-medium text-opposite/80 mb-1">Options</label>
                                <div class="flex flex-wrap gap-2 mb-2">
                                    <span v-for="(opt, oIndex) in field.options" :key="oIndex"
                                        class="inline-flex items-center gap-1 bg-secondary border border-gray-700 text-opposite text-sm px-2 py-1 rounded-md">
                                        {{ opt }}
                                        <button @click="removeOption(sIndex, fIndex, oIndex)"
                                            class="text-red-400 hover:text-red-300">
                                            <i class="fa-solid fa-times text-xs"></i>
                                        </button>
                                    </span>
                                </div>
                                <div class="flex gap-2">
                                    <AppInput v-model="field.newOption" type="text" placeholder="Add option..." :hide-icon="true"
                                        class="flex-1" @keyup.enter="addOption(sIndex, fIndex)" />
                                    <AppButton buttonStyle="secondary" @click="addOption(sIndex, fIndex)">
                                        Add
                                    </AppButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="services.length > 0" class="flex justify-end pt-4">
                    <AppButton buttonStyle="secondary" @click="saveServices" :loading="saving">
                        Save All Services
                    </AppButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { getVehicleJobTypes } from '@/components/fleet/endpoints'
import type { VehicleJobType } from '@/util/interfaces'
import { INPUT_CLASS } from '@/components/contants'
import Select2 from '@/components/Select2.vue'
import AppInput from '@/components/AppInput.vue'
import { apiGet, apiPut } from '@/util/api'

const authStore = useAuthStore()
const toast = useToast()
const saving = ref(false)
const jobTypes = ref<VehicleJobType[]>([])

const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Boolean (Yes/No)' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'radio', label: 'Radio' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'file', label: 'File' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'link', label: 'Link' },
]

interface CustomField {
    label: string
    type: { value: string; label: string }
    required: boolean
    options: string[]
    newOption: string
}

interface ServiceItem {
    id?: string
    name: string
    description: string
    jobTypeId: any
    expanded: boolean
    fields: CustomField[]
}

const crumbs = [
    { name: 'Customers', path: '/customers/list', icon: 'fa-solid fa-building text-neutral-700 text-2xl' },
    { name: 'Services', path: '' }
]

const services = ref<ServiceItem[]>([])

const addService = () => {
    services.value.push({
        name: '',
        description: '',
        jobTypeId: '',
        expanded: true,
        fields: [],
    })
}

const fetchJobTypes = async () => {
    try {
        jobTypes.value = await getVehicleJobTypes(authStore)
    } catch {
        // Silently handle - job types dropdown will be empty
    }
}

const removeService = (index: number) => {
    services.value.splice(index, 1)
}

const addField = (serviceIndex: number) => {
    services.value[serviceIndex].fields.push({
        label: '',
        type: fieldTypes[0],
        required: false,
        options: [],
        newOption: '',
    })
}

const removeField = (serviceIndex: number, fieldIndex: number) => {
    services.value[serviceIndex].fields.splice(fieldIndex, 1)
}

const addOption = (serviceIndex: number, fieldIndex: number) => {
    const field = services.value[serviceIndex].fields[fieldIndex]
    if (field.newOption.trim()) {
        field.options.push(field.newOption.trim())
        field.newOption = ''
    }
}

const removeOption = (serviceIndex: number, fieldIndex: number, optionIndex: number) => {
    services.value[serviceIndex].fields[fieldIndex].options.splice(optionIndex, 1)
}

const fetchServices = async () => {
    try {
        const data = await apiGet<any[]>('/customers/services', authStore)
        if (data && data.length > 0) {
            services.value = data.map((s: any) => ({
                id: s.id,
                name: s.name,
                description: s.description ?? '',
                jobTypeId: s.jobType ?? '',
                expanded: false,
                fields: (s.fields ?? []).map((f: any) => ({
                    label: f.label ?? '',
                    type: fieldTypes.find(ft => ft.value === f.type) ?? fieldTypes[0],
                    required: f.required ?? false,
                    options: f.options ?? [],
                    newOption: '',
                })),
            }))
        }
    } catch {
        // No services yet
    }
}

onMounted(() => {
    fetchJobTypes()
    fetchServices()
})

const saveServices = async () => {
    const invalid = services.value.find((s) => !s.name.trim())
    if (invalid) {
        toast.showToast('Validation Error', 'All services must have a name.', 'error')
        return
    }

    saving.value = true
    try {
        const payload = {
            services: services.value.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description || undefined,
                jobTypeId: s.jobTypeId?.id || undefined,
                fields: s.fields.map(f => ({
                    label: f.label,
                    type: f.type?.value ?? f.type,
                    required: f.required,
                    options: f.options,
                })),
            }))
        }
        const result = await apiPut<any[]>('/customers/services', payload, authStore)
        if (result) {
            services.value = result.map((s: any) => ({
                id: s.id,
                name: s.name,
                description: s.description ?? '',
                jobTypeId: s.jobType ?? '',
                expanded: false,
                fields: (s.fields ?? []).map((f: any) => ({
                    label: f.label ?? '',
                    type: fieldTypes.find(ft => ft.value === f.type) ?? fieldTypes[0],
                    required: f.required ?? false,
                    options: f.options ?? [],
                    newOption: '',
                })),
            }))
        }
        toast.showToast('Services saved', 'Customer services updated successfully', 'success')
    } catch (error: any) {
        toast.showToast('Error', 'Failed to save services configuration', 'error')
    } finally {
        saving.value = false
    }
}
</script>
