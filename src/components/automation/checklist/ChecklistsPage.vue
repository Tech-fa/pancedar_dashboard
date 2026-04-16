<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />
        <div class="px-6 pb-6 pt-4">
            <Table :cols="cols" :rows="paginatedRows" :entities="paginatedEntities" entityName="Checklist"
                :loading="loading" searchPlaceholder="Search checklists..." :onSearch="handleSearch" :page="page"
                :total="total" :perPage="perPage" :totalPages="totalPages" :onNextPage="onNextPage"
                :onPreviousPage="onPreviousPage" :setPage="setPage"
                :viewPath="(row: any) => `/automation/checklists/${row.id}`"
                :hide-view="(row: any) => true"
                :handleDelete="handleDeleteFromTable" subject="assets">
                <template #header>
                    <div class="flex items-center justify-between w-full mb-4">
                        <h3 class="text-lg font-medium text-opposite">Checklists</h3>
                        <AppButton buttonStyle="primary" :href="'/automation/checklists/add'">
                            <i class="fa-solid fa-plus mr-1"></i>
                            Add Checklist
                        </AppButton>
                    </div>
                </template>
            </Table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Table from '@/components/Table.vue'
import AppButton from '@/components/AppButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { getAllChecklists, deleteChecklistById, type Checklist } from '@/components/fleet/endpoints'
import { formatDate } from '@/util/util'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const dialog = useDialog()

const allChecklists = ref<Checklist[]>([])
const filtered = ref<Checklist[]>([])
const loading = ref(false)

const page = ref(1)
const perPage = ref(25)
const total = computed(() => filtered.value.length)
const totalPages = computed(() => Math.ceil(total.value / perPage.value) || 1)

const paginatedEntities = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filtered.value.slice(start, start + perPage.value)
})

const paginatedRows = computed(() => {
    return paginatedEntities.value.map((c) => ({
        id: c.id,
        Name: c.name,
        Description: c.description || '—',
        Type: c.type === 'PRE_JOB' ? 'Pre-Job' : 'Post-Job',
        Items: c.items?.length ?? 0,
        Created: formatDate(c.createdAt),
    }))
})

const onNextPage = () => {
    if (page.value < totalPages.value) page.value++
}
const onPreviousPage = () => {
    if (page.value > 1) page.value--
}
const setPage = (newPage: number) => {
    if (newPage !== page.value) page.value = newPage
}

const cols = ['Name', 'Description', 'Type', 'Items', 'Created']

const crumbs = [
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Checklists', path: '' }
]

const loadChecklists = async () => {
    loading.value = true
    try {
        const data = await getAllChecklists(authStore)
        allChecklists.value = data
        filtered.value = data
        page.value = 1
    } catch {
        allChecklists.value = []
        filtered.value = []
    } finally {
        loading.value = false
    }
}

const handleSearch = (query: string) => {
    const q = query.toLowerCase().trim()
    if (!q) {
        filtered.value = allChecklists.value
    } else {
        filtered.value = allChecklists.value.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                (c.description && c.description.toLowerCase().includes(q))
        )
    }
    page.value = 1
}

const handleDeleteFromTable = (entity: Checklist) => {
    dialog.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete checklist "${entity.name}"?`,
        onConfirm: async () => {
            try {
                await deleteChecklistById(entity.id, authStore)
                toast.showToast('Deleted', 'Checklist deleted successfully', 'success')
                await loadChecklists()
            } catch {
                toast.showToast('Error', 'Failed to delete checklist', 'error')
            } finally {
                dialog.closeDialog()
            }
        },
        onCancel: () => dialog.closeDialog(),
    })
}

onMounted(() => {
    loadChecklists()
})
</script>
