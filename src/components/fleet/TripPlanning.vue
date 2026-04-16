<template>
    <div class="bg-main min-h-screen">
        <div v-if="pageLoading" class="flex items-center justify-center py-24">
            <Spinner width="3" height="3" />
        </div>
        <Form v-else :key="formKey" ref="formRef" @submit="saveJob" class="min-h-screen" :initialValues="initialValues"
            v-slot="{ values }">
            <BreadCrums :crumbs="[
                {
                    name: 'Jobs',
                    path: '/fleet/planned-jobs',
                    icon: 'fa-solid fa-briefcase text-neutral-700 text-2xl'
                },
                {
                    name: isEditing ? 'Edit Job' : 'Plan New Job',
                    path: '',
                    icon: ''
                }
            ]" />

            <div class="pb-24 max-w-7xl mx-auto">
                <div class="space-y-6 w-full xl:pr-2 mt-4 px-4">
                    <!-- Job Details Section -->
                    <section class="bg-secondary border border-gray-800 rounded-lg">
                        <div class="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-opposite">Job Details</h2>
                                <p class="text-sm text-opposite/70">
                                    Specify the core information for this job
                                </p>
                            </div>
                        </div>

                        <div class="p-6 space-y-6">
                            <div class="grid gap-6 md:grid-cols-2">
                                <AppInputForm name="name" label="Job Name" placeholder="Enter job name" :rules="(value: string) =>
                                    value && value.trim() ? true : 'Job name is required'
                                    " :required="true" />

                                <div class="relative">

                                    <div class="flex items-center gap-1 absolute top-0 right-0">
                                        <button type="button" @click="refreshJobTypes" title="Refresh job types"
                                            class="p-1 text-opposite/50 hover:text-opposite transition-colors">
                                            <i class="fa-solid fa-rotate-right text-xs"
                                                :class="{ 'animate-spin': refreshingJobTypes }"></i>
                                        </button>
                                        <a :href="'/fleet/job-types/add'" target="_blank" title="Add new job type"
                                            class="p-1 text-opposite/50 hover:text-opposite transition-colors">
                                            <i class="fa-solid fa-plus text-xs"></i>
                                        </a>
                                    </div>
                                    <SearcheableSelectForm name="jobType" :values="jobTypes" :display="displayJobType"
                                        label="Job Type" placeholder="Select job type" :rules="(value: string) =>
                                            value ? true : 'Job type is required'
                                            " :required="true" />
                                </div>
                                <div class="relative">
                                    <div class="flex items-center gap-1 absolute top-0 right-0">
                                        <button type="button" @click="refreshCustomers" title="Refresh customers"
                                            class="p-1 text-opposite/50 hover:text-opposite transition-colors">
                                            <i class="fa-solid fa-rotate-right text-xs"
                                                :class="{ 'animate-spin': refreshingCustomers }"></i>
                                        </button>
                                        <a :href="'/customers/add '" target="_blank" title="Add new job type"
                                            class="p-1 text-opposite/50 hover:text-opposite transition-colors">
                                            <i class="fa-solid fa-plus text-xs"></i>
                                        </a>
                                    </div>
                                    <SearcheableApiSelectForm name="customer" label="Customer" :values="customers"
                                        :display="displayCustomer" placeholder="Select customer (optional)" :rules="(value: string) =>
                                            value ? true : 'Customer is required'
                                            " :required="true" :change-query="() => { }" />
                                </div>

                                <SearcheableApiSelectForm name="asset" label="Asset (Drone)" :values="assets"
                                    :display="displayAsset" placeholder="Select asset "
                                    :rules="(value: string) => value ? true : 'Asset is required'" :required="true"
                                    :change-query="() => { }" />

                                <SelectForm name="status" label="Status" :values="statusOptions"
                                    :display="(item: string) => item" placeholder="Select status" />


                                <div class="grid gap-6 md:grid-cols-2 md:col-span-2">
                                    <AppInputDateForm name="startDate" label="Start Date & Time" type="datetime-local"
                                        placeholder="Select start date & time" :rules="validateStartDate"
                                        :required="true" />
                                    <AppInputDateForm name="endDate" label="End Date & Time" type="datetime-local"
                                        placeholder="Select end date & time"
                                        :rules="validateEndDate(values as JobFormValues)" :required="true" />
                                </div>

                                <!-- Assigned Pilot (visible when job type and both dates are set) -->
                                <div v-if="values.jobType && values.startDate && values.endDate" class="md:col-span-2">
                                    <div v-if="loadingPilots"
                                        class="flex items-center gap-2 text-sm text-opposite/60 py-2">
                                        <Spinner width="1" height="1" />
                                        <span>Loading qualified pilots...</span>
                                    </div>
                                    <div v-else-if="!loadingPilots && pilots.length === 0"
                                        class="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                                        <i class="fa-solid fa-triangle-exclamation"></i>
                                        <span>No qualified pilots available for this job type and schedule.</span>
                                    </div>
                                    <div v-else class="flex items-end gap-3">
                                        <div class="flex-1">
                                            <SearcheableSelectForm name="assignedPilot" label="Assigned Pilot"
                                                :values="pilots" :display="displayPilot" placeholder="Select pilot" />
                                        </div>
                                        <button type="button"
                                            class="mb-1 px-4 py-2 text-sm font-medium rounded-lg bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 transition-colors whitespace-nowrap"
                                            @click="autoAssignPilot">
                                            <i class="fa-solid fa-wand-magic-sparkles mr-1"></i>
                                            Auto-Assign
                                        </button>
                                    </div>
                                </div>

                            </div>

                            <AppTextareaForm name="description" label="Mission Brief"
                                placeholder="Enter mission brief (optional)" />

                            <AppTextareaForm name="notes" label="Notes" placeholder="Enter any job notes (optional)" />
                        </div>
                    </section>

                    <!-- Location Section -->
                    <section class="bg-secondary border border-gray-800 rounded-lg">
                        <div class="px-6 py-4 border-b border-gray-800">
                            <h2 class="text-lg font-semibold text-opposite">Location</h2>
                            <p class="text-sm text-opposite/70">
                                Where will this job take place?
                            </p>
                        </div>
                        <div class="p-6">
                            <LocationPicker v-model="locationData" />
                            <p v-if="locationError" class="mt-2 text-sm text-red-500">
                                {{ locationError }}
                            </p>
                        </div>
                    </section>

                    <!-- Line Items Section -->
                    <!-- <section class="bg-secondary border border-gray-800 rounded-lg"> -->
                    <!-- <div
                            class="px-6 py-4 border-b border-gray-800 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-opposite">
                                    Line Items (Flights)
                                </h2>
                                <p class="text-sm text-opposite/70">
                                    Each line item represents a flight performed by a pilot with a
                                    drone.
                                </p>
                            </div>
                            <AppButton buttonStyle="secondary" type="button" @click="addNewTrip">
                                <i class="fa-solid fa-plus"></i>
                                <span class="ml-2">Add Flight</span>
                            </AppButton>
                        </div> -->
                    <!-- 
                        <div class="p-6 space-y-6">
                            <div v-if="trips.length === 0"
                                class="text-sm text-opposite/70 border border-dashed border-gray-700 rounded-lg p-6 text-center">
                                Add at least one flight line item to build the job.
                            </div>

                            <div v-else class="overflow-x-auto">
                                <table class="w-full text-sm text-left">
                                    <thead class="text-xs text-opposite/70 uppercase border-b border-gray-700">
                                        <tr>
                                            <th class="px-4 py-3">#</th>
                                            <th class="px-4 py-3">Drone</th>
                                            <th class="px-4 py-3">Pilot</th>
                                            <th class="px-4 py-3">Planned Time</th>
                                            <th class="px-4 py-3">Duration</th>
                                            <th class="px-4 py-3">Rate</th>
                                            <th class="px-4 py-3 text-right">Line Total</th>
                                            <th class="px-4 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(trip, index) in trips" :key="index"
                                            class="border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer" :class="{
                                                'bg-indigo-900/20': activeTripIndex === index
                                            }" @click="selectTrip(index)">
                                            <td class="px-4 py-3 text-opposite font-medium">
                                                {{ index + 1 }}
                                            </td>
                                            <td class="px-4 py-3">
                                                <span v-if="trip.asset" class="text-opposite">
                                                    {{ trip.asset.name }}
                                                </span>
                                                <span v-else class="text-yellow-500 text-xs">
                                                    Not selected
                                                </span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <span v-if="trip.pilot" class="text-opposite">
                                                    {{ trip.pilot.fname }} {{ trip.pilot.lname }}
                                                </span>
                                                <span v-else class="text-opposite/50 text-xs">
                                                    Not assigned
                                                </span>
                                            </td>
                                            <td class="px-4 py-3 text-opposite">
                                                {{
                                                    trip.plannedTime
                                                        ? formatDateTimeDisplay(trip.plannedTime)
                                                        : '-'
                                                }}
                                            </td>
                                            <td class="px-4 py-3 text-opposite">
                                                {{
                                                    trip.flightDurationMinutes
                                                        ? `${trip.flightDurationMinutes} min`
                                                        : '-'
                                                }}
                                            </td>
                                            <td class="px-4 py-3 text-opposite">
                                                {{
                                                    trip.hourlyRate
                                                        ? `$${trip.hourlyRate.toFixed(2)}/hr`
                                                        : '-'
                                                }}
                                            </td>
                                            <td class="px-4 py-3 text-opposite text-right font-medium">
                                                {{
                                                    calculateLineTotal(trip) > 0
                                                        ? formatCurrency(calculateLineTotal(trip))
                                                        : '-'
                                                }}
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="flex items-center gap-2 justify-center">
                                                    <button type="button" class="text-accent-blue hover:text-blue-300"
                                                        @click.stop="selectTrip(index)">
                                                        <i class="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button type="button" class="text-red-500 hover:text-red-300"
                                                        @click.stop="removeTrip(index)">
                                                        <i class="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div v-if="activeTrip" class="border border-gray-800 rounded-lg bg-main/30">
                                <div class="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                                    <div>
                                        <h3 class="text-md font-semibold text-opposite">
                                            Editing Flight {{ activeTripIndex + 1 }}
                                        </h3>
                                        <p class="text-xs text-opposite/60">
                                            Select a drone, assign a pilot, and set flight details.
                                        </p>
                                    </div>
                                    <button type="button" class="text-opposite/60 hover:text-opposite"
                                        @click="closeLineEditor">
                                        <i class="fa-solid fa-xmark"></i>
                                    </button>
                                </div>

                                <div class="p-6 space-y-6">
                                    <div class="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label class="block text-sm font-medium text-opposite mb-2">Drone *</label>
                                            <SearcheableApiSelect2 v-model="activeTrip.asset" :values="assets"
                                                placeholder="Select a drone" :display="displayAsset"
                                                :changeQuery="() => { }" :extraAction="(asset: Asset) => onTripAssetSelect(asset)
                                                    " />
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-opposite mb-2">Pilot</label>
                                            <SearcheableApiSelect2 v-model="activeTrip.pilot" :values="pilots"
                                                placeholder="Select pilot (optional)" :display="displayPilot"
                                                :changeQuery="() => { }" :extraAction="(pilot: User) => onTripPilotSelect(pilot)
                                                    " />
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-opposite mb-2">Planned
                                                Date/Time</label>
                                            <input type="datetime-local" v-model="activeTrip.plannedTime"
                                                class="w-full rounded-lg bg-main border border-gray-800 text-opposite text-sm px-3 py-2 focus:outline-none focus:border-accent-blue" />
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-opposite mb-2">Duration
                                                (minutes)</label>
                                            <AppInput v-model.number="activeTrip.flightDurationMinutes" type="number"
                                                min="1" :hide-icon="true" class="text-opposite" placeholder="e.g. 60" />
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-opposite mb-2">Hourly Rate
                                                ($)</label>
                                            <AppInput v-model.number="activeTrip.hourlyRate" type="number" step="0.01"
                                                min="0" :hide-icon="true" class="text-opposite" placeholder="0.00" />
                                        </div>

                                        <div>
                                            <label
                                                class="block text-sm font-medium text-opposite mb-2">Description</label>
                                            <AppInput v-model="activeTrip.description" type="text" :hide-icon="true"
                                                class="text-opposite" placeholder="Flight description (optional)" />
                                        </div>
                                    </div>

                                    <div class="flex justify-end">
                                        <AppButton buttonStyle="secondary" type="button" @click="closeLineEditor">
                                            Done
                                        </AppButton>
                                    </div>
                                </div>
                            </div>
                        </div> -->
                    <!-- </section> -->
                </div>

                <!-- Pricing Section -->
                <!-- <div class="space-y-6 w-full mt-4 px-4">
                    <section class="bg-secondary border border-gray-800 rounded-lg">
                        <div class="px-6 py-4 border-b border-gray-800">
                            <h2 class="text-lg font-semibold text-opposite">Pricing</h2>
                            <p class="text-sm text-opposite/70">
                                Add tax and discount to the job total
                            </p>
                        </div>
                        <div class="p-6">
                            <div class="grid gap-6 md:grid-cols-2">
                                <AppInputForm name="tax" label="Tax ($)" placeholder="0.00" type="number" min="0"
                                    step="0.01" />
                                <AppInputForm name="discount" label="Discount ($)" placeholder="0.00" type="number"
                                    min="0" step="0.01" />
                            </div>
                        </div>
                    </section>
                </div> -->

                <!-- Summary & Actions Sidebar -->
                <div class="space-y-6 w-full right-4 mt-4 px-4">
                    <section class="bg-secondary border border-gray-800 rounded-lg">
                        <div class="px-6 py-4 border-b border-gray-800">
                            <h3 class="text-md font-semibold text-opposite">Job Summary</h3>
                        </div>
                        <div class="p-6 space-y-4 text-sm text-opposite/80">
                            <div class="flex items-center justify-between">
                                <span class="text-opposite/60">Customer</span>
                                <span class="font-medium text-opposite">{{
                                    values.customer?.name || 'Not selected'
                                    }}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-opposite/60">Job Type</span>
                                <span class="font-medium text-opposite">{{
                                    values.jobType?.name || 'Not selected'
                                    }}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-opposite/60">Asset</span>
                                <span class="font-medium text-opposite">{{
                                    values.asset ? displayAsset(values.asset) : 'Not selected'
                                    }}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-opposite/60">Priority</span>
                                <span class="font-medium text-opposite">{{ values.priority }}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-opposite/60">Status</span>
                                <span class="font-medium text-opposite">{{ values.status }}</span>
                            </div>
                            <!-- <div class="flex items-center justify-between">
                                <span class="text-opposite/60">Line Items</span>
                                <span class="font-medium text-opposite">{{ trips.length }}</span>
                            </div> -->

                            <!-- Financial Summary -->
                            <!-- <div class="border-t border-gray-700 pt-4 mt-4 space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-opposite/60">Subtotal</span>
                                    <span class="font-medium text-opposite">{{
                                        formatCurrency(subtotal)
                                    }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-opposite/60">Tax</span>
                                    <span class="font-medium text-opposite">{{
                                        formatCurrency(Number(values.tax) || 0)
                                    }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-opposite/60">Discount</span>
                                    <span class="font-medium text-red-400">{{
                                        Number(values.discount) > 0
                                            ? `-${formatCurrency(Number(values.discount))}`
                                            : formatCurrency(0)
                                    }}</span>
                                </div>
                                <div class="flex items-center justify-between border-t border-gray-700 pt-3">
                                    <span class="text-opposite font-semibold">Total</span>
                                    <span class="font-bold text-lg text-green-400">{{
                                        formatCurrency(
                                            subtotal +
                                            (Number(values.tax) || 0) -
                                            (Number(values.discount) || 0)
                                        )
                                    }}</span>
                                </div> 
                            </div> -->
                        </div>
                    </section>

                    <section>
                        <div class="flex flex-row gap-3 justify-end">
                            <AppButton type="button" buttonStyle="primary" @click="router.push('/fleet/planned-jobs')">
                                Cancel
                            </AppButton>
                            <AppButton buttonStyle="secondary" type="submit" :loading="submitting">
                                {{ isEditing ? 'Update Job' : 'Create Job' }}
                            </AppButton>
                        </div>
                    </section>
                </div>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Form, type FormContext } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getAssets,
    getVehicleJobTypes,
    getVehicleJobById,
    createVehicleJob,
    updateVehicleJob,
    getCustomers,
    getQualifiedPilots,
    createLocation,
} from './endpoints'
import type {
    Asset,
    VehicleJob,
    VehicleJobType,
    User,
    Customer,
    VehicleJobPriority
} from '@/util/interfaces'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import AppInputForm from '@/components/AppInputForm.vue'
import AppInputDateForm from '@/components/AppInputDateForm.vue'
import AppTextareaForm from '@/components/AppTextareaForm.vue'
import SelectForm from '@/components/SelectForm.vue'
import SearcheableApiSelectForm from '@/components/SearcheableApiSelectForm.vue'
import SearcheableApiSelect2 from '@/components/SearcheableApiSelect2.vue'
import Spinner from '@/components/Spinner.vue'
import { formatDateToInput, formatDateToInputWithTime } from '@/util/util'
import SearcheableSelectForm from '../SearcheableSelectForm.vue'
import LocationPicker from '@/components/LocationPicker.vue'
import type { LocationData } from '@/components/LocationPicker.vue'

