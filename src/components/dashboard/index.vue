<template>
    <!-- Main Content -->
    <div id=" bg-secondary">
        <!-- Top Header -->
        <BreadCrumbs :crumbs="crumbs"> </BreadCrumbs>

        <!-- Fleet Readiness Overview Section -->
        <section id="fleet-overview" class="p-6 bg-secondary">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <Can subject="work-order" :actions="['read']">
                    <div class="lg:col-span-2 bg-secondary rounded-xl p-6 border border-gray-800">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-semibold text-opposite">Fleet Readiness</h2>
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span class="text-sm text-green-500 font-medium">Operational</span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-8">
                            <div class="text-center">
                                <GaugeChart
                                    :value="fleetReadiness.readinessPct"
                                    :loading="isDashboardKeyLoading('fleet_readiness_overview')"
                                    label="Mission Ready"
                                    height-class="h-32 w-32 mx-auto mb-2"
                                />
                            </div>
                            <div class="flex-1 space-y-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-opposite opacity-70">Active Units</span>
                                    <span class="text-opposite font-medium">
                                        {{ fleetReadiness.activeAssets }} /
                                        {{ fleetReadiness.totalAssets }}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-opposite opacity-70">Under Maintenance</span>
                                    <span class="text-yellow-500 font-medium">
                                        {{ fleetReadiness.maintenanceAssets }}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-opposite opacity-70">Grounded</span>
                                    <span class="text-red-500 font-medium">
                                        {{ fleetReadiness.groundedAssets }}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-opposite opacity-70">Avg Uptime (30d)</span>
                                    <span class="text-green-500 font-medium">
                                        {{ formatPercent(fleetReadiness.avgUptimePct) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Can>

                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Flight Hours Today</h3>
                    <div class="text-3xl font-bold text-blue-500 mb-2">
                        {{ flightHoursSummary.hoursToday.toFixed(1) }}h
                    </div>
                    <div class="flex items-center space-x-2 text-sm">
                        <i
                            class="fa-solid"
                            :class="[flightHoursChangeMeta.icon, flightHoursChangeMeta.class]"
                        ></i>
                        <span :class="flightHoursChangeMeta.class">{{
                            flightHoursChangeMeta.label
                        }}</span>
                        <span class="text-opposite opacity-70">vs yesterday</span>
                    </div>
                    <div class="mt-4 space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-opposite opacity-70">Planned</span>
                            <span class="text-opposite">
                                {{ formatHours(flightHoursSummary.plannedHoursAvg, 1) }}
                            </span>
                        </div>
                       
                    </div>
                </div>
                <Can subject="work-order" :actions="['read']">
                    <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                        <h3 class="text-lg font-semibold text-opposite mb-4">Maintenance Cost</h3>
                        <div class="text-3xl font-bold text-opposite mb-2">
                            {{ formatCurrency(maintenanceCostSummary.totalAmount) }}
                        </div>
                        <div class="flex items-center space-x-2 text-sm">
                            <i
                                class="fa-solid"
                                :class="[
                                    maintenanceCostChangeMeta.icon,
                                    maintenanceCostChangeMeta.class
                                ]"
                            ></i>
                            <span :class="maintenanceCostChangeMeta.class">{{
                                maintenanceCostChangeMeta.label
                            }}</span>
                            <span class="text-opposite opacity-70">vs last month</span>
                        </div>
                        <div class="mt-4 space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-opposite opacity-70">Preventive</span>
                                <span class="text-opposite">
                                    {{ formatCurrency(maintenanceCostSummary.preventiveAmount) }}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-opposite opacity-70">Corrective</span>
                                <span class="text-red-500">
                                    {{ formatCurrency(maintenanceCostSummary.correctiveAmount) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </Can>
            </div>
        </section>

        <!-- Alerts Overview Section -->
        <section id="alerts-overview" class="px-6 pb-6 bg-secondary mt-4">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-secondary rounded-xl p-6 border border-gray-800">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-semibold text-opposite">Critical Alerts</h2>
                        <button
                            class="text-blue-500 hover:text-blue-400 text-sm font-medium"
                            @click="$router.push('/alerts')"
                        >
                            View All
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div
                            v-for="alert in criticalAlerts"
                            :key="alert.id"
                            class="flex items-center p-4 rounded-lg transition"
                            :class="alertSeverityMeta(alert.severity).wrapper"
                        >
                            <div
                                class="w-3 h-3 rounded-full mr-4"
                                :class="{
                                    'bg-red-500': alert.severity === 'critical',
                                    'bg-yellow-500': alert.severity === 'warning',
                                    'bg-blue-500':
                                        alert.severity !== 'critical' &&
                                        alert.severity !== 'warning'
                                }"
                            ></div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between">
                                    <h4 class="font-medium text-opposite">
                                        {{ alert.alertName || alert.description }}
                                    </h4>
                                    <span class="text-xs text-opposite opacity-70">{{
                                        alert.createdLabel
                                    }}</span>
                                </div>
                                <p class="text-sm text-opposite opacity-70">
                                    {{ alert.description }}
                                </p>
                                <div class="flex items-center mt-2 space-x-4">
                                    <span
                                        class="text-xs px-2 py-1 rounded"
                                        :class="alertSeverityMeta(alert.severity).chip"
                                    >
                                        {{ alertSeverityMeta(alert.severity).label }}
                                    </span>
                                    <span class="text-xs text-opposite opacity-70">{{
                                        alert.assetName
                                    }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="!criticalAlerts.length" class="text-sm text-opposite opacity-70">
                            No active critical alerts.
                        </div>
                    </div>
                </div>

                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <h3 class="text-lg font-semibold text-opposite mb-4">Alert Distribution</h3>
                    <PieChart
                        :data="alertDistributionChartData"
                        :loading="isDashboardKeyLoading('alert_severity_distribution')"
                        :options="pieChartOptions"
                        class="mb-4"
                    />
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span class="text-sm text-opposite opacity-70">Critical</span>
                            </div>
                            <span class="text-sm font-medium text-opposite">
                                {{ alertSeverityBreakdown.counts.critical }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                <span class="text-sm text-opposite opacity-70">Warning</span>
                            </div>
                            <span class="text-sm font-medium text-opposite">
                                {{ alertSeverityBreakdown.counts.warning }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                <span class="text-sm text-opposite opacity-70">Info</span>
                            </div>
                            <span class="text-sm font-medium text-opposite">
                                {{ alertSeverityBreakdown.counts.info }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Kanban Work Orders Section -->
        <Can subject="work-order" :actions="['read']">
            <section id="work-orders-kanban" class="px-6 pb-6">
                <div class="bg-secondary rounded-xl p-6 border border-gray-800">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-semibold text-opposite">Active Work Orders</h2>
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <i class="fa-solid fa-filter text-opposite opacity-70"></i>
                                <select
                                    class="bg-main border border-gray-700 rounded px-3 py-1 text-sm text-opposite"
                                >
                                    <option>All Technicians</option>
                                    <option>John Smith</option>
                                    <option>Sarah Johnson</option>
                                    <option>Mike Wilson</option>
                                </select>
                            </div>
                            <button
                                class="bg-main hover:bg-secondary text-opposite px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                <i class="fa-solid fa-plus mr-2"></i>
                                New Work Order
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div
                            v-for="column in workOrderStatuses"
                            :key="column.key"
                            class="bg-main rounded-lg p-4"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-medium text-opposite">{{ column.label }}</h3>
                                <span
                                    class="text-xs px-2 py-1 rounded-full"
                                    :class="column.badgeClass"
                                >
                                    {{ (workOrdersByStatus[column.key] || []).length }}
                                </span>
                            </div>
                            <div class="space-y-3 max-h-[500px] overflow-y-auto">
                                <div
                                    v-for="order in workOrdersByStatus[column.key] || []"
                                    :key="order.id"
                                    class="bg-secondary border border-gray-700 rounded-lg p-4 cursor-pointer"
                                    @click="$router.push(`/services/work-orders/${order.id}`)"
                                >
                                    <div class="flex items-center justify-between mb-2">
                                        <span
                                            class="text-xs px-2 py-1 rounded"
                                            :class="
                                                order.priority === 'Critical'
                                                    ? 'bg-red-500 text-opposite'
                                                    : order.priority === 'High'
                                                      ? 'bg-yellow-500 text-main'
                                                      : 'bg-blue-500/20 text-blue-300'
                                            "
                                        >
                                            {{ order.priority || '—' }}
                                        </span>
                                        <span class="text-xs text-opposite opacity-70">{{
                                            order.code
                                        }}</span>
                                    </div>
                                    <h4 class="font-medium text-opposite text-sm mb-1">
                                        {{ order.title }}
                                    </h4>
                                    <p class="text-xs text-opposite opacity-70 mb-3">
                                        {{ order.assetName }}
                                    </p>
                                    <div
                                        class="flex items-center justify-between text-xs text-opposite opacity-70"
                                    >
                                        <span>{{ order.type || '—' }}</span>
                                        <span v-if="order.expectedEndDate">
                                            Due {{ formatDateToDay(order.expectedEndDate) }}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    v-if="!(workOrdersByStatus[column.key] || []).length"
                                    class="text-xs text-opposite opacity-70"
                                >
                                    No work orders in this state.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Can>

        <!-- Component Health Monitor Section -->
        <section id="component-health" class="px-6 pb-6">
            <div class="bg-secondary rounded-xl p-6 border">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-white">Component Health Monitor</h2>
                    <div class="flex items-center space-x-4">
                        <button class="text-opposite hover:text-white p-2">
                            <i class="fa-solid fa-refresh"></i>
                        </button>
                        <button class="text-opposite hover:text-white p-2">
                            <i class="fa-solid fa-download"></i>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div class="bg-main rounded-lg p-4">
                        <h3 class="font-medium text-white mb-4">Battery Health</h3>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-sm text-opposite opacity-70">Average Health</span>
                            <span class="text-sm font-semibold text-accent-green">
                                {{ formatPercent(componentHealthSummary.battery) }}
                            </span>
                        </div>
                        <div class="space-y-4">
                            <div
                                v-for="component in topComponentsByCategory('battery')"
                                :key="component.assetName + '-' + component.componentName"
                            >
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-opposite">{{
                                        component.assetName
                                    }}</span>
                                    <span
                                        class="text-sm font-medium"
                                        :class="
                                            component.status === 'critical'
                                                ? 'text-accent-red'
                                                : component.status === 'warning'
                                                  ? 'text-accent-yellow'
                                                  : 'text-accent-green'
                                        "
                                    >
                                        {{ component.healthScore.toFixed(0) }}%
                                    </span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        class="h-2 rounded-full"
                                        :class="
                                            component.status === 'critical'
                                                ? 'bg-red-500'
                                                : component.status === 'warning'
                                                  ? 'bg-yellow-500'
                                                  : 'bg-green-500'
                                        "
                                        :style="{
                                            width: `${Math.max(0, Math.min(100, component.healthScore)).toFixed(0)}%`
                                        }"
                                    ></div>
                                </div>
                            </div>
                            <div
                                v-if="!topComponentsByCategory('battery').length"
                                class="text-xs text-opposite opacity-70"
                            >
                                No battery components tracked yet.
                            </div>
                        </div>
                    </div>

                    <div class="bg-main rounded-lg p-4">
                        <h3 class="font-medium text-white mb-4">Motor Performance</h3>
                        <BarChart
                            :data="componentHealthChartData"
                            :loading="isDashboardKeyLoading('component_health_summary')"
                            :options="componentHealthChartOptions"
                            height-class="h-32 mb-4"
                        />
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-opposite">Average Health</span>
                                <span class="text-white">
                                    {{ formatPercent(componentHealthSummary.motor) }}
                                </span>
                            </div>
                            <div v-if="lowestMotorComponent" class="flex justify-between">
                                <span class="text-opposite">Lowest Component</span>
                                <span class="text-accent-yellow">
                                    {{ lowestMotorComponent?.assetName }}
                                    ({{ lowestMotorComponent?.healthScore.toFixed(0) }}%)
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-opposite">Tracked Components</span>
                                <span class="text-white">
                                    {{ topComponentsByCategory('motor').length }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-main rounded-lg p-4">
                        <h3 class="font-medium text-white mb-4">Avionics Status</h3>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-sm text-opposite opacity-70">Average Health</span>
                            <span class="text-sm font-semibold text-accent-green">
                                {{ formatPercent(componentHealthSummary.avionics) }}
                            </span>
                        </div>
                        <div class="space-y-3">
                            <div
                                v-for="component in topComponentsByCategory('avionics')"
                                :key="component.assetName + '-' + component.componentName"
                                class="flex items-center justify-between p-2 bg-secondary rounded"
                            >
                                <div class="flex items-center">
                                    <div
                                        class="w-2 h-2 rounded-full mr-2"
                                        :class="
                                            component.status === 'critical'
                                                ? 'bg-red-500'
                                                : component.status === 'warning'
                                                  ? 'bg-yellow-500'
                                                  : 'bg-green-500'
                                        "
                                    ></div>
                                    <span class="text-sm text-white">{{
                                        component.componentName
                                    }}</span>
                                </div>
                                <span
                                    class="text-xs"
                                    :class="
                                        component.status === 'critical'
                                            ? 'text-accent-red'
                                            : component.status === 'warning'
                                              ? 'text-accent-yellow'
                                              : 'text-accent-green'
                                    "
                                >
                                    {{ component.healthScore.toFixed(0) }}%
                                </span>
                            </div>
                            <div
                                v-if="!topComponentsByCategory('avionics').length"
                                class="text-xs text-opposite opacity-70"
                            >
                                No avionics components tracked yet.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Health Table -->
                <div class="bg-dark-tertiary rounded-lg overflow-hidden">
                    <div class="p-4 border-b border-gray-700">
                        <h3 class="font-medium text-white">Detailed Component Status</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-800">
                                <tr>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-opposite uppercase tracking-wider"
                                    >
                                        Asset
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-opposite uppercase tracking-wider"
                                    >
                                        Component
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-opposite uppercase tracking-wider"
                                    >
                                        Health Score
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-opposite uppercase tracking-wider"
                                    >
                                        Flight Hours
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-opposite uppercase tracking-wider"
                                    >
                                        Next Service
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-opposite uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-700">
                                <tr
                                    v-for="component in componentHealthDetails"
                                    :key="component.assetName + '-' + component.componentName"
                                    class="hover:bg-gray-800"
                                >
                                    <td class="px-4 py-3 text-sm text-white">
                                        {{ component.assetName }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-opposite">
                                        {{ component.componentName }}
                                    </td>
                                    <td class="px-4 py-3 text-sm">
                                        <span
                                            class="font-medium"
                                            :class="
                                                component.status === 'critical'
                                                    ? 'text-accent-red'
                                                    : component.status === 'warning'
                                                      ? 'text-accent-yellow'
                                                      : 'text-accent-green'
                                            "
                                        >
                                            {{ component.healthScore.toFixed(0) }}%
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-opposite">
                                        {{ component.flightHours.toFixed(1) }}h
                                    </td>
                                    <td class="px-4 py-3 text-sm text-opposite">
                                        <span v-if="component.nextServiceDue">
                                            {{ formatDateToDay(component.nextServiceDue) }}
                                        </span>
                                        <span v-else>—</span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span :class="componentStatusClass(component.status)">
                                            {{ component.status.toUpperCase() }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="!componentHealthDetails.length">
                                    <td
                                        colspan="6"
                                        class="px-4 py-6 text-center text-sm text-opposite opacity-70"
                                    >
                                        No component health data available.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

        <!-- Predictive Analytics Section -->
        <Can subject="work-order" :actions="['read']">
            <section id="predictive-analytics" class="px-6 pb-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-dark-secondary rounded-xl p-6 border border-gray-800">
                        <h2 class="text-xl font-semibold text-white mb-4">
                            Predictive Risk Outlook
                        </h2>
                        <div class="space-y-4">
                            <div
                                v-for="item in predictiveRiskList"
                                :key="item.assetName + '-' + item.riskScore"
                                class="flex items-center justify-between p-4 rounded-lg"
                                :class="
                                    item.riskScore >= 80
                                        ? 'bg-red-900/20 border border-red-800'
                                        : item.riskScore >= 60
                                          ? 'bg-yellow-900/20 border border-yellow-800'
                                          : 'bg-blue-900/20 border border-blue-800'
                                "
                            >
                                <div class="flex-1">
                                    <h4 class="font-medium text-white">{{ item.assetName }}</h4>
                                    <p class="text-sm text-opposite">
                                        Active: {{ item.activeOccurrences }} | Critical:
                                        {{ item.criticalOccurrences }}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <div
                                        class="text-2xl font-bold"
                                        :class="
                                            item.riskScore >= 80
                                                ? 'text-accent-red'
                                                : item.riskScore >= 60
                                                  ? 'text-accent-yellow'
                                                  : 'text-accent-blue'
                                        "
                                    >
                                        {{ Math.round(item.riskScore) }}%
                                    </div>
                                    <div class="text-xs text-opposite">Risk Score</div>
                                </div>
                            </div>
                            <div
                                v-if="!predictiveRiskList.length"
                                class="text-sm text-opposite opacity-70"
                            >
                                No predictive risk insights available yet.
                            </div>
                        </div>
                    </div>

                    <div class="bg-dark-secondary rounded-xl p-6 border border-gray-800">
                        <h2 class="text-xl font-semibold text-white mb-4">
                            Maintenance Efficiency
                        </h2>
                        <BarChart
                            :data="efficiencyChartData"
                            :loading="isDashboardKeyLoading('maintenance_efficiency')"
                            :options="efficiencyChartOptions"
                            class="mb-4"
                        />
                        <div class="grid grid-cols-2 gap-4">
                            <div class="text-center p-3 bg-dark-tertiary rounded-lg">
                                <div class="text-2xl font-bold text-accent-green">
                                    {{ formatPercent(maintenanceEfficiency.preventiveRatioPct) }}
                                </div>
                                <div class="text-sm text-opposite">Preventive Ratio</div>
                            </div>
                            <div class="text-center p-3 bg-dark-tertiary rounded-lg">
                                <div class="text-2xl font-bold text-accent-blue">
                                    {{ formatHours(maintenanceEfficiency.avgRepairHours, 1) }}
                                </div>
                                <div class="text-sm text-opposite">Avg Repair Time</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Can>
        <!-- Fleet Performance Metrics Section -->
        <Can subject="work-order" :actions="['read']">
            <section id="fleet-metrics" class="px-6 pb-6">
                <div class="bg-dark-secondary rounded-xl p-6 border border-gray-800">
                    <h2 class="text-xl font-semibold text-white mb-6">Fleet Performance Metrics</h2>

                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                        <div class="bg-main rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-accent-green mb-2">
                                {{ formatPercent(fleetPerformanceCards.availabilityPct) }}
                            </div>
                            <div class="text-sm text-opposite mb-1">Fleet Availability</div>
                            <div class="text-xs text-accent-green">Rolling 30-day average</div>
                        </div>

                        <div class="bg-main rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-accent-blue mb-2">
                                {{ fleetPerformanceCards.flightHours30d.toFixed(1) }}h
                            </div>
                            <div class="text-sm text-opposite mb-1">Total Flight Hours</div>
                            <div class="text-xs text-accent-green">Past 30 days</div>
                        </div>

                        <div class="bg-main rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-white mb-2">
                                {{
                                    fleetPerformanceCards.mtbfHours
                                        ? fleetPerformanceCards.mtbfHours.toFixed(1) + 'h'
                                        : '—'
                                }}
                            </div>
                            <div class="text-sm text-opposite mb-1">MTBF (Mean Time)</div>
                            <div class="text-xs text-accent-green">
                                Based on critical alert intervals
                            </div>
                        </div>

                        <div class="bg-main rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-accent-yellow mb-2">
                                {{ formatHours(fleetPerformanceCards.mttrHours, 1) }}
                            </div>
                            <div class="text-sm text-opposite mb-1">MTTR (Repair Time)</div>
                            <div class="text-xs text-accent-green">Resolved alert average</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-medium text-white mb-4">Flight Hours Trend</h3>
                            <LineChart
                                :data="flightHoursChartData"
                                :loading="isDashboardKeyLoading('flight_hours_trend')"
                                :options="areaChartOptions"
                            />
                        </div>

                        <div>
                            <h3 class="text-lg font-medium text-white mb-4">
                                Maintenance Cost Breakdown
                            </h3>
                            <PieChart
                                :data="costBreakdownChartData"
                                :loading="isDashboardKeyLoading('maintenance_cost_breakdown')"
                                :options="pieChartOptions"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </Can>

        <!-- Inventory Status Section -->
        <Can subject="part-inventory" :actions="['read']">
            <section id="inventory-status" class="px-6 pb-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-dark-secondary rounded-xl p-6 border border-gray-800">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-semibold text-white">
                                Critical Parts Inventory
                            </h2>
                            <button
                                class="text-accent-blue hover:text-blue-400 text-sm font-medium"
                            >
                                Manage Inventory
                            </button>
                        </div>

                        <div class="space-y-4">
                            <div
                                v-for="part in inventoryCriticalParts"
                                :key="part.id"
                                class="flex items-center justify-between p-3 rounded-lg"
                                :class="
                                    part.onHand <= 0
                                        ? 'bg-red-900/20 border border-red-800'
                                        : part.onHand <= part.reorderPoint
                                          ? 'bg-yellow-900/20 border border-yellow-800'
                                          : 'bg-green-900/20 border border-green-800'
                                "
                            >
                                <div>
                                    <h4 class="font-medium text-white">{{ part.name }}</h4>
                                    <p class="text-sm text-opposite">SKU: {{ part.sku }}</p>
                                    <p class="text-xs text-opposite opacity-70">
                                        Reorder point: {{ part.reorderPoint }} | On order:
                                        {{ part.onOrder }}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <div
                                        class="text-lg font-bold"
                                        :class="
                                            part.onHand <= 0
                                                ? 'text-accent-red'
                                                : part.onHand <= part.reorderPoint
                                                  ? 'text-accent-yellow'
                                                  : 'text-accent-green'
                                        "
                                    >
                                        {{ part.onHand }}
                                    </div>
                                    <div class="text-xs text-opposite">Units left</div>
                                </div>
                            </div>
                            <div
                                v-if="!inventoryCriticalParts.length"
                                class="text-sm text-opposite opacity-70"
                            >
                                Inventory levels are within thresholds.
                            </div>
                        </div>
                    </div>
                    <div class="bg-dark-secondary rounded-xl p-6 border border-gray-800">
                        <h2 class="text-xl font-semibold text-white mb-6">
                            Predictive Risk Heatmap
                        </h2>
                        <HeatmapChart
                            :data="riskHeatmapChartData"
                            :x-labels="riskHeatmap.weeks"
                            :y-labels="riskHeatmap.components"
                            :loading="isDashboardKeyLoading('predictive_risk_heatmap')"
                        />
                    </div>
                </div>
            </section>
        </Can>
        <!-- Cost Analysis & ROI Section -->
        <Can subject="work-order" :actions="['read']">
            <section id="cost-analysis" class="px-6 pb-8">
                <div class="bg-dark-secondary rounded-xl p-6 border border-gray-800">
                    <h2 class="text-xl font-semibold text-white mb-6">
                        Cost Analysis &amp; ROI Metrics
                    </h2>

                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                        <div class="bg-main rounded-lg p-4">
                            <h3 class="text-sm font-medium text-opposite mb-2">
                                Maintenance Savings
                            </h3>
                            <div class="text-2xl font-bold text-accent-green mb-1">
                                {{
                                    costAnalysisCards.savingsPct !== null
                                        ? formatPercent(costAnalysisCards.savingsPct)
                                        : '—'
                                }}
                            </div>
                            <div class="text-xs text-accent-green">Compared to prior quarter</div>
                        </div>

                        <div class="bg-main rounded-lg p-4">
                            <h3 class="text-sm font-medium text-opposite mb-2">
                                Total Maintenance Cost
                            </h3>
                            <div class="text-2xl font-bold text-white mb-1">
                                {{ formatCurrency(costAnalysisCards.totalCostQtd) }}
                            </div>
                            <div class="text-xs text-accent-green">Quarter to date</div>
                        </div>

                        <div class="bg-main rounded-lg p-4">
                            <h3 class="text-sm font-medium text-opposite mb-2">MTBF (Hours)</h3>
                            <div class="text-2xl font-bold text-accent-blue mb-1">
                                {{
                                    costAnalysisCards.mtbfHours !== null
                                        ? costAnalysisCards.mtbfHours.toFixed(1)
                                        : '—'
                                }}
                            </div>
                            <div class="text-xs text-accent-green">Critical alert intervals</div>
                        </div>

                        <div class="bg-main rounded-lg p-4">
                            <h3 class="text-sm font-medium text-opposite mb-2">MTTR (Hours)</h3>
                            <div class="text-2xl font-bold text-accent-yellow mb-1">
                                {{ formatHours(costAnalysisCards.mttrHours, 1) }}
                            </div>
                            <div class="text-xs text-accent-green">Average resolution time</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-medium text-white mb-4">ROI Trend Analysis</h3>
                            <LineChart
                                :data="roiChartData"
                                :loading="isDashboardKeyLoading('roi_trend')"
                                :options="lineChartOptions"
                            />
                        </div>

                        <div>
                            <h3 class="text-lg font-medium text-white mb-4">
                                Cost Breakdown by Category
                            </h3>
                            <BarChart
                                :data="costCategoryChartData"
                                :loading="isDashboardKeyLoading('cost_category_breakdown')"
                                :options="barChartOptions"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </Can>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BreadCrumbs from '@/components/breadCrums.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import { listDashboardConfigs, runDashboardQuery } from './endpoints'
import type { DashboardWidgetConfig, DashboardWidgetQueryResult } from '@/util/interfaces'
import { formatCurrency, formatDateToDay } from '@/util/util'
import GaugeChart from '@/components/common/charts/GaugeChart.vue'
import PieChart from '@/components/common/charts/PieChart.vue'
import BarChart from '@/components/common/charts/BarChart.vue'
import LineChart from '@/components/common/charts/LineChart.vue'
import HeatmapChart from '@/components/common/charts/HeatmapChart.vue'
import Can from '../Can.vue'

const authStore = useAuthStore()
const toast = useToast()

const crumbs = [{ name: 'Fleet Operations Dashboard' }]

const dashboardConfigs = ref<DashboardWidgetConfig[]>([])
const dashboardData = ref<Record<string, DashboardWidgetQueryResult>>({})
const dashboardLoading = ref(false)
const dashboardDataLoading = ref<Record<string, boolean>>({})

const numericField = (row: Record<string, unknown> | undefined, key: string, fallback = 0) => {
    const value = row?.[key]
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const numericFieldNullable = (row: Record<string, unknown> | undefined, key: string) => {
    const value = row?.[key]
    if (value === null || value === undefined) {
        return null
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const stringField = (row: Record<string, unknown> | undefined, key: string, fallback = '') => {
    const value = row?.[key]
    if (value === null || value === undefined) {
        return fallback
    }
    return String(value)
}

const formatPercent = (value: number | null | undefined, digits = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—'
    }
    return `${value.toFixed(digits)}%`
}

const formatHours = (value: number | null | undefined, digits = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—'
    }
    return `${value.toFixed(digits)}h`
}

const setDashboardLoading = (key: string, value: boolean) => {
    dashboardDataLoading.value = {
        ...dashboardDataLoading.value,
        [key]: value
    }
}

const isDashboardKeyLoading = (key: string) => {
    if (dashboardLoading.value) {
        return true
    }
    return dashboardDataLoading.value[key] ?? false
}

const dashboardRows = <T = Record<string, unknown>,>(key: string): T[] => {
    return (dashboardData.value[key]?.rows as T[]) ?? []
}

const dashboardFirstRow = <T = Record<string, unknown>,>(key: string): T | undefined => {
    const rows = dashboardRows<T>(key)
    if (!rows.length) {
        return undefined
    }
    return rows[0]
}

const fleetReadiness = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('fleet_readiness_overview')
    return {
        totalAssets: numericField(row, 'total_assets'),
        activeAssets: numericField(row, 'active_assets'),
        maintenanceAssets: numericField(row, 'maintenance_assets'),
        groundedAssets: numericField(row, 'grounded_assets'),
        readinessPct: numericField(row, 'readiness_pct'),
        avgUptimePct: numericField(row, 'avg_uptime_pct')
    }
})

const flightHoursSummary = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('flight_hours_today')
    return {
        hoursToday: numericField(row, 'hours_today'),
        hoursYesterday: numericField(row, 'hours_yesterday'),
        percentChange: numericFieldNullable(row, 'percent_change'),
        plannedHoursAvg: numericField(row, 'planned_hours_avg')
    }
})

const flightHoursChangeMeta = computed(() => {
    const change = flightHoursSummary.value.percentChange
    if (change === null || change === undefined || Number.isNaN(change)) {
        return { icon: 'fa-minus', class: 'text-neutral-400', label: '—' }
    }
    const icon = change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'
    const className = change >= 0 ? 'text-green-500' : 'text-red-500'
    const label = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    return { icon, class: className, label }
})

const maintenanceCostSummary = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('maintenance_cost_summary')
    return {
        totalAmount: numericField(row, 'total_amount'),
        preventiveAmount: numericField(row, 'preventive_amount'),
        correctiveAmount: numericField(row, 'corrective_amount'),
        inspectionAmount: numericField(row, 'inspection_amount'),
        percentChange: numericFieldNullable(row, 'percent_change')
    }
})

const maintenanceCostChangeMeta = computed(() => {
    const change = maintenanceCostSummary.value.percentChange
    if (change === null || change === undefined || Number.isNaN(change)) {
        return { icon: 'fa-minus', class: 'text-neutral-400', label: '—' }
    }
    const icon = change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'
    const className = change >= 0 ? 'text-green-500' : 'text-red-500'
    const label = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    return { icon, class: className, label }
})

const alertSeverityBreakdown = computed(() => {
    const rows = dashboardRows<Record<string, unknown>>('alert_severity_distribution')
    const counts = { critical: 0, warning: 0, info: 0 }
    rows.forEach((row) => {
        const category = stringField(row, 'category', '').toLowerCase()
        const total = numericField(row, 'total')
        if (category === 'critical') {
            counts.critical += total
        } else if (category === 'warning') {
            counts.warning += total
        } else if (category === 'info') {
            counts.info += total
        }
    })
    const total = counts.critical + counts.warning + counts.info
    return { counts, total }
})

const criticalAlerts = computed(() => {
    return dashboardRows<Record<string, unknown>>('critical_alerts_recent').map((row) => {
        const createdAt = numericField(row, 'created_at', 0)
        return {
            id: stringField(row, 'id', ''),
            assetName: stringField(row, 'asset_name', '—'),
            description: stringField(row, 'description', ''),
            severity: stringField(row, 'severity', 'info').toLowerCase(),
            status: stringField(row, 'status', ''),
            createdAt,
            alertName: stringField(row, 'alert_name', ''),
            createdLabel: createdAt > 0 ? formatDateToDay(createdAt) : '—'
        }
    })
})

const alertSeverityMeta = (severity: string) => {
    const normalized = (severity || '').toLowerCase()
    if (normalized === 'critical') {
        return {
            wrapper: 'bg-red-900/20 border border-red-800',
            chip: 'bg-red-500 text-opposite',
            label: 'CRITICAL'
        }
    }
    if (normalized === 'warning') {
        return {
            wrapper: 'bg-yellow-900/20 border border-yellow-800',
            chip: 'bg-yellow-500 text-main',
            label: 'WARNING'
        }
    }
    return {
        wrapper: 'bg-blue-900/20 border border-blue-800',
        chip: 'bg-blue-500 text-opposite',
        label: 'INFO'
    }
}

const workOrderStatuses = [
    {
        key: 'Open',
        label: 'Open',
        badgeClass: 'bg-secondary text-opposite',
        dotClass: 'bg-blue-500'
    },
    {
        key: 'InProgress',
        label: 'In Progress',
        badgeClass: 'bg-blue-500 text-opposite',
        dotClass: 'bg-blue-500'
    },
    {
        key: 'Completed',
        label: 'Completed',
        badgeClass: 'bg-green-500 text-opposite',
        dotClass: 'bg-green-500'
    },
    {
        key: 'Cancelled',
        label: 'Cancelled',
        badgeClass: 'bg-red-500 text-opposite',
        dotClass: 'bg-red-500'
    }
]

type WorkOrderItem = {
    id: string
    code: string
    title: string
    status: string
    priority: string
    type: string
    createdAt: number
    expectedEndDate: number | null
    assetName: string
}

const workOrdersByStatus = computed(() => {
    const rows = dashboardRows<Record<string, unknown>>('work_orders_kanban')
    const groups: Record<string, WorkOrderItem[]> = {}
    rows.forEach((row) => {
        const status = stringField(row, 'status', 'Other')
        if (!groups[status]) {
            groups[status] = []
        }
        groups[status].push({
            id: stringField(row, 'id', ''),
            code: stringField(row, 'code', ''),
            title: stringField(row, 'title', ''),
            status,
            priority: stringField(row, 'priority', ''),
            type: stringField(row, 'type', ''),
            createdAt: numericField(row, 'created_at', 0),
            expectedEndDate: numericFieldNullable(row, 'expected_end_date'),
            assetName: stringField(row, 'asset_name', '—')
        })
    })
    return groups
})

const componentHealthSummary = computed(() => {
    const rows = dashboardRows<Record<string, unknown>>('component_health_summary')
    const defaults = new Map<string, number>([
        ['Battery', -1],
        ['Motor', -1],
        ['Avionics', -1],
        ['Propeller', -1]
    ])
    rows.forEach((row) => {
        const category = stringField(row, 'category', '')
        const score = numericField(row, 'health_score', -1)
        if (defaults.has(category)) {
            defaults.set(category, score)
        }
    })
    const categories = Array.from(defaults.entries()).map(([category, score]) => ({
        category,
        score
    }))
    return {
        battery: defaults.get('Battery') ?? 100,
        motor: defaults.get('Motor') ?? 100,
        avionics: defaults.get('Avionics') ?? 100,
        propeller: defaults.get('Propeller') ?? 100,
        categories
    }
})

const componentHealthDetails = computed(() => {
    return dashboardRows<Record<string, unknown>>('component_health_details').map((row) => ({
        assetName: stringField(row, 'asset_name', '—'),
        componentName: stringField(row, 'component_name', '—'),
        healthScore: numericField(row, 'health_score'),
        flightHours: numericField(row, 'flight_hours_30d'),
        nextServiceDue: numericFieldNullable(row, 'next_service_due'),
        status: stringField(row, 'status', 'good'),
        lastAlertAt: numericFieldNullable(row, 'last_alert_at')
    }))
})

const topComponentsByCategory = (category: string) => {
    const normalized = category.toLowerCase()
    return componentHealthDetails.value
        .filter((item) => item.componentName.toLowerCase().includes(normalized))
        .sort((a, b) => a.healthScore - b.healthScore)
        .slice(0, 3)
}

const lowestComponentForCategory = (category: string) => {
    const [first] = topComponentsByCategory(category)
    return first
}

const lowestMotorComponent = computed(() => lowestComponentForCategory('motor'))
const lowestAvionicsComponent = computed(() => lowestComponentForCategory('avionics'))

const componentStatusClass = (status: string) => {
    const normalized = (status || '').toLowerCase()
    if (normalized === 'critical') {
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200'
    }
    if (normalized === 'warning') {
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200'
    }
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200'
}

const predictiveRiskList = computed(() => {
    return dashboardRows<Record<string, unknown>>('predictive_risk_outlook').map((row) => ({
        assetName: stringField(row, 'asset_name', '—'),
        riskScore: numericField(row, 'risk_score'),
        activeOccurrences: numericField(row, 'active_occurrences'),
        criticalOccurrences: numericField(row, 'critical_occurrences'),
        lastOccurredAt: numericFieldNullable(row, 'last_occurred_at')
    }))
})

const maintenanceEfficiency = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('maintenance_efficiency')
    return {
        preventiveCount: numericField(row, 'preventive_count'),
        correctiveCount: numericField(row, 'corrective_count'),
        preventiveRatioPct: numericField(row, 'preventive_ratio_pct'),
        avgRepairHours: numericField(row, 'avg_repair_hours')
    }
})

