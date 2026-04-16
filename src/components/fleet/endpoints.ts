import {
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiPatchFormData,
  apiDelete,
  apiPostFormData,
} from "@/util/api";
import type {
  Alert,
  Asset,
  AssetPart,
  AssetCategory,
  AssetModel,
  AssetStatistics,
  AuthStore,
  Customer,
  Department,
  Location,
  Meter,
  MeterReading,
  PaginatedResponse,
  Warehouse,
  WarehouseBin,
  Trip,
  TripLog,
  TripTelemetryPoint,
  TripSummary,
  VehicleJob,
  VehicleJobLineItem,
  VehicleJobType,
  VehicleJobPriority,
  VehicleJobLineItemStatus,
  User,
  CustomerNote,
  CustomerLocation,
  CustomerContact,
  CreateCustomerLocation,
} from "@/util/interfaces";

export const getOperators = (authStore: AuthStore) => {
  return apiGet<User[]>("/users", authStore, { roleName: "Operator" });
};

export const getQualifiedPilots = (
  authStore: AuthStore,
  params: {
    jobTypeId: string;
    startDate: number;
    endDate: number;
    autoAssign?: boolean;
  },
) => {
  return apiGet<User[]>("/users/qualified-pilots", authStore, {
    jobTypeId: params.jobTypeId,
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.autoAssign ? { autoAssign: "true" } : {}),
  });
};

export const getAssets = (
  authStore: AuthStore,
  filters?: {
    search?: string;
    status?: string;
    modelId?: string;
    page?: number;
    perPage?: number;
  },
) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.modelId) params.append("modelId", filters.modelId);
  if (filters?.page) params.append("page", `${filters.page}`);
  if (filters?.perPage) params.append("perPage", `${filters.perPage}`);

  const queryString = params.toString();
  const url = queryString ? `/assets?${queryString}` : "/assets";

  return apiGet<PaginatedResponse<Asset>>(url, authStore);
};

export const getAssetById = (id: string, authStore: AuthStore) => {
  return apiGet<Asset>(`/assets/${id}`, authStore);
};

export const getAssetStatistics = (authStore: AuthStore) => {
  return apiGet<AssetStatistics>("/assets/statistics", authStore);
};

export const createAsset = (data: Partial<Asset>, authStore: AuthStore) => {
  return apiPost<Asset>("/assets", data, authStore);
};

export const updateAsset = (
  id: string,
  data: Partial<Asset>,
  authStore: AuthStore,
) => {
  return apiPut<Asset>(`/assets/${id}`, data, authStore);
};

