<template>
    
    <div class="w-full bg-transparent border-none" v-if="!useSearch">
        <label v-if="label" class="block text-xs text-opposite/60 mb-1 ml-1">{{ label }}</label>

        <div class="relative" id="select2-dropdown">
            <button type="button" :class="`${INPUT_CLASS} text-left pl-4 pr-12`" @click="toggleDropdown">
                <span :class="`${model ? 'font-medium' : 'font-normal text-neutral-500'} block truncate`">
                    {{ model ? display(model) : placeholder }}
                </span>
                <span class="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button v-if="model && optional" @click.stop="clearSelection" class="flex items-center px-2">
                        <XMarkIcon class="h-5 w-5 text-gray-400 hover:text-gray-500" aria-hidden="true" />
                    </button>
                    <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
            </button>

            <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <div v-if="isOpen && values.length > 0"
                    class="z-50 absolute mt-1 w-full overflow-auto rounded-md bg-main py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                    :style="{
                        height: 'auto',
                        maxHeight: dropdownHeight || '15rem'
                    }">
                    <ul>
                        <li v-for="value in values" :key="display(value)" @click="selectOption(value)"
                            @keydown.enter="selectOption(value)" tabindex="0"
                            class="relative cursor-default select-none py-2 pl-6 pr-4" :class="{
                                'bg-secondary text-opposite': hoveredOption === display(value),
                                'text-opposite  ': hoveredOption !== display(value)
                            }" @mouseover="hoveredOption = display(value)" @mouseleave="hoveredOption = null"
                            :test-id="'select-option'">
                            <span class="block truncate" :class="{
                                'font-medium': display(model) === display(value),
                                'font-normal': display(model) !== display(value)
                            }">
                                {{ display(value) }}
                            </span>
                            <span v-if="display(model) === display(value)"
                                class="absolute inset-y-0 left-0 flex items-center pl-2" :class="{
                                    'dark:text-white text-black': hoveredOption === display(value),
                                    'text-teal-600': hoveredOption !== display(value)
                                }">

                                <CheckIcon class="h-3 w-3" aria-hidden="true" />
                            </span>
                        </li>
                    </ul>
                </div>
                <div v-else-if="values.length === 0 && isOpen"
                    class="z-50 absolute mt-1 w-full overflow-auto rounded-md bg-main text-opposite py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                    :style="{
                        height: dropdownHeight || 'auto',
                        maxHeight: dropdownHeight || '15rem'
                    }">
                    <div class="flex items-center justify-center h-full">
                        <div class="text-gray-500">No options available</div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
    <SearcheableSelect v-else v-model="model" :values="values" :display="display" :placeholder="placeholder"
        :optional="optional" :maxHeight="dropdownHeight ? parseInt(dropdownHeight) : undefined" />
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps<{
    values: any[]
    placeholder: string
    display: Function
    optional?: boolean
    label?: string
    dropdownHeight?: string
}>()
const model = defineModel<any>()

import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/vue/20/solid'
import { INPUT_CLASS } from './contants'
import { CheckIcon } from '@heroicons/vue/24/outline'
import SearcheableSelect from './SearcheableSelect.vue'

const isOpen = ref(false)
const hoveredOption = ref(null)


const useSearch = computed(() => props.values.length > 15)

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

const selectOption = (option: any) => {
    model.value = option
    isOpen.value = false
}

const clearSelection = (event: Event) => {
    event.stopPropagation()
    model.value = null
}

// Close dropdown when clicking outside
const clickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('#select2-dropdown')) {
        isOpen.value = false
    }
}

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        isOpen.value = false
    }
}

// Lifecycle hooks
onMounted(() => {
    document.addEventListener('click', clickOutside)
    document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
    document.removeEventListener('click', clickOutside)
    document.removeEventListener('keydown', handleKeyDown)
})
</script>
