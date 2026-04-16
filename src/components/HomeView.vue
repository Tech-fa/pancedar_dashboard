<template>
    <div :class="['min-h-full  bg-main']">
        <TransitionRoot as="template" :show="sidebarOpen" v-if="authStore.state.isLoggedIn">
            <Dialog :class="[`relative z-alot xl:hidden `, route.path == '/' ? 'open-bar' : '']"
                @close="uiStore.setSidebarOpen(false)">
                <TransitionChild as="template" enter="transition-opacity ease-linear duration-300"
                    enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300"
                    leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-main/80" />
                </TransitionChild>

                <div class="fixed inset-0 flex">
                    <TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
                        enter-from="-translate-x-full" enter-to="translate-x-0"
                        leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0"
                        leave-to="-translate-x-full">
                        <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
                            <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0"
                                enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100"
                                leave-to="opacity-0">
                                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                                    <button type="button" class="-m-2.5 p-2.5" @click="uiStore.setSidebarOpen(false)">
                                        <span class="sr-only">Close sidebar</span>
                                        <XMarkIcon class="h-4 w-4 text-opposite" aria-hidden="true" />
                                    </button>
                                </div>
                            </TransitionChild>
                            <!-- Sidebar component, swap this element with another sidebar if you like -->
                            <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-main px-6">
                                <div class="flex flex-col gap-2 w-full mt-2">
                                    <img v-if="clientLogoUrl" :src="clientLogoUrl" alt="Client logo"
                                        class="h-12 max-w-28 object-contain" />
                                    <Select2 v-if="canReadTeams" :model-value="teamValue" :values="teamsList"
                                        :display="displayTeam" placeholder="Team" label="Team" class="w-full"
                                        @update:model-value="selectTeam" />
                                </div>
                                <nav class="flex flex-1 flex-col mt-6">
                                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" class="-mx-2 space-y-1">
                                                <li v-for="item in navigations.filter(
                                                    (a: any) =>
                                                        (!a.subject ||
                                                            authStore.hasPermissions({
                                                                subject: a.subject || '',
                                                                actions: ['read']
                                                            })) &&
                                                        (!a.menuItems?.length ||
                                                            a.menuItems.some((b: any) =>
                                                                authStore.hasPermissions({
                                                                    subject: b.subject || '',
                                                                    actions: ['read']
                                                                })
                                                            ))
                                                )" :key="item.name">
                                                    <span v-if="!item.menuItems?.length" @click="router.push(item.path)"
                                                        :class="[
                                                            item.path == route.path ||
                                                                route.path.includes(`${item.path}/`)
                                                                ? 'bg-complementary-main text-opposite'
                                                                : 'hover:bg-complementary-main/50  text-opposite ',
                                                            'group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 cursor-pointer'
                                                        ]">
                                                        <component :is="item.icon" class="h-4 w-4 shrink-0"
                                                            aria-hidden="true" />
                                                        {{ item.name }}
                                                    </span>
                                                    <Disclosure as="div" v-else v-slot="{ open }" :default-open="route.path.includes(`${item.path}/`)
                                                        ">
                                                        <DisclosureButton :class="[
                                                            route.path.includes(`${item.path}/`)
                                                                ? 'bg-complementary-main text-opposite'
                                                                : 'hover:bg-complementary-main/50  text-opposite ',
                                                            'flex w-full items-center  gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 '
                                                        ]">
                                                            <component :is="item.icon" class="h-4 w-4 shrink-0"
                                                                aria-hidden="true" />
                                                            {{ item.name }}
                                                            <ChevronRightIcon :class="[
                                                                open
                                                                    ? 'rotate-90 text-opposite'
                                                                    : 'text-opposite',
                                                                'ml-auto h-5 w-5 shrink-0'
                                                            ]" aria-hidden="true" />
                                                        </DisclosureButton>
                                                        <DisclosurePanel as="ul" class="mt-1 px-2">
                                                <li v-for="subItem in item.menuItems.filter(
                                                    (subItem: any) =>
                                                        !subItem.subject ||
                                                        authStore.hasPermissions({
                                                            subject:
                                                                subItem.subject ||
                                                                '',
                                                            actions: ['read']
                                                        })
                                                )" :key="subItem.name">
                                                    <!-- 44px -->
                                                    <span @click="
                                                        router.push(subItem.path)
                                                        " :class="[
                                                            subItem.path ==
                                                                route.path ||
                                                                route.path.includes(
                                                                    `${subItem.path}/`
                                                                )
                                                                ? 'bg-complementary-main text-opposite'
                                                                : 'hover:bg-complementary-main/50  text-opposite ',
                                                            'flex flex-row items-center gap-x-3 rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-black cursor-pointer'
                                                        ]">
                                                        <component :is="subItem.icon" class="h-4 w-4 shrink-0"
                                                            aria-hidden="true" />
                                                        {{ subItem.name }}
                                                    </span>
                                                </li>
                                                </DisclosurePanel>
                                                </Disclosure>
                                        </li>
                                    </ul>
                                    </li>

                                    <li class="-mx-6 mt-auto">
                                        <div class="flex flex-col gap-y-2">
                                            <!-- Notifications -->
                                            <div @click="router.push('/notifications')" :class="[
                                                'flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 hover:bg-complementary-main/50  text-opposite cursor-pointer',
                                                route.path == '/notifications'
                                                    ? 'bg-complementary-main text-opposite'
                                                    : ''
                                            ]">
                                                <i class="fa-solid fa-bell text-lg"></i>
                                                <span>Notifications</span>
                                                <span v-if="notificationCountStore.count > 0"
                                                    class="flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 w-5 ml-auto">
                                                    {{ notificationCountStore.count }}
                                                </span>
                                            </div>

                                            <!-- Profile -->
                                            <div @click="router.push('/profile')" :class="[
                                                'flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 hover:bg-complementary-main/50  text-opposite cursor-pointer',
                                                route.path == '/profile'
                                                    ? 'bg-complementary-main text-opposite'
                                                    : ''
                                            ]">
                                                <i class="fa-solid fa-user text-lg"></i>
                                                <span>Profile</span>
                                            </div>

                                            <!-- Logout -->
                                            <div @click="authStore.logout()"
                                                class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 hover:bg-complementary-main/50 text-opposite cursor-pointer"
                                                test-id="home-view-logout-button">
                                                <i class="fa-solid fa-right-from-bracket text-lg"></i>
                                                <span>Logout</span>
                                            </div>
                                        </div>
                                    </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </TransitionRoot>
        <!-- Static sidebar for desktop -->
        <TransitionRoot :show="open" v-if="authStore.state.isLoggedIn">
            <TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
                enter-from="-translate-x-full" enter-to="translate-x-0"
                leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0"
                leave-to="-translate-x-full">
                <div :class="[
                    'hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-56 xl:flex-col bg-main  '
                ]">
                    <!-- Sidebar component, swap this element with another sidebar if you like -->
                    <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-main px-6">
                        <div class="flex flex-col gap-2 w-full">
                            <div class="flex flex-row">
                                <div class="flex h-16 shrink-0 items-center">
                                    <button @click="uiStore.setOpen(false)">
                                        <Bars3Icon :class="[
                                            'h-5 w-5 ',
                                            route.path == `/` ? 'text-opposite' : 'text-opposite '
                                        ]" aria-hidden="true" />
                                    </button>
                                </div>
                                <img v-if="clientLogoUrl" :src="clientLogoUrl" alt="Client logo"
                                    class="h-12 ml-4 mt-2 w-auto object-contain max-w-28" />
                            </div>
                            <Select2 v-if="canReadTeams" :model-value="teamValue" :values="teamsList"
                                :display="displayTeam" placeholder="Team" label="Team" class="w-full"
                                @update:model-value="selectTeam" />
                        </div>

                        <nav class="flex flex-1 flex-col mt-2">
                            <ul role="list" class="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" class="-mx-2 space-y-1">
                                        <li v-for="item in navigations.filter(
                                            (a: any) =>
                                                (!a.subject ||
                                                    authStore.hasPermissions({
                                                        subject: a.subject || '',
                                                        actions: ['read']
                                                    })) &&
                                                (!a.menuItems?.length ||
                                                    a.menuItems.some((b: any) =>
                                                        authStore.hasPermissions({
                                                            subject: b.subject || '',
                                                            actions: ['read']
                                                        })
                                                    ))
                                        )" :key="item.name">
                                            <span v-if="!item.menuItems?.length" @click="router.push(item.path)" :class="[
                                                item.path == route.path ||
                                                    route.path.includes(`${item.path}/`)
                                                    ? 'bg-complementary-main text-opposite'
                                                    : 'hover:bg-complementary-main/50  text-opposite ',
                                                'group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 cursor-pointer'
                                            ]">
                                                <component :is="item.icon" class="h-4 w-4 shrink-0 text-opposite"
                                                    aria-hidden="true" />
                                                {{ item.name }}
                                            </span>
                                            <Disclosure as="div" v-else v-slot="{ open }"
                                                :default-open="route.path.includes(`${item.path}/`)">
                                                <DisclosureButton :class="[
                                                    route.path.includes(`${item.path}/`)
                                                        ? 'bg-complementary-main text-opposite'
                                                        : 'hover:bg-complementary-main/50  text-opposite',
                                                    'flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 cursor-pointer'
                                                ]">
                                                    <component :is="item.icon" class="h-4 w-4 shrink-0 text-opposite"
                                                        aria-hidden="true" />
                                                    {{ item.name }}
                                                    <ChevronRightIcon :class="[
                                                        open
                                                            ? 'rotate-90 text-opposite'
                                                            : 'text-opposite',
                                                        'ml-auto h-5 w-5 shrink-0'
                                                    ]" aria-hidden="true" />
                                                </DisclosureButton>
                                                <DisclosurePanel as="ul" class="mt-1 px-2">
                                        <li v-for="subItem in item.menuItems.filter(
                                            (subItem: any) =>
                                                authStore.hasPermissions({
                                                    subject: subItem.subject || '',
                                                    actions: ['read']
                                                })
                                        )" :key="subItem.name">
                                            <!-- 44px -->
                                            <span @click="router.push(subItem.path)" :test-id="subItem.path.replace(/\//g, '-') +
                                                '-sidebar'
                                                " :class="[
                                                    subItem.path == route.path ||
                                                        route.path.includes(
                                                            `${subItem.path}/`
                                                        )
                                                        ? 'bg-complementary-main text-opposite'
                                                        : 'hover:bg-complementary-main/50  text-opposite ',
                                                    'flex flex-row items-center gap-x-3 rounded-md py-2 pl-2 pr-2 text-sm leading-6 text-black cursor-pointer'
                                                ]">
                                                <component :is="subItem.icon" class="h-4 w-4 shrink-0 text-opposite"
                                                    aria-hidden="true" />
                                                {{ subItem.name }}
                                            </span>
                                        </li>
                                        </DisclosurePanel>
                                        </Disclosure>
                                </li>
                            </ul>
                            </li>

                            <li class="-mx-6 mt-auto">
                                <div class="flex flex-col gap-y-2">
                                    <!-- Notifications -->
                                    <!-- <div @click="router.push('/notifications')" :class="[
                                        'flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-opposite hover:bg-complementary-main/50 cursor-pointer',
                                        route.path == '/notifications'
                                            ? 'bg-complementary-main text-opposite'
                                            : ''
                                    ]">
                                        <i class="fa-solid fa-bell text-lg"></i>
                                        <span>Notifications</span>
                                        <span v-if="notificationCountStore.count > 0"
                                            class="flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 w-5 ml-auto">
                                            {{ notificationCountStore.count }}
                                        </span>
                                    </div> -->

                                    <!-- Profile -->
                                    <div @click="router.push('/profile')" :class="[
                                        'flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6  text-opposite hover:bg-complementary-main/50 cursor-pointer',
                                        route.path == '/profile'
                                            ? 'bg-complementary-main text-opposite'
                                            : ''
                                    ]">
                                        <i class="fa-solid fa-user text-lg"></i>
                                        <span>Profile</span>
                                    </div>

                                    <!-- Logout -->
                                    <div @click="authStore.logout()"
                                        class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-opposite hover:bg-complementary-main/50 cursor-pointer"
                                        test-id="home-view-logout-button">
                                        <i class="fa-solid fa-right-from-bracket text-lg"></i>
                                        <span>Logout</span>
                                    </div>
                                </div>
                            </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </TransitionChild>
        </TransitionRoot>

        <div :class="[
            'transition-all duration-300 ease-in-out',
            authStore.state.isLoggedIn ? (open ? ' xl:pl-56' : '') : '',
            'min-h-screen bg-secondary'
        ]">
            <button v-if="authStore.state.isLoggedIn" type="button" :class="[
                ' transition-all duration-300 ease-in-out bg-main rounded-full w-10 h-10 absolute flex items-center justify-center',
                'm-2.5 ml-5  text-main z-10000',
                open ? 'xl:hidden' : 'block',
                route.path == '/map' ? ' ml-12' : ''
            ]" @click="
                () => {
                    uiStore.setSidebarOpen(true)
                    uiStore.setOpen(true)
                }
            ">
                <span class="sr-only">Open sidebar</span>
                <Bars3Icon :class="['h-5 w-5 text-opposite']" aria-hidden="true" />
            </button>
            <ComplianceNotice />
            <RouterView />
        </div>
    </div>