export const deleteAsset = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/assets/${id}`, authStore);
};

export const getAlertsByAsset = async (
  assetId: string,
  authStore: AuthStore,
  params: { page?: number; perPage?: number } = {},
) => {
  const response = await apiGet<PaginatedResponse<Alert>>(
    `/assets/${assetId}/alerts`,
    authStore,
    params,
  );

  return response.data;
};

export const getAllAlerts = async (
  authStore: AuthStore,
  params: { page?: number; perPage?: number } = {},
) => {
  const response = await apiGet<PaginatedResponse<Alert>>(
    "/assets/alerts",
    authStore,
    {
      page: params.page,
      perPage: params.perPage ?? 50,
    },
  );

  return response.data;
};

export const getAssetPartInstances = (
  authStore: AuthStore,
  params?: { assetId?: string },
) => {
  return apiGet<AssetPart[]>("/assets/part-instances", authStore, params);
};

export const getAssetPartInstanceById = (id: string, authStore: AuthStore) => {
  return apiGet<AssetPart>(`/assets/part-instances/${id}`, authStore);
};

export const getAssetTrips = (assetId: string, authStore: AuthStore) => {
  return apiGet<Trip[]>(`/assets/${assetId}/trips`, authStore);
};

export const getAllTrips = (
  authStore: AuthStore,
  filters?: { assetId?: string; vehicleJobId?: string; planned?: boolean },
) => {
  const params = new URLSearchParams();
  if (filters?.assetId) params.append("assetId", filters.assetId);
  if (filters?.vehicleJobId)
    params.append("vehicleJobId", filters.vehicleJobId);
  if (filters?.planned) params.append("planned", filters.planned.toString());

  const queryString = params.toString();
  const url = queryString ? `/assets/trips?${queryString}` : "/assets/trips";

  return apiGet<Trip[]>(url, authStore);
};

export const getTripById = (
  assetId: string,
  tripId: string,
  authStore: AuthStore,
) => {
  return apiGet<Trip>(`/assets/${assetId}/trips/${tripId}`, authStore);
};

export const createTripSummary = (
  assetId: string,
  tripId: string,
  data: Partial<TripSummary>,
  authStore: AuthStore,
) => {
  return apiPost<TripSummary>(
    `/assets/${assetId}/trips/${tripId}/summary`,
    data,
    authStore,
  );
};

export const updateTripSummary = (
  assetId: string,
  tripId: string,
  data: Partial<TripSummary>,
  authStore: AuthStore,
) => {
  return apiPut<TripSummary>(
    `/assets/${assetId}/trips/${tripId}/summary`,
    data,
    authStore,
  );
};

export const getTripTelemetry = (
  assetId: string,
  tripId: string,
  authStore: AuthStore,
  params?: { page?: number; perPage?: number },
) => {
  return apiGet<PaginatedResponse<TripTelemetryPoint>>(
    `/assets/${assetId}/trips/${tripId}/telemetry`,
    authStore,
    params,
  );
};

export const createTrip = (
  data: {
    assetId: string;
    flightId: string;
    state?: string;
    vehicleJobId?: string | null;
    timestamp?: number;
    waypoints?: Array<{ lat: number; lng: number }>;
    plannedDate?: number;
    operatorId?: string | null;
  },
  authStore: AuthStore,
) => {
  return apiPost<Trip>("/assets/trips", data, authStore);
};

// Location endpoints
export const getLocations = (authStore: AuthStore) => {
  return apiGet<Location[]>("/assets/locations", authStore);
};

export const getLocationById = (id: string, authStore: AuthStore) => {
  return apiGet<Location>(`/assets/locations/${id}`, authStore);
};

export const createLocation = (
  data: Partial<Location>,
  authStore: AuthStore,
) => {
  return apiPost<Location>("/assets/locations", data, authStore);
};

export const updateLocation = (
  id: string,
  data: Partial<Location>,
  authStore: AuthStore,
) => {
  return apiPut<Location>(`/assets/locations/${id}`, data, authStore);
};

export const deleteLocation = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/assets/locations/${id}`, authStore);
};

// Warehouse endpoints
export const getWarehouses = (authStore: AuthStore) => {
  return apiGet<Warehouse[]>("/warehouses", authStore);
};

export const getWarehouseBins = (authStore: AuthStore) => {
  return apiGet<WarehouseBin[]>("/warehouses/bins", authStore);
};

// Asset Model endpoints
export const getAssetModels = (authStore: AuthStore) => {
  return apiGet<AssetModel[]>("/assets/models", authStore);
};

export const getAssetModelById = (id: string, authStore: AuthStore) => {
  return apiGet<AssetModel>(`/assets/models/${id}`, authStore);
};

export const createAssetModel = (
  data: Partial<AssetModel>,
  authStore: AuthStore,
) => {
  return apiPost<AssetModel>("/assets/models", data, authStore);
};

export const updateAssetModel = (
  id: string,
  data: Partial<AssetModel>,
  authStore: AuthStore,
) => {
  return apiPut<AssetModel>(`/assets/models/${id}`, data, authStore);
};

