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
import { apiGet, renewToken } from '@/util/api'
import { useToast } from '@/stores/notification'
import { useDialog } from '@/stores/dialog'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import type { PaginatedResponse } from '@/util/interfaces'
import type { Team } from './admin/teams/team.interface'
import Select2 from '@/components/Select2.vue'
import ComplianceNotice from './compliance-notice.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()
const { sidebarOpen, open } = storeToRefs(uiStore)
const toast = useToast()
const query = ref({})
const dialog = useDialog()

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



const canReadTeams = computed(() =>
    authStore.hasPermissions({ subject: 'teams', actions: ['read'] })
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


watch(
    () => [authStore.state.isLoggedIn],
    ([isLoggedIn]) => {
        if (!isLoggedIn) {
            teamsList.value = []
            router.push({
                path: '/login',
                query: query.value
            })
            return
        }
    },
)

const selectTeam = (team: Team) => {
    renewToken(authStore, true, team.id).then(() => {
        window.location.reload();
    })
}
onMounted(() => {
    if (!localStorage.getItem('permissions') && authStore.state.isLoggedIn) {
        apiGet<{ [key: string]: PermissionTree }>('/permissions', authStore).then((res) => {
            authStore.setPermissionTree(res)
        })
    }
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

    if (idleTimeout.value !== null) {
        window.clearInterval(idleTimeout.value)
        idleTimeout.value = null
    }

    window.removeEventListener('mousemove', handleUserActivity)
    window.removeEventListener('keydown', handleUserActivity)
    window.removeEventListener('click', handleUserActivity)
    window.removeEventListener('scroll', handleUserActivity)
})



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
                    subject: 'users',
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

            ]
        },
        {
            name: 'Resources',
            path: '/resources',
            icon: h('i', { class: 'fa-solid fa-book text-opposite ' }),
            menuItems: [
                {
                    name: 'Categories',
                    path: '/resources/categories',
                    icon: h('i', { class: 'fa-solid fa-tags text-opposite ' }),
                    subject: 'email_workflow_categories'
                },
                {
                    name: 'Google Accounts',
                    path: '/resources/google-accounts',
                    icon: h('i', { class: 'fa-brands fa-google text-opposite ' }),
                    subject: 'google_accounts'
                }
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
                    name: 'Costs',
                    path: '/automation/costs',
                    icon: h('i', { class: 'fa-solid fa-dollar-sign text-opposite ' }),
                    subject: 'costs'
                },


            ]
        },
        {
            name: 'Findings',
            path: '/findings',
            icon: h('i', { class: 'fa-solid fa-magnifying-glass text-opposite ' }),
            menuItems: [
                {
                    name: 'Kiji Links',
                    path: '/findings/kiji-links',
                    icon: h('i', { class: 'fa-solid fa-link text-opposite ' }),
                    subject: 'kijiji_links'
                }
            ]
        },



    ]
</script>
