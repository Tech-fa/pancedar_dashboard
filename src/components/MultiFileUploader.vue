<template>
    <div>
        <div v-if="files.length > 0">
            <label class="text-sm text-neutral-600 font-medium" v-if="!readonly">Existing Files</label>
            <div v-for="file in files.filter(f => !removedFiles.includes(f))" :key="file" class="flex items-center p-2 border border-neutral-200 rounded-md bg-white my-1">
                <i class="fa-regular fa-file-pdf text-neutral-500"></i>
                <span
                    @click="() => downloadFile(file)"
                    class="ml-2 text-blue-500 hover:text-blue-700 cursor-pointer flex-1"
                >
                    {{
                        file
                            .split('_')
                            .filter((_, index) => index !== 0)
                            .reduce((acc, curr) => acc + ' ' + curr)
                    }}
                    <i class="fa-solid fa-download ml-1"></i>
                </span>
                <button
                    type="button"
                    @click="() => removeExistingFile(file)"
                    class="ml-2 text-red-500 hover:text-red-700"
                    :test-id="`remove-existing-file-${file}`"
                    v-if="!readonly"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>

        <div v-if="removedFiles.length > 0" class="mt-4">
            <label class="text-sm text-neutral-600 font-medium">Removed Files</label>
            <div
                v-for="file in removedFiles"
                :key="file"
                class="flex items-center p-2 border border-red-200 rounded-md bg-red-50 my-1"
            >
                <i class="fa-regular fa-file-pdf text-red-500"></i>
                <span class="ml-2 text-red-700 flex-1">
                    {{
                        file
                            .split('_')
                            .filter((_, index) => index !== 0)
                            .reduce((acc, curr) => acc + ' ' + curr)
                    }}
                </span>
                <button
                    type="button"
                    @click="() => restoreFile(file)"
                    class="ml-2 text-green-500 hover:text-green-700"
                    title="Restore file"
                >
                    <i class="fa-solid fa-undo"></i>
                </button>
            </div>
        </div>

        <div v-if="modelValue && modelValue.length > 0" class="mt-4">
            <label class="text-sm text-neutral-600 font-medium">New Files</label>
            <div
                v-for="(file, index) in modelValue"
                :key="index"
                class="flex items-center p-3 border border-neutral-200 rounded-md bg-neutral-50 my-1"
            >
                <i class="fa-regular fa-file-pdf text-neutral-500"></i>
                <span class="ml-2 flex-1"> {{ file.name }}</span>
                <button
                    type="button"
                    @click="() => removeNewFile(index)"
                    class="ml-2 text-neutral-500 hover:text-neutral-700"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>

        <div
            class="mt-3 border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center"
            v-if="!readonly"
        >
            <i class="fa-solid fa-cloud-arrow-up text-4xl text-neutral-400 mb-2"></i>
            <p class="text-sm text-neutral-500">Upload document file</p>
            <input
                type="file"
                @change="handleFileUpload"
                class="hidden"
                :id="inputId"
                :accept="accept"
                :multiple="true"
            />
            <label
                :for="inputId"
                class="mt-2 px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer inline-block"
            >
                Browse Files
            </label>
            <p class="text-sm text-neutral-500">Acceptable file types: {{ accept }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { apiGet } from '@/util/api'
import { ref, defineProps, defineEmits } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'

const authStore = useAuthStore()
const toast = useToast()

const props = defineProps({
    files: {
        type: Array as () => string[],
        default: () => []
    },
    downloadUrl: {
        type: String,
        default: ''
    },
    accept: {
        type: String,
        default: '.pdf,.doc,.docx,.xls,.xlsx'
    },
    inputId: {
        type: String,
        default: 'file-upload'
    },
    readonly: {
        type: Boolean,
        default: false
    },
    maxSizeMB: {
        type: Number,
        default: 10
    }
})

const getMaxFileSize = () => props.maxSizeMB * 1024 * 1024
const FORBIDDEN_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'js', 'msi', 'com', 'scr', 'pif', 'cpl', 'jar', 'vbs', 'wsf', 'ps1']

const emit = defineEmits(['update:removedFiles'])

const modelValue = defineModel<File[]>()
const removedFiles = ref<string[]>([])

const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files) {
        const files = Array.from(input.files)
        const allowed = props.accept
            .split(',')
            .map(ext => ext.replace('.', '').toLowerCase().trim())
            .filter(Boolean)
        const maxSize = getMaxFileSize()
        const validFiles: File[] = []
        files.forEach(file => {
            const ext = file.name.split('.').pop()?.toLowerCase()
            if (file.size > maxSize) {
                toast.showToast(
                    'Error',
                    `File "${file.name}" is too large. Maximum allowed size is ${props.maxSizeMB}MB.`,
                    'error'
                )
                return
            }
            if (ext && FORBIDDEN_EXTENSIONS.includes(ext)) {
                toast.showToast(
                    'Error',
                    `File type "${ext}" is not allowed for security reasons.`,
                    'error'
                )
                return
            }
            if (!ext || !allowed.includes(ext)) {
                toast.showToast(
                    'Error',
                    `File type "${ext || ''}" is not allowed. Allowed: ${allowed.join(', ')}`,
                    'error'
                )
                return
            }
            validFiles.push(file)
        })
        if (validFiles.length > 0) {
            modelValue.value = [...(modelValue.value || []), ...validFiles]
        }
        // Reset input so same file can be reselected if needed
        input.value = ''
    }
}

const removeNewFile = (index: number) => {
    if (modelValue.value) {
        modelValue.value = modelValue.value.filter((_, i) => i !== index)
    }
}

const removeExistingFile = (file: string) => {
    removedFiles.value.push(file)
    emit('update:removedFiles', removedFiles.value)
}

const restoreFile = (file: string) => {
    removedFiles.value = removedFiles.value.filter((f) => f !== file)
    emit('update:removedFiles', removedFiles.value)
}

const downloadFile = async (file?: string) => {
    try {
        const response = await apiGet<string>(
            `/files/${encodeURIComponent(file || props.downloadUrl)}`,
            authStore
        )

        const link = document.createElement('a')
        link.href = response
        document.body.appendChild(link)
        link.target = '_blank'
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error('Error downloading document:', error)
        toast.showToast('Error', 'Failed to download document', 'error')
    }
}
</script>
