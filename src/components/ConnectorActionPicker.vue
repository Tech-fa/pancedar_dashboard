<template>
    <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block text-xs text-opposite/60 mb-1">Connector</label>
                <Select2 :modelValue="selectedConnector" :values="connectors" :display="connectorDisplay"
                    placeholder="Select connector..." optional @update:modelValue="onConnectorChanged" />
            </div>
            <div v-if="selectedConnector">
                <label class="block text-xs text-opposite/60 mb-1">Action Instance</label>
                <div class="flex items-center gap-2">
                    <div class="flex-1">
                        <Select2 :modelValue="selectedActionInstance" :values="actionInstances"
                            :display="actionInstanceDisplay" placeholder="Select action instance..." optional
                            @update:modelValue="onActionInstanceChanged" />
                    </div>
                    <button type="button" @click="emit('reloadConnectors')"
                        class="p-1.5 text-opposite/50 hover:text-blue-400 transition-colors"
                        title="Reload action instances">
                        <i class="fa-solid fa-arrows-rotate text-sm"></i>
                    </button>
                    <button type="button" @click="openAddActionInstance"
                        class="p-1.5 text-opposite/50 hover:text-blue-400 transition-colors"
                        title="Add new action instance">
                        <i class="fa-solid fa-plus text-sm"></i>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="loadingVariables" class="flex items-center gap-2 text-xs text-opposite/40">
            <Spinner width="1" height="1" /> Loading variables...
        </div>

        <div v-if="showBindings && !loadingVariables && variables.length > 0"
            class="border border-gray-700 rounded-lg p-3">
            <label class="block text-xs text-opposite/60 font-medium mb-2">Variable Bindings</label>

            <div v-if="hasInjectionModules" class="mb-3">
                <label class="block text-xs text-opposite/50 mb-1">Injection module (optional)</label>
                <Select2 :modelValue="selectedModuleOption" :values="moduleOptions"
                    :display="(o: any) => o?.label || ''" placeholder="None — constants only…" optional
                    @update:modelValue="onModuleSelected" />
                <p v-if="!selectedInjectionModule" class="text-[11px] text-opposite/40 mt-1">
                    Without a module, every variable is a constant.
                </p>
                <p v-else class="text-[11px] text-opposite/40 mt-1">
                    Toggle each variable between constant and injectable from this module.
                </p>
            </div>

            <div class="space-y-2">
                <div v-for="varName in variables" :key="varName"
                    class="bg-secondary rounded border border-gray-600 p-2">
                    <div class="flex items-center gap-2 mb-1.5">
                        <span class="text-xs text-opposite font-medium font-mono">@@{{ varName }}@@</span>
                        <div class="flex items-center gap-1 ml-auto">
                            <button type="button" class="px-2 py-0.5 text-[10px] rounded border transition-colors"
                                :class="getBindingType(varName) === 'constant'
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                    : 'border-gray-600 text-opposite/50 hover:border-gray-500'"
                                @click="setBinding(varName, { type: 'constant', value: '' })">
                                Constant
                            </button>
                            <button v-if="effectiveInjectableOptions.length > 0" type="button"
                                class="px-2 py-0.5 text-[10px] rounded border transition-colors" :class="getBindingType(varName) === 'injectable'
                                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                    : 'border-gray-600 text-opposite/50 hover:border-gray-500'"
                                @click="setBinding(varName, { type: 'injectable', module: '', property: '' })">
                                Injectable
                            </button>
                            <button v-if="responseOptions.length > 0" type="button"
                                class="px-2 py-0.5 text-[10px] rounded border transition-colors" :class="getBindingType(varName) === 'response'
                                    ? 'bg-green-500/20 border-green-500 text-green-400'
                                    : 'border-gray-600 text-opposite/50 hover:border-gray-500'"
                                @click="setBinding(varName, { type: 'response', mappedTo: '' })">
                                Response
                            </button>
                        </div>
                    </div>

                    <!-- Constant value -->
                    <div v-if="getBindingType(varName) === 'constant'">
                        <input type="text" :value="(currentBindings[varName] as any)?.value || ''"
                            @input="updateConstantValue(varName, ($event.target as HTMLInputElement).value)"
                            placeholder="Enter constant value..." :class="[INPUT_CLASS, 'w-full text-xs']" />
                    </div>

                    <!-- Injectable select -->
                    <div v-else-if="getBindingType(varName) === 'injectable'">
                        <Select2 :modelValue="findInjectableOption(varName)" :values="effectiveInjectableOptions"
                            :display="(o: any) => o?.label || ''" placeholder="Select property to inject..."
                            @update:modelValue="(val: any) => onInjectableSelected(varName, val)" />
                    </div>

                    <!-- Response select -->
                    <div v-else-if="getBindingType(varName) === 'response'">
                        <Select2 :modelValue="findResponseOption(varName)" :values="availableResponseOptions"
                            :display="(o: any) => o?.label || ''" placeholder="Select response value..."
                            @update:modelValue="(val: any) => onResponseSelected(varName, val)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Select2 from '@/components/Select2.vue'
