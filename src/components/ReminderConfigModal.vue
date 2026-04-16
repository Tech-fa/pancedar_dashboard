<template>
    <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">
                Reminder Configurations for "{{ snakeToCamelCase(selectedEventType) }}"
            </h2>
            <button @click="onCancel" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <!-- Add New Reminder Config -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Add New Reminder</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Days</label>
                    <AppInput
                        v-model="newReminderConfig.days"
                        type="number"
                        :hide-icon="true"
                        placeholder="e.g., 7"
                        min="0"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                    <Select2
                        v-model="newReminderConfig.direction"
                        :values="directionOptions"
                        :display="(option: any) => option.label"
                        placeholder="Select direction"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Field</label>
                    <Select2
                        v-model="newReminderConfig.field"
                        :values="fieldOptions"
                        :display="(option: any) => option.label"
                        placeholder="Select field"
                    />
                </div>
            </div>

            <!-- Recipients Section -->
            <div class="mt-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                        >Recipient Type</label
                    >
                    <Select2
                        v-model="newReminderConfig.recepientType"
                        :values="availableRecipientTypes"
                        placeholder="Select recipient type"
                        :display="(value: RecipientType) => recipientTypeLabels[value]"
                    />
                </div>

                <div v-if="newReminderConfig.recepientType === 'selected_users'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Select Users</label>
                    <SearcheableMultiSelect
                        v-model="newReminderConfig.selectedUsers"
                        :results="availableUsers"
                        placeholder="Search users..."
                        :display="(user: User) => `${user.fname} ${user.lname}`"
                    />
                </div>
            </div>

            <div class="mt-4 flex justify-end">
                <AppButton
                    buttonStyle="primary"
                    type="button"
                    :loading="loading"
                    @click="addReminderConfig"
                    :disabled="
                        !newReminderConfig.days ||
                        newReminderConfig.days < 0 ||
                        !newReminderConfig.recepientType
                    "
                >
                    Add
                </AppButton>
            </div>
        </div>

        <!-- Existing Reminder Configs -->
        <div>
            <h3 class="text-lg font-semibold mb-3">Existing Reminders</h3>
            <div v-if="reminderConfigs.length === 0" class="text-gray-500 text-center py-8">
                No reminder configurations found for this event type.
            </div>
            <div v-else class="space-y-3">
                <div
                    v-for="config in reminderConfigs"
                    :key="config.id"
                    class="p-4 border border-gray-200 rounded-lg"
                >
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="text-sm flex gap-2 mb-2">
                                <span class="font-medium">{{ config.days }} days</span>
                                <span class="text-gray-500">{{ config.direction }}</span>
                                <span class="text-gray-500 font-bold">{{
                                    config.field === 'startDate' ? 'start date' : 'end date'
                                }}</span>
                            </div>
                            <div class="text-sm text-gray-600">
                                <span class="font-medium">Recipients:</span>
                                <span class="ml-1">{{ getRecipientDisplayText(config) }}</span>
                            </div>
                        </div>
                        <button
                            @click="deleteReminderConfig(config.id)"
                            class="text-red-600 hover:text-red-800 text-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { apiGet, apiPost, apiDelete } from '../util/api'
import AppInput from './AppInput.vue'
import Select2 from './Select2.vue'
import SearcheableMultiSelect from './SearcheableMultiSelect.vue'
import AppButton from './AppButton.vue'
import { snakeToCamelCase } from '@/util/util'
import type {
    CreateEventReminderConfigDto,
    EventReminderConfigResponseDto,
    RecipientType,
    User
} from '@/util/interfaces'

// Types

const props = defineProps<{ selectedEventType: string; onCancel: () => void }>()

// Reactive state
const authStore = useAuthStore()
const reminderConfigs = ref<EventReminderConfigResponseDto[]>([])
const loading = ref(false)
const availableUsers = ref<User[]>([])

// Options for Select2 components
const directionOptions: { value: 'before' | 'after'; label: string }[] = [
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' }
]

