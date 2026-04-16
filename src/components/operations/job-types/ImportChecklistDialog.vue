<template>
    <div class="bg-secondary rounded-lg p-6 w-full max-w-2xl">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-medium text-opposite">Import Checklist</h2>
            <button class="text-opposite/50 hover:text-opposite" @click="onCancel">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>

        <div class="mb-4">
            <input v-model="searchTerm" type="text" placeholder="Search checklists..."
                class="w-full px-3 py-2 border border-gray-700 rounded-lg bg-main text-opposite placeholder-opposite/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
            <Spinner width="3" height="3" />
        </div>

        <div v-else-if="filteredChecklists.length === 0"
            class="text-center py-8 text-opposite/50 border border-dashed border-gray-700 rounded-lg">
            {{ searchTerm ? 'No checklists match your search.' : 'No checklists available to import.' }}
        </div>

        <div v-else class="max-h-96 overflow-y-auto space-y-2">
            <div v-for="cl in filteredChecklists" :key="cl.id" @click="selectedId = cl.id"
                class="p-3 border rounded-lg cursor-pointer transition-colors" :class="selectedId === cl.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-opposite font-medium">{{ cl.name }}</span>
                            <span class="text-xs px-2 py-0.5 rounded-full"
                                :class="cl.type === 'PRE_JOB' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'">
                                {{ cl.type === 'PRE_JOB' ? 'Pre-Job' : 'Post-Job' }}
                            </span>
                        </div>
                        <div v-if="cl.description" class="text-sm text-opposite/60 mt-1">{{ cl.description }}</div>
                        <div class="text-xs text-opposite/40 mt-1">{{ cl.items?.length || 0 }} items</div>
                    </div>
                    <div v-if="selectedId === cl.id" class="text-blue-400">
                        <i class="fa-solid fa-check-circle text-lg"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
            <AppButton buttonStyle="secondary" @click="onCancel">Cancel</AppButton>
            <AppButton buttonStyle="primary" @click="onImport" :disabled="!selectedId" :loading="importing">
                Import Checklist
            </AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { getAllChecklists, importChecklistToJobType } from '@/components/fleet/endpoints'
import type { Checklist } from '@/components/fleet/endpoints'

const props = defineProps<{
    jobTypeId: string
    existingTypes: ('PRE_JOB' | 'POST_JOB')[]
    onSuccess: () => void
    onCancel: () => void
}>()

const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const importing = ref(false)
const allChecklists = ref<Checklist[]>([])
const searchTerm = ref('')
const selectedId = ref<string | null>(null)

const filteredChecklists = computed(() => {
    const term = searchTerm.value.toLowerCase()
    return allChecklists.value.filter((cl) => {
        if (props.existingTypes.includes(cl.type)) return false
        if (term && !cl.name.toLowerCase().includes(term) && !cl.description?.toLowerCase().includes(term)) return false
        return true
    })
})

const loadChecklists = async () => {
    loading.value = true
    try {
        allChecklists.value = await getAllChecklists(authStore)
    } catch {
        allChecklists.value = []
    } finally {
        loading.value = false
    }
}

const onImport = async () => {
    if (!selectedId.value) return
    importing.value = true
    try {
        await importChecklistToJobType(props.jobTypeId, selectedId.value, authStore)
        toast.showToast('Imported', 'Checklist imported successfully', 'success')
        props.onSuccess()
    } catch (error: any) {
        toast.showToast(
            'Error',
            error?.response?.data?.message || 'Failed to import checklist',
            'error',
        )
    } finally {
        importing.value = false
    }
}

onMounted(() => {
    loadChecklists()
})
</script>