export const deleteAssetModel = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/assets/models/${id}`, authStore);
};

// Asset Category endpoints
export const getAssetCategories = (authStore: AuthStore) => {
  return apiGet<AssetCategory[]>("/assets/categories", authStore);
};

export const getAssetCategoryById = (id: string, authStore: AuthStore) => {
  return apiGet<AssetCategory>(`/assets/categories/${id}`, authStore);
};

export const createAssetCategory = (
  data: Partial<AssetCategory>,
  authStore: AuthStore,
) => {
  return apiPost<AssetCategory>("/assets/categories", data, authStore);
};

export const updateAssetCategory = (
  id: string,
  data: Partial<AssetCategory>,
  authStore: AuthStore,
) => {
  return apiPut<AssetCategory>(`/assets/categories/${id}`, data, authStore);
};

export const deleteAssetCategory = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/assets/categories/${id}`, authStore);
};

// Meter endpoints
export const getMeters = (
  authStore: AuthStore,
  params?: { page?: number; perPage?: number },
) => {
  return apiGet<PaginatedResponse<Meter>>("/meters", authStore, params);
};

export const createMeter = (
  data: { name: string; unit: string },
  authStore: AuthStore,
) => {
  return apiPost<Meter>("/meters", data, authStore);
};

export const updateMeter = (
  id: string,
  data: { name: string; unit: string },
  authStore: AuthStore,
) => {
  return apiPut<Meter>(`/meters/${id}`, data, authStore);
};

export const deleteMeter = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/meters/${id}`, authStore);
};

// Meter reading endpoints
export const getMeterReadingsByAsset = (
  assetId: string,
  authStore: AuthStore,
  params?: { meterId?: string; page?: number; perPage?: number },
) => {
  return apiGet<PaginatedResponse<MeterReading>>(
    `/assets/${assetId}/meter-readings`,
    authStore,
    params,
  );
};

export const createMeterReading = (
  assetId: string,
  data: { meterId: string; value: number; timestamp: string },
  authStore: AuthStore,
) => {
  return apiPost<MeterReading>(
    `/assets/${assetId}/meter-readings`,
    data,
    authStore,
  );
};

export const updateMeterReading = (
  assetId: string,
  readingId: string,
  data: { meterId: string; value: number; timestamp: string },
  authStore: AuthStore,
) => {
  return apiPut<MeterReading>(
    `/assets/${assetId}/meter-readings/${readingId}`,
    data,
    authStore,
  );
};

// VehicleJobType endpoints
export const getVehicleJobTypes = (authStore: AuthStore) => {
  return apiGet<VehicleJobType[]>("/vehicle-jobs/vehicle-job-types", authStore);
};

export const getVehicleJobTypeById = (id: string, authStore: AuthStore) => {
  return apiGet<VehicleJobType>(
    `/vehicle-jobs/vehicle-job-types/${id}`,
    authStore,
  );
};

export const createVehicleJobType = (
  data: {
    name: string;
    description?: string;
    isActive?: boolean;
    skillIds?: string[];
    requiredDocuments?: { documentTypeId: number; documentCodeId?: number }[];
    workflowIds?: string[];
  },
  authStore: AuthStore,
) => {
  return apiPost<VehicleJobType>(
    "/vehicle-jobs/vehicle-job-types",
    data,
    authStore,
  );
};

export const updateVehicleJobType = (
  id: string,
  data: {
    name: string;
    description?: string;
    isActive?: boolean;
    skillIds?: string[];
    requiredDocuments?: { documentTypeId: number; documentCodeId?: number }[];
    workflowIds?: string[];
  },
  authStore: AuthStore,
) => {
  return apiPut<VehicleJobType>(
    `/vehicle-jobs/vehicle-job-types/${id}`,
    data,
    authStore,
  );
};

export const deleteVehicleJobType = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(
    `/vehicle-jobs/vehicle-job-types/${id}`,
    authStore,
  );
};

// Customer endpoints
export const getCustomers = (
  authStore: AuthStore,
  filters?: {
    search?: string;
    status?: string;
    page?: number;
    perPage?: number;
  },
) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.page) params.append("page", `${filters.page}`);
  if (filters?.perPage) params.append("perPage", `${filters.perPage}`);

  const queryString = params.toString();
  const url = queryString ? `/customers?${queryString}` : "/customers";

  return apiGet<PaginatedResponse<Customer>>(url, authStore);
};

export const getCustomerById = (id: string, authStore: AuthStore) => {
  return apiGet<Customer>(`/customers/${id}`, authStore);
};

export const createCustomer = (
  data: {
    name: string;
    notes?: CustomerNote[];
    contacts?: CustomerContact[];
    locations?: CreateCustomerLocation[];
    isActive?: boolean;
  },
  authStore: AuthStore,
) => {
  return apiPost<Customer>("/customers", data, authStore);
};

export const updateCustomer = (
  id: string,
  data: {
    name?: string;
    isActive?: boolean;
    contacts?: CustomerContact[];
    locations?: CreateCustomerLocation[];
    notes?: CustomerNote[];
  },
  authStore: AuthStore,
) => {
  return apiPut<Customer>(`/customers/${id}`, data, authStore);
};

export const deleteCustomer = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/customers/${id}`, authStore);
};