const fleetPerformanceCards = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('fleet_performance_cards')
    return {
        availabilityPct: numericField(row, 'fleet_availability_pct'),
        flightHours30d: numericField(row, 'total_flight_hours_30d'),
        mtbfHours: numericFieldNullable(row, 'mtbf_hours'),
        mttrHours: numericField(row, 'mttr_hours')
    }
})

const flightHoursTrend = computed(() => {
    return dashboardRows<Record<string, unknown>>('flight_hours_trend').map((row) => ({
        bucket: stringField(row, 'bucket', ''),
        totalHours: numericField(row, 'total_hours')
    }))
})

const maintenanceCostBreakdown = computed(() => {
    return dashboardRows<Record<string, unknown>>('maintenance_cost_breakdown').map((row) => ({
        category: stringField(row, 'category', ''),
        total: numericField(row, 'total')
    }))
})

const inventoryCriticalParts = computed(() => {
    return dashboardRows<Record<string, unknown>>('inventory_critical_parts').map((row) => ({
        id: stringField(row, 'id', ''),
        name: stringField(row, 'name', ''),
        sku: stringField(row, 'sku', ''),
        onHand: numericField(row, 'on_hand'),
        reserved: numericField(row, 'reserved'),
        onOrder: numericField(row, 'on_order'),
        reorderPoint: numericField(row, 'reorder_point'),
        reorderQuantity: numericField(row, 'reorder_quantity')
    }))
})

