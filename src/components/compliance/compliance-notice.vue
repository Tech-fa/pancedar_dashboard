<template>
    <div v-if="!authStore.state.userDetails.isCompliant">
        <!-- Sidebar trigger button -->
        <div @click="openPanel"
            class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-yellow-300 hover:bg-complementary-main/50 cursor-pointer">
            <i class="fa-solid fa-triangle-exclamation text-lg"></i>
            <span>ATTENTION: YOU ARE NON-COMPLIANT</span>
            <span
                class="flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 w-5 ml-auto">
                !</span>
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
                            <TransitionChild as="template"
                                enter="transform transition ease-in-out duration-300"
                                enter-from="translate-x-full" enter-to="translate-x-0"
                                leave="transform transition ease-in-out duration-300" leave-from="translate-x-0"
                                leave-to="translate-x-full">
                                <DialogPanel class="pointer-events-auto w-screen max-w-md">
                                    <div class="flex h-full flex-col bg-main shadow-xl">
                                        <!-- Header -->
                                        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                                            <DialogTitle class="text-lg font-semibold text-opposite">
                                                Compliance Requirements
                                            </DialogTitle>
                                            <button @click="isOpen = false"
                                                class="rounded-md text-opposite hover:text-gray-300">
                                                <XMarkIcon class="h-5 w-5" />
                                            </button>
                                        </div>

                                        <!-- Content -->
                                        <div class="flex-1 overflow-y-auto px-4 py-4">
                                            <p class="text-sm text-yellow-400 mb-4">
                                                You are missing required documents. Please upload the following to become compliant.
                                            </p>

                                            <div v-if="loading" class="flex items-center justify-center py-8">
                                                <i class="fa-solid fa-spinner fa-spin text-opposite text-xl"></i>
                                            </div>

                                            <div v-else-if="rules.length === 0"
                                                class="text-sm text-opposite/60 py-4 text-center">
                                                No compliance rules configured.
                                            </div>

                                            <div v-else class="space-y-4">
                                                <div v-for="location in rules" :key="location.locationId"
                                                    class="rounded-lg bg-complementary-main/30 p-3">
                                                    <div class="flex items-center gap-2 mb-2">
                                                        <i class="fa-solid fa-location-dot text-opposite/70 text-xs"></i>
                                                        <span class="text-sm font-medium text-opposite">
                                                            {{ [location.country, location.state, location.city].filter(Boolean).join(', ') || 'All Locations' }}
                                                        </span>
                                                    </div>
                                                    <ul class="space-y-1.5 pl-5">
                                                        <li v-for="doc in location.requiredDocuments"
                                                            :key="doc.documentTypeId + (doc.documentCodeId || '')"
                                                            class="flex items-start gap-2 text-sm text-opposite/80">
                                                            <i class="fa-solid fa-file-circle-exclamation text-yellow-400 mt-0.5 text-xs"></i>
                                                            <span>
                                                                {{ doc.documentTypeName }}
                                                                <span v-if="doc.documentCodeName"
                                                                    class="text-opposite/50">
                                                                    &mdash; {{ doc.documentCodeName }}
                                                                </span>
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
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
import { ref } from 'vue'
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { getComplianceRules, type ComplianceRule } from '@/components/operation-config/endpoints'

const authStore = useAuthStore()

const isOpen = ref(false)
const loading = ref(false)
const rules = ref<ComplianceRule[]>([])

const openPanel = async () => {
    isOpen.value = true
    if (rules.value.length > 0) return
    loading.value = true
    try {
        rules.value = await getComplianceRules(authStore)
    } catch (e) {
        console.error('Failed to fetch compliance rules:', e)
    } finally {
        loading.value = false
    }
}
</script>
