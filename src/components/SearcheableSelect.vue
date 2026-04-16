<template>
    <div class="w-full">
        <div class="relative" id="searcheable-select-dropdown">
            <input type="text" :class="`${INPUT_CLASS} pl-2 ${error ? 'ring-red-500' : ''}`" :placeholder="placeholder"
                :value="model ? display(model) : ''" @input="(e) => query = (e.target as HTMLInputElement).value"
                @focus="isOpen = true" />
            <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-2" @click="isOpen = !isOpen">
                <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </button>

            <transition leave="transition ease-in duration-100" leave-from="opacity-100" leave-to="opacity-0"
                @after-leave="query = ''">
                <div v-if="isOpen" :class="[
                    'z-50 absolute mt-1 w-full overflow-auto rounded-md bg-main py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm',
                    props.maxHeight
                        ? `max-h-${props.maxHeight} overflow-y-auto`
                        : 'max-h-60'
                ]">
                    <div v-if="filteredValues.length === 0"
                        class="relative cursor-default select-none px-4 py-2 text-opposite">
                        Nothing found.
                    </div>

                    <ul>
                        <li v-for="value in filteredValues" :key="display(value)" @click="selectOption(value)"
                            @keydown.enter="selectOption(value)" @mouseover="hoveredOption = display(value)"
                            @mouseleave="hoveredOption = null" tabindex="0"
                            class="relative cursor-default select-none py-2 pl-6 pr-4" :class="{
                                'bg-gray-600 text-opposite':
                                    hoveredOption === display(value),
                                'text-opposite': hoveredOption !== display(value)
                            }" test-id="searcheable-select-option">
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
            </transition>
        </div>
    </div>
</template>
<script setup lang="ts">
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { INPUT_CLASS } from './contants'

const model = defineModel<any>()
const props = defineProps<{
    values: any[]
    placeholder?: string
    display: Function
    addedAction?: Function
    maxHeight?: number
    error?: boolean
}>()

watch(model, () => {
    if (props.addedAction) {
        props.addedAction()
    }
})
const query = ref('')
const isOpen = ref(false)
const hoveredOption = ref<string | number | null>(null)

const selectOption = (value: any) => {
    model.value = value
    isOpen.value = false
    if (props.addedAction) {
        props.addedAction()
    }
}

// Close dropdown when clicking outside
const clickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('#searcheable-select-dropdown')) {
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
    query.value === ''
        ? props.values
        : props.values.filter((v) =>
            props
                .display(v)
                .toLowerCase()
                .replace(/\s+/g, '')
                .includes(query.value.toLowerCase().replace(/\s+/g, ''))
        )
)
</script>
