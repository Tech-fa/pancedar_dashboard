<template>
    <div class="h-full">
        <div class="mt-8">
            <div class="overflow-hidden h-full">
                <div :class="`min-w-full py-2 align-middle px-1 flex flex-col items-center`">
                    <slot name="header" />
                    <div
                        id="filters"
                        class="mb-6 w-full"
                        v-if="
                            ((rows.length > 0 || searchVal || searchLoading) && onSearch) ||
                            !$slots['filters']
                        "
                    >
                        <div class="flex flex-col sm:flex-row gap-4">
                            <div
                                v-if="(rows.length > 0 || searchVal || searchLoading) && onSearch"
                                class="flex-1"
                            >
                                <div class="relative">
                                    <span v-if="!searchLoading">
                                        <component
                                            :is="
                                                h('i', {
                                                    class: 'fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400'
                                                })
                                            "
                                        />
                                    </span>

                                    <Spinner
                                        v-if="searchLoading"
                                        class="absolute left-3 top-1/2 -translate-y-1/2"
                                    />
                                    <AppInput
                                        @input="
                                            (e: any) => {
                                                onSearch?.(e.target.value)
                                                searchVal = e.target.value
                                            }
                                        "
                                        type="text"
                                        :placeholder="searchPlaceholder || 'Search users...'"
                                        :test-id="`${entityName.toLowerCase()}-search`"
                                    />
                                </div>
                            </div>
                            <slot name="extra-search" />

                        </div>
                    </div>
                    <slot name="filters" />
                    <div
                        class="bg-main shadow-sm overflow-x-auto w-full relative"
                        id="table-wrapper"
                    >
                        <table class="w-full">
                            <thead class="bg-secondary border-b lg:table-header-group hidden">
                                <tr>
                                    <!-- Drag handle column when drag is enabled -->
                                    <th
                                        v-if="enableDragAndDrop && hasDragAndDropPermission"
                                        scope="col"
                                        class="px-6 py-4 text-left text-sm bg-secondary text-opposite w-12"
                                    >
                                        Order
                                    </th>
                                    <th
                                        v-for="col in cols"
                                        :key="col"
                                        scope="col"
                                        class="px-6 py-4 text-left text-sm bg-secondary text-opposite select-none"
                                        :class="{
                                            'cursor-pointer': isColumnSortable(col)
                                        }"
                                        :test-id="`${col.toLowerCase()}-header`"
                                    >
                                        <button
                                            v-if="isColumnSortable(col)"
                                            type="button"
                                            class="flex items-center gap-2"
                                            @click="() => toggleSort(col)"
                                        >
                                            <span>{{ col }}</span>
                                            <span
                                                v-if="
                                                    resolveSortIcon(col) ==
                                                    'fa-solid fa-sort text-xs text-opposite/40'
                                                "
                                            >
                                                <i
                                                    class="fa-solid fa-sort text-xs text-opposite/40"
                                                ></i>
                                            </span>
                                            <span
                                                v-if="
                                                    resolveSortIcon(col) ==
                                                    'fa-solid fa-arrow-up text-xs'
                                                "
                                            >
                                                <i class="fa-solid fa-arrow-up text-xs"></i>
                                            </span>
                                            <span
                                                v-if="
                                                    resolveSortIcon(col) ==
                                                    'fa-solid fa-arrow-down text-xs'
                                                "
                                            >
                                                <i class="fa-solid fa-arrow-down text-xs"></i>
                                            </span>
                                        </button>
                                        <span v-else>{{ col }}</span>
                                    </th>

                                    <th
                                        scope="col"
                                        class="px-6 py-4 text-left text-sm text-opposite"
                                        test-id="actions-header"
                                        v-if="hasVisibleActions"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody
                                class="divide-y divide-opposite relative border-b border-opposite"
                            >
                                <tr
                                    class="hover:bg-secondary/100 text-opposite"
                                    v-for="(row, index) in rows"
                                    :key="row.id"
                                    id="table-body"
                                    :test-id="`${entityName.toLowerCase()}-row-${row.id}`"
                                    :class="{
                                        'opacity-50':
                                            enableDragAndDrop &&
                                            hasDragAndDropPermission &&
                                            draggedIndex === index,
                                        'border-blue-300 bg-blue-50':
                                            enableDragAndDrop &&
                                            hasDragAndDropPermission &&
                                            draggedIndex !== null &&
                                            draggedIndex !== index
                                    }"
                                    :draggable="enableDragAndDrop && hasDragAndDropPermission"
                                    @dragstart="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? handleDragStart(index, $event)
                                            : undefined
                                    "
                                    @dragover="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? $event.preventDefault()
                                            : undefined
                                    "
                                    @drop="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? handleDrop(index, $event)
                                            : undefined
                                    "
                                    @dragenter="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? $event.preventDefault()
                                            : undefined
                                    "
                                    @dragleave="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? $event.preventDefault()
                                            : undefined
                                    "
                                >
                                    <!-- Drag handle column when drag is enabled -->
                                    <td
                                        v-if="enableDragAndDrop && hasDragAndDropPermission"
                                        class="px-6 py-4 whitespace-nowrap"
                                    >
                                        <div class="flex items-center justify-center">
                                            <button
                                                type="button"
                                                class="text-neutral-400 hover:text-neutral-600 cursor-move p-1 rounded hover:bg-neutral-100 transition-colors"
                                                @mousedown="
                                                    hasDragAndDropPermission
                                                        ? handleDragStart(index, $event)
                                                        : undefined
                                                "
                                                title="Drag to reorder"
                                            >
                                                <i class="fa-solid fa-grip-vertical"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td
                                        v-for="(value, key) in filteredRow(row)"
                                        :key="key"
                                        class="break-wrods px-6 py-4"
                                    >
                                        <span
                                            v-if="
                                                typeof value != 'string' && typeof value != 'number'
                                            "
                                        >
                                            <component :is="value" />
                                        </span>
                                        <span v-else>
                                            <span v-if="key != 'Status'"> {{ value }}</span>
                                            <span
                                                v-if="key == 'Status'"
                                                :class="[
                                                    `px-2 py-1 text-sm rounded-full `,
                                                    mapStatusStyle?.(value as string) ||
                                                        'bg-neutral-100 text-neutral-800'
                                                ]"
                                                test-id="content-status"
                                            >
                                                {{ value }}</span
                                            >
                                        </span>
                                    </td>

                                    <td
                                        id="action_column"
                                        class="relative whitespace-nowrap px-6 py-4"
                                        v-if="hasVisibleActions"
                                    >
                                        <Can :subject="subject" :actions="['read']">
                                            <span
                                                v-if="
                                                    !hideView ||
                                                    !hideView(
                                                        row.id
                                                            ? entities.find((e) => e.id == row.id)
                                                            : entities[index]
                                                    )
                                                "
                                                :test-id="`${entityName.toLowerCase()}-view-${entities.find((e) => e.id == row.id)?.id}`"
                                                class="text-opposite hover:text-opposite/60 mr-4 cursor-pointer"
                                                @click="
                                                    (e: any) => {
                                                        e.stopPropagation()
                                                        const entity = row.id
                                                            ? entities.find((e) => e.id == row.id)
                                                            : entities[index]

                                                        if (onView && entity) {
                                                            onView(entity)
                                                            return
                                                        }

                                                        router.push(
                                                            viewPath?.(row) ||
                                                                `${router.currentRoute.value.path.replace(/\/$/, '')}/${row.id}`
                                                        )
                                                    }
                                                "
                                            >
                                                <i class="fa-solid fa-eye"></i
                                                ><span class="sr-only">, {{ row.id }}</span></span
                                            >
                                        </Can>
                                        <Can :subject="subject" :actions="['update']">
                                            <span
                                                @click="
                                                    (e: any) => {
                                                        e.stopPropagation()
                                                        if (onEdit) {
                                                            // For unsaved entities (without id), use index to find the correct entity
                                                            const entity = row.id
                                                                ? entities.find(
                                                                      (e) => e.id == row.id
                                                                  )
                                                                : entities[index]
                                                            onEdit(entity)
                                                        } else {
                                                            router.push(
                                                                editPath?.(row) ||
                                                                    `${router.currentRoute.value.path.replace(/\/$/, '')}/${row.id}/edit`
                                                            )
                                                        }
                                                    }
                                                "
                                                v-if="
                                                    !hideEdit ||
                                                    !hideEdit(
                                                        row.id
                                                            ? entities.find((e) => e.id == row.id)
                                                            : entities[index]
                                                    )
                                                "
                                                class="text-opposite hover:text-opposite/60 cursor-pointer mr-4"
                                                :test-id="`${entityName.toLowerCase()}-edit-${row.id}`"
                                            >
                                                <i class="fa-solid fa-pen-to-square"></i
                                                ><span class="sr-only">, {{ row.id }}</span></span
                                            >
                                        </Can>
                                        <Can :subject="subject" :actions="['delete']">
                                            <span
                                                @click="
                                                    (e: any) => {
                                                        e.stopPropagation()
                                                        if (handleDelete) {
                                                            if (row.id) {
                                                                handleDelete(
                                                                    entities.find(
                                                                        (e) => e.id == row.id
                                                                    )
                                                                )
                                                            } else {
                                                                handleDelete(index)
                                                            }
                                                        }
                                                    }
                                                "
                                                v-if="
                                                    !!handleDelete &&
                                                    (!hideDelete ||
                                                        !hideDelete(
                                                            row.id
                                                                ? entities.find(
                                                                      (e) => e.id == row.id
                                                                  )
                                                                : entities[index]
                                                        ))
                                                "
                                                class="dark:text-gray-300 text-700 hover:text-gray-400 cursor-pointer"
                                                :test-id="`${entityName.toLowerCase()}-delete-${row.id}`"
                                            >
                                                <i class="fa-solid fa-trash"></i
                                                ><span class="sr-only">, {{ row.id }}</span></span
                                            >
                                        </Can>

                                        <!-- Slot support for extra-field -->
                                        <span v-if="$slots['extra-field']">
                                            <slot
                                                name="extra-field"
                                                :entity="
                                                    row.id
                                                        ? entities.find((e) => e.id == row.id)
                                                        : entities[index]
                                                "
                                                :index="index"
                                                :row="row"
                                            />
                                        </span>
                                    </td>
                                </tr>
                                <tr
                                    v-for="(row, index) in rows"
                                    :key="row.id"
                                    id="hidden-body"
                                    class="flex flex-col curor-pointer w-full"
                                    :class="{
                                        'opacity-50':
                                            enableDragAndDrop &&
                                            hasDragAndDropPermission &&
                                            draggedIndex === index,
                                        'border-blue-300 bg-blue-50':
                                            enableDragAndDrop &&
                                            hasDragAndDropPermission &&
                                            draggedIndex !== null &&
                                            draggedIndex !== index
                                    }"
                                    :draggable="enableDragAndDrop && hasDragAndDropPermission"
                                    @dragstart="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? handleDragStart(index, $event)
                                            : undefined
                                    "
                                    @dragover="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? $event.preventDefault()
                                            : undefined
                                    "
                                    @drop="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? handleDrop(index, $event)
                                            : undefined
                                    "
                                    @dragenter="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? $event.preventDefault()
                                            : undefined
                                    "
                                    @dragleave="
                                        enableDragAndDrop && hasDragAndDropPermission
                                            ? $event.preventDefault()
                                            : undefined
                                    "
                                >
                                    <td class="w-full block">
                                        <!-- Drag handle for mobile view when drag is enabled -->
                                        <div
                                            v-if="enableDragAndDrop && hasDragAndDropPermission"
                                            class="w-full break-words py-4 pl-4 pr-3 text-xs font-medium text-opposite flex flex-row justify-between cursor-pointer"
                                        >
                                            <span>Order:</span>
                                            <div class="flex items-center">
                                                <button
                                                    type="button"
                                                    class="text-opposite hover:text-opposite/60 cursor-move p-1 rounded hover:bg-neutral-100 transition-colors"
                                                    @mousedown="
                                                        hasDragAndDropPermission
                                                            ? handleDragStart(index, $event)
                                                            : undefined
                                                    "
                                                    title="Drag to reorder"
                                                >
                                                    <i class="fa-solid fa-grip-vertical"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            v-for="(value, key) in filteredRow(row)"
                                            :key="key"
                                            class="w-full break-words py-4 pl-4 pr-3 text-xs font-medium text-opposite flex flex-row justify-between cursor-pointer"
                                        >
                                            <span>{{ key }}:</span>
                                            <span
                                                v-if="
                                                    typeof value != 'string' &&
                                                    typeof value != 'number'
                                                "
                                            >
                                                <component :is="value" />
                                            </span>
                                            <span v-else class="text-right font-bold pl-4">
                                                {{ value }}</span
                                            >
                                        </div>

                                        <Can :subject="subject" :actions="['read']">
                                            <div
                                                v-if="
                                                    !hideView ||
                                                    !hideView(
                                                        row.id
                                                            ? entities.find((e) => e.id == row.id)
                                                            : entities[index]
                                                    )
                                                "
                                                class="relative whitespace-nowrap py-4 pl-4 text-left text-xs font-medium pr-3"
                                                @click="
                                                    (e) => {
                                                        e.stopPropagation()
                                                        const entity = row.id
                                                            ? entities.find((e) => e.id == row.id)
                                                            : entities[index]

                                                        if (onView && entity) {
                                                            onView(entity)
                                                            return
                                                        }

                                                        router.push(
                                                            viewPath?.(row) ||
                                                                `${router.currentRoute.value.path.replace(/\/$/, '')}/${row.id}`
                                                        )
                                                    }
                                                "
                                            >
                                                <span
                                                    :test-id="`${entityName.toLowerCase()}-view-${entities[index]?.id}`"
                                                    class="text-opposite hover:text-opposite/60 cursor-pointer"
                                                >
                                                    <i class="fa-solid fa-eye"></i>
                                                    <span class="sr-only">, {{ row.id }}</span>
                                                </span>
                                            </div>
                                        </Can>
                                        <Can :subject="subject" :actions="['update']">
                                            <div
                                                v-if="
                                                    !hideEdit ||
                                                    !hideEdit(
                                                        row.id
                                                            ? entities.find((e) => e.id == row.id)
                                                            : entities[index]
                                                    )
                                                "
                                                class="relative whitespace-nowrap py-4 pl-4 text-left text-xs font-medium pr-3"
                                                @click="
                                                    (e) => {
                                                        e.stopPropagation()
                                                        if (onEdit) {
                                                            // For unsaved entities (without id), use index to find the correct entity
                                                            const entity = row.id
                                                                ? entities.find(
                                                                      (e) => e.id == row.id
                                                                  )
                                                                : entities[index]
                                                            onEdit(entity)
                                                        } else {
                                                            router.push(
                                                                editPath?.(row) ||
                                                                    `${router.currentRoute.value.path.replace(/\/$/, '')}/${row.id}/edit`
                                                            )
                                                        }
                                                    }
                                                "
                                            >
                                                <span
                                                    :test-id="`${entityName.toLowerCase()}-edit-${entities[index]?.id}`"
                                                    class="text-opposite hover:text-opposite/60 cursor-pointer"
                                                >
                                                    <i class="fa-solid fa-pen-to-square"></i>
                                                    <span class="sr-only">, {{ row.id }}</span>
                                                </span>
                                            </div>
                                        </Can>
                                        <Can :subject="subject" :actions="['delete']">
                                            <div
                                                class="relative whitespace-nowrap pl-4 text-left text-xs font-medium pr-3"
                                                v-if="
                                                    !!handleDelete &&
                                                    (!hideDelete ||
                                                        !hideDelete(
                                                            row.id
                                                                ? entities.find(
                                                                      (e) => e.id == row.id
                                                                  )
                                                                : entities[index]
                                                        ))
                                                "
                                                @click="
                                                    (e: any) => {
                                                        e.stopPropagation()
                                                        if (handleDelete) {
                                                            if (row.id) {
                                                                handleDelete(
                                                                    entities.find(
                                                                        (e) => e.id == row.id
                                                                    )
                                                                )
                                                            } else {
                                                                handleDelete(index)
                                                            }
                                                        }
                                                    }
                                                "
                                            >
                                                <span
                                                    class="relative whitespace-nowrap py-4 pl-4 text-left text-xs font-medium pr-3"
                                                    ><TrashIcon class="text-red-700 w-4" /><span
                                                        class="sr-only"
                                                        >, {{ row.id }}</span
                                                    ></span
                                                >
                                            </div>
                                        </Can>

                                        <div
                                            v-if="slots['extra-field']"
                                            class="break-words py-4 pl-4 pr-3 text-xs font-medium dark:text-gray-300 text-gray-900 flex flex-row justify-between"
                                        >
                                            <slot
                                                name="extra-field"
                                                :entity="
                                                    row.id
                                                        ? entities.find((e) => e.id == row.id)
                                                        : entities[index]
                                                "
                                                :index="index"
                                                :row="row"
                                            />
                                        </div>
                                    </td>
                                </tr>
                                <div
                                    v-if="loading && !searchLoading && !searchVal"
                                    class="inset-0 flex items-center justify-center w-full h-24"
                                >
                                    <div
                                        class="absolute inset-0 flex items-center justify-center w-full"
                                    >
                                        <Spinner />
                                    </div>
                                </div>
                            </tbody>
                        </table>
                    </div>
                    <div
                        class="px-6 py-4 border-t w-full bg-main rounded-b-lg"
                        v-if="totalPages > 1"
                    >
                        <div
                            class="flex items-center justify-between w-full"
                            v-if="rows.length > 0"
                        >
                            <div class="flex flex-row w-full items-center justify-between">
                                <div class="text-sm text-opposite" test-id="pagination-info">
                                    Showing
                                    {{ ' ' }}
                                    <span class="font-medium">{{ (page - 1) * perPage + 1 }}</span>
                                    {{ ' ' }}
                                    to
                                    {{ ' ' }}
                                    <span class="font-medium">{{
                                        page == totalPages ? total : page * perPage
                                    }}</span>
                                    {{ ' ' }}
                                    of
                                    {{ ' ' }}
                                    <span class="font-medium">{{ total }}</span>
                                    {{ ' ' }}
                                    results
                                </div>
                                <div class="flex gap-2">
                                    <button
                                        class="px-3 py-1 border rounded disabled:opacity-50 text-opposite"
                                        :disabled="page == 1"
                                        @click="() => onPreviousPage()"
                                        test-id="previous-page-button"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        v-if="pageLoading"
                                        class="px-3 py-1 border rounded disabled:opacity-50 text-opposite"
                                    >
                                        <Spinner />
                                    </button>

                                    <!-- Current: "z-10 bg-indigo-600 dark:text-white text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "dark:text-gray-900 text-gray-100 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" -->
                                    <template v-for="item in visiblePages" :key="`p-${item}`">
                                        <span
                                            v-if="item === '...'"
                                            class="px-3 py-1 text-neutral-500 select-none"
                                        >
                                            ...
                                        </span>
                                        <button
                                            v-else
                                            class=""
                                            @click="() => setPage(item as number)"
                                            aria-current="page"
                                            :class="` px-3 py-1 border rounded ${
                                                page == (item as number)
                                                    ? 'bg-neutral-200 text-neutral-800'
                                                    : 'bg-neutral-800 text-neutral-200'
                                            } `"
                                        >
                                            {{ item }}
                                        </button>
                                    </template>

                                    <button
                                        @click="() => onNextPage()"
                                        class="px-3 py-1 border rounded disabled:opacity-50 text-opposite"
                                        :disabled="page == totalPages"
                                        test-id="next-page-button"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="rows.length == 0 && !loading"
                        class="text-opposite p-4 text-xl"
                        test-id="no-records-message"
                    >
                        No records found for {{ entityName }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
const props = defineProps<{
    cols: string[]
    rows: any[]
    entities: any[]
    page: number
    total: number
    perPage: number
    totalPages: number
    onNextPage: () => void
    onPreviousPage: () => void
    setPage: (page: number) => void
    loading?: boolean
    searchLoading?: boolean
    pageLoading?: boolean
    hideEdit?: (entity: any) => boolean
    hideDelete?: (entity: any) => boolean
    hideView?: (entity: any) => boolean
    onEdit?: (row: any) => void
    onSearch?: (value: string) => void
    searchPlaceholder?: string
    subject?: string
    editPath?: (entity: any) => string
    entityName: string
    mapStatusStyle?: (status: string) => string
    viewPath?: (entity: any) => string
    skipPadding?: boolean
    handleDelete?: (entity: any) => void
    onView?: (entity: any) => void
    extraFieldInnerAction?: (row: any) => void
    // New props for drag and drop functionality
    enableDragAndDrop?: boolean
    onOrderChange?: (reorderedEntities: any[]) => void
    sortingColumns?: string[]
    onSort?: (payload: { column: string; direction: 'asc' | 'desc' | null }) => void
}>()

import { ChevronRightIcon, TrashIcon } from '@heroicons/vue/20/solid'
import { h, onMounted, ref, computed, type Component, useSlots, nextTick } from 'vue'
import { useDialog } from '@/stores/dialog'
import type { TableEntity } from '@/util/interfaces'
import Spinner from './Spinner.vue'
import { useRouter } from 'vue-router'
import Can from './Can.vue'
import AppInput from './AppInput.vue'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const router = useRouter()
const dialog = useDialog()
const slots = useSlots()

const selected = ref()
const isOpen = ref(false)
const onChangeDialog = (val: boolean) => {
    isOpen.value = val
}
const searchVal = ref('')

const activeSortColumn = ref<string | null>(null)
const activeSortDirection = ref<'asc' | 'desc' | null>(null)

const sortableColumns = computed(() => new Set(props.sortingColumns || []))

const isColumnSortable = (column: string) => sortableColumns.value.has(column)

const toggleSort = (column: string) => {
    if (!isColumnSortable(column) || !props.onSort) {
        return
    }

    if (activeSortColumn.value !== column) {
        activeSortColumn.value = column
        activeSortDirection.value = 'asc'
    } else {
        if (activeSortDirection.value === 'asc') {
            activeSortDirection.value = 'desc'
        } else if (activeSortDirection.value === 'desc') {
            activeSortDirection.value = null
            activeSortColumn.value = null
        } else {
            activeSortDirection.value = 'asc'
        }
    }

    props.onSort({ column, direction: activeSortDirection.value })
}

const resolveSortIcon = (column: string) => {
    if (!isColumnSortable(column)) {
        return ''
    }
    if (activeSortColumn.value !== column || !activeSortDirection.value) {
        return 'fa-solid fa-sort text-xs text-opposite/40'
    }
    return activeSortDirection.value === 'asc'
        ? 'fa-solid fa-arrow-up text-xs'
        : 'fa-solid fa-arrow-down text-xs'
}

// Drag and drop state
const draggedIndex = ref<number | null>(null)

// Drag and drop functionality
const handleDragStart = (index: number, event: DragEvent | MouseEvent) => {
    draggedIndex.value = index
    if ('dataTransfer' in event && event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/html', index.toString())
    }
}

const handleDrop = async (index: number, event: DragEvent) => {
    event.preventDefault()
    const draggedIndexValue = draggedIndex.value

    if (draggedIndexValue !== null && draggedIndexValue !== index) {
        try {
            // Create a new array to avoid direct mutation
            const newEntities = [...props.entities]

            // Store the target item
            const targetItem = { ...newEntities[index] }

            // Swap the items
            newEntities[index] = { ...newEntities[draggedIndexValue] }
            newEntities[draggedIndexValue] = targetItem

            // Update order numbers if entities have order property
            newEntities.forEach((item, idx) => {
                if ('order' in item) {
                    item.order = idx + 1
                }
            })

            // Wait for next tick to ensure DOM is ready
            await nextTick()

            // Notify parent component about the order change
            props.onOrderChange?.(newEntities)
        } catch (error) {
            console.error('Error during drag and drop:', error)
        }
    }

    draggedIndex.value = null
}

const hasDragAndDropPermission = computed(() => {
    return (
        !props.subject ||
        authStore.hasPermissions({
            subject: props.subject || '',
            actions: ['update', 'create']
        })
    )
})

const hasVisibleActions = computed(() => {
    return props.rows.some((row) => {
        const entity = props.entities.find((e) => e.id == row.id)
        return (
            ((!props.hideView || props.onView || !props.hideView?.(entity)) &&
                (!props.subject ||
                    authStore.hasPermissions({
                        subject: props.subject || '',
                        actions: ['read']
                    }))) ||
            ((!props.hideEdit || !props.hideEdit?.(entity)) &&
                (!props.subject ||
                    authStore.hasPermissions({
                        subject: props.subject || '',
                        actions: ['update']
                    }))) ||
            (props.handleDelete &&
                (!props.hideDelete || !props.hideDelete?.(entity)) &&
                (!props.subject ||
                    authStore.hasPermissions({
                        subject: props.subject || '',
                        actions: ['delete']
                    }))) ||
            !!slots['extra-field']
        )
    })
})

const filteredRow = (row: { [key: string]: any }) => {
    let newRow = { ...row }
    for (const key of Object.keys(row)) {
        if (!props.cols.includes(key)) {
            delete newRow[key]
        }
    }
    return newRow
}

// Pagination: show up to 6 pages around current with ellipses
const visiblePages = computed<(number | '...')[]>(() => {
    const totalPages = props.totalPages || 0
    const current = props.page || 1
    const maxWindow = 6

    if (totalPages <= maxWindow + 2) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: Array<number | '...'> = []
    pages.push(1)

    let start = Math.max(2, current - Math.floor(maxWindow / 2))
    let end = start + maxWindow - 1
    const lastInner = totalPages - 1

    if (end > lastInner) {
        end = lastInner
        start = Math.max(2, end - maxWindow + 1)
    }

    if (start > 2) pages.push('...')

    for (let p = start; p <= end; p++) pages.push(p)

    if (end < lastInner) pages.push('...')

    pages.push(totalPages)
    return pages
})
</script>
<style scoped>
#hidden-body {
    display: none;
}
@media (max-width: 1024px) {
    #table-head {
        display: none;
    }
    #table-body {
        display: none;
        background-color: transparent !important;
    }
    #hidden-body {
        display: block;
    }
    .body-small {
        display: block;
    }
}
</style>