import Spinner from '@/components/Spinner.vue'
import { INPUT_CLASS } from '@/components/contants'
import { useAuthStore } from '@/stores/auth'
import { getActionInstanceVariables } from '@/components/fleet/endpoints'
import type { Connector, ConnectorActionInstance, VariableBinding, InjectableModule } from '@/components/fleet/endpoints'
import { getWorkflowConditionFields } from './automation/endpoints'

interface InjectableOption {
    module: string
    property: string
    label: string
}

interface ResponseOption {
    mappedTo: string
    label: string
    step?: string
}

const props = withDefaults(
    defineProps<{
        connectors: Connector[]
        selectedConnector: Connector | null
        selectedActionInstance: ConnectorActionInstance | null
        variableBindings: Record<string, VariableBinding>
        injectableOptions?: InjectableOption[]
        responseOptions?: { source: string; sourceId: string; sourceType: string, step: string }[]
        showBindings?: boolean
        injectionModules?: Record<string, InjectableModule>
        selectedInjectionModule?: string | null
    }>(),
    {
        injectableOptions: () => [],
        responseOptions: () => [],
        showBindings: true,
        injectionModules: undefined,
        selectedInjectionModule: null,
    },
)

const emit = defineEmits<{
    'update:selectedConnector': [val: Connector | null]
    'update:selectedActionInstance': [val: ConnectorActionInstance | null]
    'update:variableBindings': [val: Record<string, VariableBinding>]
    'reloadConnectors': []
    'variablesLoaded': [variables: string[]]
    'update:selectedInjectionModule': [val: string | null]
}>()

const router = useRouter()
const authStore = useAuthStore()

const variables = ref<string[]>([])
const loadingVariables = ref(false)

const actionInstances = computed(() =>
    props.selectedConnector?.actionInstances || [],
)

const currentBindings = computed(() => props.variableBindings)
const availableResponseOptions = ref<{ mappedTo: string; label: string; step: string }[]>([])

type ModuleOption = { key: string; label: string }

const hasInjectionModules = computed(() =>
    props.injectionModules && Object.keys(props.injectionModules).length > 0,
)

const moduleOptions = computed<ModuleOption[]>(() => {
    if (!props.injectionModules) return []
    return Object.entries(props.injectionModules).map(([key, mod]) => ({
        key,
        label: mod.label,
    }))
})
console.log(props.responseOptions)
const selectedModuleOption = computed<ModuleOption | null>(() => {
    if (!props.selectedInjectionModule) return null
    return moduleOptions.value.find(o => o.key === props.selectedInjectionModule) ?? null
})

const moduleDerivedInjectableOptions = computed<InjectableOption[]>(() => {
    if (!props.injectionModules || !props.selectedInjectionModule) return []
    const mod = props.injectionModules[props.selectedInjectionModule]
    if (!mod) return []
    return mod.properties.map(p => ({
        module: props.selectedInjectionModule!,
        property: p.key,
        label: p.label,
    }))
})

const effectiveInjectableOptions = computed<InjectableOption[]>(() => {
    if (moduleDerivedInjectableOptions.value.length > 0) return moduleDerivedInjectableOptions.value
    return props.injectableOptions
})

