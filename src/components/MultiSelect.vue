<template>
    <div class="w-full">
        <div class="w-full flex flex-row flex-wrap">
            <div
                class="p-1 rounded-xl dark:bg-gray-700 bg-gray-300 flex flex-row my-1 text-xs dark:text-gray-100 ml-1"
                v-for="select in model"
            >
                {{ display(select) }}
                <XMarkIcon class="w-3 ml-3 cursor-pointer" @click="remove(select)" />
            </div>
        </div>
        <div class="relative" id="multi-select-dropdown">
            <div>
                <button
                    type="button"
                    :class="`${INPUT_CLASS} pl-2 pr-4 text-left`"
                    @click="toggleDropdown"
                >
                    {{ placeholder }}
                    <span class="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                </button>
            </div>
            <transition
                leave="transition ease-in duration-100"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div
                    v-if="isOpen"
                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-main py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50"
                >
                    <div
                        v-if="filteredValues.length === 0"
                        class="relative cursor-default select-none px-4 py-2 text-opposite"
                    >
                        Nothing found.
                    </div>

                    <ul>
                        <li
                            v-for="result in filteredValues"
                            :key="result.id"
                            @click="handleSelect(result)"
                            @keydown.enter="handleSelect(result)"
                            tabindex="0"
                            class="hover:bg-gray-300 cursor-pointer relative select-none py-2 pl-10 pr-4 text-opposite"
                        >
                            <span class="block truncate font-medium">
                                {{ display(result) }}
                            </span>
                        </li>
                    </ul>
                </div>
            </transition>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

const model = defineModel<any>()
const props = defineProps<{
    values: any[]
    placeholder: string
    display: Function
}>()

import { XMarkIcon } from '@heroicons/vue/20/solid'
import { INPUT_CLASS } from './contants'
import { ChevronUpDownIcon } from '@heroicons/vue/24/outline'

const isOpen = ref(false)

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

const remove = (select: any) => {
    model.value = model.value.filter((v: any) => v !== select)
}

const handleSelect = (result: any) => {
    if (!model.value.includes(result)) {
        model.value = [...model.value, result]
    }
    isOpen.value = false
}

// Close dropdown when clicking outside
const clickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('#multi-select-dropdown')) {
        isOpen.value = false
    }
}

// Lifecycle hooks
onMounted(() => {
    document.addEventListener('click', clickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', clickOutside)
})

const filteredValues = computed(() =>
    props.values.filter(
        (v) => !model.value.map((m: any) => props.display(m)).includes(props.display(v))
    )
)
</script>
