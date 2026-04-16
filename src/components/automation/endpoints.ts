import type { AuthStore, PaginatedResponse } from '@/util/interfaces'
import { apiDelete, apiGet, apiPost, apiPut } from '@/util/api'
import type { Connector, ConnectorActionInstance } from '@/components/fleet/endpoints'
import type { SourceModule } from './dtos';

// Workflow interfaces
export interface WorkflowConditionItemPayload {
    sourceType?: string;
    source: string
    sourceId?: string | null
    field: string
    operator: string
    value?: string
}

export interface WorkflowStepPayload {
    name: string
    order: number
    kind: 'step' | 'condition'
    connectorActionInstanceId?: string
    variableBindings?: Record<string, any>
    injectionModules?: string[]
    subTriggers?: WorkflowTriggerPayload[]
}

export interface WorkflowTriggerPayload {
    id?: string
    conditions: WorkflowConditionItemPayload[]
    workflow: {
        id?: string
        name: string
        description?: string
        steps?: WorkflowStepPayload[]
    }
}

export interface WorkflowTriggerData {
    id: string
    conditions: WorkflowConditionItemPayload[]
    workflowId: string
    fromStepId: string | null
    triggerKey: string | null
    workflow?: Workflow
}

export interface WorkflowStep {
    id: string
    name: string
    order: number
    connectorActionInstanceId: string | null
    variableBindings: Record<string, any> | null
    injectionModules: string[] | null
    subTriggers?: WorkflowTriggerData[]
    workflowId: string
    createdAt: number
    updatedAt: number
}

export interface ConditionField {
    key: string
    label: string
    type?: string
    options?: { value: string; label: string }[]
}

export interface ConditionFieldSourceItem {
    sourceType: string
    sourceId?: string | null
    source?: string
}

export interface ConditionFieldSource {
    sourceType: string
    source: string
    sourceId: string | null
    operators: string[]
    properties: ConditionField[]
}

export interface Workflow {
    id: string
    name: string
    description: string | null
    trigger: WorkflowTriggerData | null
    parentId: string | null
    children: Workflow[]
    steps: WorkflowStep[]
    createdAt: number
    updatedAt: number
}

/** Response rows linked to a workflow step run (`source_id` = step instance id). */
export interface WorkflowStepInstanceResponse {
    id: string
    sourceId: string
    sourceType: string
    responseJson: Record<string, any>
    mappedResponseJson: Record<string, any> | null
    parameters?: Record<string, any> | null
    connectorActionInstanceId: string | null
    createdAt: number
}

export interface WorkflowStepInstanceRun {
    id: string
    workflowInstanceId: string
    workflowStep: WorkflowStep
    workflowStepId: string
    order: number
    responseJson: Record<string, any> | null
    status: string | null
    errorMessage: string | null
    startedAt: number | null
    finishedAt: number | null
    createdAt: number
    updatedAt: number
    responses?: WorkflowStepInstanceResponse[]
}

export interface WorkflowInstanceRun {
    id: string
    workflowId: string
    workflowTriggerId: string
    parentInstanceId: string | null
    trigger: string | null
    triggerEntityId: string | null
    status: string
    startedAt: number
    finishedAt: number | null
    errorMessage: string | null
    createdAt: number
    updatedAt: number
    stepInstances: WorkflowStepInstanceRun[]
    childInstances: WorkflowInstanceRun[]
}

// Workflow endpoints
export const getWorkflows = (authStore: AuthStore) => {
    return apiGet<WorkflowTriggerData[]>('/workflows', authStore)
}

export const getWorkflowById = (id: string, authStore: AuthStore) => {
    return apiGet<WorkflowTriggerData>(`/workflows/${id}`, authStore)
}

export const getSourceModules = (authStore: AuthStore) => {
    return apiGet<SourceModule[]>('/workflows/source-modules', authStore)
}

export const getWorkflowConditionFields = (
    sources: ConditionFieldSourceItem[],
    authStore: AuthStore,
) => {
    return apiPost<ConditionFieldSource[]>('/workflows/condition-fields', { sources }, authStore)
}

