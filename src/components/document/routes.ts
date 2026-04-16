import DocumentsView from './main.vue'
import ViewDocument from './view-document.vue'
import DocumentSettings from './view-settings.vue'
import AddApprovalStrategy from './AddApprovalStrategy.vue'
import DocumentForm from './document-form.vue'
import DocumentChangeRequests from './document-change-requests.vue'
export const documentRoutes = [
    {
        path: '/qms/documents/settings',
        name: 'Document Settings',
        component: DocumentSettings,
        meta: {
            subjects: ['document_types', 'approval_strategies'],
            actions: ['read']
        }
    },
    {
        path: '/qms/documents/approval-strategies/add',
        name: 'AddApprovalStrategy',
        component: AddApprovalStrategy,
        meta: {
            subject: 'approval_strategies',
            actions: ['create']
        }
    },
    {
        path: '/qms/documents/approval-strategies/:id/edit',
        name: 'EditApprovalStrategy',
            component: AddApprovalStrategy,
        meta: {
            subject: 'approval_strategies',
            actions: ['update']
        }
    },
    {
        path: '/qms/documents',
        name: 'Documents',
        component: DocumentsView,
        meta: {
            subject: 'documents',
            actions: ['read']
        }
    },
    {
        path: '/qms/documents/:id',
        name: 'View Document',
        component: ViewDocument,
        meta: {
            subject: 'documents',
            actions: ['read']
        }
    },
    {
        path: '/qms/documents/add',
        name: 'Add Document',
        component: DocumentForm,
        meta: {
            subject: 'documents',
            actions: ['create']
        }
    },
    {
        path: '/qms/documents/:id/edit',
        name: 'Edit Document',
        component: DocumentForm,
        meta: {
            subject: 'documents',
            actions: ['update']
        }
    },
    {
        path: '/qms/documents/change-requests',
        name: 'Document Change Requests',
        component: DocumentChangeRequests,
        meta: {
            subject: 'change_requests',
            actions: ['read']
        }
    },
]
