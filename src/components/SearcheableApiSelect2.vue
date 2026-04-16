<template>
    <div class="relative w-full" id="searcheable-api-select2-dropdown">
        <div>
            <MagnifyingGlassIcon
                class="w-4 h-4 absolute top-3 left-2 dark:text-white text-opposite"
            />
            <input
                type="text"
                :placeholder="placeholder"
                :value="model ? display(model) : query.trim() || undefined"
                :class="`${INPUT_CLASS} pl-8 text-black ${error ? 'ring-red-500' : ''}`"
                @input="(e) => updateQuery((e.target as HTMLInputElement).value)"
                @blur="query = ''"
                @focus="isOpen = true"
            />
            <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
                @click="toggleDropdown"
            >
                <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </button>
        </div>

        <div
            v-if="isOpen"
            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-main py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50"
        >
            <div
                v-if="values.length === 0"
                class="relative cursor-default select-none px-4 py-2 text-opposite/50"
            >
                Nothing found.
            </div>

            <ul>
                <li
                    v-for="result in values"
                    :key="result.id"
                    @click="selectOption(result)"
                    @keydown.enter="selectOption(result)"
                    tabindex="0"
                    class="relative cursor-default select-none py-2 pl-6 pr-4"
                    :class="{
                        ' bg-gray-700 text-opposite': 
                            hoveredOption === result.id,
                        'text-opposite ': hoveredOption !== result.id
                    }"
                    @mouseover="hoveredOption = result.id"
                    @mouseleave="hoveredOption = null"
                >
                    <span
                        class="block truncate"
                        :class="{
                            'font-medium': model?.id === result.id,
                            'font-normal': model?.id !== result.id
                        }"
                    >
                        {{ display(result) }}
                    </span>
                    <span
                        v-if="model?.id === result.id"
                        class="absolute inset-y-0 left-0 flex items-center pl-2"
                        :class="{
                            'dark:text-white text-black': hoveredOption === result.id,
                            'text-teal-600': hoveredOption !== result.id
                        }"
                    >
                        <CheckIcon class="h-3 w-3" aria-hidden="true" />
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
    values: { [key: string]: any }[]
    placeholder: string
    display: Function
    changeQuery: Function
    extraAction?: Function
    externalSelect?: boolean
    error?: boolean
}>()

import { MagnifyingGlassIcon, CheckIcon } from '@heroicons/vue/20/solid'
import { ChevronUpDownIcon } from '@heroicons/vue/24/outline'
import { INPUT_CLASS } from './contants'

const query = ref('')
const isOpen = ref(false)
const hoveredOption = ref<string | number | null>(null)
const model = defineModel<any>()


const updateQuery = (value: string) => {
    query.value = value
}

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        query.value = ' ' // Trigger value change to load results
    } else {
        query.value = ''
    }
}

const selectOption = (result: any) => {
    if (props.externalSelect) {
        props.extraAction?.(result)
        isOpen.value = false
        return
    }
    model.value = result
    isOpen.value = false
    query.value = ''
    props.extraAction?.(result)
}

// Close dropdown when clicking outside
const clickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('#searcheable-api-select2-dropdown')) {
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

watch(query, () => props.changeQuery(query.value))
</script>
