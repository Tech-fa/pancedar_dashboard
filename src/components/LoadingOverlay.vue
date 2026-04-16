<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-[999] bg-white/80 dark:bg-gray-900/80">
      <div class="flex flex-col items-center">
        <div class="spinner h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <div class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Loading...</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 