import ConnectorsPage from './ConnectorsPage.vue'
import ViewConnector from './ViewConnector.vue'
import WorkflowsPage from './WorkflowsPage.vue'
import WorkflowFormPage from './WorkflowFormPage.vue'
import ViewWorkflowPage from './ViewWorkflowPage.vue'
import CronJobsListPage from './cron-jobs/CronJobsListPage.vue'
import ViewCronJobPage from './cron-jobs/ViewCronJobPage.vue'
import CronJobForm from './cron-jobs/CronJobForm.vue'
import ChecklistsPage from './checklist/ChecklistsPage.vue'
import ChecklistBuilder from './checklist/ChecklistBuilder.vue'

export const automationRoutes = [
    {
        path: '/automation/connectors',
        name: 'AutomationConnectors',
        component: ConnectorsPage,
        meta: { subject: 'workflows', actions: ['read'] }
    },
    {
        path: '/automation/connectors/:id',
        name: 'ViewConnector',
        component: ViewConnector,
        meta: { subject: 'workflows', actions: ['read'] }
    },
    {
        path: '/automation/workflows',
        name: 'AutomationWorkflows',
        component: WorkflowsPage,
        meta: { subject: 'workflows', actions: ['read'] }
    },
    {
        path: '/automation/workflows/new',
        name: 'AutomationWorkflowNew',
        component: WorkflowFormPage,
        meta: { subject: 'workflows', actions: ['create'] }
    },
    {
        path: '/automation/workflows/:id/edit',
        name: 'AutomationWorkflowEdit',
        component: WorkflowFormPage,
        meta: { subject: 'workflows', actions: ['update'] }
    },
    {
        path: '/automation/workflows/:id',
        name: 'ViewWorkflow',
        component: ViewWorkflowPage,
        meta: { subject: 'workflows', actions: ['read'] }
    },
    {
        path: '/automation/cron-jobs',
        name: 'AutomationCronJobs',
        component: CronJobsListPage,
        meta: { subject: 'workflows', actions: ['read'] }
    },
    {
        path: '/automation/cron-jobs/add',
        name: 'AutomationCronJobAdd',
        component: CronJobForm,
        meta: { subject: 'workflows', actions: ['create'] }
    },
    {
        path: '/automation/cron-jobs/:id/edit',
        name: 'AutomationCronJobEdit',
        component: CronJobForm,
        meta: { subject: 'workflows', actions: ['update'] }
    },
    {
        path: '/automation/cron-jobs/:id',
        name: 'AutomationCronJobView',
        component: ViewCronJobPage,
        meta: { subject: 'workflows', actions: ['read'] }
    },
    {
        path: '/automation/checklists',
        name: 'AutomationChecklists',
        component: ChecklistsPage,
        meta: { subject: 'assets', actions: ['read'] }
    },
    {
        path: '/automation/checklists/add',
        name: 'AutomationChecklistAdd',
        component: ChecklistBuilder,
        meta: { subject: 'assets', actions: ['create'] }
    },
    {
        path: '/automation/checklists/:id/edit',
        name: 'AutomationChecklistEdit',
        component: ChecklistBuilder,
        meta: { subject: 'assets', actions: ['read'] }
    }
]