function onModuleSelected(val: ModuleOption | null) {
    emit('update:selectedInjectionModule', val?.key ?? null)
    if (!val) {
        const updated = { ...currentBindings.value }
        for (const [k, b] of Object.entries(updated)) {
            if (b?.type === 'injectable') {
                updated[k] = { type: 'constant', value: '' }
            }
        }
        emit('update:variableBindings', updated)
    }
}

const connectorDisplay = (c: any) => c?.name || ''
const actionInstanceDisplay = (ai: any) => {
    if (!ai) return ''
    const typeName = ai.connectorTypeAction?.name
    return typeName ? `${ai.name} (${typeName})` : ai.name
}

function onConnectorChanged(val: Connector | null) {
    emit('update:selectedConnector', val)
    emit('update:selectedActionInstance', null)
    variables.value = []
    emit('update:variableBindings', {})
    emit('variablesLoaded', [])

    if (val) {
        const instances = val.actionInstances || []
        if (instances.length === 1) {
            emit('update:selectedActionInstance', instances[0])
        }
    }
}

async function onActionInstanceChanged(val: ConnectorActionInstance | null) {
    emit('update:selectedActionInstance', val)
    await loadVariables(val)
}

async function loadVariables(instance: ConnectorActionInstance | null) {
    variables.value = []
    if (!instance) {
        emit('update:variableBindings', {})
        emit('variablesLoaded', [])
        return
    }
    loadingVariables.value = true
    try {
        const result = await getActionInstanceVariables(instance.id, authStore)
        variables.value = result.variables
        const newBindings: Record<string, VariableBinding> = {}
        for (const v of result.variables) {
            newBindings[v] = props.variableBindings[v] || { type: 'constant', value: '' }
        }
        emit('update:variableBindings', newBindings)
        emit('variablesLoaded', result.variables)
    } catch {
        variables.value = []
        emit('update:variableBindings', {})
        emit('variablesLoaded', [])
    } finally {
        loadingVariables.value = false
    }
}

watch(
    () => props.selectedActionInstance,
    (inst) => {
        if (inst && variables.value.length === 0 && !loadingVariables.value) {
            loadVariables(inst)
        }
    },
    { immediate: true },
)

function openAddActionInstance() {
    if (!props.selectedConnector) return
    const url = router.resolve({
        path: `/automation/connectors/${props.selectedConnector.id}`,
        query: { showActionForm: 'true' },
    })
    window.open(url.href, '_blank')
}

function getBindingType(varName: string): string {
    return currentBindings.value[varName]?.type || 'constant'
}

function setBinding(varName: string, binding: VariableBinding) {
    const updated = { ...currentBindings.value, [varName]: binding }
    emit('update:variableBindings', updated)
}

function updateConstantValue(varName: string, value: string) {
    setBinding(varName, { type: 'constant', value })
}

function findInjectableOption(varName: string): InjectableOption | null {
    const b = currentBindings.value[varName]
    if (b?.type !== 'injectable') return null
    return effectiveInjectableOptions.value.find(
        o => o.module === (b as any).module && o.property === (b as any).property,
    ) || null
}

function onInjectableSelected(varName: string, val: InjectableOption | null) {
    if (val) {
        setBinding(varName, { type: 'injectable', module: val.module, property: val.property })
    }
}

function findResponseOption(varName: string): ResponseOption | null {
    const b = currentBindings.value[varName]
    if (b?.type !== 'response') return null
    return availableResponseOptions.value.find(o => o.mappedTo === (b as any).mappedTo && o.step === (b as any).step) || null
}

function onResponseSelected(varName: string, val: ResponseOption | null) {
    if (val) {
        setBinding(varName, { type: 'response', mappedTo: val.mappedTo, step: val.step })
    }
}

onMounted(async () => {
    const resuts = await Promise.all(props.responseOptions.map(async (o) => ({ resp: await getWorkflowConditionFields([o], authStore), step: o.step })));
    for (const r of resuts) {
        for (const p of r.resp) {
            for (const prop of p.properties) {
                availableResponseOptions.value.push({
                    mappedTo: prop.key,
                    label:`${r.step} → ${prop.label}`,  
                    step: r.step,
                })
            }
        }
    }
})
</script>
