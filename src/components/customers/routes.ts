import CustomerDashboard from "./CustomerDashboard.vue";
import CustomerList from "../operations/customers/CustomerList.vue";
import CustomerModal from "../operations/customers/CustomerModal.vue";
import ViewCustomer from "../operations/customers/viewCustomer.vue";
import CustomerConfig from "../operations/customers/customer-config.vue";
import CustomerServices from "../operations/customers/customer-services.vue";

export const customerRoutes = [
  {
    path: "/customers/dashboard",
    name: "Customer Dashboard",
    component: CustomerDashboard,
    meta: { subject: "customer", actions: ["read"] },
  },
  {
    path: "/customers/list",
    name: "Customer List",
    component: CustomerList,
    meta: { subject: "customer", actions: ["read"] },
  },
  {
    path: "/customers/add",
    name: "Customer Add",
    component: CustomerModal,
    meta: { subject: "customer", actions: ["create"] },
  },
  {
    path: "/customers/list/:id/edit",
    name: "Customer Edit",
    component: CustomerModal,
    meta: { subject: "customer", actions: ["update"] },
  },
  {
    path: "/customers/list/:id",
    name: "Customer View",
    component: ViewCustomer,
    meta: { subject: "customer", actions: ["read"] },
  },
  // {
  //     path: '/customers/portal-config',
  //     name: 'Customer Config',
  //     component: CustomerConfig,
  //     meta: { subject: 'customer', actions: ['read'] }
  // },
  // {
  //     path: '/customers/services',
  //     name: 'Customer Services',
  //     component: CustomerServices,
  //     meta: { subject: 'customer', actions: ['read'] }
  // }
];
