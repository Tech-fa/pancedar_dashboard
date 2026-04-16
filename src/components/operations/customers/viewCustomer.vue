<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs">
            <Can :subject="'customer'" :actions="['update']">
                <AppButton buttonStyle="primary" @click="router.push(`/customers/list/${customerId}/edit`)">
                    <i class="fa-solid fa-pen mr-1"></i> Edit
                </AppButton>
            </Can>
        </BreadCrums>

        <div v-if="loading" class="flex items-center justify-center py-24">
            <Spinner width="3" height="3" />
        </div>
        <div v-else class="px-6 pb-6 pt-4">
            <Tabs :tabs="['Details', 'Jobs']" v-model="activeTab" />

            <!-- Details Tab -->
            <div v-if="activeTab === 0" class="max-w-3xl mx-auto space-y-6">
                <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-opposite">{{ customer?.name }}</h3>
                        <span class="px-3 py-1 rounded-full text-xs font-medium"
                            :class="customer?.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'">
                            {{ customer?.isActive ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                </div>

                <!-- Locations -->
                <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                    <h4 class="text-md font-semibold text-opposite mb-4">Locations</h4>
                    <div v-if="!customer?.locations?.length" class="text-sm text-opposite/50">No locations added.</div>
                    <div v-for="(location, index) in customer?.locations" :key="index"
                        class="bg-main border border-gray-700 rounded-lg p-4 mb-3 last:mb-0">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fa-solid fa-location-dot text-opposite/60"></i>
                            <span class="text-sm font-medium text-opposite">{{ location.name }}</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div v-if="location.address">
                                <span class="text-opposite/60">Address: </span>
                                <span class="text-opposite">{{ location.address }}</span>
                            </div>
                            <div v-if="location.city">
                                <span class="text-opposite/60">City: </span>
                                <span class="text-opposite">{{ location.city }}</span>
                            </div>
                            <div v-if="location.state">
                                <span class="text-opposite/60">State: </span>
                                <span class="text-opposite">{{ location.state }}</span>
                            </div>
                            <div v-if="location.country">
                                <span class="text-opposite/60">Country: </span>
                                <span class="text-opposite">{{ location.country }}</span>
                            </div>
                            <div v-if="location.postalCode">
                                <span class="text-opposite/60">Postal Code: </span>
                                <span class="text-opposite">{{ location.postalCode }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contacts -->
                <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                    <h4 class="text-md font-semibold text-opposite mb-4">Contact Persons</h4>
                    <div v-if="!customer?.contacts?.length" class="text-sm text-opposite/50">No contacts added.</div>
                    <div v-for="(contact, index) in customer?.contacts" :key="index"
                        class="bg-main border border-gray-700 rounded-lg p-4 mb-3 last:mb-0">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fa-solid fa-user text-opposite/60"></i>
                            <span class="text-sm font-medium text-opposite">{{ contact.firstName }} {{ contact.lastName
                                }}</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div v-if="contact.email">
                                <span class="text-opposite/60">Email: </span>
                                <span class="text-opposite">{{ contact.email }}</span>
                            </div>
                            <div v-if="contact.phone">
                                <span class="text-opposite/60">Phone: </span>
                                <span class="text-opposite">{{ contact.phone }}</span>
                            </div>
                            <div v-if="contact.position">
                                <span class="text-opposite/60">Position: </span>
                                <span class="text-opposite">{{ contact.position }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <!-- Jobs Tab -->
            <div v-if="activeTab === 1" class="max-w-3xl mx-auto">
                <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                    <h4 class="text-md font-semibold text-opposite mb-4">Jobs</h4>
                    <p class="text-sm text-opposite/50" v-if="!jobs.length">No jobs found for this customer.</p>
                    <div v-else>
                        <div v-for="(job, index) in jobs" :key="index"
                            class="bg-main border border-gray-700 rounded-lg p-4 mb-3 last:mb-0 cursor-pointer hover:bg-gray-800 transition-all duration-300"
                            @click="router.push(`/fleet/jobs/${job.id}`)">
                            <div class="flex items-center gap-2 mb-2">
                                <i class="fa-solid fa-wrench text-opposite/60"></i>
                                <span class="text-sm font-medium text-opposite">{{ job.name }}</span>
                            </div>
                            <div class="text-xs text-opposite/60">
                                From: {{ formatDate(job.startDate || 0) }} - To: {{ formatDate(job.endDate || 0) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import AppButton from '@/components/AppButton.vue'
import Tabs from '@/components/Tabs.vue'
import Can from '@/components/Can.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { getCustomerById, addCustomerNote, deleteCustomerNote, getVehicleJobs } from '@/components/fleet/endpoints'
import type { Customer, VehicleJob } from '@/util/interfaces'
import { formatDate, formatDateToDay, INPUT_CLASS } from '@/util/util'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const customerId = computed(() => route.params.id as string)
const activeTab = ref(0)
const loading = ref(false)
const customer = ref<Customer | null>(null)
const jobs = ref<VehicleJob[]>([])

const crumbs = computed(() => [
    { name: 'Customers', path: '/customers/list', icon: 'fa-solid fa-building text-neutral-700 text-2xl' },
    { name: customer.value?.name || 'View Customer', path: '' }
])

const loadCustomer = async () => {
    if (!customerId.value) return
    loading.value = true
    try {
        customer.value = await getCustomerById(customerId.value, authStore)
        jobs.value = await getVehicleJobs(authStore, customerId.value)
    } catch (error: any) {
        toast.showToast('Error', 'Failed to load customer', 'error')
        router.push('/customers/list')
    } finally {
        loading.value = false
    }
}



onMounted(() => {
    loadCustomer()
})
</script>
