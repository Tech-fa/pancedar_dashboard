import OperationLocationList from './OperationLocationList.vue'
import OperationLocationModal from './OperationLocationModal.vue'

export const operationConfigRoutes = [
    {
        path: '/operation-config/locations',
        name: 'Operation Locations',
        component: OperationLocationList,
        meta: { subject: 'operation-config', actions: ['read'] }
    },
    {
        path: '/operation-config/locations/add',
        name: 'Add Operation Location',
        component: OperationLocationModal,
        meta: { subject: 'operation-config', actions: ['create'] }
    },
    {
        path: '/operation-config/locations/:id/edit',
        name: 'Edit Operation Location',
        component: OperationLocationModal,
        meta: { subject: 'operation-config', actions: ['update'] }
    }
]
