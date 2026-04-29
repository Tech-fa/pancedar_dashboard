import ConnectorsPage from "./ConnectorsPage.vue";
import CostsPage from "./CostsPage.vue";
import WorkflowsPage from "./WorkflowsPage.vue";
import NewWorkflowPage from "./NewWorkflowPage.vue";
import EditWorkflowPage from "./EditWorkflowPage.vue";
import IncomingEmailReviewPage from "./IncomingEmailReviewPage.vue";
import WorkflowRunsPage from "./WorkflowRunsPage.vue";
import WorkflowRunsKanbanPage from "./WorkflowRunsKanbanPage.vue";
import AgentCommunicationsPage from "./AgentCommunicationsPage.vue";

export const automationRoutes = [
  {
    path: "/automation/connectors",
    name: "AutomationConnectors",
    component: ConnectorsPage,
    meta: { subject: "workflows", actions: ["read"] },
  },
  {
    path: "/automation/costs",
    name: "AutomationCosts",
    component: CostsPage,
    meta: { subject: "costs", actions: ["read"] },
  },
  {
    path: "/automation/workflows",
    name: "AutomationWorkflows",
    component: WorkflowsPage,
    meta: { subject: "workflows", actions: ["read"] },
  },
  {
    path: "/automation/workflows/new",
    name: "AutomationWorkflowNew",
    component: NewWorkflowPage,
    meta: { subject: "workflows", actions: ["create"] },
  },
  {
    path: "/automation/workflows/kanban",
    name: "AllAutomationWorkflowRunsKanban",
    component: WorkflowRunsKanbanPage,
    meta: { subject: "workflows", actions: ["read"] },
  },
  {
    path: "/automation/workflows/:id",
    name: "AutomationWorkflowEdit",
    component: EditWorkflowPage,
    meta: { subject: "workflows", actions: ["read"] },
  },
  {
    path: "/automation/workflows/:id/runs",
    name: "AutomationWorkflowRuns",
    component: WorkflowRunsPage,
    meta: { subject: "workflows", actions: ["read"] },
  },
  {
    path: "/automation/workflows/:id/runs/kanban",
    name: "AutomationWorkflowRunsKanban",
    component: WorkflowRunsKanbanPage,
    meta: { subject: "workflows", actions: ["read"] },
  },
  {
    path: "/automation/workflow-runs/:runId/communications",
    name: "AutomationWorkflowRunCommunications",
    component: AgentCommunicationsPage,
    meta: { subject: "workflows", actions: ["read"] },
  },
  {
    path: "/automation/incoming-emails/:id",
    name: "AutomationIncomingEmailReview",
    component: IncomingEmailReviewPage,
    meta: {
      subjects: ["incoming_emails", "workflows"],
      actions: ["read"],
    },
  },
];