export const addCustomerNote = (
  customerId: string,
  note: string,
  authStore: AuthStore,
) => {
  return apiPost<CustomerNote>(
    `/customers/${customerId}/notes`,
    { note },
    authStore,
  );
};

export const deleteCustomerNote = (
  customerId: string,
  noteId: string,
  authStore: AuthStore,
) => {
  return apiDelete<{ id: string }>(
    `/customers/${customerId}/notes/${noteId}`,
    authStore,
  );
};

// VehicleJobLineItem interface for form
export interface VehicleJobLineItemPayload {
  assetId: string;
  pilotId?: string;
  description?: string;
  plannedDate?: number;
  flightDurationMinutes?: number;
  hourlyRate?: number;
  notes?: string;
  status?: VehicleJobLineItemStatus;
  waypoints?: { lat: number; lng: number }[];
}

// VehicleJob endpoints
export const getVehicleJobs = (authStore: AuthStore, customerId?: string) => {
  return apiGet<VehicleJob[]>("/vehicle-jobs/vehicle-jobs", authStore, {
    customerId,
  });
};

export const getVehicleJobById = (id: string, authStore: AuthStore) => {
  return apiGet<VehicleJob>(`/vehicle-jobs/vehicle-jobs/${id}`, authStore);
};

export const createVehicleJob = (
  data: {
    name: string;
    description?: string;
    jobTypeId?: string;
    customerId?: string;
    assetId?: string;
    locationId?: string;
    status?: string;
    priority?: VehicleJobPriority;
    startDate?: number;
    endDate?: number;
    dueDate?: number;
    assignedPilotId?: string;
    tax?: number;
    discount?: number;
    notes?: string;
    lineItems?: VehicleJobLineItemPayload[];
  },
  authStore: AuthStore,
) => {
  return apiPost<VehicleJob>("/vehicle-jobs/vehicle-jobs", data, authStore);
};

export const updateVehicleJob = (
  id: string,
  data: {
    name?: string;
    description?: string;
    jobTypeId?: string;
    customerId?: string;
    assetId?: string;
    locationId?: string;
    status?: string;
    priority?: VehicleJobPriority;
    startDate?: number;
    endDate?: number;
    dueDate?: number;
    assignedPilotId?: string;
    tax?: number;
    discount?: number;
    notes?: string;
    lineItems?: VehicleJobLineItemPayload[];
  },
  authStore: AuthStore,
) => {
  return apiPut<VehicleJob>(
    `/vehicle-jobs/vehicle-jobs/${id}`,
    data,
    authStore,
  );
};

export const changeVehicleJobStatus = (
  id: string,
  status: string,
  authStore: AuthStore,
  reasonForCancellation?: string,
) => {
  return apiPatch<VehicleJob>(
    `/vehicle-jobs/vehicle-jobs/${id}/status`,
    { status, ...(reasonForCancellation ? { reasonForCancellation } : {}) },
    authStore,
  );
};

export const deleteVehicleJob = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(
    `/vehicle-jobs/vehicle-jobs/${id}`,
    authStore,
  );
};