const riskHeatmap = computed(() => {
    const rows = dashboardRows<Record<string, unknown>>('predictive_risk_heatmap')
    const componentSet = new Set<string>()
    const weekMap = new Map<string, string>()
    const data = rows.map((row) => {
        const component = stringField(row, 'component', '')
        const weekKey = stringField(row, 'week_key', '')
        const weekLabel = stringField(row, 'week_label', '')
        const value = numericField(row, 'total')
        componentSet.add(component)
        if (weekKey && !weekMap.has(weekKey)) {
            weekMap.set(weekKey, weekLabel)
        }
        return { component, weekKey, weekLabel, value }
    })
    const components = Array.from(componentSet)
    const weeks = Array.from(weekMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, label]) => label)
    return { data, components, weeks }
})

const costAnalysisCards = computed(() => {
    const row = dashboardFirstRow<Record<string, unknown>>('cost_analysis_cards')
    return {
        totalCostQtd: numericField(row, 'total_cost_qtd'),
        preventiveCostQtd: numericField(row, 'preventive_cost_qtd'),
        savingsPct: numericFieldNullable(row, 'savings_pct'),
        mtbfHours: numericFieldNullable(row, 'mtbf_hours'),
        mttrHours: numericField(row, 'mttr_hours')
    }
})

const roiTrend = computed(() => {
    return dashboardRows<Record<string, unknown>>('roi_trend').map((row) => ({
        bucket: stringField(row, 'bucket', ''),
        roiPct: numericField(row, 'roi_pct')
    }))
})

