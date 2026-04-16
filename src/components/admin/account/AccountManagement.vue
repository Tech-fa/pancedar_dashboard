<template>
    <div class="min-h-screen bg-main">
        <BreadCrums
            :crumbs="[
                {
                    name: 'Account Management',
                    path: '/admin/account',
                    icon: 'fa-solid fa-id-card text-neutral-700 text-2xl'
                }
            ]"
        >
            <AppButton buttonStyle="secondary" @click="fetchClient" :disabled="loading">
                <Spinner v-if="loading" width="1" />
                <span v-else>Refresh</span>
            </AppButton>
        </BreadCrums>

        <div class="px-6 pb-6">
            <div class="bg-secondary border border-gray-800 rounded-lg p-6 mt-4">
                <Table
                    :cols="['Company Name', 'Domain', 'Logo']"
                    :rows="tableRows"
                    :entities="tableEntities"
                    :page="page"
                    :total="total"
                    :per-page="perPage"
                    :total-pages="totalPages"
                    :on-next-page="onNextPage"
                    :on-previous-page="onPreviousPage"
                    :set-page="setPage"
                    :on-success="fetchClient"
                    :loading="loading"
                    :hide-view="hideActions"
                    :hide-edit="hideActions"
                    :hide-delete="hideActions"
                    :hide-search="true"
                    entity-name="Account"
                    :subject="'client'"
                />
            </div>

            <div class="bg-secondary border border-gray-800 rounded-lg p-6 mt-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-opposite">Branding</h2>
                    <Can :subject="'client'" :actions="['update']">
                        <AppButton buttonStyle="primary" @click="triggerFileDialog" :disabled="uploading">
                            <Spinner v-if="uploading" width="1" />
                            <span v-else>Update Logo</span>
                        </AppButton>
                    </Can>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div
                        class="h-32 w-32 rounded-lg bg-main border border-dashed border-opposite flex items-center justify-center overflow-hidden"
                    >
                        <img
                            v-if="client?.logoUrl"
                            :src="client.logoUrl"
                            alt="Client logo"
                            class="h-full w-full object-contain"
                        />
                        <div v-else class="text-opposite/60 text-sm text-center px-2">
                            No logo configured yet
                        </div>
                    </div>
                    <div class="text-opposite/70 text-sm">
                        <p>Upload a square PNG or SVG logo with transparent background.</p>
                        <p class="mt-1">Maximum size: 5MB.</p>
                    </div>
                </div>
            </div>
        </div>

        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileSelected"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BreadCrums from '@/components/breadCrums.vue'
import Table from '@/components/Table.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import Can from '@/components/Can.vue'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/client'
import { apiGet, apiPostFormData } from '@/util/api'
import { useToast } from '@/stores/notification'
import type { ClientAccount } from '@/util/interfaces'

const authStore = useAuthStore()
const clientStore = useClientStore()
const toast = useToast()
const { client } = storeToRefs(clientStore)

const loading = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const page = ref(1)
const perPage = 10

const tableRows = computed(() => {
    if (!client.value) {
        return []
    }

    return [
        {
            id: client.value.id,
            'Company Name': client.value.companyName,
            Domain: client.value.domain,
            Logo: client.value.logoKey ? 'Configured' : 'Not Set'
        }
    ]
})

const tableEntities = computed(() => {
    return client.value ? [client.value] : []
})

const total = computed(() => tableRows.value.length)
const totalPages = computed(() => Math.max(1, total.value || 1))

const onNextPage = () => {}
const onPreviousPage = () => {}
const setPage = () => {}
const hideActions = () => true

const fetchClient = async () => {
    loading.value = true
    try {
        const data = await apiGet<ClientAccount>('/clients/me', authStore)
        clientStore.setClient(data)
    } catch (error) {
        console.error('Error fetching client account:', error)
        toast.showToast('Error', 'Failed to load account details', 'error')
    } finally {
        loading.value = false
    }
}

const triggerFileDialog = () => {
    fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (!target.files || !target.files.length) {
        return
    }

    const file = target.files[0]
    const formData = new FormData()
    formData.append('logo', file)

    uploading.value = true
    try {
        const data = await apiPostFormData<ClientAccount>('/clients/logo', formData, authStore)
        clientStore.setClient(data)
        toast.showToast('Success', 'Client logo updated successfully', 'success')
    } catch (error) {
        console.error('Error uploading client logo:', error)
        toast.showToast('Error', 'Failed to update logo', 'error')
    } finally {
        uploading.value = false
        if (fileInput.value) {
            fileInput.value.value = ''
        }
    }
}

onMounted(() => {
    fetchClient()
})
</script>
