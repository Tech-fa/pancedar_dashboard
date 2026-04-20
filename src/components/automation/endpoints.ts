import type { AuthStore, PaginatedResponse } from "@/util/interfaces";
import { apiDelete, apiGet, apiPost, apiPut } from "@/util/api";
import type {
  AvailableWorkflow,
  CreateWorkflowPayload,
  UpdateWorkflowStepsPayload,
  Workflow,
} from "./workflow.interface";

export interface ConnectorTypeConfig {
  name: string;
  description: string;
  serviceName: string;
  oauthUrl?: string;
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
}

export interface AddConnectionResponse {
  connectorId: string;
  connector: Connector;
  oauthUrl?: string;
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
  return apiPut<{ oauthUrl: string }>(`/connectors/reconnect/${id}`, {}, authStore);
};

export const deleteWorkflow = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/workflows/${id}`, authStore);
};

// Connector endpoints
export const getNeedConnectors = (authStore: AuthStore,onlyMissing: boolean = false) => {
  return apiGet<string[]>("/workflows/need-connectors?onlyMissing=" + onlyMissing, authStore);
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

