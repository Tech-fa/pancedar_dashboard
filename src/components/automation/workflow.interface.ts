export interface Workflow {
    id: string
    name: string
    description: string | null
    triggerQueue: string
    connectorsNeeded: string[] | null
    steps?: WorkflowStep[] | null
    context?: Record<string, any> | null
    clientId: string
    teamId: string
    createdAt: number
    updatedAt: number
}

export interface WorkflowStep {
    name: string
    values: Record<string, any>
}

export type WorkflowFieldType =
    | 'boolean'
    | 'text'
    | 'number'
    | 'select'
    | 'files'

export interface WorkflowFieldConfig {
    label: string
    name?: string
    type: WorkflowFieldType
    required?: boolean
    options?: string[]
    placeholder?: string
    accept?: string
}

export interface WorkflowStepConfig {
    name: string
    description?: string
    fields: WorkflowFieldConfig[]
}

export interface AvailableWorkflow {
    name: string
    description: string
    steps: WorkflowStepConfig[]
}

export interface CreateWorkflowPayload {
    name: string
    description?: string
    steps?: WorkflowStep[]
}

export interface UpdateWorkflowStepsPayload {
    description?: string | null
    steps?: WorkflowStep[]
}

export interface WorkflowRun {
    id: string
    workflowId: string
    context: Record<string, any> | null
    createdAt: number
    updatedAt: number
    status: string
    currentStep: string | null
    stepsContext: Record<string, any> | null
    explanation: Record<string, any> | null
}