const costCategoryBreakdown = computed(() => {
    return dashboardRows<Record<string, unknown>>('cost_category_breakdown').map((row) => ({
        category: stringField(row, 'category', ''),
        total: numericField(row, 'total')
    }))
})

// Chart Data Computed Properties
const alertDistributionChartData = computed(() => {
    const { counts } = alertSeverityBreakdown.value
    return {
        labels: ['Critical', 'Warning', 'Info'],
        datasets: [
            {
                data: [counts.critical, counts.warning, counts.info],
                backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
                borderWidth: 0
            }
        ]
    }
})

const componentHealthChartData = computed(() => {
    const categories = componentHealthSummary.value.categories
    return {
        labels: categories.map((entry) => entry.category),
        datasets: [
            {
                label: 'Health Score',
                data: categories.map((entry) => entry.score),
                backgroundColor: '#10b981',
                borderRadius: 4
            }
        ]
    }
})

const efficiencyChartData = computed(() => {
    const value = maintenanceEfficiency.value
    return {
        labels: ['Preventive', 'Corrective'],
        datasets: [
            {
                label: 'Work Orders',
                data: [value.preventiveCount, value.correctiveCount],
                backgroundColor: ['#10b981', '#ef4444'],
                borderRadius: 4
            }
        ]
    }
})

