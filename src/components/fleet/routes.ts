import Asset from "./Asset.vue";
import AddAsset from "./AddAsset.vue";
import AssetModels from "./AssetModels.vue";
import AddAssetModel from "./AddAssetModel.vue";
import AssetCategories from "./AssetCategories.vue";
import AddAssetCategory from "./AddAssetCategory.vue";
import AssetView from "./AssetView.vue";
import FleetSettings from "./fleet-settings.vue";
import FleetOpsDashboard from "./FleetOpsDashboard.vue";

export const fleetRoutes = [
  {
    path: "/fleet/dashboard",
    name: "Fleet Dashboard",
    component: FleetOpsDashboard,
    meta: { subject: "asset", actions: ["read"] },
  },
  {
    path: "/fleet/assets",
    name: "Fleet Assets",
    component: Asset,
    meta: { subject: "asset", actions: ["read"] },
  },
  {
    path: "/fleet/settings",
    name: "Fleet Settings",
    component: FleetSettings,
    meta: { subject: "asset", actions: ["read"] },
  },
  {
    path: "/fleet/assets/add",
    name: "Add Asset",
    component: AddAsset,
    meta: { subject: "asset", actions: ["create"] },
  },
  {
    path: "/fleet/assets/:assetId",
    name: "View Asset",
    component: AssetView,
    meta: { subject: "asset", actions: ["read"] },
  },

  {
    path: "/fleet/assets/:assetId/edit",
    name: "Edit Asset",
    component: AddAsset,
    meta: { subject: "asset", actions: ["update"] },
  },
  {
    path: "/fleet/asset-models",
    name: "Asset Models",
    component: AssetModels,
    meta: { subject: "asset-model", actions: ["read"] },
  },
  {
    path: "/fleet/asset-models/add",
    name: "Add Asset Model",
    component: AddAssetModel,
    meta: { subject: "asset-model", actions: ["create"] },
  },
  {
    path: "/fleet/asset-models/:modelId/edit",
    name: "Edit Asset Model",
    component: AddAssetModel,
    meta: { subject: "asset-model", actions: ["update"] },
  },
  {
    path: "/fleet/asset-categories",
    name: "Asset Categories",
    component: AssetCategories,
    meta: { subject: "asset-category", actions: ["read"] },
  },
  {
    path: "/fleet/asset-categories/add",
    name: "Add Asset Category",
    component: AddAssetCategory,
    meta: { subject: "asset-category", actions: ["create"] },
  },
  {
    path: "/fleet/asset-categories/:categoryId/edit",
    name: "Edit Asset Category",
    component: AddAssetCategory,
    meta: { subject: "asset-category", actions: ["update"] },
  },
];
