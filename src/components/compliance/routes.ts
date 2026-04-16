import ComplianceDashboard from './ComplianceDashboard.vue'

export const complianceRoutes = [
    {
        path: '/qms/dashboard',
        name: 'Compliance Dashboard',
        component: ComplianceDashboard,
        meta: {
            subjects: ['documents', 'trainings', 'audit_instances'],
            actions: ['read']
        }
    }
]
