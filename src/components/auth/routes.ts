import RegisterView from '@/components/auth/RegisterPage.vue'
import LoginView from '@/components/auth/LoginPage.vue'
import ThankYouView from '@/components/auth/ThankYouPage.vue'
import ResetPasswordView from '@/components/auth/resetPasword.vue'
import ForgotPasswordView from '@/components/auth/forgotPassword.vue'

export const AuthRoutes = [
    {
        path: '/thank-you',
        name: 'ThankYou',
        component: ThankYouView
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: ResetPasswordView
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: ForgotPasswordView
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView
    },
    {
        path: '/activate',
        name: 'Activate',
        component: () => import('../../components/auth/activate.vue')
    },

]
