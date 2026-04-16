<template>
    <div id="root" class="min-h-screen bg-dark">
        <BreadCrums
            :crumbs="[
                {
                    name: 'Permission Groups',
                    path: '',
                    icon: 'fa-solid fa-users-gear text-neutral-700 text-2xl'
                }
            ]"
        >
            <div class="flex items-center gap-4">
                <Can :subject="'permissions'" :actions="['create']">
                    <AppButton
                        buttonStyle="primary"
                        href="/admin/permissions/groups/add"
                        test-id="add-group-button"
                    >
                        <i class="fa-solid fa-plus"></i>
                        <span class="ml-2">Add Group</span>
                    </AppButton>
                </Can>
            </div>
        </BreadCrums>

        <Table
            :cols="['Name', 'Description', 'Type', 'Scope', 'Members']"
            :rows="rows"
            :page="page"
            :total="total"
            :per-page="perPage"
            :total-pages="totalPages"
            :on-next-page="onNextPage"
            :on-previous-page="onPreviousPage"
            :set-page="setPage"
            :entities="groups"
            entity-name="Group"
            :on-success="onSuccess"
            :search-placeholder="'Search permission groups by name...'"
            :on-search="
                (val: string) => {
                    query = val
                    searchLoading = true
                }
            "
            :loading="loading"
            :search-loading="searchLoading"
            :hide-edit="(e: any) => !e.custom"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Table from '@/components/Table.vue'
import type { PaginatedResponse, PermissionGroup } from '@/util/interfaces'
import { apiGet } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/AppButton.vue'
import BreadCrums from '@/components/breadCrums.vue'
import Can from '@/components/Can.vue'
const groups = ref<PermissionGroup[]>([])
const page = ref(1)
const perPage = ref(10)
const total = ref(1)
const totalPages = ref(1)
const query = ref('')
const loading = ref(true)
const searchLoading = ref(false)
const rows = ref<{ [key: string]: any }[]>([])
const authStore = useAuthStore()

const mapRows = (groups: PermissionGroup[]) => {
    return groups.map((group) => ({
        id: group.id,
        Name: group.name,
        Description: group.description,
        Type: group.custom ? 'Custom' : 'Default',
        Scope: group.scope == 'org-unit' ? 'Organization Unit' : 'Company',
        Members: group.members
    }))
}

const onNextPage = () => {
    if (page.value < totalPages.value) {
        page.value = page.value + 1
    }
}

const onPreviousPage = () => {
    if (page.value > 1) {
        page.value = page.value - 1
    }
}

const setPage = (newPage: number) => {
    if (newPage != page.value) {
        page.value = newPage
    }
}
watch(query, () => {
    page.value = 1
    onSuccess()
})

const onSuccess = () => {
    loading.value = true
    apiGet<PermissionGroup[]>(`/permissions/groups?name=${query.value}`, authStore)
        .then((res) => {
            loading.value = false
            groups.value = res
            totalPages.value = Math.ceil(res.length / perPage.value)
            total.value = res.length
            rows.value = mapRows(res)
            searchLoading.value = false
        })
        .catch((err) => {
            loading.value = false
            searchLoading.value = false
        })
}

onMounted(async () => {
    onSuccess()
})
</script>
