export interface Workflow {
  id: string;
  name: string;
  workflowType: string;
  description: string | null;
  triggerQueue: string;
  connectorsNeeded: string[] | null;
  linkedConnectors?: WorkflowConnectorSummary[];
  steps?: WorkflowStep[] | null;
  context?: Record<string, any> | null;
  clientId: string;
  teamId: string;
  createdAt: number;
  updatedAt: number;
  /** From workflow type config — POST `{ workflowId }` to trigger (when supported). */
  actionUrl?: string | null;
}

export interface WorkflowConnectorSummary {
  id: string;
  name: string;
  connectorTypeId: string;
  status?: string;
  primaryIdentifier?: string;
}

export interface WorkflowStep {
  name: string;
  values: Record<string, any>;
  allowedActions?: WorkflowAllowedActions | string[];
}

export interface WorkflowAllowedActions {
  [action: string]: {
    requiredInformation: string[];
  };
}

export type WorkflowFieldType =
  | "boolean"
  | "text"
  | "color"
  | "number"
  | "select"
  | "files"
  | "textarea"
  | "array"
  | "json"
  /** Backend step configs (e.g. register-car) use `string` for nested keys; normalized to `text` in the UI. */
  | "string";

/** Shape of each entry in an `array` field (e.g. cars, locations). */
export interface WorkflowArrayItemsJson {
  type: "json";
  fields: WorkflowFieldConfig[];
}

export interface WorkflowFieldConfig {
  label: string;
  name?: string;
  type: WorkflowFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  accept?: string;
  /** For `type: "array"`: schema for each row (typically `json` with `fields` as object keys). */
  items?: WorkflowArrayItemsJson;
  /** For `type: "json"`: sub-fields map to keyed properties on the object value. */
  fields?: WorkflowFieldConfig[];
}

export interface WorkflowStepConfig {
  name: string;
  description?: string;
  fields: WorkflowFieldConfig[];
  availableActions?: WorkflowActionConfig[];
}

export interface WorkflowActionConfig {
  name: string;
  description?: string;
  requiredInformation: string[];
  /** Connector type names (e.g. Gmail); all must be linked on the workflow to use this action. */
  connectorsNeeded?: string[];
}

export interface AvailableWorkflow {
  name: string;
  description: string;
  connectorsNeeded?: string[];
  allowMultiple?: boolean;
  /** When set, dashboard may POST to this API path to run the workflow (e.g. Google Business scraper). */
  actionUrl?: string | null;
  steps: WorkflowStepConfig[];
}

export interface CreateWorkflowPayload {
  name: string;
  workflowType: string;
  steps?: WorkflowStep[];
}

export interface UpdateWorkflowStepsPayload {
  description?: string | null;
  steps?: WorkflowStep[];
  linkedConnectorIds?: string[];
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  context: Record<string, any> | null;
  createdAt: number;
  updatedAt: number;
  status: string;
  currentStep: string | null;
  stepsContext: Record<string, any> | null;
  explanation: Record<string, any> | null;
  workflow: Workflow;
  completedView?: {
    subject: string;
    id: string;
  };
  displayContext: Record<string, any> | null;
}

export interface AgentCommunication {
  _id: string;
  workflowRunId: string;
  type?: string;
  content?: unknown;
  role?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string | number;
  updatedAt?: string | number;
}
