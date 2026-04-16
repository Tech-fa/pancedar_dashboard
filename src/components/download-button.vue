<template>
    <span
        @click="handleDownload"
        :class="[
            'inline-flex items-center gap-1 text-sm px-3 py-1 rounded border bg-main  text-opposite hover:bg-neutral-600 transition cursor-pointer',
            { 'opacity-50 cursor-not-allowed': loading || !filePath }
        ]"
        :title="!filePath ? 'No file available' : 'Download file'"
    >
        <span v-if="!loading">
            <i class="fa-solid fa-download"></i>
            Download
        </span>
        <span v-else>
           <Spinner />
        </span>
    </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiGet } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import Spinner from './Spinner.vue';

const props = defineProps<{
    filePath: string
    fileName?: string
}>()

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)

const handleDownload = async () => {
    if (!props.filePath || loading.value) return

    try {
        loading.value = true
        const response = await apiGet<string>(
            `/files/${encodeURIComponent(props.filePath)}`,
            authStore
        )

        const link = document.createElement('a')
        link.href = response
        link.download = props.fileName || props.filePath.split('/').pop() || 'download'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error('Error downloading file:', error)
        toast.showToast('Error', 'Failed to download file', 'error')
    } finally {
        loading.value = false
    }
}
</script>
