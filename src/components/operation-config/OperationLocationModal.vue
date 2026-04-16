<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div v-if="loading" class="flex items-center justify-center py-24">
            <Spinner width="3" height="3" />
        </div>

        <div v-else class="px-6 pb-6 pt-4">
            <OperationLocationDetailsTab :locationId="locationId" :isEditMode="isEditMode"
                @cancel="handleCancel" @saved="handleSaved" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import OperationLocationDetailsTab from './OperationLocationDetailsTab.vue'

const route = useRoute()
const router = useRouter()

const locationId = computed(() => route.params.id as string | undefined)
const isEditMode = computed(() => !!locationId.value)

const crumbs = computed(() => [
    { name: 'Operation Locations', path: '/operation-config/locations', icon: 'fa-solid fa-globe text-neutral-700 text-2xl' },
    { name: isEditMode.value ? 'Edit Location' : 'Add Location', path: '' }
])

const loading = ref(false)

const handleCancel = () => {
    router.push('/operation-config/locations')
}

const handleSaved = () => {
    router.push('/operation-config/locations')
}
</script>
