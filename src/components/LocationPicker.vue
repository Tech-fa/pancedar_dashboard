<template>
    <div class="grid gap-4" :class="gridClass">
        <div>
            <label v-if="showLabels" class="block text-sm font-medium text-opposite mb-1">Country</label>
            <Select2 :modelValue="selectedCountry" :values="countries" :display="countryDisplay"
                placeholder="Select country..." optional @update:modelValue="onCountryChange" />
        </div>

        <div>
            <label v-if="showLabels" class="block text-sm font-medium text-opposite mb-1">State / Region</label>
            <Select2 :modelValue="selectedState" :values="filteredStates" :display="stateDisplay"
                placeholder="Select state..." optional :disabled="!selectedCountry"
                @update:modelValue="onStateChange" />
        </div>

        <div>
            <label v-if="showLabels" class="block text-sm font-medium text-opposite mb-1">City</label>
            <Select2 :modelValue="selectedCity" :values="filteredCities" :display="cityDisplay" placeholder="Select city..."
                optional :disabled="!selectedState" @update:modelValue="onCityChange" />
        </div>

        <div>
            <label v-if="showLabels" class="block text-sm font-medium text-opposite mb-1">Address</label>
            <input type="text" :class="INPUT_CLASS" :value="modelValue.address || ''" placeholder="Street address..."
                @input="onFieldInput('address', ($event.target as HTMLInputElement).value)" />
        </div>

        <div>
            <label v-if="showLabels" class="block text-sm font-medium text-opposite mb-1">Postal Code</label>
            <input type="text" :class="INPUT_CLASS" :value="modelValue.postalCode || ''"
                placeholder="Postal / ZIP code..."
                @input="onFieldInput('postalCode', ($event.target as HTMLInputElement).value)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Country, State, City } from 'country-state-city'
import type { ICountry, IState, ICity } from 'country-state-city'
import Select2 from '@/components/Select2.vue'
import { INPUT_CLASS } from '@/components/contants'
import { getLocationFilters } from '@/components/operation-config/endpoints'
import { useAuthStore } from '@/stores/auth'

export interface LocationData {
    country: string | null
    state: string | null
    city: string | null
    address: string | null
    postalCode: string | null
    latitude: number | null
    longitude: number | null
}

const props = withDefaults(defineProps<{
    modelValue: LocationData
    showLabels?: boolean
    gridClass?: string
}>(), {
    showLabels: true,
    gridClass: 'md:grid-cols-2 lg:grid-cols-3',
})

const emit = defineEmits<{
    (e: 'update:modelValue', v: LocationData): void
}>()

const authStore = useAuthStore()

const allCountries = Country.getAllCountries()
const allowedCountryNames = ref<Set<string> | null>(null)
const allowedStateNames = ref<Set<string> | null>(null)
const allowedCityNames = ref<Set<string> | null>(null)

const countries = computed(() => {
    if (!allowedCountryNames.value) return allCountries
    return allCountries.filter(c => allowedCountryNames.value!.has(c.name))
})

const states = ref<IState[]>([])
const cities = ref<ICity[]>([])

const filteredStates = computed(() => {
    if (!allowedStateNames.value) return states.value
    return states.value.filter(s => allowedStateNames.value!.has(s.name))
})

const filteredCities = computed(() => {
    if (!allowedCityNames.value) return cities.value
    return cities.value.filter(c => allowedCityNames.value!.has(c.name))
})

const selectedCountry = ref<ICountry | null>(null)
const selectedState = ref<IState | null>(null)
const selectedCity = ref<ICity | null>(null)

const countryDisplay = (c: ICountry | null) => c ? `${c.flag} ${c.name}` : ''
const stateDisplay = (s: IState | null) => s?.name || ''
const cityDisplay = (c: ICity | null) => c?.name || ''

const emitUpdate = (partial: Partial<LocationData>) => {
    emit('update:modelValue', { ...props.modelValue, ...partial })
}

const onCountryChange = (country: ICountry | null) => {
    selectedCountry.value = country
    selectedState.value = null
    selectedCity.value = null
    states.value = country ? State.getStatesOfCountry(country.isoCode) : []
    cities.value = []

    const lat = country?.latitude ? parseFloat(country.latitude) : null
    const lng = country?.longitude ? parseFloat(country.longitude) : null
    emitUpdate({
        country: country?.name || null,
        state: null,
        city: null,
        latitude: lat,
        longitude: lng,
    })
}

const onStateChange = (state: IState | null) => {
    selectedState.value = state
    selectedCity.value = null
    cities.value = state && selectedCountry.value
        ? City.getCitiesOfState(selectedCountry.value.isoCode, state.isoCode)
        : []

    const lat = state?.latitude ? parseFloat(state.latitude) : props.modelValue.latitude
    const lng = state?.longitude ? parseFloat(state.longitude) : props.modelValue.longitude
    emitUpdate({
        state: state?.name || null,
        city: null,
        latitude: lat,
        longitude: lng,
    })
}

const onCityChange = (city: ICity | null) => {
    selectedCity.value = city
    const lat = city?.latitude ? parseFloat(city.latitude) : props.modelValue.latitude
    const lng = city?.longitude ? parseFloat(city.longitude) : props.modelValue.longitude
    emitUpdate({
        city: city?.name || null,
        latitude: lat,
        longitude: lng,
    })
}

const onFieldInput = (field: 'address' | 'postalCode', value: string) => {
    emitUpdate({ [field]: value || null })
}

const restoreFromModelValue = () => {
    if (props.modelValue.country) {
        const match = allCountries.find(c => c.name === props.modelValue.country)
        if (match) {
            selectedCountry.value = match
            states.value = State.getStatesOfCountry(match.isoCode)

            if (props.modelValue.state) {
                const stateMatch = states.value.find(s => s.name === props.modelValue.state)
                if (stateMatch) {
                    selectedState.value = stateMatch
                    cities.value = City.getCitiesOfState(match.isoCode, stateMatch.isoCode)

                    if (props.modelValue.city) {
                        const cityMatch = cities.value.find(c => c.name === props.modelValue.city)
                        if (cityMatch) selectedCity.value = cityMatch
                    }
                }
            }
        }
    }
}

onMounted(async () => {
    try {
        const filters = await getLocationFilters(authStore)
        if (filters.countries.length > 0) {
            allowedCountryNames.value = new Set(filters.countries)
            allowedStateNames.value = new Set(filters.states)
            allowedCityNames.value = new Set(filters.cities)
        }
    } catch {
        // If the endpoint fails, show all options (no filtering)
    }
    restoreFromModelValue()
})
</script>