const fieldOptions = [
    { value: 'startDate', label: 'Start Date' },
    { value: 'endDate', label: 'End Date' }
]

const recipientTypeLabels: Record<RecipientType, string> = {
    all_users_with_permission: 'All Users with Permission',
    selected_users: 'Selected Users',
    organization_owner: 'Organization Unit Owner (level 1)',
    all_organization_owners: 'All Organization Unit Owners'
}

const availableRecipientTypes = computed<RecipientType[]>(() => {
    // For now, return all types. This could be filtered based on scope like in ChangeRecipients.vue
    return [
        'all_users_with_permission',
        'selected_users',
        'organization_owner',
        'all_organization_owners'
    ]
})

// New reminder config form
const newReminderConfig = ref<CreateEventReminderConfigDto>({
    eventType: props.selectedEventType,
    days: 1,
    direction: { value: 'before', label: 'Before' },
    field: { value: 'startDate', label: 'Start Date' },
    recepientType: 'all_users_with_permission',
    selectedUsers: []
})

// Methods
const fetchUsers = async () => {
    try {
        const users = await apiPost<User[]>(
            '/permissions/clients/access',
            {
                subject: 'event'
            },
            authStore
        )
        availableUsers.value = users
    } catch (error) {
        console.error('Error fetching users:', error)
    }
}

const fetchReminderConfigs = async (eventType: string) => {
    try {
        const response = await apiGet<EventReminderConfigResponseDto[]>(
            `/events/reminder-configs/event-type/${eventType}`,
            authStore
        )
        reminderConfigs.value = response || []
    } catch (error) {
        console.error('Error fetching reminder configs:', error)
    }
}

const resetNewReminderConfig = () => {
    newReminderConfig.value = {
        eventType: props.selectedEventType,
        days: 1,
        direction: { value: 'before', label: 'Before' },
        field: { value: 'startDate', label: 'Start Date' },
        recepientType: 'all_users_with_permission',
        selectedUsers: []
    }
}

const addReminderConfig = async () => {
    loading.value = true
    try {
        // Get the actual values from the selected options
        const configToAdd = {
            eventType: newReminderConfig.value.eventType,
            days: newReminderConfig.value.days,
            direction: newReminderConfig.value.direction.value,
            field: newReminderConfig.value.field.value,
            recepientType: newReminderConfig.value.recepientType,
            selectedUsers: newReminderConfig.value.selectedUsers.map((user) => user.id)
        }

        await apiPost<{ data: EventReminderConfigResponseDto }>(
            '/events/reminder-configs',
            configToAdd,
            authStore
        )
        await fetchReminderConfigs(props.selectedEventType)
        resetNewReminderConfig()
    } catch (error) {
        console.error('Error adding reminder config:', error)
    } finally {
        loading.value = false
    }
}

const deleteReminderConfig = async (configId: string) => {
    try {
        await apiDelete(`/events/reminder-configs/${configId}`, authStore)
        await fetchReminderConfigs(props.selectedEventType)
    } catch (error) {
        console.error('Error deleting reminder config:', error)
    }
}

const getRecipientDisplayText = (config: EventReminderConfigResponseDto): string => {
    if (config.recepientType === 'selected_users') {
        if (config.recipients && config.recipients.length > 0) {
            return config.recipients.map((r) => `${r.user.fname} ${r.user.lname}`).join(', ')
        }
        return 'No users selected'
    }
    return recipientTypeLabels[config.recepientType as RecipientType] || config.recepientType
}

const onCancel = () => {
    props.onCancel()
}

// Lifecycle
onMounted(async () => {
    await Promise.all([fetchReminderConfigs(props.selectedEventType), fetchUsers()])

    // Set initial values for Select2 components
    newReminderConfig.value.direction =
        directionOptions.find((opt) => opt.value === 'before') || directionOptions[0]
    newReminderConfig.value.field =
        fieldOptions.find((opt) => opt.value === 'startDate') || fieldOptions[0]
})
</script>
