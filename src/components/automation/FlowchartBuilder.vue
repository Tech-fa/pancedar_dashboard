<template>
    <div class="flowchart-builder rounded-lg border border-gray-800 bg-main overflow-hidden flex flex-col"
        :class="compact ? 'min-h-[320px]' : 'min-h-[520px]'">
        <div
            class="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-800 bg-secondary/80 text-opposite text-sm">
            <span class="text-opposite/50 mr-1">Tools</span>
            <button type="button" :disabled="!canAddStep || readOnly"
                class="px-2 py-1 rounded border text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                :class="toolbarBtnClass" title="Add a step after the selected node" @click="addChildStep">
                <i class="fa-solid fa-square-plus mr-1"></i> Step
            </button>
            <button type="button" :disabled="!canAddTrigger || readOnly"
                class="px-2 py-1 rounded border text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                :class="toolbarBtnClass"
                title="Create a sub-workflow trigger from the selected step"
                @click="addChildTrigger">
                <i class="fa-solid fa-bolt mr-1 text-emerald-400"></i> Trigger from Step
            </button>
            <button type="button" :disabled="!canDeleteSelection || readOnly"
                class="px-2 py-1 rounded border text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-red-900/50 text-red-400 hover:bg-red-950/40"
                title="Remove selected node (start cannot be removed)" @click="deleteSelected">
                <i class="fa-solid fa-trash mr-1"></i> Delete
            </button>
            <div class="flex-1 min-w-[8px]"></div>
            <button type="button" :disabled="readOnly"
                class="px-2 py-1 rounded border text-xs text-opposite/70 border-gray-700 hover:bg-gray-800/80"
                @click="resetView">
                Reset view
            </button>
        </div>

        <div ref="viewportRef" class="relative flex-1 overflow-hidden touch-none" @wheel="onWheel">
            <div class="absolute inset-0 z-0 cursor-grab active:cursor-grabbing bg-transparent"
                @pointerdown="onPanLayerPointerDown" @pointermove="onPanLayerPointerMove"
                @pointerup="onPanLayerPointerUp" @pointercancel="onPanLayerPointerUp" />
            <div class="absolute inset-0 z-10 origin-top-left will-change-transform pointer-events-none"
                :style="canvasStyle">
                <svg class="absolute left-0 top-0 overflow-visible pointer-events-none text-gray-500" :width="svgSize.w"
                    :height="svgSize.h">
                    <defs>
                        <marker :id="arrowMarkerId" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                            <path d="M0,0 L8,4 L0,8 Z" class="fill-gray-500" />
                        </marker>
                    </defs>
                    <path v-for="edge in model.edges" :key="edge.id" :d="edgePath(edge)" fill="none"
                        stroke="currentColor" stroke-width="1.5" :marker-end="`url(#${arrowMarkerId})`"
                        class="text-gray-600" />
                </svg>

                <div v-for="node in model.nodes" :key="node.id"
                    class="flowchart-node absolute z-20 select-none pointer-events-auto cursor-grab active:cursor-grabbing"
                    :style="nodeWrapperStyle(node)" @pointerdown.stop="onNodePointerDown($event, node)"
                    @pointermove="onNodePointerMove" @pointerup="onNodePointerEnd" @pointercancel="onNodePointerEnd">
                    <!-- Trigger -->
                    <div v-if="node.kind === 'trigger'"
                        class="p-2 flex items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-950/50 text-emerald-300 text-xs font-semibold shadow-lg text-center overflow-hidden"
                        :class="selectedId === node.id ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-main' : ''"
                        :style="{ width: NODE_LAYOUT.trigger.w + 'px', height: NODE_LAYOUT.trigger.h + 'px' }"
                        :title="node.label || 'Trigger'">
                        <span class="line-clamp-2 leading-tight px-1">{{ node.label || 'Trigger' }}</span>
                    </div>

                    <!-- Step -->
                    <div v-else-if="node.kind === 'step'"
                        class="rounded-lg border border-gray-600 bg-gray-900/90 shadow-lg flex flex-col justify-center px-2 py-1 text-opposite/70 items-center"
                        :class="selectedId === node.id ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-main' : ''"
                        :style="{ width: NODE_LAYOUT.step.w + 'px', minHeight: NODE_LAYOUT.step.h + 'px' }">
                        {{ node.label || 'Step' }}
                    </div>
                </div>
            </div>

            <div v-if="!readOnly"
                class="absolute bottom-2 left-2 text-[10px] text-opposite/40 pointer-events-none space-y-0.5">
                <div>Drag nodes to arrange. Drag empty space to pan. Wheel to zoom.</div>
                <div>Select a node, then add steps. Select a step to add a trigger for a new sub-workflow.</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
    FLOWCHART_START_ID,
    createDefaultFlowchart,
    createFlowchartId,
    collectBranchAncestors,
    FLOWCHART_NODE_LAYOUT,
    type FlowchartEdge,
    type FlowchartModel,
    type FlowchartNode,
    type FlowchartNodeKind,
} from './flowchartTypes'

