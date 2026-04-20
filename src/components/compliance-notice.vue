<template>
    <div v-if="missingConnectors.length > 0">
        <!-- Sidebar trigger button -->
        <div @click="openPanel"
            class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-yellow-800 hover:bg-complementary-main/50 cursor-pointer">
            <i class="fa-solid fa-triangle-exclamation text-lg"></i>
            <span>ATTENTION: CONNECTORS NEEDED</span>
            <span class="flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 w-5 ml-auto">
                {{ missingConnectors.length }}</span>
        </div>

        <!-- Slide-over panel -->
        <TransitionRoot as="template" :show="isOpen">
            <Dialog class="relative z-[9999]" @close="isOpen = false">
                <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0"
                    enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100"
                    leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/40" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-hidden">
                    <div class="absolute inset-0 overflow-hidden">
                        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <TransitionChild as="template" enter="transform transition ease-in-out duration-300"
                                enter-from="translate-x-full" enter-to="translate-x-0"
                                leave="transform transition ease-in-out duration-300" leave-from="translate-x-0"
                                leave-to="translate-x-full">
                                <DialogPanel class="pointer-events-auto w-screen max-w-md">
                                    <div class="flex h-full flex-col bg-main shadow-xl">
                                        <!-- Header -->
                                        <div
                                            class="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                                            <DialogTitle class="text-lg font-semibold text-opposite">
                                                Connectors Needed
                                            </DialogTitle>
                                            <button @click="isOpen = false"
                                                class="rounded-md text-opposite hover:text-gray-300">
                                                <XMarkIcon class="h-5 w-5" />
                                            </button>
                                        </div>

                                        <!-- Content -->
                                        <div class="flex-1 overflow-y-auto px-4 py-4">
                                            <p class="text-sm text-yellow-400 mb-4">
                                                Some connectors need to be created for your workflows to work.
                                                Please create the following connectors:
                                            </p>

                                            <div v-if="loading" class="flex items-center justify-center py-8">
                                                <i class="fa-solid fa-spinner fa-spin text-opposite text-xl"></i>
                                            </div>

                                            <ul v-else class="space-y-2">
                                                <li v-for="connector in missingConnectors" :key="connector"
                                                    class="flex items-start gap-2 rounded-lg bg-complementary-main/30 p-3 text-sm text-opposite">
                                                    <i
                                                        class="fa-solid fa-plug-circle-exclamation text-yellow-400 mt-0.5 text-xs"></i>
                                                    <span>{{ connector }}</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <!-- Footer -->
                                        <div class="border-t border-gray-700 px-4 py-3">
                                            <button @click="goToConnectors"
                                                class="w-full rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
                                                Create Connectors
                                            </button>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiGet } from '@/util/api'
import { getNeedConnectors } from './automation/endpoints'

const authStore = useAuthStore()
const router = useRouter()

const isOpen = ref(false)
const loading = ref(false)
const missingConnectors = ref<string[]>([])

const fetchMissingConnectors = async () => {
    loading.value = true
    try {
        const connectors = await getNeedConnectors(authStore, true)
        missingConnectors.value = connectors ?? []
    } catch (e) {
        console.error('Failed to fetch needed connectors:', e)
        missingConnectors.value = []
    } finally {
        loading.value = false
    }
}

const openPanel = () => {
    isOpen.value = true
}

const goToConnectors = () => {
    isOpen.value = false
    router.push('/automation/connectors')
}

onMounted(() => {
    if (authStore.state.isLoggedIn) {
        fetchMissingConnectors()
    }
})
</script>
