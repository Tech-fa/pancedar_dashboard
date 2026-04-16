<template>
    <div id="alerts-tab" class="tab-content p-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
                <h3 class="text-lg font-semibold text-gray-900">Active Alerts</h3>
                <div class="flex items-center space-x-2">
                    <select class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                        <option>All Severities</option>
                        <option>Critical</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                    <select class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                        <option>All Types</option>
                        <option>Temperature</option>
                        <option>Vibration</option>
                        <option>Performance</option>
                        <option>Safety</option>
                    </select>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <button
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <i class="fa-solid fa-download mr-2"></i>
                    Export
                </button>
                <button
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                    <i class="fa-solid fa-plus mr-2"></i>
                    Create Alert
                </button>
            </div>
        </div>

        <div id="alerts-list" class="space-y-4">
            <div
                class="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
            >
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <i class="fa-solid fa-exclamation-triangle text-red-600"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">High Vibration Detected</h4>
                        <p class="text-sm text-gray-600">
                            Motor bearing showing excessive vibration levels at 3.2 mm/s
                        </p>
                        <div class="flex items-center space-x-4 mt-2">
                            <p class="text-xs text-gray-500">Triggered 2 hours ago</p>
                            <p class="text-xs text-gray-500">Sensor: VIB-001</p>
                            <p class="text-xs text-gray-500">Threshold: >2.5 mm/s</p>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <span
                        class="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                        >Critical</span
                    >
                    <div class="flex items-center space-x-1">
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="Acknowledge"
                        >
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="Snooze"
                        >
                            <i class="fa-solid fa-clock"></i>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="More options"
                        >
                            <i class="fa-solid fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div
                class="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg"
            >
                <div class="flex items-center space-x-3">
                    <div
                        class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"
                    >
                        <i class="fa-solid fa-thermometer-half text-orange-600"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">Temperature Warning</h4>
                        <p class="text-sm text-gray-600">
                            Operating temperature above normal range at 85°C
                        </p>
                        <div class="flex items-center space-x-4 mt-2">
                            <p class="text-xs text-gray-500">Triggered 4 hours ago</p>
                            <p class="text-xs text-gray-500">Sensor: TEMP-002</p>
                            <p class="text-xs text-gray-500">Threshold: >80°C</p>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <span
                        class="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full"
                        >Medium</span
                    >
                    <div class="flex items-center space-x-1">
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="Acknowledge"
                        >
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="Snooze"
                        >
                            <i class="fa-solid fa-clock"></i>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="More options"
                        >
                            <i class="fa-solid fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div
                class="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
                <div class="flex items-center space-x-3">
                    <div
                        class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
                    >
                        <i class="fa-solid fa-battery-half text-yellow-600"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">Power Consumption Spike</h4>
                        <p class="text-sm text-gray-600">
                            Unusual power consumption pattern detected
                        </p>
                        <div class="flex items-center space-x-4 mt-2">
                            <p class="text-xs text-gray-500">Triggered 6 hours ago</p>
                            <p class="text-xs text-gray-500">Sensor: PWR-001</p>
                            <p class="text-xs text-gray-500">Current: 52.3 kW</p>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <span
                        class="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full"
                        >Low</span
                    >
                    <div class="flex items-center space-x-1">
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="Acknowledge"
                        >
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="Snooze"
                        >
                            <i class="fa-solid fa-clock"></i>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="More options"
                        >
                            <i class="fa-solid fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="alert-history" class="mt-8">
            <h4 class="text-md font-semibold text-gray-900 mb-4">Recent Alert History</h4>
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="space-y-3">
                    <div
                        class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                    >
                        <div class="flex items-center space-x-3">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span class="text-sm text-gray-900">Motor Temperature Alert</span>
                            <span class="text-xs text-gray-500">Resolved</span>
                        </div>
                        <span class="text-xs text-gray-500">Yesterday, 2:30 PM</span>
                    </div>
                    <div
                        class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                    >
                        <div class="flex items-center space-x-3">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span class="text-sm text-gray-900">Belt Speed Anomaly</span>
                            <span class="text-xs text-gray-500">Resolved</span>
                        </div>
                        <span class="text-xs text-gray-500">Oct 1, 10:15 AM</span>
                    </div>
                    <div class="flex items-center justify-between py-2">
                        <div class="flex items-center space-x-3">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span class="text-sm text-gray-900">Sensor Communication Error</span>
                            <span class="text-xs text-gray-500">Resolved</span>
                        </div>
                        <span class="text-xs text-gray-500">Sep 29, 4:45 PM</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
