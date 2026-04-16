<template>
    <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-opposite">Checklists</h3>
            <div class="flex items-center gap-2">
                <AppButton v-if="canAddChecklist" buttonStyle="void" type="button" @click="openImportDialog"
                    class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <i class="fa-solid fa-file-import"></i>
                    Import Checklist
                </AppButton>
                <AppButton v-if="canAddChecklist" buttonStyle="void" type="button" @click="openAddChecklist"
                    class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <i class="fa-solid fa-plus"></i>
                    Add Checklist
                </AppButton>
            </div>
        </div>

        <div v-if="loadingChecklists" class="flex items-center justify-center py-12">
            <Spinner width="3" height="3" />
        </div>

        <div v-else-if="checklists.length === 0"
            class="text-center py-12 text-opposite/50 bg-secondary rounded-lg border border-gray-800">
            No checklists defined for this job type yet.
        </div>

        <div v-else class="space-y-3">
            <div v-for="cl in checklists" :key="cl.id"
                class="bg-secondary rounded-lg border border-gray-800 p-4 flex items-center justify-between">
                <div>
                    <div class="flex items-center gap-2">
                        <div class="text-opposite font-medium">{{ cl.name }}</div>
                        <span class="text-xs px-2 py-0.5 rounded-full"
                            :class="cl.type === 'PRE_JOB' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'">
                            {{ cl.type === 'PRE_JOB' ? 'Pre-Job' : 'Post-Job' }}
                        </span>
                    </div>
                    <div v-if="cl.description" class="text-sm text-opposite/60 mt-1">{{ cl.description }}</div>
                    <div class="text-xs text-opposite/40 mt-1">{{ cl.items?.length || 0 }} items</div>
                </div>
                <div class="flex items-center gap-2">
                    <AppButton buttonStyle="void" @click="openEditChecklist(cl)"
                        class="text-blue-400 hover:text-blue-300 text-sm">
                        <i class="fa-solid fa-pen"></i>
                    </AppButton>
                    <AppButton buttonStyle="void" class="text-red-400 hover:text-red-300 text-sm"
                        :warnBefore="`Are you sure you want to delete checklist &quot;${cl.name}&quot;?`"
                        @click="deleteChecklistConfirmed(cl)">
                        <i class="fa-solid fa-trash"></i>
                    </AppButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ImportChecklistDialog from './ImportChecklistDialog.vue'
import {
    getChecklistsByJobType,
    deleteChecklist,
} from '@/components/fleet/endpoints'
import type { Checklist } from '@/components/fleet/endpoints'

const props = defineProps<{
    jobTypeId: string
}>()

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const checklists = ref<Checklist[]>([])
const loadingChecklists = ref(false)

const canAddChecklist = computed(() => {
    const hasPreJob = checklists.value.some(c => c.type === 'PRE_JOB')
    const hasPostJob = checklists.value.some(c => c.type === 'POST_JOB')
    return !hasPreJob || !hasPostJob
})

const openImportDialog = () => {
    const existingTypes = checklists.value.map(c => c.type)
    dialog.openDialog(ImportChecklistDialog, {
        jobTypeId: props.jobTypeId,
        existingTypes,
        onSuccess: () => {
            dialog.closeDialog()
            loadChecklists()
        },
        onCancel: () => dialog.closeDialog(),
    })
}

const openAddChecklist = () => {
    const resolved = router.resolve({
        path: '/automation/checklists/add',
        query: { jobTypeId: props.jobTypeId },
    })
    window.open(resolved.href, '_blank')
}

const openEditChecklist = (cl: Checklist) => {
    const resolved = router.resolve({
        path: `/automation/checklists/${cl.id}/edit`,
        query: { jobTypeId: props.jobTypeId },
    })
    window.open(resolved.href, '_blank')
}

const deleteChecklistConfirmed = async (cl: Checklist) => {
    try {
        await deleteChecklist(props.jobTypeId, cl.id, authStore)
        toast.showToast('Deleted', 'Checklist deleted successfully', 'success')
        loadChecklists()
    } catch {
        toast.showToast('Error', 'Failed to delete checklist', 'error')
    }
}

const loadChecklists = async () => {
    loadingChecklists.value = true
    try {
        checklists.value = await getChecklistsByJobType(props.jobTypeId, authStore)
    } catch {
        checklists.value = []
    } finally {
        loadingChecklists.value = false
    }
}

onMounted(() => {
    loadChecklists()
})
</script>
