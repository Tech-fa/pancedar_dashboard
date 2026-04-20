<template>
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-medium">Add Permission Groups</h2>
            <button class="text-neutral-500 hover:text-neutral-700" @click="onCancel">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>

        <div class="mb-4">
            <input
                v-model="searchTerm"
                test-id="add-group-search-input"
                type="text"
                placeholder="Search groups..."
                class="w-full px-3 py-2 border rounded-lg"
            />
        </div>

        <div class="max-h-96 overflow-y-auto space-y-2">
            <div
                v-for="group in filteredGroups"
                :key="group.id"
                class="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50"
            >
                <div class="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        :id="'group-' + group.id"
                        v-model="selectedGroups"
                        :value="group.id"
                        :test-id="'add-group-checkbox-' + group.id"
                    />
                    <label :for="'group-' + group.id" class="flex items-center space-x-2">
                        <i class="fa-solid fa-users text-neutral-500"></i>
                        <span>{{ group.name }}</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="flex justify-end space-x-4 mt-6">
            <AppButton button-style="secondary" @click="onCancel" test-id="add-group-cancel">
                Cancel
            </AppButton>
            <AppButton button-style="primary" @click="onAdd" test-id="add-group-add">
                Add Selected Groups
            </AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PermissionGroup } from '../permissions/permission.interface'
import AppButton from '@/components/AppButton.vue'

const props = defineProps<{
    availableGroups: PermissionGroup[]
    existingGroups: PermissionGroup[]
    onSuccess: (groups: PermissionGroup[]) => void
    onCancel: () => void
}>()

const searchTerm = ref('')
const selectedGroups = ref<number[]>([])

const filteredGroups = computed(() => {
    const searchTermLower = searchTerm.value.toLowerCase()
    return props.availableGroups.filter(
        (group) =>
            !props.existingGroups.some((pg) => pg.id === group.id) &&
            group.name.toLowerCase().includes(searchTermLower)
    )
})

const onAdd = () => {
    const groupsToAdd = props.availableGroups.filter((group) =>
        selectedGroups.value.includes(group.id)
    )
    props.onSuccess(groupsToAdd)
}
</script>
