<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs">

        </BreadCrums>

        <div v-if="loading" class="flex items-center justify-center py-24">
            <Spinner width="3" height="3" />
        </div>

        <div v-else class="px-6 pb-6 pt-4">
            <div class="max-w-3xl mx-auto">
                <div class="bg-secondary rounded-lg border border-gray-800">
                    <Form @submit="handleSubmit" :initialValues="initialValues" class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AppInputForm name="name" label="Name" placeholder="Enter customer name"
                                :rules="requiredRule('Name is required')" required />

                            <div class="flex items-center gap-3 pt-6">
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
                        </div>


                        <!-- Contacts Section -->
                        <div class="border-t border-gray-800 pt-4">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <h4 class="text-md font-semibold text-opposite">Contact Persons</h4>
                                    <p class="text-sm text-opposite/60">At least one contact is required</p>
                                </div>
                                <AppButton buttonStyle="secondary" type="button" @click="addContact">
                                    <i class="fa-solid fa-plus mr-1"></i> Add Contact
                                </AppButton>
                            </div>

                            <div v-if="contacts.length === 0"
                                class="text-center py-4 text-opposite/50 border border-dashed border-gray-700 rounded-lg">
                                No contacts added. Click "Add Contact" to add one.
                            </div>

                            <div v-for="(contact, index) in contacts" :key="index"
                                class="bg-main border border-gray-700 rounded-lg p-4 mb-3">
                                <div class="flex justify-between items-center mb-3">
                                    <span class="text-sm font-medium text-opposite">Contact {{ index + 1 }}</span>
                                    <button v-if="contacts.length > 1" type="button" @click="removeContact(index)"
                                        class="text-red-400 hover:text-red-300 text-sm">
                                        <i class="fa-solid fa-trash mr-1"></i> Remove
                                    </button>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium text-opposite/80 mb-1">First Name
                                            *</label>
                                        <input v-model="contact.firstName" type="text" placeholder="First name"
                                            class="w-full bg-secondary border border-gray-700 text-opposite placeholder-opposite/40 rounded-md px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-opposite/80 mb-1">Last Name
                                            *</label>
                                        <input v-model="contact.lastName" type="text" placeholder="Last name"
                                            class="w-full bg-secondary border border-gray-700 text-opposite placeholder-opposite/40 rounded-md px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-opposite/80 mb-1">Email</label>
                                        <input v-model="contact.email" type="email" placeholder="Email address"
                                            class="w-full bg-secondary border border-gray-700 text-opposite placeholder-opposite/40 rounded-md px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-opposite/80 mb-1">Phone</label>
                                        <input v-model="contact.phone" type="text" placeholder="Phone number"
                                            class="w-full bg-secondary border border-gray-700 text-opposite placeholder-opposite/40 rounded-md px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-opposite/80 mb-1">Position</label>
                                        <input v-model="contact.position" type="text" placeholder="Job title / position"
                                            class="w-full bg-secondary border border-gray-700 text-opposite placeholder-opposite/40 rounded-md px-3 py-2 text-sm" />
                                    </div>
                                    <!-- <div class="flex items-center gap-3 pt-5">
                                        <label class="text-sm font-medium text-opposite/80">Can Login</label>
                                        <label class="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                v-model="contact.canLogin"
                                                @change="onCanLoginChange(contact)"
                                                class="sr-only peer"
                                            />
                                            <div
                                                class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                                            ></div>
                                            <span class="ml-2 text-sm text-opposite/80">
                                                {{ contact.canLogin ? 'Yes' : 'No' }}
                                            </span>
                                        </label>
                                    </div> -->
                                    <!-- <div v-if="contact.canLogin " class="col-span-2">
                                        <label class="block text-sm font-medium text-opposite/80">Generated Password</label>
                                        <span class="text-xs text-opposite/40 ml-1">copy password once its generated</span>
                                        <div class="flex items-center gap-2">
                                            <input
                                                :value="contact.password || 'Hidden password'"
                                                type="text"
                                                readonly
                                                class="flex-1 bg-secondary border border-gray-700 text-opposite rounded-md px-3 py-2 text-sm font-mono"
                                            />
                                            <button
                                                type="button"
                                                @click="copyPassword(contact.password)"
                                                class="text-opposite/60 hover:text-opposite p-2"
                                                title="Copy password"
                                            >
                                                <i class="fa-solid fa-copy"></i>
                                            </button>
                                            <button
                                                type="button"
                                                @click="contact.password = generatePassword()"
                                                class="text-opposite/60 hover:text-opposite p-2"
                                                title="Regenerate password"
                                            >
                                                <i class="fa-solid fa-rotate"></i>
                                            </button>
                                        </div>
                                    </div> -->
                                </div>
                            </div>
                        </div>

                        <!-- Locations Section -->
                        <div class="border-t border-gray-800 pt-4">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <h4 class="text-md font-semibold text-opposite">Locations</h4>
                                    <p class="text-sm text-opposite/60">Add one or more locations for this customer</p>
                                </div>
                                <AppButton buttonStyle="secondary" type="button" @click="addLocation">
                                    <i class="fa-solid fa-plus mr-1"></i> Add Location
                                </AppButton>
                            </div>

                            <div v-if="locations.length === 0"
                                class="text-center py-4 text-opposite/50 border border-dashed border-gray-700 rounded-lg">
                                No locations added. Click "Add Location" to add one.
                            </div>

                            <div v-for="(location, index) in locations" :key="index"
                                class="bg-main border border-gray-700 rounded-lg p-4 mb-3">
                                <div class="flex justify-between items-center mb-3">
                                    <span class="text-sm font-medium text-opposite">Location {{ index + 1 }}</span>
                                    <button type="button" @click="removeLocation(index)"
                                        class="text-red-400 hover:text-red-300 text-sm">
                                        <i class="fa-solid fa-trash mr-1"></i> Remove
                                    </button>
                                </div>

                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-sm font-medium text-opposite/80 mb-1">Location Name
                                            *</label>
                                        <input v-model="location.name" type="text"
                                            placeholder="e.g. Main Office, Warehouse"
                                            class="w-full bg-secondary border border-gray-700 text-opposite placeholder-opposite/40 rounded-md px-3 py-2 text-sm" />
                                    </div>
                                    <LocationPicker v-model="location.location"
                                        gridClass="md:grid-cols-2 lg:grid-cols-3" />
                                </div>
                            </div>
                        </div>
                        <!-- Notes Section -->
                        <div class="border-t border-gray-800 pt-4">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <h4 class="text-md font-semibold text-opposite">Notes</h4>
                                    <p class="text-sm text-opposite/60">Add notes about this customer</p>
                                </div>
                                <AppButton buttonStyle="secondary" type="button" @click="addNote">
                                    <i class="fa-solid fa-plus mr-1"></i> Add Note
                                </AppButton>
                            </div>

                            <!-- Existing notes (read-only) -->
                            <div v-for="(note, index) in existingNotes" :key="'existing-' + index"
                                class="bg-main border border-gray-700 rounded-lg p-4 mb-3">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-xs text-opposite/50">
                                        {{ note.createdBy?.fname }} {{ note.createdBy?.lname }} &middot;
                                        {{ new Date(Number(note.createdAt)).toLocaleDateString() }}
                                    </span>
                                </div>
                                <p class="text-sm text-opposite">{{ note.note }}</p>
                            </div>

                            <!-- New notes (editable) -->
                            <div v-for="(note, index) in newNotes" :key="'new-' + index"
                                class="bg-main border border-gray-700 rounded-lg p-4 mb-3">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm font-medium text-opposite">New Note</span>
                                    <button type="button" @click="removeNote(index)"
                                        class="text-red-400 hover:text-red-300 text-sm">
                                        <i class="fa-solid fa-trash mr-1"></i> Remove
                                    </button>
                                </div>
                                <textarea v-model="note.note" placeholder="Enter note..."
                                    class="w-full bg-secondary border border-gray-700 text-opposite placeholder-opposite/40 rounded-md px-3 py-2 text-sm min-h-[80px]"></textarea>
                            </div>

                            <div v-if="existingNotes.length === 0 && newNotes.length === 0"
                                class="text-center py-4 text-opposite/50 border border-dashed border-gray-700 rounded-lg">
                                No notes added. Click "Add Note" to add one.
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <AppButton buttonStyle="secondary" @click="handleCancel">
                                Cancel
                            </AppButton>
                            <AppButton buttonStyle="primary" type="submit" :loading="isSubmitting">
                                Save Changes
                            </AppButton>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Form } from 'vee-validate'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import AppButton from '@/components/AppButton.vue'
