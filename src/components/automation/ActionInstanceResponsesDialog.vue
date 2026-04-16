<template>
    <div class="bg-main rounded-lg shadow-lg  w-[500px] flex flex-col border-2">
        <div class="p-6 border-b shrink-0">
            <div class="flex items-center justify-between">
                <h2 class="text-lg text-opposite">Responses — {{ instanceName }}</h2>
                <button @click="onClose" class="text-opposite hover:text-opposite">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
            <div v-if="loading" class="flex items-center justify-center py-8">
                <Spinner width="2" height="2" />
            </div>
            <div v-else-if="responses.length === 0"
                class="text-center py-8 text-opposite/40 text-sm">
                No responses recorded yet.
            </div>
            <div v-else class="space-y-3">
                <ExecutionResponseDisplay
                    v-for="resp in responses"
                    :key="resp.id"
                    :response="resp"
                    variant="compact"
                />
            </div>
        </div>

        <div class="p-6 border-t rounded-b-lg shrink-0">
            <div class="flex justify-end">
                <AppButton @click="onClose" buttonStyle="secondary">Close</AppButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Spinner from '@/components/Spinner.vue'
import AppButton from '@/components/AppButton.vue'
import ExecutionResponseDisplay from '@/components/ExecutionResponseDisplay.vue'
import { getResponses, type ResponseEntity } from '@/components/fleet/endpoints'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
    instanceId: string
    instanceName: string
    onClose: () => void
}>()

const authStore = useAuthStore()
const loading = ref(true)
const responses = ref<ResponseEntity[]>([])

onMounted(async () => {
    try {
        responses.value = await getResponses(authStore, {
            sourceId: props.instanceId,
            sourceType: 'connector_action_instances',
        })
    } catch {
        responses.value = []
    } finally {
        loading.value = false
    }
})
</script>
