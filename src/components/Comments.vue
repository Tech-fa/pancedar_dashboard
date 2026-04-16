<template>
    <div id="comments" class="bg-secondary rounded-lg border border-main p-6">
        <h3 class="text-xl mb-4 text-opposite/70">Comments ({{ commentsCount || 0 }})</h3>
        <div class="mb-6">
            <AppTextarea placeholder="Add a comment..." v-model="commentText" test-id="comment-input" />
            <div class="mt-2">
            </div>
            <AppButton buttonStyle="primary" @click="handlePostComment" :loading="loading" :disabled="loading"
                test-id="post-comment-button">
                Post Comment
            </AppButton>
        </div>

        <div class="space-y-4">
            <div class="border-b border-neutral-200 pb-4" v-for="comment in comments" :key="comment.id">
                <div class="flex items-start gap-3">
                    <MemberIcon :member="{
                        fname: comment?.fname,
                        lname: comment?.lname,
                        image: '',
                        index: 0
                    }" />
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-opposite/80">{{ comment?.fname }} {{ comment?.lname }}</span>
                            <span class="text-sm text-opposite/50">{{
                                formatDate(comment?.createdDate)
                                }}</span>
                        </div>
                        <p class="text-opposite/80 mt-1">
                            {{ comment?.comment }}
                        </p>
                        <button @click="$emit('onDelete', comment.id)"
                            class="text-red-500 hover:text-red-700 text-sm mt-2" title="Delete comment">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppButton from './AppButton.vue'
import MemberIcon from './memberIcon.vue'
import { useToast } from '@/stores/notification'
import AppTextarea from './AppTextarea.vue';

const props = defineProps<{
    commentsCount?: number
    comments?: Array<{
        id: number | string
        fname: string
        lname: string
        comment: string
        createdDate: number
    }>
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'postComment', comment: string): void
    (e: 'onDelete', commentId: number | string): void
}>()

const commentText = ref('')
const toast = useToast()

const handlePostComment = () => {
    if (commentText.value) {
        emit('postComment', commentText.value)
        commentText.value = ''
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
        day: 'numeric'
    })
}
</script>