const props = withDefaults(
    defineProps<{
        modelValue: FlowchartModel
        compact?: boolean
        readOnly?: boolean
    }>(),
    {
        compact: false,
        readOnly: false,
    },
)

const emit = defineEmits<{
    'update:modelValue': [value: FlowchartModel]
    'nodeSelected': [node: FlowchartNode | null, ancestors: FlowchartNode[]]
}>()

const NODE_LAYOUT = FLOWCHART_NODE_LAYOUT

const toolbarBtnClass =
    'border-gray-700 text-opposite/80 hover:bg-gray-800/80 hover:border-gray-600'

const viewportRef = ref<HTMLDivElement | null>(null)
const arrowMarkerId = `flowchart-arrow-${createFlowchartId()}`

const selectedId = ref<string | null>(null)

const pan = reactive({ x: 0, y: 0 })
const scale = ref(1)

const model = computed({
    get: () => props.modelValue,
    set: (v: FlowchartModel) => emit('update:modelValue', v),
})

watch(
    () => props.modelValue,
    (v) => {
        if (!v?.nodes?.length) {
            emit('update:modelValue', createDefaultFlowchart())
        } else if (!v.nodes.some((n) => n.id === FLOWCHART_START_ID)) {
            const start = createDefaultFlowchart().nodes[0]!
            emit('update:modelValue', { nodes: [start, ...v.nodes], edges: v.edges })
        }
    },
    { immediate: true },
)

watch(selectedId, (id) => {
    const node = id ? model.value.nodes.find((n) => n.id === id) ?? null : null
    const ancestors = id ? collectBranchAncestors(id, model.value) : []
    emit('nodeSelected', node, ancestors)
})

const selectedNode = computed(
    () => model.value.nodes.find((n) => n.id === selectedId.value) ?? null,
)

const canAddStep = computed(() => {
    const n = selectedNode.value
    if (!n) return false
    const hasChild = model.value.edges.some((e) => e.from === n.id)
    return !hasChild
})

const canAddTrigger = computed(() => {
    const n = selectedNode.value
    if (!n || n.kind !== 'step') return false
    const hasChild = model.value.edges.some((e) => e.from === n.id)
    return !hasChild
})

const canDeleteSelection = computed(() => {
    const n = selectedNode.value
    return !!n && n.id !== FLOWCHART_START_ID
})

