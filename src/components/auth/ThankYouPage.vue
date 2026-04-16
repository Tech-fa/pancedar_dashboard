<template>
    <div
        id="thank-you-page"
        class="min-h-screen bg-secondary flex lg:flex-row flex-col items-center justify-center p-4"
    >
        <div
            class="max-w-xl w-full bg-main rounded-xl shadow-lg flex overflow-hidden text-opposite"
        >
            <div class="w-full p-8 lg:p-12 text-center">
                <div class="flex justify-center mb-4">
                    <img src="@/assets/img/logo-no-bg3.png" alt="Vigelon Logo" class="h-40" />
                </div>

                <transition appear name="bounce-in">
                    <div
                        class="w-20 h-20 bg-green-600 rounded-full mx-auto flex items-center justify-center mb-6"
                    >
                        <i class="fa-solid fa-check text-4xl text-white"></i>
                    </div>
                </transition>

                <h1 class="text-2xl text-opposite mb-4">Thank You for Registering!</h1>
                <p class="text-opposite text-lg mb-8">
                    Our team will review your request and get back to you soon.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
    const registerData = localStorage.getItem('registerData')
    if (registerData) {
        localStorage.removeItem('registerData')
    } else {
        router.push('/login')
    }
})
</script>

<style scoped>
.bounce-in-enter-active {
    animation: bounce-in 1s;
}
@keyframes bounce-in {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>