import AppInputForm from '@/components/AppInputForm.vue'
import LocationPicker from '@/components/LocationPicker.vue'
import type { LocationData } from '@/components/LocationPicker.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { createCustomer, updateCustomer, getCustomerById } from '@/components/fleet/endpoints'
import type { Customer } from '@/util/interfaces'

interface ContactForm {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone: string
    position: string
    canLogin: boolean
    password: string
}

interface LocationForm {
    id?: string
    name: string
    location: LocationData
}

interface NoteForm {
    id?: string
    note: string
}

interface ExistingNote {
    id: string
    note: string
    createdAt: number
    createdBy?: { fname?: string; lname?: string }
}

const generatePassword = (): string => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%&*'
    const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)]
    const required = [pick(upper), pick(lower), pick(numbers), pick(special)]
    const all = upper + lower + numbers + special
    for (let i = required.length; i < 8; i++) {
        required.push(pick(all))
    }
    return required.sort(() => Math.random() - 0.5).join('')
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const customerId = computed(() => route.params.id as string | undefined)
const isEditMode = computed(() => !!customerId.value)

const crumbs = computed(() => [
    { name: 'Customers', path: '/customers/list', icon: 'fa-solid fa-building text-neutral-700 text-2xl' },
    { name: isEditMode.value ? 'Edit Customer' : 'Add Customer', path: '' }
])

