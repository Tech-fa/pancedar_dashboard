<template>
    <div id="main-container" class="min-h-screen bg-main">
        <!-- Header -->
        <BreadCrums :crumbs="crums" />

        <main class="max-w-7xl mx-auto px-6 py-8 ">
            <Tabs :tabs="tabs" v-model="currentTab" test-id="settings-tabs" />

            <div v-if="currentTab === 0">
                <ApprovalStrategyComp v-model:strategies="strategies" />
            </div>
            <div v-if="currentTab === 1">
                <DocumentCategory v-model:types="types" />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tabs from '@/components/Tabs.vue'
import BreadCrums from '@/components/breadCrums.vue'
import ApprovalStrategyComp from '@/components/document/ApprovalStrategy.vue'
import DocumentCategory from '@/components/document/view-category.vue'
import type { ApprovalStrategy, DocumentType } from '@/util/interfaces'

const route = useRoute()
const router = useRouter()

const crums = [
    {
        name: 'Documents',
        path: '/qms/documents',
        icon: 'fa-solid fa-file-lines text-neutral-700 text-2xl'
    },
    {
        name: 'Settings',
        path: '',
        icon: 'fa-solid fa-gear text-neutral-700 text-2xl'
    }
]

const tabs = ['Approval Strategies', 'Document Categories']
const currentTab = ref(0)
const strategies = ref<ApprovalStrategy[]>([])
const types = ref<DocumentType[]>([])

// Initialize currentTab from URL parameter
const tabParam = route.query.tab
if (tabParam && !isNaN(Number(tabParam))) {
    const tabIndex = Number(tabParam)
    if (tabIndex >= 0 && tabIndex < tabs.length) {
        currentTab.value = tabIndex
    }
}


// Watch for tab changes and update URL
watch(currentTab, (newTab) => {
    router.replace({
        query: {
            ...route.query,
            tab: newTab
        }
    })
})
</script>
