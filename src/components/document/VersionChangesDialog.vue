<template>
    <div class="bg-main rounded-lg shadow-lg w-[500px] border border-main">
        <div class="p-6 border-b">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-code-compare text-neutral-700 text-xl"></i>
                    <h2 class="text-lg font-semibold text-opposite">
                        Version {{ props.version?.versionNumber }} Changes
                    </h2>
                </div>
                <button @click="handleCancel" class="text-neutral-400 hover:text-neutral-600">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
        </div>

        <div class="p-6">
            <div class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-opposite/70 mb-2">Created</label>
                    <p class="text-neutral-900">{{ formatDate(props.version?.createdAt || 0) }}</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-opposite/70 mb-2">Changes Made</label>
                    <div v-if="props.version?.changes" class="bg-main p-4 rounded-lg">
                        <p class="whitespace-pre-wrap text-sm text-opposite">{{ props.version.changes }}</p>
                    </div>
                    <div v-else class="bg-main p-4 rounded-lg text-center text-opposite/70">
                        <i class="fa-solid fa-info-circle mr-2"></i>
                        No changes recorded for this version
                    </div>
                </div>
            </div>
        </div>

        <div class="p-6 border-t bg-neutral-50 flex justify-end gap-3">
            <AppButton
                type="button"
                buttonStyle="secondary"
                @click="handleCancel"
            >
                Close
            </AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import AppButton from '../AppButton.vue'
import type { Document } from '@/util/interfaces'

interface Props {
    version: Document['versions'][number] | null
    onCancel?: () => void
}

const props = defineProps<Props>()

const handleCancel = () => {
    if (props.onCancel) {
        props.onCancel()
    }
}

const formatDate = (timestamp: number | string) => {
    if (!timestamp) return ''

    const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp
    if (isNaN(numericTimestamp)) {
        console.error('Invalid timestamp:', timestamp)
        return 'Invalid Date'
    }
    const date = new Date(numericTimestamp)
    if (isNaN(date.getTime())) {
        console.error('Invalid date created from timestamp:', numericTimestamp)
        return 'Invalid Date'
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script> 