</template>
<script setup lang="ts">
import {
    Dialog,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    TransitionChild,
    TransitionRoot
} from '@headlessui/vue'
import { Bars3Icon, XMarkIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { h, onMounted, ref, watch, type Component, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, type PermissionTree } from '@/stores/auth'
import { apiGet, apiGetPublic, renewToken } from '@/util/api'
import { useToast } from '@/stores/notification'
import { useNotificationCountStore } from '@/stores/notification-count'
import { useDialog } from '@/stores/dialog'
import { useClientStore } from '@/stores/client'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import type { ClientAccount, PaginatedResponse, Team } from '@/util/interfaces'
import Select2 from '@/components/Select2.vue'
import ComplianceNotice from './compliance/compliance-notice.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()
const { sidebarOpen, open } = storeToRefs(uiStore)
const notificationCountStore = useNotificationCountStore()
const toast = useToast()
const query = ref({})
const dialog = useDialog()
const clientStore = useClientStore()
const { client } = storeToRefs(clientStore)

// Add idle detection state and timer
const idleTimeout = ref<number | null>(null)
const lastActivity = ref(Date.now())
const IDLE_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds

// Function to handle user activity
const handleUserActivity = () => {
    lastActivity.value = Date.now()
}

// Function to check if user is idle
const checkIdle = () => {
    const now = Date.now()
    if (now - lastActivity.value >= IDLE_TIMEOUT) {
        // User is idle - you can add your custom logic here
        query.value = {
            redirect: route.fullPath
        }
        dialog.closeDialog()
        authStore.logout()

        // Example: Show a toast notification
        toast.showToast('Session Timeout', 'You have been inactive for a while', 'info')
    }
}

const companyName = computed(() => {
    return client.value?.companyName || authStore.state.userDetails?.companyName || 'Account'
})



const clientLogoUrl = computed(() => client.value?.logoUrl || null)

const canReadTeams = computed(() =>
    authStore.hasPermissions({ subject: 'teams', actions: ['read'] }) && teamsList.value.length > 1
)

const teamsList = ref<Team[]>([])
const teamValue = computed(() => teamsList.value.find(t => t.id === authStore.state.teamId))

const displayTeam = (t: Team) => t.name

const fetchTeams = async () => {
    if (!authStore.state.isLoggedIn || !canReadTeams.value) {
        teamsList.value = []
        return
    }
    try {
        const res = await apiGet<PaginatedResponse<Team>>('/teams', authStore, {
            page: 1,
            perPage: 100
        })
        teamsList.value = res.data

    } catch (error) {
        console.error('Error fetching teams:', error)
    }
}

const fetchClientAccount = async () => {
    if (!authStore.state.isLoggedIn) {
        return
    }
    try {
        const data = await apiGet<ClientAccount>('/clients/me', authStore)
        clientStore.setClient(data)
    } catch (error) {
        console.error('Error fetching client account:', error)
    }
}

watch(authStore, () => {
    if (!authStore.state.isLoggedIn) {
        teamsList.value = []
        router.push({
            path: '/login',
            query: query.value
        })
    }
    if (!localStorage.getItem('permissions') && authStore.state.isLoggedIn) {
        apiGetPublic<{ [key: string]: PermissionTree }>('/permissions').then((res) => {
            authStore.setPermissionTree(res)
        })
    }
    if (authStore.state.isLoggedIn) {
        fetchClientAccount()
        fetchTeams()
    }
})

const selectTeam = (team: Team) => {
    renewToken(authStore, true, team.id).then(() => {
        window.location.reload();
    })
}
onMounted(() => {
    // Fetch notification count immediately
    // fetchNotificationCount()

    // Set up a timer to fetch notification count every 60 seconds
    // notificationTimer.value = window.setInterval(() => {
    //     fetchNotificationCount()
    // }, 60000)

    if (!localStorage.getItem('permissions')) {
        apiGetPublic<{ [key: string]: PermissionTree }>('/permissions').then((res) => {
            authStore.setPermissionTree(res)
        })
    }

    fetchClientAccount()
    fetchTeams()

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)
    window.addEventListener('click', handleUserActivity)
    window.addEventListener('scroll', handleUserActivity)

    // Set up idle check interval
    idleTimeout.value = window.setInterval(checkIdle, 10000) // Check every 10 seconds
})

