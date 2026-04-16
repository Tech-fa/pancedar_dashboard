import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ClientAccount } from '@/util/interfaces'

export const useClientStore = defineStore('client', () => {
    const storedClient = localStorage.getItem('client')
    const initialClient = storedClient ? (JSON.parse(storedClient) as ClientAccount) : null
    const client = ref<ClientAccount | null>(initialClient)

    const setClient = (data: ClientAccount) => {
        client.value = data
        localStorage.setItem('client', JSON.stringify(data))
    }

    const clearClient = () => {
        client.value = null
        localStorage.removeItem('client')
    }

    return {
        client,
        setClient,
        clearClient
    }
})
