<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6">
            <div class="max-w-6xl mx-auto">
                <!-- Portal URL / Slug Configuration -->
                <div class="bg-secondary border border-gray-800 rounded-lg p-6 mb-6">
                    <h2 class="text-lg font-semibold text-opposite mb-4">Portal URL</h2>
                    <div class="flex items-end gap-3">
                        <div class="flex-1">
                            <div class="flex items-center">
                                <span class="bg-main border border-r-0 border-gray-700 text-opposite/60 rounded-l-md px-3 py-2 text-sm whitespace-nowrap">
                                    {{ portalDomain }}
                                </span>
                                <input
                                    v-model="slug"
                                    type="text"
                                    placeholder="my-company"
                                    class="flex-1 bg-main border border-gray-700 text-opposite rounded-r-md px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <AppButton buttonStyle="primary" @click="saveSlug" :loading="savingSlug">
                            Save Slug
                        </AppButton>
                    </div>
                </div>

                <!-- Theme Configuration -->
                <div class="bg-secondary border border-gray-800 rounded-lg p-6 mb-6">
                    <h2 class="text-lg font-semibold text-opposite mb-4">Portal Theme</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-opposite/80 mb-2">Primary Color</label>
                            <div class="flex items-center gap-3">
                                <input
                                    type="color"
                                    v-model="theme.primaryColor"
                                    class="w-10 h-10 rounded cursor-pointer border border-gray-700"
                                />
                                <input
                                    v-model="theme.primaryColor"
                                    type="text"
                                    class="flex-1 bg-main border border-gray-700 text-opposite rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-opposite/80 mb-2">Background Color</label>
                            <div class="flex items-center gap-3">
                                <input
                                    type="color"
                                    v-model="theme.backgroundColor"
                                    class="w-10 h-10 rounded cursor-pointer border border-gray-700"
                                />
                                <input
                                    v-model="theme.backgroundColor"
                                    type="text"
                                    class="flex-1 bg-main border border-gray-700 text-opposite rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-opposite/80 mb-2">Text Color</label>
                            <div class="flex items-center gap-3">
                                <input
                                    type="color"
                                    v-model="theme.textColor"
                                    class="w-10 h-10 rounded cursor-pointer border border-gray-700"
                                />
                                <input
                                    v-model="theme.textColor"
                                    type="text"
                                    class="flex-1 bg-main border border-gray-700 text-opposite rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <AppButton buttonStyle="primary" @click="saveTheme" :loading="saving">
                            Save Theme
                        </AppButton>
                    </div>
                </div>

                <!-- Portal Pages Preview -->
                <div class="bg-secondary border border-gray-800 rounded-lg p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-semibold text-opposite">Portal Pages</h2>
                        <label class="flex items-center gap-3 cursor-pointer">
                            <span class="text-sm text-opposite/70">Require Login</span>
                            <button
                                @click="toggleHasLogin"
                                :class="[
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                    hasLogin ? 'bg-blue-500' : 'bg-gray-600'
                                ]"
                            >
                                <span
                                    :class="[
                                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                        hasLogin ? 'translate-x-6' : 'translate-x-1'
                                    ]"
                                />
                            </button>
                        </label>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <button
                            v-for="page in visiblePages"
                            :key="page.id"
                            @click="activePage = page.id"
                            :class="[
                                'border rounded-lg p-4 text-center transition-all',
                                activePage === page.id
                                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                    : 'border-gray-700 hover:border-gray-600 text-opposite/70 hover:text-opposite'
                            ]"
                        >
                            <i :class="[page.icon, 'text-2xl mb-2']"></i>
                            <p class="text-sm font-medium">{{ page.name }}</p>
                        </button>
                    </div>

                    <!-- Page Preview -->
                    <div
                        class="border border-gray-700 rounded-lg overflow-hidden"
                        :style="{
                            backgroundColor: theme.backgroundColor,
                            color: theme.textColor
                        }"
                    >
                        <!-- Login Page Preview -->
                        <div v-if="activePage === 'login'" class="p-8">
                            <div class="max-w-sm mx-auto">
                                <h3 class="text-2xl font-bold text-center mb-6">Customer Portal</h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm mb-1 opacity-70">Email</label>
                                        <div class="w-full border rounded-md px-3 py-2 text-sm opacity-50" :style="{ borderColor: theme.primaryColor }">
                                            contact@example.com
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm mb-1 opacity-70">Password</label>
                                        <div class="w-full border rounded-md px-3 py-2 text-sm opacity-50" :style="{ borderColor: theme.primaryColor }">
                                            ********
                                        </div>
                                    </div>
                                    <div
                                        class="w-full text-center py-2 rounded-md text-white font-medium"
                                        :style="{ backgroundColor: theme.primaryColor }"
                                    >
                                        Sign In
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Services Page Preview -->
                        <div v-if="activePage === 'services'" class="p-8">
                            <h3 class="text-xl font-bold mb-4">Available Services</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-for="i in 4" :key="i" class="border rounded-lg p-4" :style="{ borderColor: theme.primaryColor + '40' }">
                                    <div class="flex items-center gap-3 mb-2">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center" :style="{ backgroundColor: theme.primaryColor + '20' }">
                                            <i class="fa-solid fa-wrench text-sm" :style="{ color: theme.primaryColor }"></i>
                                        </div>
                                        <span class="font-medium">Service {{ i }}</span>
                                    </div>
                                    <p class="text-sm opacity-60">Sample service description for preview purposes.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Place Order Page Preview -->
                        <div v-if="activePage === 'order'" class="p-8">
                            <h3 class="text-xl font-bold mb-4">Place Service Request</h3>
                            <div class="max-w-lg space-y-4">
                                <div>
                                    <label class="block text-sm mb-1 opacity-70">Service Type</label>
                                    <div class="w-full border rounded-md px-3 py-2 text-sm opacity-50" :style="{ borderColor: theme.primaryColor }">
                                        Select a service...
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm mb-1 opacity-70">Description</label>
                                    <div class="w-full border rounded-md px-3 py-6 text-sm opacity-50" :style="{ borderColor: theme.primaryColor }">
                                        Describe your request...
                                    </div>
                                </div>
                                <div
                                    class="inline-block text-center px-6 py-2 rounded-md text-white font-medium"
                                    :style="{ backgroundColor: theme.primaryColor }"
                                >
                                    Submit Request
                                </div>
                            </div>
                        </div>

                        <!-- My Requests Page Preview -->
                        <div v-if="activePage === 'requests'" class="p-8">
                            <h3 class="text-xl font-bold mb-4">My Requests</h3>
                            <div class="border rounded-lg overflow-hidden" :style="{ borderColor: theme.primaryColor + '30' }">
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr :style="{ backgroundColor: theme.primaryColor + '15' }">
                                            <th class="text-left px-4 py-3 font-medium">Request ID</th>
                                            <th class="text-left px-4 py-3 font-medium">Service</th>
                                            <th class="text-left px-4 py-3 font-medium">Status</th>
                                            <th class="text-left px-4 py-3 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="i in 3" :key="i" class="border-t" :style="{ borderColor: theme.primaryColor + '15' }">
                                            <td class="px-4 py-3 opacity-70">REQ-00{{ i }}</td>
                                            <td class="px-4 py-3 opacity-70">Sample Service {{ i }}</td>
                                            <td class="px-4 py-3">
                                                <span
                                                    class="px-2 py-1 rounded-full text-xs font-medium"
                                                    :style="{
                                                        backgroundColor: theme.primaryColor + '20',
                                                        color: theme.primaryColor
                                                    }"
                                                >
                                                    {{ ['Created', 'In Review', 'Accepted'][i - 1] }}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3 opacity-70">2026-02-{{ 20 + i }}</td>
                                        </tr>
                                    </tbody>
                                </table>
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
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { apiGet, apiPut } from '@/util/api'

