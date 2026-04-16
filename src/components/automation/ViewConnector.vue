<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />
        <div class="px-6 pb-6 pt-4">
            <div v-if="loading" class="flex items-center justify-center py-20">
                <Spinner width="3" height="3" />
            </div>

            <template v-else-if="connector">
                <div class="max-w-3xl mx-auto space-y-6">
                    <!-- Header -->
                    <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div :class="['w-3 h-3 rounded-full shrink-0', connector.isActive ? 'bg-green-500' : 'bg-gray-500']" />
                                <div>
                                    <h2 class="text-xl font-semibold text-opposite">{{ connector.name }}</h2>
                                    <p class="text-sm text-opposite/40 mt-0.5">{{ connector.connectorType?.name }}</p>
                                </div>
                            </div>
                            <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', connector.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400']">
                                {{ connector.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                    </div>

                    <!-- Displays -->
                    <div v-if="connector.displays && Object.keys(connector.displays).length" class="bg-secondary rounded-lg border border-gray-800 p-6">
                        <h3 class="text-sm font-medium text-opposite mb-4">Details</h3>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div v-for="(value, key) in connector.displays" :key="key"
                                class="p-3 rounded-lg bg-gray-800/50">
                                <div class="text-xs text-opposite/40 mb-1">{{ formatLabel(key as string) }}</div>
                                <div class="text-sm text-opposite break-all">{{ value ?? '—' }}</div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="bg-secondary rounded-lg border border-gray-800 p-6 text-center text-opposite/40 text-sm">
                        No display data available for this connector.
                    </div>

                    <!-- Available Actions (connector type actions) -->
                    <div v-if="connector.connectorType?.actions?.length" class="bg-secondary rounded-lg border border-gray-800 p-6">
                        <h3 class="text-sm font-medium text-opposite mb-4">Available Actions</h3>
                        <div class="space-y-2">
                            <div v-for="action in connector.connectorType.actions" :key="action.id"
                                class="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                                <i class="fa-solid fa-bolt text-yellow-400 text-xs mt-1"></i>
                                <div class="min-w-0">
                                    <div class="text-sm text-opposite font-medium">{{ action.name }}</div>
                                    <div v-if="action.description" class="text-xs text-opposite/40 mt-0.5">
                                        {{ action.description }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Instances (reusable panel) -->
                    <ActionInstancesPanel
                        :connectorId="connector.id"
                        :availableActions="connector.connectorType?.actions || []"
                        :showFormOnMount="showActionFormOnMount"
                    />

                    <!-- Metadata -->
                    <div class="bg-secondary rounded-lg border border-gray-800 p-6">
                        <h3 class="text-sm font-medium text-opposite mb-4">Info</h3>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div class="p-3 rounded-lg bg-gray-800/50">
                                <div class="text-xs text-opposite/40 mb-1">Created</div>
                                <div class="text-sm text-opposite">{{ formatDateToDay(+connector.createdAt) }}</div>
                            </div>
                            <div class="p-3 rounded-lg bg-gray-800/50">
                                <div class="text-xs text-opposite/40 mb-1">Last Updated</div>
                                <div class="text-sm text-opposite">{{ formatDateToDay(+connector.updatedAt) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <div v-else class="text-center py-20 text-opposite/50">
                Connector not found.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import ActionInstancesPanel from '@/components/automation/ActionInstancesPanel.vue'
import { useAuthStore } from '@/stores/auth'
import { getConnectorById } from '@/components/fleet/endpoints'
import type { Connector } from '@/components/fleet/endpoints'
import { formatDateToDay } from '@/util/util'

const route = useRoute()
const authStore = useAuthStore()

const connector = ref<Connector | null>(null)
const loading = ref(false)
const showActionFormOnMount = computed(() => route.query.showActionForm === 'true')

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Connectors', path: '/automation/connectors' },
    { name: 'View', path: '' }
]

const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^\w/, c => c.toUpperCase()).trim()

onMounted(async () => {
    const id = route.params.id as string
    loading.value = true
    try {
        connector.value = await getConnectorById(id, authStore)
    } catch {
        connector.value = null
    } finally {
        loading.value = false
    }
})
</script>
