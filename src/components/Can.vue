<template>
    <template v-if="hasPermission">
        <slot />
    </template>
    <template v-else-if="showIfNoPermission">
        <span>You don't have permission to access this module</span>
    </template>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
const authStore = useAuthStore()
const props = defineProps<{
    subject?: string
    actions: string[]
    subjects?: string[]
    showIfNoPermission?: boolean
}>()

const hasPermission = computed(() => {
    if (!props.subject && !props.subjects) {
        return true
    }
    const subjects = props.subjects || [props.subject as string]
    return subjects.some((subject) =>
        authStore.hasPermissions({ subject: subject as string, actions: props.actions })
    )
})
</script>
