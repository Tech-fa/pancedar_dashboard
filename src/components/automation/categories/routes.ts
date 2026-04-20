export const categoriesRoutes = [
  {
    path: "/resources/categories",
    component: () => import("./mainView.vue"),
    meta: {
      subject: "email_workflow_categories",
      actions: ["read"],
    },
  },
  {
    path: "/resources/categories/add",
    component: () => import("./AddCategory.vue"),
    meta: {
      subject: "email_workflow_categories",
      actions: ["create"],
    },
  },
  {
    path: "/resources/categories/:categoryId",
    component: () => import("./viewCategory.vue"),
    meta: {
      subject: "email_workflow_categories",
      actions: ["read"],
    },
  },
  {
    path: "/resources/categories/:categoryId/edit",
    component: () => import("./AddCategory.vue"),
    meta: {
      subject: "email_workflow_categories",
      actions: ["update"],
    },
  },
];
