import Groups from './Groups.vue'
import AddGroup from './addGroup.vue'

export const permissionsRoutes = [
    {
        path: '/admin/permissions/groups',
        name: 'Permissions Groups',
        component: Groups,
        meta: {
            subject: 'permissions',
            actions: ['read']
        }
    },
    {
        path: '/admin/permissions/groups/add',
        name: 'Add Permission Group',
        component: AddGroup,
        meta: {
            subject: 'permissions',
            actions: ['create']
        }
    },
    {
        path: '/admin/permissions/groups/:id/edit',
        name: 'Edit Permission Group',
        component: AddGroup,
        meta: {
            subject: 'permissions',
            actions: ['update']
        }
    },
    {
        path: '/admin/permissions/groups/:id',
        name: 'Permission Group',
        component: AddGroup,
        meta: {
            subject: 'permissions',
            actions: ['read']
        }
    }
]
