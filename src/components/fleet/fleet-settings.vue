<template>
    <div id="main-container" class="min-h-screen bg-main">
        <BreadCrums :crumbs="crumbs" />
        <main class="mx-auto lg:p-12 p-6">
            <Tabs :tabs="tabs" v-model="currentTab" :testIds="tabTestIds" />
            <Can subject="asset-model" :actions="['read']" showIfNoPermission>
                <VehicleModelsTab v-if="currentTab === 0" />
            </Can>
            <Can subject="asset-category" :actions="['read']" showIfNoPermission>
                <VehicleCategoriesTab v-if="currentTab === 1" />
            </Can>
           
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tabs from '@/components/Tabs.vue'
import BreadCrums from '@/components/breadCrums.vue'
import Can from '../Can.vue'
import VehicleModelsTab from './vehicle-models-tab.vue'
import VehicleCategoriesTab from './vehicle-categories-tab.vue'
import UploadHistoryTab from './upload-history-tab.vue'

const route = useRoute()
const router = useRouter()

const crumbs = [
    {
        name: 'Fleet',
        path: '/fleet/assets',
        icon: 'fa-solid fa-helicopter'
    },
    {
        name: 'Settings',
        path: '/fleet/settings',
        icon: 'fa-solid fa-gear text-opposite/70 text-2xl'
    }
]

const tabs = ['Vehicle Models', 'Vehicle Categories']

const tabTestIds = ['vehicle-models-tab-button', 'vehicle-categories-tab-button', 'upload-history-tab-button']

const currentTab = ref(0)

const tabParam = route.query.tab
if (tabParam && !isNaN(Number(tabParam))) {
    const tabIndex = Number(tabParam)
    if (tabIndex >= 0 && tabIndex < tabs.length) {
        currentTab.value = tabIndex
    }
}

watch(currentTab, (newTab) => {
    router.replace({
        query: {
            ...route.query,
            tab: newTab
        }
    })
})
</script>
