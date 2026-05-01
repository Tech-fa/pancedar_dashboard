import KijiLinksPage from "./KijiLinksPage.vue";

export const findingsRoutes = [
  {
    path: "/findings/kiji-links",
    name: "FindingsKijiLinks",
    component: KijiLinksPage,
    meta: { subject: "kijiji_links", actions: ["read"] },
  },
];