export const uploadTripLog = (
  file: File,
  authStore: AuthStore,
  assetId: string | undefined,
  model: { name: string; make: string },
) => {
  const formData = new FormData();
  formData.append("file", file);
  const params = new URLSearchParams();
  if (assetId) params.append("assetId", assetId);
  if (model) params.append("modelName", model.name);
  if (model) params.append("modelMake", model.make);
  const queryString = params.toString();
  const url = queryString
    ? `/assets/trips/upload-log?${queryString}`
    : "/assets/trips/upload-log";
  return apiPostFormData<{ fileKey: string }>(url, formData, authStore);
};

export interface SupportedModel {
  name: string;
  make: string;
}

export const getSupportedModels = (authStore: AuthStore) => {
  return apiGet<SupportedModel[]>("/assets/supported-models", authStore);
};

export const getTripLogs = (
  authStore: AuthStore,
  params?: { page?: number; perPage?: number },
) => {
  return apiGet<PaginatedResponse<TripLog>>(
    "/assets/trip-logs",
    authStore,
    params,
  );
};

// ConnectorType interfaces (global, read-only)
export interface ConnectorTypeAction {
  id: string;
  direction: "inbound" | "outbound";
  connectorTypeId: string;
  connectorType?: ConnectorType;
  name: string;
  functionName: string;
  description: string | null;
  fields: Record<
    string,
    {
      type: string;
      label: string;
      required?: boolean;
      options?: { value: string; label: string }[];
      value?: string;
    }
  > | null;
  createdAt: number;
  updatedAt: number;
}

export interface ConnectorType {
  id: string;
  name: string;
  description: string | null;
  serviceName: string;
  oauthUrl: string | null;
  fields: Record<
    string,
    { type: string; label: string; required?: boolean }
  > | null;
  actions: ConnectorTypeAction[];
  createdAt: number;
  updatedAt: number;
}

// Connector interface (per-client instance)
export interface Connector {
  id: string;
  name: string;
  connectorTypeId: string;
  connectorType: ConnectorType;
  credentials: Record<string, any> | null;
  displays: Record<string, any> | null;
  isActive: boolean;
  actionInstances: ConnectorActionInstance[];
  createdAt: number;
  updatedAt: number;
}

// ConnectorType endpoints (read-only)
export const getConnectorTypes = (authStore: AuthStore) => {
  return apiGet<ConnectorType[]>("/connectors/types", authStore);
};

export const getAllConnectorTypeActions = (authStore: AuthStore) => {
  return apiGet<ConnectorTypeAction[]>("/connectors/actions", authStore);
};

// Connector CRUD (per-client)
export const getConnectors = (authStore: AuthStore) => {
  return apiGet<Connector[]>("/connectors", authStore);
};

export const getConnectorById = (id: string, authStore: AuthStore) => {
  return apiGet<Connector>(`/connectors/${id}`, authStore);
};

export interface ConnectorStatus {
  id: string;
  isActive: boolean;
  hasCredentials: boolean;
}

export const getConnectorStatus = (id: string, authStore: AuthStore) => {
  return apiGet<ConnectorStatus>(`/connectors/status/${id}`, authStore);
};

export const getConnectorAuthUrl = (
  oauthPath: string,
  connectorId: string,
  authStore: AuthStore,
) => {
  return apiGet<{ url: string }>(oauthPath, authStore, { connectorId });
};

export const createConnector = (
  data: {
    name: string;
    connectorTypeId: string;
    credentials?: Record<string, any>;
    isActive?: boolean;
  },
  authStore: AuthStore,
) => {
  return apiPost<Connector>("/connectors", data, authStore);
};

export const updateConnector = (
  id: string,
  data: {
    name?: string;
    credentials?: Record<string, any> | null;
    isActive?: boolean;
  },
  authStore: AuthStore,
) => {
  return apiPut<Connector>(`/connectors/${id}`, data, authStore);
};