const authStore = useAuthStore()
const toast = useToast()

const portalDomain = computed(() => `${window.location.origin}/portal/`)

const crumbs = [
    { name: 'Customers', path: '/customers/list', icon: 'fa-solid fa-building text-neutral-700 text-2xl' },
    { name: 'Portal Configuration', path: '' }
]

const pages = [
    { id: 'login', name: 'Login', icon: 'fa-solid fa-right-to-bracket' },
    { id: 'services', name: 'Services', icon: 'fa-solid fa-concierge-bell' },
    { id: 'order', name: 'Place Order', icon: 'fa-solid fa-cart-plus' },
    { id: 'requests', name: 'My Requests', icon: 'fa-solid fa-list-check' },
]

const activePage = ref('login')
const saving = ref(false)
const savingSlug = ref(false)
const savingLogin = ref(false)
const loading = ref(false)
const slug = ref('')
const hasLogin = ref(true)

const theme = ref({
    primaryColor: '#3b82f6',
    backgroundColor: '#111827',
    textColor: '#f9fafb',
})

const visiblePages = computed(() => {
    if (hasLogin.value) return pages
    return pages.filter(p => p.id !== 'login')
})

const toggleHasLogin = async () => {
    const newValue = !hasLogin.value
    savingLogin.value = true
    try {
        await apiPut('/customers/portal-config', { hasLogin: newValue }, authStore)
        hasLogin.value = newValue
        if (!newValue && activePage.value === 'login') {
            activePage.value = 'services'
        }
        toast.showToast('Updated', `Portal login ${newValue ? 'enabled' : 'disabled'}`, 'success')
    } catch (error: any) {
        toast.showToast('Error', 'Failed to update login setting', 'error')
    } finally {
        savingLogin.value = false
    }
}

const fetchConfig = async () => {
    loading.value = true
    try {
        const config = await apiGet<{ theme: any; slug: string | null; hasLogin: boolean }>('/customers/portal-config', authStore)
        if (config?.theme) {
            theme.value = {
                primaryColor: config.theme.primaryColor ?? '#3b82f6',
                backgroundColor: config.theme.backgroundColor ?? '#111827',
                textColor: config.theme.textColor ?? '#f9fafb',
            }
        }
        slug.value = config?.slug ?? ''
        hasLogin.value = config?.hasLogin ?? true
        if (!hasLogin.value && activePage.value === 'login') {
            activePage.value = 'services'
        }
    } catch {
        // No config yet, use defaults
    } finally {
        loading.value = false
    }
}

const saveTheme = async () => {
    saving.value = true
    try {
        await apiPut('/customers/portal-config', { theme: theme.value }, authStore)
        toast.showToast('Theme saved', 'Portal theme updated successfully', 'success')
    } catch (error: any) {
        toast.showToast('Error', 'Failed to save theme configuration', 'error')
    } finally {
        saving.value = false
    }
}

const saveSlug = async () => {
    if (!slug.value.trim()) {
        toast.showToast('Validation Error', 'Slug cannot be empty', 'error')
        return
    }
    savingSlug.value = true
    try {
        await apiPut('/customers/portal-config', { slug: slug.value.trim() }, authStore)
        toast.showToast('Slug saved', 'Portal slug updated successfully', 'success')
    } catch (error: any) {
        toast.showToast('Error', error?.response?.data?.message || 'Failed to save slug', 'error')
    } finally {
        savingSlug.value = false
    }
}

onMounted(() => {
    fetchConfig()
})
</script>