export const createWorkflow = (data: WorkflowTriggerPayload, authStore: AuthStore) => {
    return apiPost<Workflow>('/workflows', data, authStore)
}

export const updateWorkflow = (id: string, data: WorkflowTriggerPayload, authStore: AuthStore) => {
    return apiPut<Workflow>(`/workflows/${id}`, data, authStore)
}

export const deleteWorkflow = (id: string, authStore: AuthStore) => {
    return apiDelete<{ id: string }>(`/workflows/${id}`, authStore)
}

export const getWorkflowInstances = (workflowId: string, authStore: AuthStore) => {
    return apiGet<WorkflowInstanceRun[]>(`/workflows/${workflowId}/instances`, authStore)
}

export type CronJobVariableBinding =
    | { type: 'constant'; value: string }
    | { type: 'injectable'; property: string }

export type CronJobModuleCondition = {
    operator: 'eq' | 'neq' | 'lt' | 'gt'
    value: string
}

/** A single scheduled execution row for a cron job (`GET /cron-jobs/:id/instances`). */
export interface CronJobInstance {
    id: string
    cronJobId: string
    startedAt: number
    finishedAt: number | null
    durationMs: number | null
    createdAt: number
    updatedAt: number
}

export const CRON_JOB_INSTANCE_SOURCE_TYPE = 'cron_job_instances'

/** Scheduled connector action (automation cron jobs). */
export interface CronJob {
    id: string
    name: string
    description: string | null
    connectorId: string
    connector: Connector
    connectorActionInstanceId: string
    connectorActionInstance: ConnectorActionInstance
    actionConfig: Record<string, any> | null
    variableBindings: Record<string, CronJobVariableBinding> | null
    /** Present after migration; omitted on older API responses. */
    injectionModule?: string | null
    moduleConditions?: Record<string, CronJobModuleCondition> | null
    frequency: string
    isActive: boolean
    createdAt: number
    updatedAt: number
}

export const getTriggerEntities = (triggerKey: string, authStore: AuthStore) => {
    return apiGet<{ id: string; name: string }[]>(`/workflows/${triggerKey}/entities`, authStore)
}

export const getCronJobs = (authStore: AuthStore) => {
    return apiGet<CronJob[]>('/cron-jobs', authStore)
}

export const getCronJobById = (id: string, authStore: AuthStore) => {
    return apiGet<CronJob>(`/cron-jobs/${id}`, authStore)
}

export const getCronJobInstances = (
    cronJobId: string,
    authStore: AuthStore,
    params: { page?: number; perPage?: number } = {},
) => {
    return apiGet<PaginatedResponse<CronJobInstance>>(
        `/cron-jobs/${cronJobId}/instances`,
        authStore,
        params,
    )
}

export const createCronJob = (
    data: {
        name: string
        description?: string
        connectorId: string
        connectorActionInstanceId: string
        actionConfig?: Record<string, any>
        variableBindings?: Record<string, CronJobVariableBinding> | null
        injectionModule?: string | null
        moduleConditions?: Record<string, CronJobModuleCondition> | null
        frequency: string
        isActive?: boolean
    },
    authStore: AuthStore
) => {
    return apiPost<CronJob>('/cron-jobs', data, authStore)
}

export const updateCronJob = (
    id: string,
    data: {
        name?: string
        description?: string | null
        connectorId?: string
        connectorActionInstanceId?: string
        actionConfig?: Record<string, any> | null
        variableBindings?: Record<string, CronJobVariableBinding> | null
        injectionModule?: string | null
        moduleConditions?: Record<string, CronJobModuleCondition> | null
        frequency?: string
        isActive?: boolean
    },
    authStore: AuthStore
) => {
    return apiPut<CronJob>(`/cron-jobs/${id}`, data, authStore)
}

export const deleteCronJob = (id: string, authStore: AuthStore) => {
    return apiDelete<{ id: string }>(`/cron-jobs/${id}`, authStore)
}