interface TripPlan {
    assetId: string
    asset: Asset | null
    plannedTime: string
    waypoints: { lat: number; lng: number }[]
    pilotId?: string
    pilot?: User | null
    description?: string
    flightDurationMinutes?: number
    hourlyRate?: number
    lineTotal?: number
}

interface JobFormValues {
    name?: string
    description: string
    notes: string
    jobType: VehicleJobType | null
    customer: Customer | null
    asset: Asset | null
    assignedPilot: User | null
    status: string
    priority?: VehicleJobPriority
    startDate?: string
    endDate?: string
    dueDate?: string
    tax: number
    discount: number
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

// Form state
const formRef = ref<FormContext<JobFormValues> | null>(null)
const formKey = ref(0)
const pageLoading = ref(false)
const submitting = ref(false)
const isEditing = ref(false)
const editingJobId = ref<string | null>(null)

// Initial values for the form
const initialValues = ref<JobFormValues>({
    name: undefined,
    description: '',
    notes: '',
    jobType: null,
    customer: null,
    asset: null,
    assignedPilot: null,
    status: 'Draft',
    priority: 'Medium',
    startDate: undefined,
    endDate: undefined,
    tax: 0,
    discount: 0
})

// Location
const locationError = ref('')
const locationData = ref<LocationData>({
    country: null,
    state: null,
    city: null,
    address: null,
    postalCode: null,
    latitude: null,
    longitude: null,
})

// Options
const statusOptions = ['Draft', 'Planned']
const priorityOptions = ['Low', 'Medium', 'High', 'Critical']

// Reference data
const assets = ref<Asset[]>([])
const jobTypes = ref<VehicleJobType[]>([])
const pilots = ref<User[]>([])
const customers = ref<Customer[]>([])
const loadingPilots = ref(false)
const pendingPilotRestore = ref<User | null>(null)

// Trips State
const trips = ref<TripPlan[]>([])
const activeTripIndex = ref<number>(-1)

const activeTrip = computed(() =>
    activeTripIndex.value >= 0 ? trips.value[activeTripIndex.value] : null
)

// Calculate line item total (hourlyRate * duration in hours)
const calculateLineTotal = (trip: TripPlan): number => {
    if (!trip.hourlyRate || !trip.flightDurationMinutes) return 0
    return (trip.hourlyRate * trip.flightDurationMinutes) / 60
}

// Subtotal: sum of all line items
const subtotal = computed(() => {
    return trips.value.reduce((sum, trip) => sum + calculateLineTotal(trip), 0)
})

// Format currency
const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`
}

// Display functions
const displayAsset = (asset: Asset | null) => {
    if (!asset) return ''
    return `${asset.name} (${asset.assetCode})`
}

const displayJobType = (jobType: VehicleJobType | null) => {
    if (!jobType) return ''
    return jobType.name
}

const displayPilot = (user: User | null) => {
    if (!user) return ''
    return `${user.fname} ${user.lname}`
}

const displayCustomer = (customer: Customer | null) => {
    if (!customer) return ''
    return `${customer.name}`
}

// Date validation rules
const validateStartDate = (value: string) => {
    if (!value) return 'Start date is required'
    const selected = new Date(value)
    if (selected < new Date()) return 'Start date & time cannot be in the past'
    return true
}

const validateEndDate = (values: JobFormValues) => (value: string) => {
    if (!value) return 'End date is required'
    if (values.startDate) {
        const start = new Date(values.startDate)
        const end = new Date(value)
        if (end < start) return 'End date & time cannot be before start date & time'
    }
    return true
}

// Fetch qualified pilots based on job type and schedule
const fetchQualifiedPilots = async (jobTypeId: string, startDate: string, endDate: string) => {
    loadingPilots.value = true
    pilots.value = []
    try {
        const startEpoch = new Date(startDate).getTime()
        const endEpoch = new Date(endDate).getTime()
        if (isNaN(startEpoch) || isNaN(endEpoch)) return

        const data = await getQualifiedPilots(authStore, {
            jobTypeId,
            startDate: startEpoch,
            endDate: endEpoch,
        })
        pilots.value = data as User[]

        if (pendingPilotRestore.value) {
            const match = pilots.value.find(p => p.id === pendingPilotRestore.value?.id)
            if (match && formRef.value) {
                (formRef.value as any).setFieldValue('assignedPilot', match)
            }
            pendingPilotRestore.value = null
        }
    } catch (error: any) {
        toast.showToast(
            'Error loading pilots',
            error?.response?.data?.message || 'Failed to load qualified pilots.',
            'error'
        )
    } finally {
        loadingPilots.value = false
    }
}

// Auto-assign pilot via backend
const autoAssignPilot = async () => {
    if (!formRef.value) return
    const values = formRef.value.values
    if (!values.jobType || !values.startDate || !values.endDate) return

    try {
        const startEpoch = new Date(values.startDate).getTime()
        const endEpoch = new Date(values.endDate).getTime()
        const result = await getQualifiedPilots(authStore, {
            jobTypeId: values.jobType.id,
            startDate: startEpoch,
            endDate: endEpoch,
            autoAssign: true,
        })
        if (result.length > 0) {
            (formRef.value as any).setFieldValue('assignedPilot', result[0])
        } else {
            toast.showToast('No Pilots', 'No qualified pilots available for auto-assignment.', 'warning')
        }
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to auto-assign pilot.',
            'error'
        )
    }
}

// Watch job type + dates — reset pilot and re-fetch qualified pilots
watch(
    () => [
        formRef.value?.values?.jobType,
        formRef.value?.values?.startDate,
        formRef.value?.values?.endDate,
    ],
    ([newJobType, newStart, newEnd], [oldJobType, oldStart, oldEnd]) => {
        if (!formRef.value) return
        const changed =
            newJobType !== oldJobType || newStart !== oldStart || newEnd !== oldEnd
        if (!changed) return

        if (!pendingPilotRestore.value) {
            (formRef.value as any).setFieldValue('assignedPilot', null)
            pilots.value = []
        }

        if (newJobType && newStart && newEnd) {
            const jt = newJobType as VehicleJobType
            fetchQualifiedPilots(jt.id, newStart as string, newEnd as string)
        }
    }
)

const formatDateTimeDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Trip management
const addNewTrip = () => {
    const newTrip: TripPlan = {
        assetId: '',
        asset: null,
        plannedTime: '',
        waypoints: []
    }
    trips.value.push(newTrip)
    activeTripIndex.value = trips.value.length - 1
}

const selectTrip = (index: number) => {
    activeTripIndex.value = index
}

const removeTrip = (index: number) => {
    trips.value.splice(index, 1)
    if (activeTripIndex.value >= trips.value.length) {
        activeTripIndex.value = trips.value.length - 1
    }
}

const closeLineEditor = () => {
    activeTripIndex.value = -1
}

const onTripAssetSelect = (asset: Asset | null) => {
    if (activeTrip.value && asset) {
        activeTrip.value.asset = asset
        activeTrip.value.assetId = asset.id
    }
}

const onTripPilotSelect = (pilot: User | null) => {
    if (activeTrip.value) {
        activeTrip.value.pilot = pilot
        activeTrip.value.pilotId = pilot?.id || ''
    }
}

// Ensure options exist in select lists
const ensureJobTypeOption = (jobType: VehicleJobType | null) => {
    if (!jobType) return
    if (!jobTypes.value.some((jt) => jt.id === jobType.id)) {
        jobTypes.value.push(jobType)
    }
}

const ensureCustomerOption = (customer: Customer | null) => {
    if (!customer) return
    if (!customers.value.some((c) => c.id === customer.id)) {
        customers.value.push(customer)
    }
}

const ensureAssetOption = (asset: Asset | null) => {
    if (!asset) return
    if (!assets.value.some((a) => a.id === asset.id)) {
        assets.value.push(asset)
    }
}

const ensurePilotOption = (pilot: User | null) => {
    if (!pilot) return
    if (!pilots.value.some((p) => p.id === pilot.id)) {
        pilots.value.push(pilot)
    }
}

// Data fetching
const fetchAssets = async () => {
    try {
        const res = await getAssets(authStore, { perPage: 100 })
        assets.value = res.data
    } catch (e) {
        console.error(e)
    }
}

const refreshingJobTypes = ref(false)
const refreshJobTypes = async () => {
    refreshingJobTypes.value = true
    await fetchJobTypes()
    refreshingJobTypes.value = false
}
const refreshingCustomers = ref(false)
const refreshCustomers = async () => {
    refreshingCustomers.value = true
    await fetchCustomers()
    refreshingCustomers.value = false
}

const fetchJobTypes = async () => {
    try {
        jobTypes.value = await getVehicleJobTypes(authStore)
    } catch (e) {
        console.error(e)
    }
}

const fetchCustomers = async () => {
    try {
        const res = await getCustomers(authStore)
        customers.value = res.data
    } catch (e) {
        console.error(e)
    }
}

const formatDateTimeLocal = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toISOString().slice(0, 16)
}

const mapJobToFormValues = (job: VehicleJob): JobFormValues => {
    ensureJobTypeOption(job.jobType || null)
    ensureCustomerOption(job.customer || null)
    ensureAssetOption(job.asset || null)
    ensurePilotOption(job.assignedPilot || null)

    if (job.location) {
        locationData.value = {
            country: job.location.country || null,
            state: job.location.state || null,
            city: job.location.city || null,
            address: job.location.address || null,
            postalCode: job.location.postalCode || null,
            latitude: job.location.latitude || null,
            longitude: job.location.longitude || null,
        }
    }

    return {
        name: job.name,
        description: job.description || '',
        notes: job.notes || '',
        jobType: job.jobType || null,
        customer: job.customer || null,
        asset: job.asset || null,
        assignedPilot: job.assignedPilot || null,
        status: job.status,
        priority: job.priority || 'Medium',
        startDate: job.startDate ? formatDateToInputWithTime(job.startDate) : undefined,
        endDate: job.endDate ? formatDateToInputWithTime(job.endDate) : undefined,
        dueDate: job.dueDate ? formatDateToInput(job.dueDate) : undefined,
        tax: job.tax || 0,
        discount: job.discount || 0
    }
}

const loadExistingJob = async (jobId: string) => {
    try {
        const job = await getVehicleJobById(jobId, authStore)

        // Map job to form values and set initial values
        const formValues = mapJobToFormValues(job)
        initialValues.value = formValues

        if (job.assignedPilot) {
            pendingPilotRestore.value = job.assignedPilot as User
        }

        formKey.value += 1

        // Load existing line items as trips
        if (job.lineItems && job.lineItems.length > 0) {
            trips.value = job.lineItems.map((item) => ({
                assetId: item.assetId || '',
                asset: item.asset || null,
                plannedTime: item.plannedDate ? formatDateTimeLocal(item.plannedDate) : '',
                waypoints: item.waypoints || [],
                pilotId: item.pilotId || '',
                pilot: item.pilot || null,
                description: item.description || '',
                flightDurationMinutes: item.flightDurationMinutes || undefined,
                hourlyRate: item.hourlyRate || 0,
                lineTotal: item.lineTotal || undefined
            }))
            activeTripIndex.value = 0
        } else if (job.trips && job.trips.length > 0) {
            // Legacy support for trips
            trips.value = job.trips.map((trip) => ({
                assetId: trip.assetId || '',
                asset: trip.asset || null,
                plannedTime: trip.plannedDate ? formatDateTimeLocal(trip.plannedDate) : '',
                waypoints: []
            }))
            activeTripIndex.value = 0
        }

        isEditing.value = true
        editingJobId.value = jobId
    } catch (error: any) {
        toast.showToast(
            'Error loading job',
            error?.response?.data?.message || 'Failed to load job. Please try again.',
            'error'
        )
        router.push('/fleet/planned-jobs')
    }
}

const dateInputToEpoch = (value: string | null | undefined): number | undefined => {
    if (!value) return undefined
    const timestamp = new Date(value).getTime()
    return isNaN(timestamp) ? undefined : timestamp
}

// Save job
const saveJob = async (values: any) => {
    if (submitting.value) return

    const loc = locationData.value
    if (!loc.country || !loc.city || !loc.address?.trim()) {
        locationError.value = 'Country, city, and address are required.'
        toast.showToast('Validation Error', 'Country, city, and address are required for the job location.', 'error')
        return
    }
    locationError.value = ''

    try {
        submitting.value = true

        // Build line items from trips
        const lineItems = trips.value
            .filter((trip) => trip.assetId)
            .map((trip) => {
                const lineTotal = calculateLineTotal(trip)
                return {
                    assetId: trip.assetId,
                    pilotId: trip.pilotId || undefined,
                    description: trip.description || undefined,
                    plannedDate: trip.plannedTime
                        ? new Date(trip.plannedTime).getTime()
                        : undefined,
                    flightDurationMinutes: trip.flightDurationMinutes || undefined,
                    hourlyRate: trip.hourlyRate || undefined,
                    lineTotal: lineTotal > 0 ? lineTotal : undefined,
                    waypoints: trip.waypoints.length > 0 ? trip.waypoints : undefined
                }
            })

        const tax = Number(values.tax) || 0
        const discount = Number(values.discount) || 0
        const totalAmount = subtotal.value + tax - discount

        const loc = locationData.value


        const jobData = {
            name: values.name?.trim() || '',
            description: values.description?.trim() || undefined,
            jobTypeId: values.jobType?.id || undefined,
            customerId: values.customer?.id || undefined,
            assetId: values.asset?.id || undefined,
            location: loc,
            assignedPilotId: values.assignedPilot?.id || undefined,
            status: values.status as any,
            priority: values.priority,
            startDate: dateInputToEpoch(values.startDate),
            endDate: dateInputToEpoch(values.endDate),
            dueDate: dateInputToEpoch(values.dueDate),
            notes: values.notes?.trim() || undefined,
            tax: tax || undefined,
            discount: discount || undefined,
            totalAmount: totalAmount || undefined,
            lineItems: lineItems.length > 0 ? lineItems : undefined
        }

        let savedJob: VehicleJob

        if (isEditing.value && editingJobId.value) {
            savedJob = await updateVehicleJob(editingJobId.value, jobData, authStore)
            toast.showToast('Success', 'Job updated successfully', 'success')
        } else {
            savedJob = await createVehicleJob(jobData, authStore)
            toast.showToast('Success', 'Job created successfully', 'success')
        }

        router.push('/fleet/planned-jobs')
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to save job. Please try again.',
            'error'
        )
        console.error(error)
    } finally {
        submitting.value = false
    }
}

// Lifecycle
onMounted(async () => {
    const jobId = route.query.jobId as string
    if (jobId) {
        pageLoading.value = true
    }

    await Promise.all([fetchAssets(), fetchJobTypes(), fetchCustomers()])

    // Check if editing existing job
    if (jobId) {
        await loadExistingJob(jobId)
    }

    pageLoading.value = false
})
</script>
