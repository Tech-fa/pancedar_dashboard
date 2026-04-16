import AddTeam from './AddTeam.vue'
import MainView from './mainView.vue'
import ViewTeam from './viewTeam.vue'

export const teamsRoutes = [
    {
        path: '/admin/teams',
        component: MainView,
        meta: {
            subject: 'teams',
            actions: ['read']
        }
    },
    {
        path: '/admin/teams/:teamId/edit',
        component: AddTeam,
        meta: {
            subject: 'teams',
            actions: ['update']
        }
    },
    {
        path: '/admin/teams/:teamId',
        component: ViewTeam,
        meta: {
            subject: 'teams',
            actions: ['read']
        }
    },
    {
        path: '/admin/teams/add',
        component: AddTeam,
        meta: {
            subject: 'teams',
            actions: ['create']
        }
    }
]
