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
        <div class="relative mt-1" id="searcheable-api-multi-select-dropdown">
            <div>
                <MagnifyingGlassIcon
                    class="w-4 h-4 absolute top-[33%] left-2 dark:text-gray-100 text-gray-600"
                />
                <input
                    type="text"
                    :placeholder="placeholder"
                    :class="`pl-10 pr-4 ${INPUT_CLASS}`"
                    @input="(e) => (query = (e.target as HTMLInputElement).value)"
                    @blur="query = ''"
                    @focus="isOpen = true"
                />
                <button
                    type="button"
                    class="absolute inset-y-0 right-0 flex items-center pr-2"
                    @click="toggleDropdown"
                >
                    <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
            </div>
            <transition
                leave="transition ease-in duration-100"
                leave-from="opacity-100"
                leave-to="opacity-0"
                class=""
                @after-leave="query = ''"
            >
                <div
                    v-if="isOpen"
                    :class="[
                        'absolute mt-1 w-full overflow-auto rounded-md  bg-main py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50',
                        props.maxHeight ? `max-h-${props.maxHeight} overflow-y-auto` : 'max-h-60'
                    ]"
                >
                    <div
                        v-if="filteredValues.length === 0"
                        class="relative cursor-default select-none px-4 py-2 text-opposite  "
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
                            class="hover:bg-secondary cursor-pointer relative  select-none py-2 pl-10 pr-4 text-opposite"
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
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
    results: { [key: string]: any }[]
    placeholder: string
    display: Function
    changeQuery: Function
    maxHeight?: string
}>()

import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import { ChevronUpDownIcon } from '@heroicons/vue/24/outline'
import { INPUT_CLASS } from './contants'

const query = ref('')
const isOpen = ref(false)
const model = defineModel<any>()

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        query.value = ' ' // Trigger value change to load results when opening dropdown
    }
}

const remove = (select: any) => {
    model.value = model.value.filter((v: any) => v !== select)
}

const handleSelect = (result: any) => {
    if (!model.value.includes(result)) {
        model.value.push(result)
    }
    isOpen.value = false
}

// Close dropdown when clicking outside
const clickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('#searcheable-api-multi-select-dropdown')) {
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

watch(query, () => {
    props.changeQuery(query.value)
})

const filteredValues = computed(() => props.results.filter((v) => !model.value.includes(v)))
</script>