onUnmounted(() => {
    // Clean up the timer when component is unmounted to prevent memory leaks
    // if (notificationTimer.value !== null) {
    //     window.clearInterval(notificationTimer.value)
    //     notificationTimer.value = null
    // }

    // Clean up idle detection
    if (idleTimeout.value !== null) {
        window.clearInterval(idleTimeout.value)
        idleTimeout.value = null
    }

    // Remove event listeners
    window.removeEventListener('mousemove', handleUserActivity)
    window.removeEventListener('keydown', handleUserActivity)
    window.removeEventListener('click', handleUserActivity)
    window.removeEventListener('scroll', handleUserActivity)
})

const fetchNotificationCount = async () => {
    try {
        const response = await apiGet<number>('/user-notifications/unviewed-count', authStore)
        if (notificationCountStore.count !== response) {
            notificationCountStore.setCount(response)
            if (response > 0) {
                toast.showToast(
                    'New Notification',
                    'You have ' + response + ' new notifications',
                    'success'
                )
            }
        }
    } catch (error) {
        console.error('Error fetching notification count:', error)
    }
}

const navigations: {
    name: string
    path: string
    icon: Component
    subject?: string
    menuItems?: { name: string; path: string; icon: Component; subject: string }[]
}[] = [
        {
            name: 'Company',
            path: '/admin',
            icon: h('i', { class: 'fa-solid fa-gear text-opposite ' }),
            menuItems: [
                {
                    name: 'Manage Users',
                    path: '/admin/users',
                    subject: 'user',
                    icon: h('i', { class: 'fa-solid fa-users text-opposite ' })
                },
                {
                    name: 'Permission Groups',
                    path: '/admin/permissions/groups',
                    subject: 'permissions',
                    icon: h('i', { class: 'fa-solid fa-shield-halved text-neutral-700 ' })
                },
                {
                    name: 'Teams',
                    path: '/admin/teams',
                    subject: 'teams',
                    icon: h('i', { class: 'fa-solid fa-sitemap text-neutral-700 ' })
                },
                {
                    name: 'Account',
                    path: '/admin/account',
                    subject: 'client',
                    icon: h('i', { class: 'fa-solid fa-id-card text-opposite ' })
                }
            ]
        },
        {
            name: 'Compliance',
            path: '/qms',
            icon: h('i', { class: 'fa-solid fa-shield-halved text-opposite ' }),
            menuItems: [
                {
                    name: 'Dashboard',
                    path: '/qms/dashboard',
                    icon: h('i', { class: 'fa-solid fa-chart-line text-opposite ' }),
                    subject: 'document'
                },
                {
                    name: 'Documents',
                    path: '/qms/documents',
                    icon: h('i', { class: 'fa-solid fa-file-pen text-opposite ' }),
                    subject: 'document'
                }
            ]
        },

        // {
        //     name: 'Inventory',
        //     path: '/inventory',
        //     icon: h('i', { class: 'fa-solid fa-warehouse text-opposite ' }),
        //     menuItems: [
        //         {
        //             name: 'Dashboard',
        //             path: '/inventory/dashboard',
        //             icon: h('i', { class: 'fa-solid fa-warehouse text-opposite ' }),
        //             subject: 'part-inventory'
        //         },
        //         {
        //             name: 'Parts',
        //             path: '/inventory/parts',
        //             icon: h('i', { class: 'fa-solid fa-cogs text-opposite ' }),
        //             subject: 'part'
        //         },
        //         {
        //             name: 'Purchase Orders',
        //             path: '/inventory/purchase-orders',
        //             icon: h('i', { class: 'fa-solid fa-file-invoice text-opposite ' }),
        //             subject: 'purchase-order'
        //         },
        //         {
        //             name: 'Vendors',
        //             path: '/inventory/vendors',
        //             icon: h('i', { class: 'fa-solid fa-handshake text-opposite ' }),
        //             subject: 'vendor'
        //         },
        //         {
        //             name: 'Warehouses',
        //             path: '/inventory/warehouses',
        //             icon: h('i', { class: 'fa-solid fa-building text-opposite ' }),
        //             subject: 'warehouse'
        //         }
        //     ]
        // },
        // {
        //     name: 'Maintenance',
        //     path: '/maintenance',
        //     icon: h('i', { class: 'fa-solid fa-tools text-opposite ' }),
        //     menuItems: [
        //         {
        //             name: 'Dashboard',
        //             path: '/services/dashboard',
        //             icon: h('i', { class: 'fa-solid fa-chart-line text-opposite ' }),
        //             subject: 'work-order'
        //         },
        //         {
        //             name: 'Service Tasks',
        //             path: '/services/service-tasks',
        //             icon: h('i', { class: 'fa-solid fa-wrench text-opposite ' }),
        //             subject: 'service-task'
        //         },
        //         {
        //             name: 'Service Programs',
        //             path: '/services/service-programs',
        //             icon: h('i', { class: 'fa-solid fa-list-check text-opposite ' }),
        //             subject: 'service-program'
        //         },
        //         {
        //             name: 'Technicians',
        //             path: '/services/technicians',
        //             icon: h('i', { class: 'fa-solid fa-user-group text-opposite ' }),
        //             subject: 'technician'
        //         },
        //         {
        //             name: 'Alerts',
        //             path: '/alerts',
        //             icon: h('i', { class: 'fa-solid fa-bell text-opposite ' }),
        //             subject: 'alert'
        //         },
        //         {
        //             name: 'Work Orders',
        //             path: '/services/work-orders',
        //             icon: h('i', { class: 'fa-solid fa-clipboard-check text-opposite ' }),
        //             subject: 'work-order'
        //         },
        //         {
        //             name: 'Calendar',
        //             path: '/services/calendar',
        //             icon: h('i', { class: 'fa-solid fa-calendar text-opposite ' }),
        //             subject: 'work-order'
        //         },


        //         {
        //             name: 'Inspections',
        //             path: '/inspections/history',
        //             icon: h('i', { class: 'fa-solid fa-clipboard-list text-opposite ' }),
        //             subject: 'inspection'
        //         }
        //     ]
        // },
        {
            name: 'Flight Ops',
            path: '/fleet',
            icon: h('i', { class: 'fa-solid fa-plane-arrival text-opposite ' }),
            menuItems: [
                {
                    name: 'Dashboard',
                    path: '/fleet/dashboard',
                    icon: h('i', { class: 'fa-solid fa-chart-line text-opposite ' }),
                    subject: 'asset'
                },
                {
                    name: 'Drones',
                    path: '/fleet/assets',
                    icon: h('i', { class: 'fa-solid fa-plane-arrival text-opposite ' }),
                    subject: 'asset'
                },
                {
                    name: 'Map',
                    path: '/fleet/map',
                    icon: h('i', { class: 'fa-solid fa-map-location-dot text-opposite ' }),
                    subject: 'asset'
                },
                {
                    name: 'Jobs',
                    path: '/fleet/planned-jobs',
                    icon: h('i', { class: 'fa-solid fa-briefcase text-opposite ' }),
                    subject: 'vehicle-job'
                },
                {
                    name: 'Job Types',
                    path: '/fleet/job-types',
                    icon: h('i', { class: 'fa-solid fa-tags text-opposite ' }),
                    subject: 'vehicle-job-type'
                },
                {
                    name: 'Pilots',
                    path: '/fleet/pilots',
                    icon: h('i', { class: 'fa-solid fa-user text-opposite ' }),
                    subject: 'pilot'
                }
            ]
        },

        {
            name: 'Customers',
            path: '/customers',
            icon: h('i', { class: 'fa-solid fa-building text-opposite ' }),
            menuItems: [
                {
                    name: 'Dashboard',
                    path: '/customers/dashboard',
                    icon: h('i', { class: 'fa-solid fa-chart-line text-opposite ' }),
                    subject: 'customer'
                },
                {
                    name: 'Customer List',
                    path: '/customers/list',
                    icon: h('i', { class: 'fa-solid fa-list text-opposite ' }),
                    subject: 'customer'
                },
                // {
                //     name: 'Portal Configuration',
                //     path: '/customers/portal-config',
                //     icon: h('i', { class: 'fa-solid fa-gear text-opposite ' }),
                //     subject: 'customer'
                // },
                // {
                //     name: 'Customer Services',
                //     path: '/customers/services',
                //     icon: h('i', { class: 'fa-solid fa-concierge-bell text-opposite ' }),
                //     subject: 'customer'
                // }
            ]
        },
        {
            name: 'Automation',
            path: '/automation',
            icon: h('i', { class: 'fa-solid fa-robot text-opposite ' }),
            menuItems: [
                {
                    name: 'Workflows',
                    path: '/automation/workflows',
                    icon: h('i', { class: 'fa-solid fa-diagram-project text-opposite ' }),
                    subject: 'workflows'
                },
                {
                    name: 'Connectors',
                    path: '/automation/connectors',
                    icon: h('i', { class: 'fa-solid fa-plug text-opposite ' }),
                    subject: 'workflows'
                },
                {
                    name: 'Cron Jobs',
                    path: '/automation/cron-jobs',
                    icon: h('i', { class: 'fa-solid fa-clock text-opposite ' }),
                    subject: 'workflows'
                },
                {
                    name: 'Checklists',
                    path: '/automation/checklists',
                    icon: h('i', { class: 'fa-solid fa-clipboard-check text-opposite ' }),
                    subject: 'assets'
                }
            ]
        },
        {
            name: 'Operation Config',
            path: '/operation-config',
            icon: h('i', { class: 'fa-solid fa-sliders text-opposite ' }),
            menuItems: [
                {
                    name: 'Locations',
                    path: '/operation-config/locations',
                    icon: h('i', { class: 'fa-solid fa-globe text-opposite ' }),
                    subject: 'operation-config'
                }
            ]
        },
        // {
        //     name: 'Reports',
        //     path: '/reports',
        //     icon: h('i', { class: 'fa-solid fa-chart-bar text-opposite ' }),
        //     subject: 'reports'
        // },

    ]
</script>