export const deleteConnector = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/connectors/${id}`, authStore);
};

export const createOrGetChecklistItemInstance = (
  jobId: string,
  data: { checklistItemId: string },
  authStore: AuthStore,
) =>
  apiPost<ChecklistItemInstance>(
    `/checklists/instances/by-job/${jobId}`,
    data,
    authStore,
  );

export interface ExecuteActionResult {
  requiresFields?: boolean;
  variables?: string[];
  id?: string;
  sourceId?: string;
  sourceType?: string;
  responseJson?: Record<string, any>;
  [key: string]: any;
}

export const executeConnectorAction = (
  actionInstanceId: string,
  data?: {
    fields?: Record<string, string>;
    test?: boolean;
    checklistItemInstanceId?: string;
  },
  authStore?: AuthStore,
) => {
  return apiPost<ExecuteActionResult>(
    `/connectors/execute-action/${actionInstanceId}`,
    data || {},
    authStore!,
  );
};

// Action Instance Variables & Injectables
export interface ActionInstanceVariablesResult {
  variables: string[];
}

export interface InjectableConditionOption {
  value: string;
  label: string;
}

export type InjectableConditionOperator = "eq" | "neq" | "lt" | "gt";

export interface InjectableProperty {
  key: string;
  label: string;
  type: string;
  /** Cron module conditions: non-empty → select; otherwise free text. */
  options?: InjectableConditionOption[];
  /** Cron module conditions: allowed operators; omit for default eq / lt / gt. */
  operators?: InjectableConditionOperator[];
}

export interface InjectableModule {
  label: string;
  properties: InjectableProperty[];
  /** Properties that require operator + value when used as injectable (cron jobs). */
  conditionalProperties?: InjectableProperty[];
}

export interface InjectablesResult {
  modules: Record<string, InjectableModule>;
}

export type VariableBinding =
  | { type: "constant"; value: string }
  | { type: "injectable"; module: string; property: string }
  | { type: "response"; mappedTo: string; step?: string };

export const getActionInstanceVariables = (
  actionInstanceId: string,
  authStore: AuthStore,
) => {
  return apiGet<ActionInstanceVariablesResult>(
    `/connectors/action-instances/${actionInstanceId}/variables`,
    authStore,
  );
};

export const getInjectables = (context: string, authStore: AuthStore) => {
  return apiGet<InjectablesResult>(
    `/connectors/injectables/${context}`,
    authStore,
  );
};
export const executeActionFromChecklist = (
  data: { checklistItemInstanceId: string },
  authStore: AuthStore,
) => {
  return apiPost<ExecuteActionResult>(
    `/checklists/execute-action-from-checklist`,
    data,
    authStore,
  );
};

// ConnectorActionInstance interface (per-connector)
export interface ResponseMappingEntry {
  mappedFrom: string;
  mappedTo: string;
}

export interface ConnectorActionInstance {
  id: string;
  name: string;
  connectorId: string;
  connector: Connector;
  connectorTypeActionId: string;
  connectorTypeAction: ConnectorTypeAction;
  actionConfig: Record<string, any> | null;
  responseMapping: ResponseMappingEntry[] | null;
  responseId: string | null;
  response: ResponseEntity | null;
  createdAt: number;
  updatedAt: number;
}

// ConnectorActionInstance CRUD (per-connector)
export const getActionInstances = (
  connectorId: string,
  authStore: AuthStore,
) => {
  return apiGet<ConnectorActionInstance[]>(
    `/connectors/${connectorId}/action-instances`,
    authStore,
  );
};

export const getActionInstanceById = (
  connectorId: string,
  id: string,
  authStore: AuthStore,
) => {
  return apiGet<ConnectorActionInstance>(
    `/connectors/${connectorId}/action-instances/${id}`,
    authStore,
  );
};

export const createActionInstance = (
  connectorId: string,
  data: {
    name: string;
    connectorTypeActionId: string;
    actionConfig?: Record<string, any>;
    responseMapping?: ResponseMappingEntry[] | null;
  },
  authStore: AuthStore,
) => {
  return apiPost<ConnectorActionInstance>(
    `/connectors/${connectorId}/action-instances`,
    data,
    authStore,
  );
};

export const updateActionInstance = (
  connectorId: string,
  id: string,
  data: {
    name?: string;
    connectorTypeActionId?: string;
    actionConfig?: Record<string, any> | null;
    responseMapping?: ResponseMappingEntry[] | null;
  },
  authStore: AuthStore,
) => {
  return apiPut<ConnectorActionInstance>(
    `/connectors/${connectorId}/action-instances/${id}`,
    data,
    authStore,
  );
};

export const deleteActionInstance = (
  connectorId: string,
  id: string,
  authStore: AuthStore,
) => {
  return apiDelete<{ id: string }>(
    `/connectors/${connectorId}/action-instances/${id}`,
    authStore,
  );
};

// Response interfaces
export interface ResponseEntity {
  id: string;
  sourceId: string;
  sourceType: string;
  responseJson: Record<string, any>;
  mappedResponseJson?: Record<string, any>;
  parameters?: Record<string, any> | null;
  createdBy: { id: string; fname: string; lname: string };
  createdAt: number;
}

// Response endpoints
export const getResponses = (
  authStore: AuthStore,
  params: { sourceId: string; sourceType: string },
) => {
  return apiGet<ResponseEntity[]>(
    `/responses?sourceId=${params.sourceId}&sourceType=${params.sourceType}`,
    authStore,
  );
};

export const createResponse = (
  data: {
    sourceId: string;
    sourceType: string;
    responseJson: Record<string, any>;
  },
  authStore: AuthStore,
) => {
  return apiPost<ResponseEntity>("/responses", data, authStore);
};

export const deleteResponse = (id: string, authStore: AuthStore) => {
  return apiDelete<{ id: string }>(`/responses/${id}`, authStore);
};

// DynamicField interfaces
export type DynamicFieldType =
  | "text"
  | "textarea"
  | "options"
  | "image"
  | "video"
  | "file";

export interface DynamicField {
  id: string;
  name: string;
  type: DynamicFieldType;
  options: string[] | null;
  required: boolean;
  order: number;
  checklistItemId: string;
  createdAt: number;
  updatedAt: number;
}

export interface DynamicFieldPayload {
  name: string;
  type: DynamicFieldType;
  options?: string[];
  required?: boolean;
  order: number;
}

// Checklist interfaces
export interface ChecklistItemPayload {
  name: string;
  description?: string;
  order: number;
  inputType?: "connector" | "manual";
  connectorId?: string;
  connectorTypeActionId?: string;
  connectorActionInstanceId?: string;
  variableBindings?: Record<string, VariableBinding>;
  actionConfig?: Record<string, any>;
  dynamicFields?: DynamicFieldPayload[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  description: string | null;
  order: number;
  checklistId: string;
  inputType: "connector" | "manual";
  connectorId: string | null;
  connector: Connector | null;
  connectorTypeActionId: string | null;
  connectorTypeAction: ConnectorTypeAction | null;
  connectorActionInstanceId: string | null;
  connectorActionInstance: ConnectorActionInstance | null;
  variableBindings: Record<string, VariableBinding> | null;
  actionConfig: Record<string, any> | null;
  dynamicFields: DynamicField[];
  isConfirmed: boolean;
  confirmedBy: string | null;
  confirmedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Checklist {
  id: string;
  name: string;
  description: string | null;
  type: "PRE_JOB" | "POST_JOB";
  vehicleJobTypeId: string;
  items: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
}

// Checklist endpoints
export const getAllChecklists = (authStore: AuthStore) =>
  apiGet<Checklist[]>(`/checklists`, authStore);

export const getChecklistsByJobType = (
  jobTypeId: string,
  authStore: AuthStore,
) => apiGet<Checklist[]>(`/checklists/by-job-type/${jobTypeId}`, authStore);

export const importChecklistToJobType = (
  jobTypeId: string,
  checklistId: string,
  authStore: AuthStore,
) =>
  apiPost<Checklist>(
    `/checklists/by-job-type/${jobTypeId}/import/${checklistId}`,
    {},
    authStore,
  );

export const getChecklistById = (id: string, authStore: AuthStore) =>
  apiGet<Checklist>(`/checklists/${id}`, authStore);

export const updateChecklistById = (
  id: string,
  data: { name?: string; description?: string; items?: ChecklistItemPayload[] },
  authStore: AuthStore,
) => apiPut<Checklist>(`/checklists/${id}`, data, authStore);

export const createStandaloneChecklist = (
  data: {
    name: string;
    description?: string;
    type: "PRE_JOB" | "POST_JOB";
    items?: ChecklistItemPayload[];
  },
  authStore: AuthStore,
) => apiPost<Checklist>(`/checklists`, data, authStore);

export const createChecklist = (
  jobTypeId: string,
  data: {
    name: string;
    description?: string;
    type: "PRE_JOB" | "POST_JOB";
    items?: ChecklistItemPayload[];
  },
  authStore: AuthStore,
) =>
  apiPost<Checklist>(`/checklists/by-job-type/${jobTypeId}`, data, authStore);

export const updateChecklist = (
  jobTypeId: string,
  id: string,
  data: { name?: string; description?: string; items?: ChecklistItemPayload[] },
  authStore: AuthStore,
) => apiPut<Checklist>(`/checklists/${id}`, data, authStore);

export const deleteChecklist = (
  jobTypeId: string,
  id: string,
  authStore: AuthStore,
) =>
  apiDelete<{ id: string }>(`/checklists/${id}/jobs/${jobTypeId}`, authStore);

export const deleteChecklistById = (id: string, authStore: AuthStore) =>
  apiDelete<{ id: string }>(`/checklists/${id}`, authStore);

/** Text values + files (by dynamic field id) sent with checklist step confirm */
export interface ChecklistItemConfirmStoreFields {
  fieldValues: Record<string, string>;
  files: Record<string, File>;
}

export const confirmChecklistItemInstance = (
  id: string,
  authStore: AuthStore,
  storeFields: ChecklistItemConfirmStoreFields = { fieldValues: {}, files: {} },
) => {
  const formData = new FormData();
  formData.append(
    "payload",
    JSON.stringify({ fieldValues: storeFields.fieldValues ?? {} }),
  );
  for (const [fieldId, file] of Object.entries(storeFields.files ?? {})) {
    if (file) {
      formData.append(fieldId, file);
    }
  }
  return apiPatchFormData<ChecklistItemInstance>(
    `/checklists/instances/${id}/confirm`,
    formData,
    authStore,
  );
};

// ChecklistItemInstance - created when executing a checklist step
export interface ChecklistItemInstance {
  id: string;
  vehicleJobId: string;
  checklistItemId: string;
  confirmedById: string | null;
  confirmedAt: number | null;
  isConfirmed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DynamicFieldInstanceForJob {
  id: string;
  dynamicFieldId: string;
  value: string | string[] | Record<string, any> | null;
  documentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ChecklistItemInstanceForJob {
  id: string;
  confirmedBy: string | null;
  confirmedAt: number | null;
  isConfirmed: boolean;
  dynamicFieldInstances: DynamicFieldInstanceForJob[];
  createdAt: number;
  updatedAt: number;
}

export interface ChecklistItemForJob {
  id: string;
  name: string;
  description: string | null;
  order: number;
  inputType: "connector" | "manual";
  connectorId: string | null;
  connector: Connector | null;
  actionInstance: ConnectorActionInstance | null;
  variableBindings: Record<string, VariableBinding> | null;
  actionConfig: Record<string, any> | null;
  dynamicFields: DynamicField[];
  instance: ChecklistItemInstanceForJob | null;
}

export interface ChecklistForJob {
  id: string;
  name: string;
  description: string | null;
  type: "PRE_JOB" | "POST_JOB";
  items: ChecklistItemForJob[];
}

/** Sections for read-only checklist display (pre-job vs post-job). */
export interface ChecklistActionsGroup {
  type: "PRE_JOB" | "POST_JOB";
  checklistName: string;
  description: string | null;
  items: ChecklistItemForJob[];
}

export const getChecklistForJob = (jobId: string, authStore: AuthStore) =>
  apiGet<ChecklistForJob[]>(`/checklists/by-job/${jobId}`, authStore);
