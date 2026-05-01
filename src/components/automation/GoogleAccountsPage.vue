<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="[
            {
                name: 'Google Accounts',
                path: '/resources/google-accounts',
                icon: 'fa-brands fa-google text-neutral-700 text-2xl'
            }
        ]" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto space-y-4">
                <div>
                    <h3 class="text-lg font-medium text-opposite">Google Accounts</h3>
                    <p class="text-sm text-opposite/60">
                        Connected Google account records fetched from the backend.
                    </p>
                </div>

                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="googleAccounts.length === 0"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                    No Google accounts found.
                </div>

                <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div v-for="(account, index) in googleAccounts" :key="account._id || account.connectorid || index"
                        class="bg-main border border-gray-800 rounded-lg p-4 space-y-3">
                        <div class="flex items-center justify-between gap-3">
                            <div class="font-medium text-opposite truncate">
                                {{ account.connectorid || account.connectorId || 'Google Account' }}
                            </div>
                            <span class="text-xs uppercase tracking-wide px-2 py-1 rounded border border-gray-700 text-opposite/70">
                                Account
                            </span>
                        </div>
                        <pre
                            class="text-sm text-opposite/90 bg-secondary border border-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap">{{ formatJson(account) }}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { apiGet } from '@/util/api'
import { formatJson } from '@/util/util'

interface GoogleAccount {
    _id?: string
    connectorid?: string
    connectorId?: string
    [key: string]: unknown
}

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)
const googleAccounts = ref<GoogleAccount[]>([])

const fetchGoogleAccounts = async () => {
    loading.value = true
    try {
        googleAccounts.value = await apiGet<GoogleAccount[]>('/google-accounts', authStore)
    } catch {
        googleAccounts.value = []
        toast.showToast('Error', 'Failed to load Google accounts', 'error')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchGoogleAccounts()
})
</script>
