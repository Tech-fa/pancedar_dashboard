import { snakeToCamelCase } from "@/util/util"
import type { Connector } from "../fleet/endpoints"
import type { WorkflowTriggerData } from "./endpoints"
import { createFlowchartId, FLOWCHART_START_ID, type FlowchartEdge, type FlowchartModel, type FlowchartNode } from "./flowchartTypes"

export interface SourceModule {  
    sourceType: string;
    source: string;
    mustchoose: boolean;
}


export interface TriggerModule {
    sourceLabel: string;
    sourceType: string;
    step: string;
    sourceId: string;
    source: string;
}

function stepToMeta(step: any, connectors: Connector[]) {
    let connectorId: string | undefined
    if (step.connectorActionInstanceId) {
        for (const c of connectors) {
            if (c.actionInstances?.some((ai: any) => ai.id === step.connectorActionInstanceId)) {
                connectorId = c.id
                break
            }
        }
    }
    return {
        id: step.id,
        connectorId,
        connectorActionInstanceId: step.connectorActionInstanceId || undefined,
        variableBindings: step.variableBindings || undefined,
        sourceType: 'Response',
        source: 'ConnectorActionInstance',
        sourceId: step.connectorActionInstanceId || undefined,
    }
}

export function workflowToFlowchart(wf: WorkflowTriggerData, connectors: Connector[]): FlowchartModel {
    const nodes: FlowchartNode[] = []
    const edges: FlowchartEdge[] = []
    const triggerConds = wf.conditions || []
    nodes.push({
        id: FLOWCHART_START_ID,
        kind: 'trigger',
        label: snakeToCamelCase(triggerConds[0]?.source),
        x: 320, y: 56,
        meta: {
            id: wf.id,
            workflowId: wf.workflow?.id || undefined,
            sourceType: triggerConds[0]?.sourceType || undefined,
            source: triggerConds[0]?.source || undefined,
            sourceId: triggerConds[0]?.sourceId || undefined,
            conditionRows: triggerConds.map((c) => ({ field: c.field, operator: c.operator, value: c.value || '' })),
        },
    })

    function addSteps(steps: any[], prevId: string, x: number, y: number): number {
        let curY = y
        let prev = prevId
        for (const step of [...steps].sort((a: any, b: any) => a.order - b.order)) {
            const sid = step.id ? `step-${step.id}` : createFlowchartId()
                nodes.push({ id: sid, kind: 'step', label: step.name, x, y: curY, meta: stepToMeta(step, connectors) })
                edges.push({ id: createFlowchartId(), from: prev, to: sid })
                prev = sid
                curY += 90

                for (const sub of step.subTriggers || []) {
                    const subTrigId = createFlowchartId()
                    const subConds = sub.conditions || []
                    nodes.push({
                        id: subTrigId,
                        kind: 'trigger',
                        label:subConds[0]?.step ||  snakeToCamelCase(subConds[0]?.source) || sub.workflow?.name || 'Trigger',
                        x, y: curY,
                        meta: {
                            id: sub.id, 
                            workflowId: sub.workflow?.id || undefined,
                            step: subConds[0]?.step || undefined,
                            sourceType: subConds[0]?.sourceType || undefined,
                            source: sub.triggerKey || undefined,
                            sourceLabel: nodes.find((s: any) => s.id === step.id)?.label || undefined,
                            sourceId: subConds[0]?.sourceId || undefined,
                            conditionRows: subConds.map((c: any) => ({ field: c.field, operator: c.operator, value: c.value || '' })),
                        },
                    })
                    edges.push({ id: createFlowchartId(), from: prev, to: subTrigId })
                    prev = subTrigId
                    curY += 70

                    if (sub.workflow?.steps?.length) {
                        curY = addSteps(sub.workflow.steps, subTrigId, x, curY)
                    }
                    break
                }
        }
        return curY
    }

    addSteps(wf.workflow?.steps || [], FLOWCHART_START_ID, 320, 196)
    return { nodes, edges }
}
