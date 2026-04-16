import { apiGet, apiPost, apiPut, apiDelete } from '@/util/api'
import type { AuthStore, OperationLocation } from '@/util/interfaces'

export const getOperationLocations = (authStore: AuthStore) => {
    return apiGet<OperationLocation[]>('/operation-config/locations', authStore)
}

export const getOperationLocationById = (id: string, authStore: AuthStore) => {
    return apiGet<OperationLocation>(`/operation-config/locations/${id}`, authStore)
}

export const createOperationLocation = (
    data: {
        country?: string
        state?: string
        city?: string
        isActive?: boolean
        requiredDocuments?: { documentTypeId: number; documentCodeId?: number | null }[]
    },
    authStore: AuthStore
) => {
    return apiPost<OperationLocation>('/operation-config/locations', data, authStore)
}

export const updateOperationLocation = (
    id: string,
    data: {
        country?: string
        state?: string
        city?: string
        isActive?: boolean
        requiredDocuments?: { documentTypeId: number; documentCodeId?: number | null }[]
    },
    authStore: AuthStore
) => {
    return apiPut<OperationLocation>(`/operation-config/locations/${id}`, data, authStore)
}

export const deleteOperationLocation = (id: string, authStore: AuthStore) => {
    return apiDelete<{ id: string }>(`/operation-config/locations/${id}`, authStore)
}

export const getLocationFilters = (authStore: AuthStore) => {
    return apiGet<{ countries: string[]; states: string[]; cities: string[] }>(
        '/operation-config/location-filters',
        authStore,
    )
}

export interface ComplianceRule {
    locationId: string
    country: string | null
    state: string | null
    city: string | null
    requiredDocuments: {
        documentTypeId: string
        documentTypeName: string
        documentCodeId: string | null
        documentCodeName: string | null
    }[]
}

export const getComplianceRules = (authStore: AuthStore) => {
    return apiGet<ComplianceRule[]>('/operation-config/compliance-rule', authStore)
}
