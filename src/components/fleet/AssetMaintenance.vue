<template>
    <div id="maintenance-tab" class="tab-content p-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
                <h3 class="text-lg font-semibold text-gray-900">Maintenance Schedule</h3>
                <span
                    class="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                    >2 Upcoming</span
                >
            </div>
            <div class="flex items-center space-x-3">
                <button
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <i class="fa-solid fa-calendar mr-2"></i>
                    View Calendar
                </button>
                <button
                    class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                    <i class="fa-solid fa-plus mr-2"></i>
                    Schedule Maintenance
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold text-gray-900">Upcoming Tasks</h4>
                    <span class="text-2xl font-bold text-purple-600">2</span>
                </div>
                <div class="space-y-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span class="text-sm text-gray-700">Preventive maintenance in 5 days</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span class="text-sm text-gray-700">Belt inspection in 12 days</span>
                    </div>
                </div>
            </div>
            <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold text-gray-900">Completed This Month</h4>
                    <span class="text-2xl font-bold text-green-600">4</span>
                </div>
                <div class="space-y-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-sm text-gray-700">Motor inspection completed</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-sm text-gray-700">Lubrication service completed</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-4">
            <div
                class="flex items-start justify-between p-5 bg-purple-50 border-l-4 border-purple-400 rounded-lg"
            >
                <div class="flex items-start space-x-4">
                    <div
                        class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                        <i class="fa-solid fa-calendar text-purple-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                            <h4 class="font-semibold text-gray-900">Preventive Maintenance</h4>
                            <span
                                class="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full"
                                >Upcoming</span
                            >
                        </div>
                        <p class="text-sm text-gray-700 mb-2">
                            Belt tension adjustment, lubrication of bearings, and general inspection
                            of drive components.
                        </p>
                        <div class="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                            <span
                                ><i class="fa-solid fa-calendar mr-1"></i>Scheduled for Oct 7,
                                2024</span
                            >
                            <span><i class="fa-solid fa-clock mr-1"></i>2-4 hours</span>
                            <span><i class="fa-solid fa-user mr-1"></i>Maintenance Team A</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs text-gray-500">Progress:</span>
                            <div class="flex-1 h-2 bg-gray-200 rounded-full max-w-xs">
                                <div
                                    class="h-2 bg-purple-500 rounded-full"
                                    style="width: 25%"
                                ></div>
                            </div>
                            <span class="text-xs text-gray-500">25%</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button
                        class="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
                    >
                        View Details
                    </button>
                    <button class="p-2 text-gray-400 hover:text-gray-600">
                        <i class="fa-solid fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>

            <div
                class="flex items-start justify-between p-5 bg-blue-50 border-l-4 border-blue-400 rounded-lg"
            >
                <div class="flex items-start space-x-4">
                    <div
                        class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                        <i class="fa-solid fa-search text-blue-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                            <h4 class="font-semibold text-gray-900">Belt Inspection</h4>
                            <span
                                class="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                >Scheduled</span
                            >
                        </div>
                        <p class="text-sm text-gray-700 mb-2">
                            Comprehensive inspection of belt condition, alignment, and wear
                            patterns. Visual and measurement checks.
                        </p>
                        <div class="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                            <span
                                ><i class="fa-solid fa-calendar mr-1"></i>Scheduled for Oct 14,
                                2024</span
                            >
                            <span><i class="fa-solid fa-clock mr-1"></i>1-2 hours</span>
                            <span><i class="fa-solid fa-user mr-1"></i>Inspector J. Smith</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs text-gray-500">Progress:</span>
                            <div class="flex-1 h-2 bg-gray-200 rounded-full max-w-xs">
                                <div class="h-2 bg-blue-500 rounded-full" style="width: 0%"></div>
                            </div>
                            <span class="text-xs text-gray-500">0%</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button
                        class="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                    >
                        View Details
                    </button>
                    <button class="p-2 text-gray-400 hover:text-gray-600">
                        <i class="fa-solid fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>

            <div
                class="flex items-start justify-between p-5 bg-green-50 border-l-4 border-green-400 rounded-lg"
            >
                <div class="flex items-start space-x-4">
                    <div
                        class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                        <i class="fa-solid fa-check text-green-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                            <h4 class="font-semibold text-gray-900">Motor Inspection</h4>
                            <span
                                class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                                >Completed</span
                            >
                        </div>
                        <p class="text-sm text-gray-700 mb-2">
                            Complete motor inspection, cleaning, and performance testing. All
                            components within normal parameters.
                        </p>
                        <div class="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                            <span
                                ><i class="fa-solid fa-calendar mr-1"></i>Completed on Sep 15,
                                2024</span
                            >
                            <span><i class="fa-solid fa-clock mr-1"></i>3 hours</span>
                            <span><i class="fa-solid fa-user mr-1"></i>Technician M. Johnson</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs text-gray-500">Progress:</span>
                            <div class="flex-1 h-2 bg-gray-200 rounded-full max-w-xs">
                                <div
                                    class="h-2 bg-green-500 rounded-full"
                                    style="width: 100%"
                                ></div>
                            </div>
                            <span class="text-xs text-gray-500">100%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts"></script>
