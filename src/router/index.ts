import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import HomeView from "@/components/HomeView.vue";
import { AuthRoutes } from "@/components/auth/routes";
import { usersRoutes } from "@/components/admin/users/routes";
import { ref } from "vue";
import { permissionsRoutes } from "@/components/admin/permissions/routes";
import ProfileView from "@/components/profile/Profile.vue";
import { teamsRoutes } from "@/components/admin/teams/routes";
import { automationRoutes } from "@/components/automation/routes";
import { categoriesRoutes } from "@/components/automation/categories/routes";
import { findingsRoutes } from "@/components/findings/routes";
// Create a reactive loading state that can be imported in other components
export const isRouteChanging = ref(false);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // the children array here, can be extracted and used in all other integrations.
    {
      path: "/",
      component: HomeView,
      children: [
        {
          path: "",
          name: "Main",
          redirect: "/profile",
        },

        { path: "profile", name: "Profile", component: ProfileView },

        ...usersRoutes,
        ...permissionsRoutes,
        ...teamsRoutes,
        ...automationRoutes,
        ...categoriesRoutes,
        ...findingsRoutes,
      ],
    },

    {
      path: "/:catchAll(.*)",
      name: "NotFound",
      component: () => import("../components/NotFound.vue"),
    },
    ...AuthRoutes,
  ],
});

// Show loading state before each route change
router.beforeEach(async (to, from) => {
  isRouteChanging.value = true;
  const authStore = useAuthStore();
  if (
    !authStore.state.isLoggedIn &&
    !AuthRoutes.map((route) => route.name).includes(to.name as string)
  ) {
    // redirect the user to the login page with the intended destination
    return {
      name: "Login",
      query: { redirect: to.fullPath },
    };
  }
  if (to.meta.actions) {
    const subjects = (to.meta.subjects as string[]) || [
      to.meta.subject as string,
    ];
    if (
      !subjects.some((subject) =>
        authStore.hasPermissions({
          subject: subject as string,
          actions: to.meta.actions as string[],
        }),
      )
    ) {
      return { name: "Login" };
    }
  }
});

// Hide loading state after navigation is complete
router.afterEach(() => {
  // Add a small delay to make the loading state visible even for quick navigations
  isRouteChanging.value = false;
});

export default router;
