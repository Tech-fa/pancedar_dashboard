<template>
    <div class="bg-main min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div v-if="loading" class="flex items-center justify-center py-24">
            <Spinner width="3" height="3" />
        </div>

        <div v-else class="px-6 pb-6 pt-4">
            <Tabs v-if="isEditMode" :tabs="tabs" :modelValue="activeTab" @update:modelValue="activeTab = $event" />

            <JobTypeDetailsTab v-if="activeTab === 0" :jobTypeId="jobTypeId" :isEditMode="isEditMode"
                @cancel="handleCancel" @saved="handleSaved" />


            <JobTypeChecklistTab v-if="activeTab === 1 && jobTypeId" :jobTypeId="jobTypeId" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import Spinner from '@/components/Spinner.vue'
import Tabs from '@/components/Tabs.vue'
import JobTypeDetailsTab from './JobTypeDetailsTab.vue'
import JobTypeChecklistTab from './JobTypeChecklistTab.vue'

const route = useRoute()
const router = useRouter()

const jobTypeId = computed(() => route.params.id as string | undefined)
const isEditMode = computed(() => !!jobTypeId.value)

const tabs = ['Details', 'Checklists']
const activeTab = ref(0)

const crumbs = computed(() => [
    { name: 'Job Types', path: '/fleet/job-types', icon: 'fa-solid fa-tags text-neutral-700 text-2xl' },
    { name: isEditMode.value ? 'Edit Job Type' : 'Add Job Type', path: '' }
])

const loading = ref(false)

const handleCancel = () => {
    router.push('/fleet/job-types')
}

const handleSaved = () => {
    router.push('/fleet/job-types')
}
</script>
