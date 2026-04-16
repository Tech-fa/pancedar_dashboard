<template>
    <div class="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p class="mt-1 text-sm text-gray-500">
                Manage your organization settings and permissions
            </p>
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- User Settings Card -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center mb-4">
                    <div class="bg-blue-100 p-3 rounded-lg">
                        <svg
                            class="w-6 h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <h2 class="ml-3 text-xl font-semibold text-gray-900">User Settings</h2>
                </div>
                <ul class="space-y-3">
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">🔑</span>
                            Permissions
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">👥</span>
                            Roles & Permissions
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">📋</span>
                            Users List
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">🎯</span>
                            User Role Scope
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">🎯</span>
                            Users Group
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">🎯</span>
                            Management System
                        </a>
                    </li>
                </ul>
            </div>
            <!-- Organization Settings Card -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center mb-4">
                    <div class="bg-purple-100 p-3 rounded-lg">
                        <svg
                            class="w-6 h-6 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                    </div>
                    <h2 class="ml-3 text-xl font-semibold text-gray-900">Organization Settings</h2>
                </div>
                <ul class="space-y-3">
                    <li>
                        <a
                            href="/admin/unit-types"
                            class="flex items-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">⚙️</span>
                            Organization Unit Types
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">📋</span>
                            Organization Units Settings
                        </a>
                    </li>
                    <li>
                        <a
                            href="/admin/org-tree"
                            class="flex items-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">🌳</span>
                            Organization Units Tree
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Other Settings Card -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center mb-4">
                    <div class="bg-green-100 p-3 rounded-lg">
                        <svg
                            class="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </div>
                    <h2 class="ml-3 text-xl font-semibold text-gray-900">Other Settings</h2>
                </div>
                <ul class="space-y-3">
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3"><CalendarIcon class="w-6 h-6" /></span>
                            Working Days
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">👤</span>
                            All Roles
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">🔔</span>
                            Reminder Alerts
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            class="flex items-center text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md p-2 transition-colors"
                        >
                            <span class="mr-3">📧</span>
                            Email Settings
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CalendarIcon } from '@heroicons/vue/24/outline'
// Add any required logic here
</script>
