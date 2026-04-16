<template>
    <img 
        :src="href" 
        :alt="alt" 
        :width="width"
        :height="height"
        class="cursor-pointer"
        v-if="href" 
        @click="openImage"
    />
    <Spinner v-else />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Spinner from './Spinner.vue'
import { apiGet } from '@/util/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
    src: string
    alt?: string
    width?: number | string
    height?: number | string
    imageClass?: string
}>()
const href = ref()
const openImage = () => {
    window.open(href.value, '_blank')
}
const authStore = useAuthStore()
const getImageHref = async () => {
    const response = await apiGet<string>(`/files/${encodeURIComponent(props.src)}`, authStore)
    href.value = response
}
onMounted(() => {
    getImageHref()
})
</script>
