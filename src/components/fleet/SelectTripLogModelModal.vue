<script setup lang="ts">
import { ref, computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import Select2 from '@/components/Select2.vue'
import type { SupportedModel } from './endpoints'
import Notice from '../Notice.vue'

const props = defineProps<{
    supportedModels: SupportedModel[]
    onConfirm: (model: SupportedModel, file: File) => void
    onCancel: () => void
}>()

const selectedModel = ref<SupportedModel | null>(null)
const selectedFile = ref<File | null>(null)
const loading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const displayModel = (model: SupportedModel) => {
    return model ? `${model.make} ${model.name}` : ''
}

const canUpload = computed(() => selectedModel.value && selectedFile.value)

const handleFileSelect = () => {
    fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
        selectedFile.value = input.files[0]
    }
}

const clearFile = () => {
    selectedFile.value = null
    if (fileInputRef.value) {
        fileInputRef.value.value = ''
    }
}

const handleConfirm = async () => {
    if (!selectedModel.value || !selectedFile.value) return
    loading.value = true
    await props.onConfirm(selectedModel.value, selectedFile.value)
}
</script>

<template>
    <div
        id="modal"
        class="bg-secondary rounded-lg shadow-lg w-full max-w-md border border-gray-800 flex flex-col"
    >
        <div id="modal-header" class="p-6 border-b border-gray-800">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-upload text-accent-blue text-xl"></i>
                    <h2 class="text-lg text-opposite">Upload Trip Log</h2>
                </div>
                <button @click="onCancel" class="text-opposite/40 hover:text-opposite/60">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
        </div>

        <div id="modal-content" class="p-6">
            <div class="space-y-4">
                <p class="text-sm text-opposite/70">
                    Select the vehicle model and upload the trip log file. This helps us parse the
                    log file correctly.
                </p>
                <div>
                    <label class="block text-sm font-medium text-opposite mb-2">
                        Vehicle Model <span class="text-red-500">*</span>
                    </label>
                    <Select2
                        v-model="selectedModel"
                        :values="supportedModels"
                        :display="displayModel"
                        :dropdownHeight="'300px'"
                        placeholder="Select vehicle model"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-opposite mb-2">
                        Trip Log File <span class="text-red-500">*</span>
                    </label>
                    <Notice
                        description="The trip log file must be an already decoded file from the vehicle."
                        level="info"
                    />
                    <div class="mt-2"></div>
                    <input
                        ref="fileInputRef"
                        type="file"
                        accept=".csv,.json,.txt,.log"
                        class="hidden"
                        @change="handleFileChange"
                    />
                    <div
                        v-if="!selectedFile"
                        @click="handleFileSelect"
                        class="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-accent-blue transition-colors"
                    >
                        <i class="fa-solid fa-file-arrow-up text-3xl text-opposite/40 mb-2"></i>
                        <p class="text-sm text-opposite/70">Click to select a file</p>
                        <p class="text-xs text-opposite/40 mt-1">CSV, JSON, TXT, or LOG files</p>
                    </div>
                    <div
                        v-else
                        class="border border-gray-700 rounded-lg p-4 flex items-center justify-between bg-main/50"
                    >
                        <div class="flex items-center gap-3">
                            <i class="fa-solid fa-file text-accent-blue text-xl"></i>
                            <div>
                                <p class="text-sm text-opposite truncate max-w-[200px]">
                                    {{ selectedFile.name }}
                                </p>
                                <p class="text-xs text-opposite/40">
                                    {{ (selectedFile.size / 1024).toFixed(1) }} KB
                                </p>
                            </div>
                        </div>
                        <button
                            @click="clearFile"
                            class="text-opposite/40 hover:text-red-500 transition-colors"
                        >
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="modal-footer" class="p-6 border-t border-gray-800 bg-main/50 rounded-b-lg mt-auto">
            <div class="flex justify-end gap-3">
                <AppButton
                    @click="onCancel"
                    buttonStyle="secondary"
                    test-id="trip-log-modal-cancel"
                >
                    Cancel
                </AppButton>
                <AppButton
                    @click="handleConfirm"
                    buttonStyle="primary"
                    :loading="loading"
                    :disabled="!canUpload"
                    test-id="trip-log-modal-confirm"
                >
                    <i class="fa-solid fa-upload mr-2"></i>
                    Upload
                </AppButton>
            </div>
        </div>
    </div>
</template>
