<template>
    <div class="p-6">
        <div class="mb-4 flex items-center justify-between gap-4">
            <div class="relative max-w-md flex-1">
                <AppInput
                    v-model="searchQuery"
                    @input="handleSearch"
                    type="text"
                    placeholder="Search documents by title..."
                    class="w-full px-4 py-2 pl-10 border border-neutral-200 rounded-md"
                />
                <i class="fa-solid fa-search absolute left-3 top-3 text-neutral-400"></i>
            </div>
            <AppButton
                buttonStyle="primary"
                class="flex items-center gap-2"
                :href="addDocumentUrl"
            >
                <i class="fa-solid fa-plus"></i>
                Attach Document
            </AppButton>
        </div>

        <Table
            :cols="columns"
            :rows="rows"
            :skip-padding="true"
            :entities="documents.data"
            :total-pages="totalPages"
            :page="currentPage"
            :total="totalDocuments"
            :per-page="perPage"
            :on-next-page="handleNextPage"
            :on-previous-page="handlePreviousPage"
            :set-page="setPage"
            entity-name="Document"
            :on-success="fetchDocuments"
            :loading="loading"
            subject="documents"
            :hide-edit="() => true"
            :hide-view="() => true"
            :hide-delete="() => true"
            :map-status-style="
                (status: string) => (status === 'Obsolete' ? 'bg-red-100 text-red-800' : '')
            "
        >
            <template #extra-field="{ entity }">
                <div class="flex gap-4 flex-wrap items-center justify-center h-full">
                    <AppButton
                        type="button"
                        button-style="void"
                        :href="`/qms/documents/${entity.id}`"
                        class="cursor-pointer hover:text-neutral-400"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </AppButton>
                    <AppButton
                        v-if="entity.versions?.[0]?.file"
                        type="button"
                        button-style="void"
                        class="cursor-pointer hover:text-neutral-400"
                        :download="entity.versions[0].file"
                    >
                        <i class="fa-solid fa-download"></i>
                    </AppButton>
                </div>
            </template>
        </Table>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiGet } from '@/util/api'
import { useToast } from '@/stores/notification'
import { formatDate, mapDocumentStatus } from '@/util/util'
import type { Document, PaginatedResponse } from '@/util/interfaces'
import Table from '@/components/Table.vue'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'

const props = defineProps<{
    userId: string
}>()

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const addDocumentUrl = computed(() => {
    const redirect = encodeURIComponent(route.fullPath)
    return `/qms/documents/add?createdFor=${props.userId}&redirect=${redirect}`
})

const columns = ['Title', 'Category', 'Status', 'Upload Date', 'Version']
const documents = ref<PaginatedResponse<Document>>({
    data: [],
    currentPage: 1,
    totalCount: 0,
    perPage: 10
})
const rows = ref<Record<string, any>[]>([])

const currentPage = ref(1)
const totalPages = ref(1)
const totalDocuments = ref(0)
const perPage = ref(10)
const loading = ref(false)
const searchQuery = ref('')
const searchTimeout = ref<ReturnType<typeof setTimeout>>()

const mapRows = (docs: Document[]) => {
    return docs.map((doc) => ({
        id: doc.id,
        Title: doc.title,
        Category: doc.documentType?.name ?? '',
        Status: mapDocumentStatus(doc.versions?.[0]?.status ?? 'pending'),
        'Upload Date': formatDate(doc.createdAt),
        Version: doc.currentVersion
    }))
}

const fetchDocuments = async () => {
    loading.value = true
    try {
        const searchParam = searchQuery.value ? `&search=${searchQuery.value}` : ''
        const response = await apiGet<PaginatedResponse<Document>>(
            `/documents?perPage=${perPage.value}&page=${currentPage.value}&createdFor=${props.userId}${searchParam}`,
            authStore
        )
        rows.value = mapRows(response.data)
        documents.value = response
        totalPages.value = Math.ceil(response.totalCount / perPage.value)
        totalDocuments.value = response.totalCount
    } catch (err) {
        console.error(err)
        toast.showToast('Error', 'Failed to fetch documents', 'error')
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }
    searchTimeout.value = setTimeout(() => {
        currentPage.value = 1
        fetchDocuments()
    }, 300)
}

const handleNextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const handlePreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const setPage = (page: number) => {
    currentPage.value = page
}

watch(currentPage, () => {
    fetchDocuments()
})

onMounted(() => {
    fetchDocuments()
})

onUnmounted(() => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
    }
})
</script>
