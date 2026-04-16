import { apiGet } from "@/util/api"
import type { AuthStore } from "@/util/interfaces"

export const getAssetsWithMap = (authStore: AuthStore) => {
    return apiGet<any[]>('/assets/map', authStore)
}   