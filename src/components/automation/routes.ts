import ConnectorsPage from "./ConnectorsPage.vue";
import WorkflowsPage from "./WorkflowsPage.vue";
import NewWorkflowPage from "./NewWorkflowPage.vue";
import EditWorkflowPage from "./EditWorkflowPage.vue";

export const automationRoutes = [
  {
    path: "/automation/connectors",
    name: "AutomationConnectors",
    component: ConnectorsPage,
    meta: { subject: "workflows", actions: ["read"] },
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
    path: "/automation/workflows/:id",
    name: "AutomationWorkflowEdit",
    component: EditWorkflowPage,
    meta: { subject: "workflows", actions: ["read"] },
  },
];