const loading = ref(false)
const isSubmitting = ref(false)
const isActive = ref(true)
const customer = ref<Customer | null>(null)

const contacts = ref<ContactForm[]>([
    { firstName: '', lastName: '', email: '', phone: '', position: '', canLogin: false, password: '' }
])

const emptyLocation = (): LocationData => ({
    country: null, state: null, city: null, address: null, postalCode: null, latitude: null, longitude: null,
})

const locations = ref<LocationForm[]>([
    { name: '', location: emptyLocation() }
])

const existingNotes = ref<ExistingNote[]>([])
const newNotes = ref<NoteForm[]>([])

const initialValues = ref({
    name: ''
})

const requiredRule = (message: string) => (value: string) => (value ? true : message)

const onCanLoginChange = (contact: ContactForm) => {
    if (contact.canLogin) {
        contact.password = generatePassword()
    } else {
        contact.password = ''
    }
}

const copyPassword = async (password: string) => {
    await navigator.clipboard.writeText(password)
    toast.showToast('Copied', 'Password copied to clipboard', 'success')
}

const addContact = () => {
    contacts.value.push({ firstName: '', lastName: '', email: '', phone: '', position: '', canLogin: false, password: '' })
}

const removeContact = (index: number) => {
    contacts.value.splice(index, 1)
}

const addLocation = () => {
    locations.value.push({ name: '', location: emptyLocation() })
}

const removeLocation = (index: number) => {
    locations.value.splice(index, 1)
}

const addNote = () => {
    newNotes.value.push({ note: '' })
}

const removeNote = (index: number) => {
    newNotes.value.splice(index, 1)
}