const canvasStyle = computed(() => ({
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale.value})`,
}))

const svgSize = computed(() => {
    const rect = viewportRef.value?.getBoundingClientRect()
    const w = rect?.width ?? 800
    const h = rect?.height ?? 480
    const pad = 400
    return { w: w + pad * 2, h: h + pad * 2 }
})

function cloneModel(m: FlowchartModel): FlowchartModel {
    return {
        nodes: m.nodes.map((n) => ({ ...n, meta: n.meta ? { ...n.meta } : undefined })),
        edges: m.edges.map((e) => ({ ...e })),
    }
}

function commit(next: FlowchartModel) {
    emit('update:modelValue', cloneModel(next))
}

function setNodeLabel(id: string, label: string) {
    if (props.readOnly) return
    const m = cloneModel(model.value)
    const n = m.nodes.find((x) => x.id === id)
    if (n) {
        n.label = label
        commit(m)
    }
}

function nodeById(id: string): FlowchartNode | undefined {
    return model.value.nodes.find((n) => n.id === id)
}

function nodeWrapperStyle(node: FlowchartNode) {
    const L = NODE_LAYOUT[node.kind]
    return {
        left: `${node.x - L.w / 2}px`,
        top: `${node.y - L.h / 2}px`,
        width: `${L.w}px`,
    }
}

function anchorOut(n: FlowchartNode) {
    const L = NODE_LAYOUT[n.kind]
    return { x: n.x, y: n.y + L.h / 2 }
}

function anchorIn(n: FlowchartNode) {
    const L = NODE_LAYOUT[n.kind]
    return { x: n.x, y: n.y - L.h / 2 }
}

function edgePath(edge: FlowchartEdge): string {
    const fromN = nodeById(edge.from)
    const toN = nodeById(edge.to)
    if (!fromN || !toN) return ''
    const p0 = anchorOut(fromN)
    const p3 = anchorIn(toN)
    const midY = (p0.y + p3.y) / 2
    return `M ${p0.x} ${p0.y} C ${p0.x} ${midY}, ${p3.x} ${midY}, ${p3.x} ${p3.y}`
}

function placeBelow(parent: FlowchartNode, kind: FlowchartNodeKind): { x: number; y: number } {
    const Lp = NODE_LAYOUT[parent.kind]
    const Lc = NODE_LAYOUT[kind]
    const gap = (Lp.h + Lc.h) / 2 + 24
    return { x: parent.x, y: parent.y + gap }
}

function addChildStep() {
    const parent = selectedNode.value
    if (!parent || props.readOnly) return
    if (model.value.edges.some((e) => e.from === parent.id)) return
    const id = createFlowchartId()
    const pos = placeBelow(parent, 'step')
    const newNode: FlowchartNode = { id, kind: 'step', label: '', x: pos.x, y: pos.y }
    const newEdge: FlowchartEdge = { id: createFlowchartId(), from: parent.id, to: id }
    const m = cloneModel(model.value)
    m.nodes.push(newNode)
    m.edges.push(newEdge)
    commit(m)
    selectedId.value = id
}

function addChildTrigger() {
    const parent = selectedNode.value
    if (!parent || parent.kind !== 'step' || props.readOnly) return
    if (model.value.edges.some((e) => e.from === parent.id)) return
    const id = createFlowchartId()
    const pos = placeBelow(parent, 'trigger')
    const newNode: FlowchartNode = { id, kind: 'trigger', label: 'Sub Trigger', x: pos.x, y: pos.y }
    const newEdge: FlowchartEdge = { id: createFlowchartId(), from: parent.id, to: id }
    const m = cloneModel(model.value)
    m.nodes.push(newNode)
    m.edges.push(newEdge)
    commit(m)
    selectedId.value = id
}

function deleteSelected() {
    const id = selectedId.value
    const n = id ? nodeById(id) : undefined
    if (!id || !n || n.id === FLOWCHART_START_ID || props.readOnly) return
    const m = cloneModel(model.value)
    const descendantIds = collectDescendants(id, m)
    const removeSet = new Set([id, ...descendantIds])
    m.nodes = m.nodes.filter((x) => !removeSet.has(x.id))
    m.edges = m.edges.filter((e) => !removeSet.has(e.from) && !removeSet.has(e.to))
    commit(m)
    selectedId.value = null
}

function collectDescendants(nodeId: string, m: FlowchartModel): string[] {
    const ids: string[] = []
    const queue = m.edges.filter((e) => e.from === nodeId).map((e) => e.to)
    while (queue.length) {
        const cur = queue.shift()!
        ids.push(cur)
        m.edges.filter((e) => e.from === cur).forEach((e) => queue.push(e.to))
    }
    return ids
}

function resetView() {
    pan.x = 0
    pan.y = 0
    scale.value = 1
}

// --- Pan & zoom ---
let canvasDragging: { sx: number; sy: number; px: number; py: number } | null = null

function onPanLayerPointerDown(e: PointerEvent) {
    selectedId.value = null
    canvasDragging = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPanLayerPointerMove(e: PointerEvent) {
    if (canvasDragging) {
        pan.x = canvasDragging.px + (e.clientX - canvasDragging.sx)
        pan.y = canvasDragging.py + (e.clientY - canvasDragging.sy)
    }
}

function onPanLayerPointerUp(e: PointerEvent) {
    canvasDragging = null
    try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
        /* ignore */
    }
}

function onWheel(e: WheelEvent) {
    if (selectedId.value) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    const next = Math.min(1.8, Math.max(0.45, scale.value + delta))
    scale.value = next
}

// --- Node drag ---
let nodeDrag: {
    id: string
    lastX: number
    lastY: number
} | null = null

function onNodePointerDown(e: PointerEvent, node: FlowchartNode) {
    if (props.readOnly) return
    selectedId.value = node.id
    nodeDrag = { id: node.id, lastX: e.clientX, lastY: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    e.preventDefault()
}

function onNodePointerMove(e: PointerEvent) {
    if (!nodeDrag || props.readOnly) return
    const dx = (e.clientX - nodeDrag.lastX) / scale.value
    const dy = (e.clientY - nodeDrag.lastY) / scale.value
    nodeDrag.lastX = e.clientX
    nodeDrag.lastY = e.clientY
    const m = cloneModel(model.value)
    const n = m.nodes.find((x) => x.id === nodeDrag!.id)
    if (n) {
        n.x += dx
        n.y += dy
        commit(m)
    }
}

function onNodePointerEnd(e: PointerEvent) {
    if (!nodeDrag) return
    try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
        /* ignore */
    }
    nodeDrag = null
}
</script>
