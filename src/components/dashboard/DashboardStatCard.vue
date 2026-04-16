<template>
    <a :href="link" class="block transform transition hover:scale-105 mx-8 text-black">
        <div class="rounded-xl p-6 flex flex-col items-center">
            <div
                :class="[
                    'octagon1 w-52 h-52  flex flex-col items-center justify-center mb-4',
                    white ? 'bg-white' : 'bg-gray-200'
                ]"
            >
                <img :src="image" :alt="title" class="w-16 h-16" />
                <CountUp :end-val="count || 0" :duration="2" class="text-lg font-bold mt-2" />
                <p class="text-lg text-gray-600 font-semibold">{{ title }}</p>
            </div>
        </div>
    </a>
</template>

<script setup lang="ts">

import CountUp from 'vue-countup-v3'
defineProps({
    title: String,
    count: Number,
    image: String,
    link: String,
    white: Boolean
})
</script>

<style scoped>
.octagon {
    clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}
</style>
