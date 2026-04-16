import { apiGet } from '@/util/api'
import type {
    AuthStore,
    DashboardWidgetConfig,
    DashboardWidgetQueryResult
} from '@/util/interfaces'

export const listDashboardConfigs = (authStore: AuthStore, module?: string) => {
    const params = module ? `?module=${encodeURIComponent(module)}` : ''
    return apiGet<DashboardWidgetConfig[]>(`/dashboard/configs${params}`, authStore)
}

export const runDashboardQuery = (authStore: AuthStore, key: string) => {
    return apiGet<DashboardWidgetQueryResult>(`/dashboard/configs/${key}/data`, authStore)
}