const flightHoursChartData = computed(() => {
    const data = flightHoursTrend.value
    return {
        labels: data.map((item) => item.bucket),
        datasets: [
            {
                label: 'Flight Hours',
                data: data.map((item) => item.totalHours),
                fill: true,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                pointRadius: 0
            }
        ]
    }
})

const costBreakdownChartData = computed(() => {
    const data = maintenanceCostBreakdown.value
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    return {
        labels: data.map((item) => item.category || 'Uncategorised'),
        datasets: [
            {
                data: data.map((item) => item.total),
                backgroundColor: data.map((_, i) => colors[i % colors.length]),
                borderWidth: 0
            }
        ]
    }
})

const roiChartData = computed(() => {
    const data = roiTrend.value
    return {
        labels: data.map((item) => item.bucket),
        datasets: [
            {
                label: 'ROI',
                data: data.map((item) => item.roiPct),
                borderColor: '#10b981',
                backgroundColor: '#10b981',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }
        ]
    }
})

const costCategoryChartData = computed(() => {
    const data = costCategoryBreakdown.value
    return {
        labels: data.map((item) => item.category || 'Unknown'),
        datasets: [
            {
                label: 'Cost',
                data: data.map((item) => item.total),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }
        ]
    }
})

const riskHeatmapChartData = computed(() => {
    const { data, components, weeks } = riskHeatmap.value
    const weekIndex = new Map<string, number>()
    weeks.forEach((label, index) => {
        weekIndex.set(label, index)
    })
    const componentIndex = new Map<string, number>()
    components.forEach((component, index) => {
        componentIndex.set(component, index)
    })
    return data
        .filter((item) => componentIndex.has(item.component) && weekIndex.has(item.weekLabel))
        .map((item) => ({
            x: weekIndex.get(item.weekLabel) ?? 0,
            y: componentIndex.get(item.component) ?? 0,
            value: item.value
        }))
})

