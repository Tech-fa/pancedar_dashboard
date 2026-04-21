import type { AuthStore, PaginatedResponse } from "@/util/interfaces";
import { apiDelete, apiGet, apiPost, apiPut } from "@/util/api";
import type {
  AvailableWorkflow,
  CreateWorkflowPayload,
  UpdateWorkflowStepsPayload,
  Workflow,
  WorkflowRun,
} from "./workflow.interface";

export interface ConnectorTypeConfig {
  name: string;
  description: string;
  serviceName: string;
  oauthUrl?: string;
}

export interface WorkflowRunsFilters {
  hideCompleted?: boolean;
  hideSkipped?: boolean;
  onlyShowAwaitingActions?: boolean;
}

export interface Connector {
  id: string;
  name: string;
  connectorTypeId: string;
  status: "active" | "inactive" | "pending" | "error" | "warning";
  primaryIdentifier?: string;
  credentials?: Record<string, any>;
  createdAt?: number;
  updatedAt?: number;
  /** DELETE this path to disconnect (OAuth revoke / stop watch); only when configured for the type. */
  disconnectUrl?: string;
}

export interface AddConnectionResponse {
  connectorId: string;
  connector: Connector;
  oauthUrl?: string;
}

export interface IncomingEmailReview {
  id: string;
  from: string;
  subject: string | null;
  htmlText: string;
  workflowRunId: string | null;
  replyEmail: {
    replyBody: string;
    actionUrl: string | null;
    workflowRunId: string;
  } | null;
  workflowRun: WorkflowRun;
}

// Workflow endpoints
export const getWorkflows = (authStore: AuthStore) => {
  return apiGet<Workflow[]>("/workflows", authStore);
};

export const getAvailableWorkflows = (authStore: AuthStore) => {
  return apiGet<AvailableWorkflow[]>("/workflows/available", authStore);
};

export const getWorkflowById = (id: string, authStore: AuthStore) => {
  return apiGet<Workflow>(`/workflows/${id}`, authStore);
};

export const getWorkflowRuns = (
  id: string,
  authStore: AuthStore,
  filters: WorkflowRunsFilters = {},
) => {
  return apiGet<WorkflowRun[]>(`/workflows/${id}/runs`, authStore, filters);
};

export const createWorkflow = (
  data: CreateWorkflowPayload,
  authStore: AuthStore,
) => {
  return apiPost<Workflow>("/workflows", data, authStore);
};

export const updateWorkflow = (
  id: string,
  data: UpdateWorkflowStepsPayload,
  authStore: AuthStore,
) => {
  return apiPut<Workflow>(`/workflows/${id}`, data, authStore);
};

export const reconnectConnector = (id: string, authStore: AuthStore) => {
  return apiPut<{ oauthUrl: string }>(
    `/connectors/reconnect/${id}`,
    {},
    authStore,
  );
};

export const disconnectConnector = (
  data: { connectorId: string; disconnectUrl: string },
  authStore: AuthStore,
) => {
  return apiPost<{ id?: string }>(data.disconnectUrl, data, authStore);
};

export const deleteWorkflow = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/workflows/${id}`, authStore);
};

export const getIncomingEmailReview = (
  incomingEmailId: string,
  authStore: AuthStore,
) => {
  return apiGet<IncomingEmailReview>(
    `/users/incoming-emails/${incomingEmailId}/review`,
    authStore,
  );
};

export const sendIncomingEmailReply = (
  actionUrl: string,
  replyBody: string,
  authStore: AuthStore,
) => {
  const normalizedActionUrl = actionUrl.startsWith("/")
    ? actionUrl
    : `/${actionUrl}`;
  return apiPost(normalizedActionUrl, { replyBody }, authStore);
};

// Connector endpoints
export const getNeedConnectors = (
  authStore: AuthStore,
  onlyMissing: boolean = false,
) => {
  return apiGet<string[]>(
    "/workflows/need-connectors?onlyMissing=" + onlyMissing,
    authStore,
  );
};

export const getConnectors = (authStore: AuthStore) => {
  return apiGet<Connector[]>("/connectors", authStore);
};

export const getConnectorTypes = (authStore: AuthStore) => {
  return apiGet<ConnectorTypeConfig[]>("/connectors/types", authStore);
};

export const deleteConnector = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/connectors/${id}`, authStore);
};

export const addConnection = (
  data: { connectorTypeName: string; name?: string },
  authStore: AuthStore,
) => {
  return apiPost<AddConnectionResponse>(
    "/connectors/add-connection",
    data,
    authStore,
  );
};
