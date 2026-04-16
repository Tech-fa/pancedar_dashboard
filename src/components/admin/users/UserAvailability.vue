<template>
    <div class="p-6 space-y-6">
        <!-- Add Vacation Form -->
        <div class="bg-main rounded-lg p-4 border">
            <h3 class="text-sm font-medium text-opposite mb-4">Add Days Off</h3>
            <div class="flex items-end gap-4 flex-wrap">
                <div class="space-y-1">
                    <label class="block text-sm text-opposite/70">Start Date</label>
                    <AppInput
                        v-model="newVacation.startDate"
                        type="date"
                        :hide-icon="true"
                        class="min-w-[180px]"
                    />
                </div>
                <div class="space-y-1">
                    <label class="block text-sm text-opposite/70">End Date</label>
                    <AppInput
                        v-model="newVacation.endDate"
                        type="date"
                        :hide-icon="true"
                        class="min-w-[180px]"
                    />
                </div>
                <div v-if="calculatedDays > 0" class="text-sm text-opposite/70 pb-2">
                    {{ calculatedDays }} day{{ calculatedDays !== 1 ? 's' : '' }}
                </div>
                <AppButton
                    buttonStyle="primary"
                    type="button"
                    @click="addVacation"
                    :loading="isAdding"
                    :disabled="!newVacation.startDate || !newVacation.endDate"
                    class="flex items-center gap-2"
                >
                    <i class="fa-solid fa-plus"></i>
                    Add
                </AppButton>
            </div>
        </div>

        <!-- Upcoming / Current -->
        <div v-if="upcomingVacations.length > 0">
            <h3 class="text-sm font-medium text-opposite mb-3">Upcoming & Current</h3>
            <div class="flex flex-wrap gap-3">
                <div
                    v-for="v in upcomingVacations"
                    :key="v.id"
                    class="flex items-center gap-3 rounded-lg border border-secondary bg-main px-4 py-3"
                >
                    <i class="fa-solid fa-calendar-day text-blue-500"></i>
                    <div class="text-sm">
                        <span class="font-medium text-opposite">{{ formatDateToDay(+v.startDate) }}</span>
                        <span class="text-opposite/50 mx-1">&rarr;</span>
                        <span class="font-medium text-opposite">{{ formatDateToDay(+v.endDate) }}</span>
                        <span class="ml-2 text-opposite/60">({{ v.numOfDays }} day{{ v.numOfDays !== 1 ? 's' : '' }})</span>
                    </div>
                    <button
                        type="button"
                        class="ml-2 text-red-400 hover:text-red-600 transition-colors"
                        @click="confirmDelete(v)"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Past -->
        <div v-if="pastVacations.length > 0">
            <h3 class="text-sm font-medium text-opposite mb-3">Past</h3>
            <div class="flex flex-wrap gap-3">
                <div
                    v-for="v in pastVacations"
                    :key="v.id"
                    class="flex items-center gap-3 rounded-lg border bg-main px-4 py-3 opacity-70"
                >
                    <i class="fa-solid fa-calendar-check text-neutral-400"></i>
                    <div class="text-sm">
                        <span class="font-medium text-opposite">{{ formatDate(v.startDate) }}</span>
                        <span class="text-opposite/50 mx-1">&rarr;</span>
                        <span class="font-medium text-opposite">{{ formatDate(v.endDate) }}</span>
                        <span class="ml-2 text-opposite/60">({{ v.numOfDays }} day{{ v.numOfDays !== 1 ? 's' : '' }})</span>
                    </div>
                    <button
                        type="button"
                        class="ml-2 text-red-400 hover:text-red-600 transition-colors"
                        @click="confirmDelete(v)"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        </div>

        <div
            v-if="!loading && upcomingVacations.length === 0 && pastVacations.length === 0"
            class="text-center py-8 text-opposite/50"
        >
            No days off recorded yet.
        </div>

        <div v-if="loading && vacations.length === 0" class="flex items-center justify-center py-8">
            <Spinner width="30" height="30" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiGet, apiPost, apiDelete } from '@/util/api'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import { formatDate, formatDateToDay } from '@/util/util'
import type { Vacation } from '@/util/interfaces'
import AppButton from '@/components/AppButton.vue'
import AppInput from '@/components/AppInput.vue'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps<{
    userId: string
}>()

const authStore = useAuthStore()
const toast = useToast()
const dialogStore = useDialog()

const vacations = ref<Vacation[]>([])
const loading = ref(false)
const isAdding = ref(false)
const newVacation = ref({ startDate: '', endDate: '' })

const now = Date.now()

const calculatedDays = computed(() => {
    if (!newVacation.value.startDate || !newVacation.value.endDate) return 0
    const start = new Date(newVacation.value.startDate).getTime()
    const end = new Date(newVacation.value.endDate).getTime()
    if (end <= start) return 0
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
})

const upcomingVacations = computed(() =>
    vacations.value.filter((v) => v.endDate >= now)
)

const pastVacations = computed(() =>
    vacations.value.filter((v) => v.endDate < now)
)

const fetchVacations = async () => {
    loading.value = true
    try {
        const response = await apiGet<Vacation[]>(
            `/users/${props.userId}/vacations`,
            authStore
        )
        vacations.value = response
    } catch (err) {
        console.error(err)
        toast.showToast('Error', 'Failed to fetch vacations', 'error')
    } finally {
        loading.value = false
    }
}

const addVacation = async () => {
    if (!newVacation.value.startDate || !newVacation.value.endDate) return

    const startDate = new Date(newVacation.value.startDate).getTime()
    const endDate = new Date(newVacation.value.endDate).getTime()

    if (endDate <= startDate) {
        toast.showToast('Error', 'End date must be after start date', 'error')
        return
    }

    isAdding.value = true
    try {
        await apiPost(
            `/users/${props.userId}/vacations`,
            { startDate, endDate, userId: props.userId },
            authStore
        )
        toast.showToast('Success', 'Days off added successfully', 'success')
        newVacation.value = { startDate: '', endDate: '' }
        await fetchVacations()
    } catch (err: any) {
        toast.showToast(
            'Error',
            err?.response?.data?.message || 'Failed to add days off',
            'error'
        )
    } finally {
        isAdding.value = false
    }
}

const confirmDelete = (vacation: Vacation) => {
    dialogStore.openDialog(ConfirmDialog, {
        message: `Are you sure you want to delete this vacation (${formatDate(vacation.startDate)} - ${formatDate(vacation.endDate)})?`,
        onConfirm: async () => {
            dialogStore.closeDialog()
            await deleteVacation(vacation.id)
        },
        onCancel: () => dialogStore.closeDialog()
    })
}

const deleteVacation = async (vacationId: number) => {
    try {
        await apiDelete(`/users/${props.userId}/vacations/${vacationId}`, authStore)
        toast.showToast('Success', 'Vacation deleted successfully', 'success')
        await fetchVacations()
    } catch (err: any) {
        toast.showToast(
            'Error',
            err?.response?.data?.message || 'Failed to delete vacation',
            'error'
        )
    }
}

onMounted(() => {
    fetchVacations()
})
</script>
