/** Fixed id for the entry node — preserved when resetting edges. */
export const FLOWCHART_START_ID = "flowchart-start";

export type FlowchartNodeKind = "trigger" | "step";

export interface FlowchartConditionItem {
  source: string;
  sourceId?: string | null;
  field: string;
  operator: string;
  value?: string | null;
}

export interface TriggerConditionRow {
  field: string;
  operator: string;
  value: string;
}

export interface FlowchartNodeMeta {  
  id?: string;
  sourceLabel?: string;
  workflowId?: string;
  source?: string;
  conditionItems?: FlowchartConditionItem[];
  connectorTypeActionId?: string;
  connectorId?: string;
  connectorActionInstanceId?: string;
  variableBindings?: Record<string, any>;
  conditionMet?: boolean;
  sourceType?: string;
  sourceId?: string | null;
  step?: string | null;
  conditionFields?: any[];
  conditionRows?: TriggerConditionRow[];
}

export interface FlowchartNode {
  id: string;
  kind: FlowchartNodeKind;
  /** Display label (e.g. step name, trigger summary) */
  label: string;
  /** Canvas position (center of node), pixels */
  x: number;
  y: number;
  meta?: FlowchartNodeMeta;
}

export interface FlowchartEdge {
  id: string;
  /** Source node id */
  from: string;
  /** Target node id */
  to: string;
  /** Optional connector label */
  label?: string;
}

export interface FlowchartModel {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export function createFlowchartId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `fc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultFlowchart(): FlowchartModel {
  return {
    nodes: [
      {
        id: FLOWCHART_START_ID,
        kind: "trigger",
        label: "Start",
        x: 320,
        y: 56,
      },
    ],
    edges: [],
  };
}

/**
 * Walk backwards from a node through edges, collecting all ancestor nodes
 * within the same branch. Stops at a trigger boundary (the trigger that
 * starts the branch is included as the last element).
 * Returns nodes ordered from immediate parent → branch root.
 */
export function collectBranchAncestors(
  nodeId: string,
  model: FlowchartModel,
): FlowchartNode[] {
  const ancestors: FlowchartNode[] = [];
  const visited = new Set<string>();
  let currentId: string | null = nodeId;

  while (currentId) {
    const incomingEdge = model.edges.find((e) => e.to === currentId);
    if (!incomingEdge) break;

    const parent = model.nodes.find((n) => n.id === incomingEdge.from);
    if (!parent || visited.has(parent.id)) break;
    visited.add(parent.id);
    ancestors.push(parent);

    currentId = parent.id;
  }

  return ancestors;
}

export const FLOWCHART_NODE_LAYOUT: Record<
  FlowchartNodeKind,
  { w: number; h: number }
> = {
  trigger: { w: 104, h: 44 },
  step: { w: 152, h: 58 },
};
