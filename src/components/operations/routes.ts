import TripPlanning from '../fleet/TripPlanning.vue'
import PlannedTrips from '../fleet/PlannedTrips.vue'
import ViewJob from '../fleet/ViewJob.vue'
import PilotList from './pilots/PilotList.vue'
import PilotDetails from './pilots/PilotDetails.vue'
import AddUser from '../admin/users/AddUser.vue'
import JobTypeList from './job-types/JobTypeList.vue'
import JobTypeModal from './job-types/JobTypeModal.vue'

export const operationsRoutes = [
    {
        path: '/fleet/plan-job',
        name: 'Plan Job',
        component: TripPlanning,
        meta: { subject: 'vehicle-job', actions: ['read', 'create'] }
    },
    {
        path: '/fleet/planned-jobs',
        name: 'Planned Jobs',
        component: PlannedTrips,
        meta: { subject: 'vehicle-job', actions: ['read'] }
    },
    {
        path: '/fleet/jobs/:jobId',
        name: 'View Job',
        component: ViewJob,
        meta: { subject: 'vehicle-job', actions: ['read'] }
    },
    {
        path: '/fleet/pilots',
        name: 'Pilots',
        component: PilotList,
        meta: { subject: 'pilot', actions: ['read'], module: 'pilots' }
    },
    {
        path: '/fleet/pilots/add',
        name: 'Add Pilot',
        component: AddUser,
        meta: { subject: 'pilot', actions: ['create'], module: 'pilots' }
    },
    {
        path: '/fleet/pilots/:pilotId',
        name: 'Pilot Details',
        component: PilotDetails,
        meta: { subject: 'pilot', actions: ['read'], module: 'pilots' }
    },
    {
        path: '/fleet/pilots/:userId/edit',
        name: 'Edit Pilot',
        component: AddUser,
        meta: { subject: 'pilot', actions: ['update'], module: 'pilots' }
    },
    {
        path: '/fleet/job-types',
        name: 'Job Types',
        component: JobTypeList,
        meta: { subject: 'vehicle-job-type', actions: ['read'] }
    },
    {
        path: '/fleet/job-types/add',
        name: 'Add Job Type',
        component: JobTypeModal,
        meta: { subject: 'vehicle-job-type', actions: ['create'] }
    },
    {
        path: '/fleet/job-types/:id/edit',
        name: 'Edit Job Type',
        component: JobTypeModal,
        meta: { subject: 'vehicle-job-type', actions: ['update'] }
    }
]