// Chart Options
const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    }
}

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
}

const componentHealthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x' as const,
    scales: {
        x: {
            ticks: { color: '#9ca3af', font: { size: 11 } },
            grid: { display: false }
        },
        y: {
            min: 0,
            max: 100,
            ticks: { color: '#9ca3af', font: { size: 11 } },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
}

const efficiencyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: { color: '#9ca3af' },
            grid: { display: false }
        },
        y: {
            beginAtZero: true,
            title: { display: true, text: 'Work Orders', color: '#9ca3af' },
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
}

const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        },
        y: {
            title: { display: true, text: 'ROI %', color: '#9ca3af' },
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
}

const areaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        },
        y: {
            title: { display: true, text: 'Hours', color: '#9ca3af' },
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(55, 65, 81, 0.4)' }
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
}

const fetchDashboardData = async (config: DashboardWidgetConfig) => {
    setDashboardLoading(config.key, true)
    try {
        const response = await runDashboardQuery(authStore, config.key)
        if (response) {
            dashboardData.value = {
                ...dashboardData.value,
                [config.key]: response
            }
        }
    } catch (error) {
        console.error(`Failed to load dashboard data for ${config.key}`, error)
        toast.showToast('Error', 'Unable to load dashboard data. Please try again later.', 'error')
    } finally {
        setDashboardLoading(config.key, false)
    }
}

const loadDashboard = async () => {
    dashboardLoading.value = true
    try {
        const configs = await listDashboardConfigs(authStore)
        dashboardConfigs.value = configs ?? []
        await Promise.all(
            dashboardConfigs.value
                .filter((config) =>
                    authStore.hasPermissions({ subject: config.subject, actions: ['read'] })
                )
                .map((config) => fetchDashboardData(config))
        )
    } catch (error) {
        console.error('Failed to load dashboard widgets', error)
        toast.showToast('Error', 'Failed to load dashboard', 'error')
    } finally {
        dashboardLoading.value = false
    }
}

onMounted(async () => {
    await loadDashboard()
})
</script>