const loadCustomer = async () => {
    if (!customerId.value) return
    loading.value = true
    try {
        const data = await getCustomerById(customerId.value, authStore)
        customer.value = data
        isActive.value = data.isActive
        initialValues.value = {
            name: data.name ?? ''
        }
        existingNotes.value = (data.notes || []).map((n: any) => ({
            id: n.id,
            note: n.note,
            createdAt: n.createdAt,
            createdBy: n.createdBy,
        }))
        contacts.value = data.contacts?.length
            ? data.contacts.map((c) => ({
                id: c.id,
                firstName: c.firstName ?? '',
                lastName: c.lastName ?? '',
                email: c.email ?? '',
                phone: c.phone ?? '',
                position: c.position ?? '',
                canLogin: c.canLogin ?? false,
                password: 'Hidden Password',
            }))
            : [{ firstName: '', lastName: '', email: '', phone: '', position: '', canLogin: false, password: '' }]
        locations.value = data.locations?.length
            ? data.locations.map((l) => ({
                id: l.id,
                name: l.name ?? '',
                location: {
                    country: l.location.country ?? null,
                    state: l.location.state ?? null,
                    city: l.location.city ?? null,
                    address: l.location.address ?? null,
                    postalCode: l.location.postalCode ?? null,
                    latitude: l.location.latitude ?? null,
                    longitude: l.location.longitude ?? null,
                } as LocationData,
            }))
            : [{ name: '', location: emptyLocation() }]
    } catch (error: any) {
        toast.showToast('Error', 'Failed to load customer', 'error')
        router.push('/customers/list')
    } finally {
        loading.value = false
    }
}
const validateLocations = (locations: LocationForm[]): boolean => {
    return locations.every((l) => l.name.trim() && l.location.city && l.location.state && l.location.country)
}
const handleSubmit = async (values: any) => {
    if (isSubmitting.value) return

    if (contacts.value.length === 0) {
        toast.showToast('Validation Error', 'At least one contact person is required.', 'error')
        return
    }

    const invalidContact = contacts.value.find((c) => !c.firstName.trim() || !c.lastName.trim())
    if (invalidContact) {
        toast.showToast('Validation Error', 'All contacts must have a first name and last name.', 'error')
        return
    }

    if (!validateLocations(locations.value)) {
        toast.showToast('Validation Error', 'Please select a valid location.', 'error')
        return
    }
    isSubmitting.value = true
    try {
        const data = {
            name: values.name,
            isActive: isActive.value,
            contacts: contacts.value.map((c) => ({
                id: c.id || undefined,
                firstName: c.firstName,
                lastName: c.lastName,
                email: c.email || undefined,
                phone: c.phone || undefined,
                position: c.position || undefined,
                canLogin: c.canLogin,
                password: c.canLogin && c.password ? c.password : undefined,
            })),
            locations: locations.value
                .filter((l) => l.name.trim())
                .map((l) => ({
                    id: l.id || undefined,
                    name: l.name,
                    address: l.location.address || undefined,
                    city: l.location.city || undefined,
                    state: l.location.state || undefined,
                    country: l.location.country || undefined,
                    postalCode: l.location.postalCode || undefined,
                    latitude: l.location.latitude || undefined,
                    longitude: l.location.longitude || undefined,
                })),
            notes: newNotes.value
                .filter((n) => n.note.trim())
                .map((n) => ({ id: n.id || undefined, note: n.note })),
        }

        if (isEditMode.value && customerId.value) {
            await updateCustomer(customerId.value, data, authStore)
            toast.showToast('Customer updated', 'Customer updated successfully', 'success')
        } else {
            await createCustomer(data, authStore)
            toast.showToast('Customer created', 'Customer created successfully', 'success')
        }
        router.push('/customers/list')
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Unable to save customer. Please try again.',
            'error'
        )
    } finally {
        isSubmitting.value = false
    }
}

const handleCancel = () => {
    if (!isSubmitting.value) {
        router.push('/customers/list')
    }
}

onMounted(() => {
    loadCustomer()
})
</script>
