export interface UserDepartment {
  id: number;
  user: User;
  department: Department;
}


export interface TableEntity {
  id: number | string;
}
export interface UnitType {
  id: number;
  name: string;
  deleted: boolean;
  // parent: UnitType;
  children: UnitType[];
}
export interface NotificationConfig {
  id: number;
  subject: string;
  action: string;
  recipient: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  scope: string;
  recipients: User[];
  label: string;
  excludeAppAdmins: boolean;
}

export interface DocumentCode {
  id: number;
  code: string;
  name: string | null;
  documentTypeId: number;
}

export interface DocumentType {
  id: number;
  name: string;
  description: string;
  categoryCode: string;
  createdAt: number;
  updatedAt: number;
  createdBy: User;
  documentsCount: number;
  documentCodes?: DocumentCode[];
}

export interface Document {
  id: string;
  title: string;
  description: string;
  dueDate: number;
  documentCode: string;
  isPublic: boolean;
  isObsolete: boolean;
  createdAt: number;
  updatedAt: number;
  currentVersion: number;
  approvalDate: number;
  approvalDueDate: number;
  obsoleteDate: number;
  deleted: boolean;
  activeChangeRequests?: number;
  totalChangeRequests?: number;
  changeRequest?: { id: number };

  documentType: DocumentType;

  category?: DocumentCode;


  versions: DocumentVersion[];

  createdBy: User;

  approvers: User[];

  reviewers: User[];

  contributors: ContentContributor[];

  approvalStrategy: ApprovalStrategy;
  isPersonal: boolean;
  createdFor?: User;
}

export interface ApprovalStrategy {
  id: number;
  name: string;
  requiredReviews: number;
  maxReviewDuration: number;
  requiredApprovals: number;
  maxApprovalDuration: number;
  documentApprovers: DocumentApprover[];
  allReviewers: boolean;
  allApprovers: boolean;
  includeChildren: boolean;
  noReview: boolean;
  noApprove: boolean;
}
export interface DocumentApprover {
  id: number;
  user: User;
  roleType: string;
}
export interface DocumentVersion {
  id: number;
  versionNumber: number;
  createdAt: number;
  content: string;
  file: string;
  document: Document;
  changes?: string;
  status: DocumentStatus;
}

export enum DocumentStatus {
  PENDING = "pending",
  READY_FOR_APPROVAL = "ready_for_approval",
  PUBLISHED = "published",
  IN_REVIEW = "in_review",
  OBSOLETE = "obsolete",
}

export interface Comment {
  id: number;
  text: string;
  createdAt: number;
  createdBy: User;
}

export interface ChangeRequest {
  id: number;
  title?: string;
  reason?: string;
  justification?: string;
  riskIdentified?: string;
  status: ChangeRequestStatus;
  documentId?: string;
  documentIds?: string[];
  documents?: ChangeRequestDocument[];
  organizationUnitId?: number;
  requestedBy: User;
  reviewedBy?: User;
  reviewedAt?: number;
  reviewComment?: string;
  createdAt: number;
  updatedAt: number;
}
export interface ChangeRequestDocument {
  id: string;
  title: string;
}
export enum ChangeRequestStatus {
  ACTIVE = "active",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}
export interface ContentContributor {
  id: number;
  user: User;
  actions: ContentAction[];
  version: number;
}
export interface ContentAction {
  id: number;
  type: string;
  createdDate: number;
  comment: Comment;
}
export interface DocumentVersion {
  id: number;
  versionNumber: number;
  content: string;
  createdAt: number;
  file: string;
  changes?: string;
  changeRequest?: ChangeRequest;
  status: DocumentStatus;
  createdBy: User;
}

export interface CalendarLegend {
  id: number;
  name: string;
  color: string;
}
export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  eventType: {
    id: number;
    name: string;
    color: string;
  };
  attendees: User[];
}
export interface Skill {
  id: string;
  name: string;
  description?: string | null;
  createdAt: number;
  updatedAt: number;
}
export interface User {
  id: string;
  fname: string;
  lname: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  createdBy: {
    id: number;
    fname: string;
    lname: string;
  };
  verifiedAt: number;
  userType?: string;
  skill?: string;
  hourlyRate?: number;
  skills?: UserSkill[];
  phone?: string;
  isAdmin?: boolean;
}
export interface Vacation {
  id: number;
  startDate: number;
  endDate: number;
  numOfDays: number;
  userId: string;
  createdAt: number;
}

export interface OrganizationUnitSettings {
  maxOwnerLevels: number;
  levelNames: string[];
}

export interface PermissionGroup {
  id: number;
  name: string;
  permissions: PermissionDTO[];
  scope: string;
  members?: number;
  userPermissionGroups?: UserPermissionGroup[];
  description?: string;
  custom?: boolean;
}
export interface UserPermissionGroup {
  id: number;
  user: User;
  permissionGroup: PermissionGroup;
}
export interface PermissionDTO {
  subject: string;
  action: string;
}
export interface UserSkill {
  id: number;
  skill: Skill;
}
export interface Technician extends User {
  skills: UserSkill[];
  hourlyRate: number;
}

export interface Pilot extends User {
  // Pilots are users with the Pilot role
  // Additional pilot-specific fields can be added here
}
export interface EventType {
  id: number;
  name: string;
  color: string;
}
export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalCount: number;
  perPage: number;
}

export interface Role {
  id: number;
  name: string;
  permissions: PermissionDTO[];
  members?: number;
  users?: User[];
  description?: string;
  custom?: boolean;
}
export interface UserRole {
  id: number;
  user: User;
  role: Role;
}
export interface Department {
  id: number;
  name: string;
}
export interface PermissionDTO {
  subject: string;
  action: string;
}

export interface UserNotification {
  id: number;
  createdAt: number;
  viewed: boolean;
  data: {
    id: number;
    title: string;
    message: string;
    link: string;
  };
}

export interface AuthStore {
  logout: Function;
  setLoginState: Function;
  renewToken: Function;
  state: { token: string | null; expiryDate: number };
  hasPermissions: Function;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  siteId: string;
  site?: Department;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  siteId: string;
  locationId: string | null;
  parentAssetId: string | null;
  modelId: string | null;
  assetCode: string;
  name: string;
  class: string | null;
  serialNo: string | null;
  criticality: "Low" | "Medium" | "High";
  status: "Active" | "Inactive" | "Retired";
  purchaseDate: number;
  commissionDate: number;
  custom: any | null;
  createdAt: number;
  updatedAt: number;
  site?: Department;
  warehouse?: Warehouse;
  warehouseBin?: WarehouseBin;
  assetModel?: AssetModel;
  assetCategory?: AssetCategory;
  year?: number | null;
  parts?: AssetPart[];
  assetParams?: AssetParams;
  lastLocation?: Location;
  jobs?: VehicleJob[];
}

export interface AssetParams {
  latitude: number | null;
  longitude: number | null;
  updatedAt: number | null;
}

export enum AssetPartLifecycleState {
  InUse = "in-use",
  InRepair = "in-repair",
  Repaired = "repaired",
  Waste = "waste",
}

export interface AssetPartStateChange {
  id: string;
  assetPartId: string;
  state: AssetPartLifecycleState;
  stateChangedAt: number;
  source: string | null;
}

export interface AssetPart {
  id: string;
  assetId: string;
  partId: string;
  serialNumber: string;
  part?: Part | null;
  asset?: Asset | null;
  placedAt: number;
  lifecycleState?: AssetPartLifecycleState;
  lifecycleHistory?: AssetPartStateChange[];
}

export type AssetTimelineState = "Active" | "InMaintenance";

export interface AssetTimelineEvent {
  id: string;
  state: AssetTimelineState;
  startedAt: number;
  endedAt?: number | null;
  description?: string | null;
  workOrderId?: string | null;
  workOrderCode?: string | null;
}

export type TripLifecycleState =
  | "Planned"
  | "Started"
  | "Takeoff"
  | "Completed"
  | "Halted"
  | "Unknown";

export interface TripState {
  id: string;
  tripId: string;
  state: TripLifecycleState;
  recordedAt: number;
  payload: Record<string, any> | null;
  createdAt: number;
  updatedAt: number;
}

export interface TrajectoryPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface TripMetadata {
  trajectory?: TrajectoryPoint[];
}

export interface Trip {
  id: string;
  displayId: string;
  assetId: string;
  flightId: string;
  plannedDate: number | null;
  currentState: TripLifecycleState;
  startedAt: number;
  completedAt: number | null;
  haltedAt: number | null;
  createdAt: number;
  updatedAt: number;
  states?: TripState[];
  asset?: Asset | null;
  vehicleJob?: VehicleJob | null;
  operatorId?: string | null;
  operator?: User | null;
  takeoffLocation?: Record<string, any> | null;
  landingLocation?: Record<string, any> | null;
  batteryMax?: number | null;
  batteryMin?: number | null;
  milesTravelled?: number | null;
  maxSpeed?: number | null;
  distanceFromHome?: number | null;
  metadata?: TripMetadata | null;
}

export interface TripTelemetryPoint {
  bucket: number;
  metrics: Record<string, number | null>;
}

export interface AssetModel {
  id: string;
  name: string;
  make: string | null;
}

export interface AssetCategory {
  id: string;
  name: string;
}

export interface Meter {
  id: string;
  name: string;
  label: string;
  unit: string;
  createdAt: number;
  updatedAt: number;
}

export interface MeterReading {
  id: string;
  meterId: string;
  assetId: string;
  value: number;
  timestamp: number;
  createdAt: number;
  updatedAt: number;
  meter?: Meter;
  asset?: Asset;
}

export interface Alert {
  id: string;
  assetId: string;
  partId?: string | null;
  severity: "critical" | "warning" | "info";
  status: "active" | "resolved";
  description: string;
  createdAt: number;
  updatedAt: number | null;
  asset?: Asset | null;
  part?: Part | null;
  alertSettingId?: string | null;
  alertSetting?: AlertSetting | null;
}

export interface AlertSetting {
  id: string;
  meterId: string;
  name: string;
  threshold: number;
  criticality: "critical" | "warning" | "info";
  createdAt: number;
  updatedAt: number;
  direction: "above" | "below" | "delta";
  meter?: Meter | null;
}

export interface AlertsSummary {
  severity: {
    critical: number;
    warning: number;
    info: number;
  };
  status: {
    active: number;
    resolved: number;
  };
}

export type AlertDashboardType =
  | "line"
  | "bar"
  | "pie"
  | "list"
  | "semi-circle";

export interface AlertDashboardConfig {
  key: string;
  name: string;
  type: AlertDashboardType;
  description?: string;
}

export interface AlertDashboardQueryResult {
  key: string;
  name: string;
  type: AlertDashboardType;
  description?: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

export type DashboardWidgetType =
  | "gauge-summary"
  | "stat-card"
  | "stat-breakdown"
  | "list"
  | "pie"
  | "kanban"
  | "table"
  | "timeseries"
  | "heatmap"
  | "cards"
  | "bar";

export interface DashboardWidgetConfig {
  key: string;
  name: string;
  type: DashboardWidgetType;
  description?: string;
  subject: string;
}

export interface DashboardWidgetQueryResult {
  key: string;
  name: string;
  type: DashboardWidgetType;
  description?: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface AssetStatistics {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  groundedAssets: number;
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  lowAlerts: number;
}
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  bins?: WarehouseBin[];
}

export interface WarehouseBin {
  id: number;
  warehouseId: string;
  warehouse?: Warehouse | null;
  code: string;
  description?: string | null;
  zone: "Receiving" | "Storage" | "Pick" | "Quarantine" | "Returns" | "Staging";
  aisle?: string | null;
  rack?: string | null;
  level?: string | null;
  slot?: string | null;
  barcode?: string | null;
  putawayPriority: number;
  pickingPriority: number;
  capacityUnits?: string | null;
  capacityWeight?: string | null;
  capacityVolume?: string | null;
  envConstraints?: Record<string, any> | null;
  allowedItemClass?: string | null;
  isPointOfUse: boolean;
  location_id?: number | null;
  last_counted_at?: string | null;
  is_active: boolean;
}

export interface CreateWarehousePayload {
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateWarehouseBinPayload {
  warehouseId: string;
  code: string;
  description?: string | null;
  zone?: WarehouseBin["zone"];
  aisle?: string | null;
  rack?: string | null;
  level?: string | null;
  slot?: string | null;
  barcode?: string | null;
  putawayPriority?: number | null;
  pickingPriority?: number | null;
  capacityUnits?: string | null;
  capacityWeight?: string | null;
  capacityVolume?: string | null;
  envConstraints?: Record<string, any> | null;
  allowedItemClass?: string | null;
  isPointOfUse?: boolean;
  location_id?: number | null;
  last_counted_at?: string | null;
  is_active?: boolean;
}

export interface PartCategory {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  currency: string;
  paymentTerms?: string | null;
  contractEnd?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorPayload {
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  currency?: string;
  paymentTerms?: string | null;
  contractEnd?: number | null;
}

export interface PartInventorySummary {
  id: string;
  partId: string;
  onHand: number;
  onOrder: number;
  reserved: number;
  averageCost: number;
  reorderPoint: number;
  reorderQuantity: number;
  warehouseId?: string;
  warehouse?: Warehouse | null;
  warehouseBinId?: number | null;
  warehouseBin?: WarehouseBin | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface ConfigurePartInventoryItem {
  partId?: string;
  warehouseId: string;
  warehouseBinId: number;
  onHand: number;
  reserved: number;
  onOrder: number;
  averageCost: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  reason?: string | null;
}

export interface ConfigurePartInventoryPayload {
  inventories: ConfigurePartInventoryItem[];
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  cost: number;
  description?: string | null;
  categoryId?: string | null;
  category?: AssetCategory | null;
  parentId?: string | null;
  // parent?: Part | null;
  children?: Part[];
  hasChildren?: boolean;
  childrenLoaded?: boolean;
  childrenLoading?: boolean;
  vendorPricings?: PartVendorPricing[];
  purchaseOrderLines?: PurchaseOrderLine[];
  uom: string;
  trackSerial: boolean;
  trackLot: boolean;
  minQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  defaultLeadTimeDays: number;
  isActive: boolean;
  inventories?: PartInventorySummary[];
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
  treeDepth?: number;
}

export interface PartsStats {
  totalInventoryValue: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  atRiskCount: number;
  averageLeadTimeDays: number;
  monthlyConsumption: number;
  averageDailyConsumption: number;
  totalParts: number;
}

export interface GetPartsParams {
  search?: string;
  parentId?: string;
  page?: number;
  perPage?: number;
  category?: string;
  stockStatus?: string;
  supplier?: string;
  rootOnly?: boolean;
  vendorId?: string;
}

export interface BrowsePartsParams {
  rootId?: string;
  cursor?: string;
  limit?: number;
  q?: string;
  includeDescendants?: boolean;
  rootOnly?: boolean;
  categoryId?: string;
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CreatePartPayload {
  name: string;
  sku: string;
  cost: string;
  description?: string | null;
  categoryId?: string | null;
  parentId?: string | null;
  uom?: string;
  trackSerial?: boolean;
  trackLot?: boolean;
  minQuantity?: string;
  reorderPoint?: string;
  reorderQuantity?: string;
  defaultLeadTimeDays?: number;
  isActive?: boolean;
  vendors?: PartVendorPayload[];
}

export interface PartFormValues {
  name: string;
  sku: string;
  cost: string;
  description: string | null;
  category: PartCategory | null;
  uom: string;
  trackSerial: boolean;
  trackLot: boolean;
  minQuantity: string;
  reorderPoint: string;
  reorderQuantity: string;
  defaultLeadTimeDays: string;
  isActive: boolean;
}

export interface PartVendorPayload {
  vendorId: string;
  leadTimeDays: number;
  price: number;
}

export interface PartVendorPricing extends PartVendorPayload {
  vendor?: Vendor | null;
}

export type PurchaseOrderStatus =
  | "Draft"
  | "Approved"
  | "PartiallyReceived"
  | "Received"
  | "Cancelled";

export interface PurchaseOrderLine {
  id: string;
  partId: string;
  part?: Part | null;
  warehouseId?: string | null;
  warehouse?: Warehouse | null;
  warehouseBinId?: number | null;
  warehouseBin?: WarehouseBin | null;
  description?: string | null;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  taxRate: number;
  discountAmount: number;
  lineTotal: number;
  expectedAt?: number | null;
  isClosed: boolean;
  createdAt?: number;
  updatedAt?: number;
  purchaseOrder?: PurchaseOrder | null;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  vendorId: string;
  vendor?: Vendor | null;
  warehouseId: string;
  warehouse?: Warehouse | null;
  status: PurchaseOrderStatus;
  currency: string;
  expectedAt?: number | null;
  notes?: string | null;
  createdById?: string | null;
  approvedById?: string | null;
  approvedAt?: number | null;
  taxRate?: number;
  discount?: number;
  totalAmount: number;
  createdAt: number;
  updatedAt: number;
  lines: PurchaseOrderLine[];
}

export interface AssetForMap {
  id: string;
  assetCode: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  battery: number;
  altitude: number;
  speed: number;
  lastUpdate: Date;
  hasAlerts: boolean;
}
export interface PopupAlert {
  id: string | number;
  message: string;
  severity: string;
  timestamp: string | number | Date;
}

export interface CreatePurchaseOrderLinePayload {
  partId: string;
  warehouseBinId: number;
  warehouseId: string;
  quantityOrdered: number;
  expectedAt?: number;
}

export interface CreatePurchaseOrderPayload {
  vendorId: string;
  currency?: string;
  expectedAt?: number;
  notes?: string | null;
  tax?: number;
  status?: PurchaseOrderStatus;
  discount?: number;
  lines: CreatePurchaseOrderLinePayload[];
}

export interface UpdatePurchaseOrderLinePayload
  extends CreatePurchaseOrderLinePayload {
  id?: string;
}

export interface UpdatePurchaseOrderPayload {
  vendorId: string;
  currency?: string;
  expectedAt?: number;
  notes?: string | null;
  tax?: number;
  status?: PurchaseOrderStatus;
  discount?: number;
  lines: UpdatePurchaseOrderLinePayload[];
}

export interface UpdatePurchaseOrderStatusPayload {
  status: PurchaseOrderStatus;
}

export interface PurchaseOrderDraftLine {
  id: string;
  unitCost: number;
  sourceLineId?: string | null;
}

export interface PurchaseOrderFormValues {
  vendor: Vendor | null;
  expectedDate: string | null;
  status: PurchaseOrderStatus;
  currency: string;
  notes: string | null;
  tax: number;
  discount: number;
}

export type DailyInspectionCheckType =
  | "IMAGE"
  | "PASS_FAIL"
  | "TEXT"
  | "NUMBER";

export interface DailyInspectionCheck {
  id: string;
  formId: string;
  label: string;
  checkType: DailyInspectionCheckType;
  displayOrder: number;
  isRequired: boolean;
  failThreshold?: number | string | null;
  createdAt: number;
  updatedAt: number;
}

export interface DailyInspectionCheckPayload {
  id?: string;
  label: string;
  checkType?: DailyInspectionCheckType;
  displayOrder: number;
  isRequired?: boolean;
  failThreshold?: number | null;
}

export interface DailyInspectionForm {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  checks: DailyInspectionCheck[];
}

export interface DailyInspectionFormPayload {
  checks: DailyInspectionCheckPayload[];
}

export interface DailyInspectionResult {
  id: string;
  inspectionId: string;
  checkId: string;
  checkType: DailyInspectionCheckType;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  valueImageUrl?: string | null;
  remark?: string | null;
  createdAt: number;
  updatedAt: number;
  check?: DailyInspectionCheck | null;
}

export interface DailyInspectionResultPayload {
  checkId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  valueImageUrl?: string | null;
  imageField?: string | null;
  remark?: string | null;
}

export interface DailyInspectionSignOffPayload {
  name: string;
  title?: string | null;
  acknowledged: boolean;
  signedAt: number;
  remark?: string | null;
}

export type DailyInspectionStatus = "PASS" | "FAIL";

export interface DailyInspection {
  id: string;
  formId: string;
  assetId: string;
  performedById: string;
  performedByName: string;
  performedAt: number;
  overallRemark?: string | null;
  status: DailyInspectionStatus;
  createdAt: number;
  updatedAt: number;
  form?: DailyInspectionForm | null;
  asset?: Asset | null;
  results?: DailyInspectionResult[];
  signOff?: DailyInspectionSignOffPayload | null;
  signOffName?: string | null;
  signOffTitle?: string | null;
  signOffAcknowledged?: boolean;
  signOffSignedAt?: number | null;
  signOffRemark?: string | null;
}

export interface DailyInspectionPayload {
  formId: string;
  assetId: string;
  overallRemark?: string | null;
  performedAt: number;
  signOff?: DailyInspectionSignOffPayload | null;
  results: DailyInspectionResultPayload[];
}

export interface PartInventoryTransaction {
  id: string;
  inventoryId: string;
  transactionType:
    | "ADJUSTMENT"
    | "RECEIPT"
    | "ISSUE"
    | "TRANSFER"
    | "RESERVATION";
  quantity: number;
  reference?: string | null;
  note?: string | null;
  performedById?: string | null;
  performedByName?: string | null;
  createdAt: number;
  inventory?: PartInventorySummary | null;
}

export interface CheckDraft {
  key: string;
  label: string;
  checkType?: { value: DailyInspectionCheckType; label: string };
  isRequired?: boolean;
  displayOrder: number;
  id?: string;
  failThreshold?: number | string | null;
}
export interface ServiceTaskSubtask {
  id?: string;
  taskId?: string;
  name: string;
  description?: string | null;
}
export interface ServiceTaskFormValues {
  name: string | undefined;
  description?: string | null;
  isActive: boolean;
  estimatedHours?: number;
  estimatedMinutes: number;
  subtasks: ServiceTaskSubtask[];
  parts: ServiceTaskPartFormEntry[];
}
export interface ServiceTaskPayload {
  name: string;
  description?: string | null;
  isActive: boolean;
  estimatedDurationMinutes?: number;
  subtasks: ServiceTaskSubtask[];
  parts: ServiceTaskPartFormEntry[];
}
export interface ServiceTaskPartFormEntry {
  id?: string;
  partId?: string;
  part?: Part | null;
  quantity: number;
}

export interface ServiceTask {
  id: string;
  name: string;
  description?: string | null;
  estimatedDurationMinutes: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  subtasks?: ServiceTask[];
  parts?: ServiceTaskPartFormEntry[];
}

export type ServiceProgramVehicleSelectionType =
  | "department"
  | "assetModel"
  | "assetModelYear"
  | "selectedVehicles";

export interface ServiceProgram {
  id: string;
  name: string;
  description?: string | null;
  status: "Draft" | "Active" | "Paused" | "Inactive";
  serviceTaskId: string;
  serviceTask?: ServiceTask | null;
  usageMeterId?: string | null;
  usageMeter?: Meter | null;
  usageThreshold?: number | null;
  timeThresholdValue?: number | null;
  timeThresholdUnit?: "hours" | "days" | "weeks" | "months" | null;
  vehicleSelectionType?: ServiceProgramVehicleSelectionType | null;
  departmentIds?: number[] | null;
  assetModelId?: string | null;
  assetModelYear?: number | null;
  assetIds?: string[] | null;
  createdAt: number;
  updatedAt: number;
}

export interface ServiceProgramFormValues {
  name: string;
  description?: string | null;
  status: "Draft" | "Active" | "Paused" | "Inactive";
  serviceTask: ServiceTask | null;
  usage: Meter | null;
  usageThreshold?: number | null;
  timeThresholdValue?: number | null;
  timeThresholdUnit?: "hours" | "days" | "weeks" | "months" | null;
  vehicleSelectionType: ServiceProgramVehicleSelectionType;
  departments: Department[];
  assetModel: AssetModel | null;
  assetYear: number | string | null;
  vehicles: Asset[];
}

export type WorkOrderStatus = "Open" | "InProgress" | "Completed" | "Cancelled";
export type WorkOrderPriority = "Low" | "Medium" | "High" | "Critical";
export type WorkOrderType =
  | "Corrective Maintenance"
  | "Preventive Maintenance"
  | "Inspection";
export type WorkOrderPartSource = "service-task" | "manual";
export type SlaTargetUnit = "hours" | "days";
export type WorkOrderLineItemStatus = "Pending" | "InProgress" | "Completed";

export interface WorkOrderLineItemPart {
  id: string;
  lineItemId: string;
  partId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  source: WorkOrderPartSource;
  part?: Part | null;
  warehouseId?: string | null;
  warehouse?: Warehouse | null;
  warehouseBinId?: number | null;
  warehouseBin?: WarehouseBin | null;
}

export interface WorkOrderLineItem {
  id: string;
  workOrderId: string;
  serviceTaskId: string;
  serviceTask?: ServiceTask | null;
  technicianId: string;
  technician?: User | null;
  laborMinutes: number;
  laborRate: number;
  laborTotal: number;
  partsTotal: number;
  lineTotal: number;
  notes?: string | null;
  status?: WorkOrderLineItemStatus | null;
  createdAt: number;
  updatedAt: number;
  parts: WorkOrderLineItemPart[];
}

export interface WorkOrder {
  id: string;
  displayId: string;
  code: string;
  title: string;
  reason?: string | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  type: WorkOrderType;
  assetId: string;
  asset?: Asset | null;
  siteId?: string | null;
  site?: Department | null;
  requestedById?: string | null;
  requestedBy?: User | null;
  dueDate?: number | null;
  expectedStartDate?: number | null;
  expectedEndDate?: number | null;
  slaTargetValue?: number | null;
  slaTargetUnit?: SlaTargetUnit | null;
  totalPartsAmount: number;
  totalLaborAmount: number;
  totalAmount: number;
  tax?: number | null;
  discount?: number | null;
  taxRate?: number | null;
  discountRate?: number | null;
  createdAt: number;
  updatedAt: number;
  lineItems: WorkOrderLineItem[];
}

export interface WorkOrderLineItemPartForm {
  partId: string;
  quantity: number;
  source: WorkOrderPartSource;
  part?: Part | null;
  warehouseId?: string | null;
  warehouse?: Warehouse | null;
  warehouseBinId?: number | null;
  warehouseBin?: WarehouseBin | null;
}

export interface WorkOrderLineItemForm {
  serviceTask: ServiceTask | null;
  technician: User | null;
  laborMinutes: number;
  notes?: string | null;
  parts: WorkOrderLineItemPartForm[];
  manualPart: Part | null;
  manualQuantity: number;
  id: string;
  status?: WorkOrderLineItemStatus | null;
}

export interface WorkOrderFormValues {
  title: string;
  reason?: string | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  asset: Asset | null;
  site: Department | null;
  dueDate?: string | null;
  expectedStartDate?: string | null;
  expectedEndDate?: string | null;
  slaTargetValue?: number | null;
  slaTargetUnit?: SlaTargetUnit | null;
  taxRate?: number | null;
  discountRate?: number | null;
  lineItems: WorkOrderLineItemForm[];
}

export interface CreateWorkOrderLineItemPartPayload {
  partId: string;
  quantity: number;
  source?: WorkOrderPartSource;
  warehouseId: string;
  warehouseBinId?: number | null;
}

export interface CreateWorkOrderLineItemPayload {
  id?: string;
  serviceTaskId: string;
  technicianId: string;
  laborMinutes: number;
  notes?: string | null;
  parts: CreateWorkOrderLineItemPartPayload[];
  status?: WorkOrderLineItemStatus | null;
}

export interface CreateWorkOrderPayload {
  title: string;
  reason?: string | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  assetId: string;
  siteId?: number | null;
  requestedById?: string | null;
  dueDate?: number | null;
  expectedStartDate?: number | null;
  expectedEndDate?: number | null;
  slaTargetValue?: number | null;
  slaTargetUnit?: SlaTargetUnit | null;
  tax?: number | null;
  discount?: number | null;
  lineItems: CreateWorkOrderLineItemPayload[];
}

export interface UpdateWorkOrderPayload
  extends Partial<CreateWorkOrderPayload> {
  status?: WorkOrderStatus;
}

export interface CompleteWorkOrderLineItemResponse {
  lineItem: WorkOrderLineItem;
  allCompleted: boolean;
}

export interface ClientAccount {
  id: string;
  companyName: string;
  domain: string;
  logoKey: string;
  logoUrl: string;
}

/** Client team (from GET /teams) */
export interface Team {
  id: string;
  name: string;
  clientId: string;
  createdAt: number;
  updatedAt: number;
  members?: TeamMemberEntry[];
  memberCount?: number;
}

export interface TeamMemberEntry {
  id: string;
  user: User;
  createdAt: number;
  groupIds: number[];
  isAdmin: boolean;
}

export interface CheckResponse {
  valueText: string;
  valueNumber: string;
  valueBoolean: boolean | null;
  valueImageUrl: string;
  imageFile: File | null;
  imagePreview: string | null;
  remark: string;
}

export interface SignOffState {
  name: string;
  title: string;
  signedAtLocal: string;
  acknowledged: boolean;
  remark: string;
}

export type LiveFeedSeverity = "CRITICAL" | "WARNING" | "INFO" | "SYSTEM";

export type LiveFeedMotorHealth = "NOMINAL" | "WARNING" | "CRITICAL";

export interface LiveFeedBattery {
  voltage: number;
  current: number;
  stateOfCharge: number;
  remainingMinutes: number;
}

export interface LiveFeedMotor {
  id: string;
  label: string;
  rpm: number;
  load: number;
  status: LiveFeedMotorHealth;
}

export interface LiveFeedTemperatureReading {
  id: string;
  label: string;
  value: number;
  limit: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
}

export interface LiveFeedGnss {
  status: string;
  signalStrength: number;
  satellites: number;
  hdop: number;
  correction: "RTK FIX" | "RTK FLOAT" | "SBAS" | "NONE";
}

export interface LiveFeedEnvelope {
  altitude: number;
  speed: number;
  pitch: number;
  roll: number;
  heading: number;
}

export interface LiveFeedPower {
  consumptionWatts: number;
  efficiency: number;
}

export interface LiveFeedEvent {
  id: string;
  occurredAt: number;
  severity: LiveFeedSeverity;
  summary: string;
  detail?: string;
}

export interface LiveFeedBatteryPoint {
  timestamp: number;
  stateOfCharge: number;
}

export interface LiveFeedBatteryTrendPoint {
  timestamp: number;
  voltage: number;
  current: number;
}

export interface LiveFeedPowerPoint {
  timestamp: number;
  watts: number;
}

export interface LiveFeedTemperaturePoint {
  timestamp: number;
  battery: number;
  esc: number;
  motor: number;
}

export interface LiveFeedRiskPoint {
  system: string;
  level: number;
}

export interface LiveFeedVibrationPoint {
  timestamp: number;
  magnitude: number;
}

export interface LiveFeedMaintenanceBacklogPoint {
  label: string;
  openTasks: number;
}

export interface LiveFeedSnapshot {
  timestamp: number;
  asset: {
    id: string;
    name: string;
    sessionId: string;
    mode: "Real-Time" | "Post-Flight";
  };
  status: {
    flightStatus: string;
    overallHealthScore: number;
    flightStartAt: number;
    flightTimeSeconds: number;
  };
  telemetry: {
    battery: LiveFeedBattery;
    motors: LiveFeedMotor[];
    temperatures: LiveFeedTemperatureReading[];
    gnss: LiveFeedGnss;
  };
  envelope: LiveFeedEnvelope;
  power: LiveFeedPower;
  events: LiveFeedEvent[];
  charts: {
    batteryState: LiveFeedBatteryPoint[];
    batteryTrends: LiveFeedBatteryTrendPoint[];
    powerConsumption: LiveFeedPowerPoint[];
    temperatureBands: LiveFeedTemperaturePoint[];
    motorLoad: LiveFeedMotor[];
    riskOutlook: LiveFeedRiskPoint[];
    vibration: LiveFeedVibrationPoint[];
    maintenanceBacklog: LiveFeedMaintenanceBacklogPoint[];
  };
}

export interface CreateEventReminderConfigDto {
  eventType: string;
  days: number;
  direction: { value: "before" | "after"; label: string };
  field: { value: string; label: string };
  recepientType: RecipientType;
  selectedUsers: User[];
}
export interface EventReminderConfigResponseDto {
  id: string;
  eventType: string;
  days: number;
  direction: "before" | "after";
  field: "startDate" | "endDate";
  recepientType: RecipientType;
  recipients: { user: User; role: string }[];
}

export type RecipientType =
  | "all_users_with_permission"
  | "selected_users"
  | "organization_owner"
  | "all_organization_owners";

export type VehicleJobStatus =
  | "Draft"
  | "Planned"
  | "InProgress"
  | "Executed"
  | "PostExecution"
  | "Completed"
  | "Cancelled";
export type VehicleJobPriority = "Low" | "Medium" | "High" | "Critical";
export type VehicleJobLineItemStatus =
  | "Pending"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export interface CustomerNote {
  id: string | undefined;
  note: string;
  createdAt?: number;
  createdBy?: { fname?: string; lname?: string };
}

export interface Customer {
  id: string;
  name: string;
  notes: CustomerNote[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  contacts: CustomerContact[];
  locations: CustomerLocation[];
}

export interface CustomerLocation {
  id: string | undefined;
  name: string;
  address: string | undefined;
  city: string | undefined;
  state: string | undefined;
  country: string | undefined;
  postalCode: string | undefined;
  location: Location;
}
export interface CreateCustomerLocation {
  id: string | undefined;
  name: string;
  address: string | undefined;
  city: string | undefined;
  state: string | undefined;
  country: string | undefined;
  postalCode: string | undefined;
}
export interface CustomerContact {
  id: string | undefined;
  firstName: string;
  lastName: string;
  email: string | undefined;
  phone: string | undefined;
  position: string | undefined;
  canLogin: boolean;
  password: string | undefined;
}

export interface VehicleJobTypeDocument {
  id: string;
  documentTypeId: number;
  documentCodeId: number;
  documentType: DocumentType;
  documentCode: DocumentCode;
}

export interface VehicleJobType {
  id: string;
  name: string;
  description: string | undefined;
  isActive: boolean;
  clientId: string;
  createdAt: string;
  updatedAt: string;

  jobTypeSkills: Skill[];
  jobTypeDocuments: VehicleJobTypeDocument[];
  workflowJobs: {
    id: string;
    workflowId: string;
    workflow: { id: string; name: string; description: string | null };
  }[];
}

export interface VehicleJobLineItem {
  id: string;
  vehicleJobId: string;
  assetId: string;
  asset?: Asset | null;
  pilotId: string | null;
  pilot?: User | null;
  description: string | null;
  plannedDate: number | null;
  startedAt: number | null;
  completedAt: number | null;
  flightDurationMinutes: number | null;
  hourlyRate: number;
  lineTotal: number;
  notes: string | null;
  status: VehicleJobLineItemStatus;
  waypoints: { lat: number; lng: number }[] | null;
  createdAt: number;
  updatedAt: number;
}

export interface VehicleJob {
  id: string;
  displayId: string;
  name: string;
  description: string | null;
  clientId: string;
  jobTypeId: string | null;
  jobType: VehicleJobType | null;
  customerId: string | null;
  customer: Customer | null;
  assetId: string | null;
  asset: Asset | null;
  locationId: string | null;
  location: Location | null;
  status: VehicleJobStatus;
  priority: VehicleJobPriority;
  startDate: number | null;
  endDate: number | null;
  dueDate: number | null;
  assignedPilotId: string | null;
  assignedPilot: User | null;
  totalAmount: number;
  tax: number;
  discount: number;
  notes: string | null;
  reasonForCancellation: string | null;
  lineItems: VehicleJobLineItem[];
  trips: Trip[];
  createdAt: number;
  updatedAt: number;
}

export interface TripLog {
  id: string;
  extension: string;
  filename: string;
  createdAt: number;
  state: string;
  modelId: string;
  model?: AssetModel | null;
}

export interface TripSummary {
  batteryMax: number;
  batteryMin: number;
  milesTravelled: number;
  maxSpeed: number;
  distanceFromHome: number;
  dropOffLocation: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  startLocation: {
    latitude: number | null;
    longitude: number | null;
  } | null;
}
export interface Competency {
  id?: number;
  name: string;
  description: string;
  competencyLevels: CompetencyLevel[];
  deleteCompetencyLevels?: number[];
}
export interface CompetencyLevel {
  id?: number | string;
  name: string;
  description: string;
  order: number;
}

export interface ListItem {
  id?: number | string;
  name: string;
  description?: string;
  isActive?: boolean;
}
export interface Training {
  id: number;
  title: string;
  description: string;
  competency: Competency;
  competencyLevel: CompetencyLevel;
  budget: number;
  trainingType: TrainingType;
  trainingMaterial?: string[];
}
export interface TrainingType {
  id: number;
  name: string;
  description: string;
}

export interface Trainer {
  id: string;
  fname: string;
  lname: string;
}
export interface StatusOption {
  id: string | number;
  name: string;
}
export interface TrainingInstance {
  id: string;
  evaluationType: {
    id: string;
    name: string;
  };
  training: {
    id: string;
    title: string;
    competency: Competency;
    competencyLevel: CompetencyLevel;
    trainingDocuments: {
      id: string;
      title: string;
    }[];
    trainingMaterial: string[];
  };
  trainingType: {
    id: string;
    name: string;
  };

  trainer: {
    id: string;
    fname: string;
    lname: string;
  };
  location: string;
  onlineMeetingLink: string;
  startDate: number;
  endDate: number;
  status: string;
  createdAt: string;
  createdBy: {
    id: string;
    fname: string;
    lname: string;
  };
  updatedAt: string;
  roster: Array<{
    id: string;
    trainingInstance: {
      id: string;
    };
    trainingUser: {
      id: string;
      fname: string;
      lname: string;
    };
    enrollmentDate: string;
    enrollmentStatus: string;
  }>;
  postEvaluationActions: Array<{
    id: string;
    trainingInstance: {
      id: string;
    };
    type: string;
    status: string;
    note: string;
    roster: {
      id: string;
      trainingUser: {
        id: string;
        fname: string;
        lname: string;
      };
    };
  }>;
  effectiveness: {
    id: string;
    result: string;
    notes: string;
    evidenceFiles: string[];
  };
}
export const PERSONNEL_TYPE_OPTIONS: StatusOption[] = [
  { id: "", name: "All Types" },
  { id: "Internal", name: "Internal" },
  { id: "External", name: "External" },
] as const;

export const STATUS_OPTIONS: StatusOption[] = [
  { id: "", name: "All Status" },
  { id: "Active", name: "Active" },
  { id: "Inactive", name: "Inactive" },
] as const;

export interface TrainingUser {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  address: string;
  trainingUserTypeName: string;
}
export enum TrainingStatus {
  CREATED = "CREATED",
  SCHEDULED = "SCHEDULED",
  PARTIALLY_EXECUTED = "PARTIALLY_EXECUTED",
  FULLY_EXECUTED = "FULLY_EXECUTED",
}

export interface AuditPersonnel {
  id: number | string;
  firstName: string;
  lastName: string;
  email?: string;
  employeeId?: string;
  isExternal?: boolean;
  isActive?: boolean;
  createdBy?: User;
  deleted?: boolean;
}

// API response structure that matches backend format
export interface AuditPersonnelResponse {
  id: number;
  fname: string;
  lname: string;
  email?: string;
  employeeId?: string;
  isExternal?: boolean;
  isActive?: boolean;
  createdBy?: User;
  deleted?: boolean;
}

export interface AuditRole {
  id: string;
  name: string;
  description?: string;
  createdBy?: User;
  createdAt?: number;
  updatedAt?: number;
}

export interface AuditTeamMember {
  id: string;
  auditPersonnel: AuditPersonnel;
  auditRole: AuditRole;
  assignedAt?: number;
  assignedBy?: User;
}

// API response structure that matches backend format
export interface AuditTeamMemberResponse {
  id: string;
  auditPersonnel: AuditPersonnelResponse;
  auditRole: AuditRole;
  assignedAt?: number;
  assignedBy?: User;
}

// Type alias for compatibility with existing code
export type TeamMember = AuditTeamMember;

export interface AuditActivityType extends ListItem {
  organizationUnit?: {
    id: number;
    name: string;
  };
}

export enum AuditProgramStatus {
  DRAFT = "DRAFT",
  PLANNED = "PLANNED",
  SCHEDULED = "SCHEDULED",
  CANCELLED = "CANCELLED_PLAN",
}

export enum AuditInstanceStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  ON_HOLD = "ON_HOLD",
}

export const AUDIT_INSTANCE_STATUS_OPTIONS: StatusOption[] = [
  { id: AuditInstanceStatus.SCHEDULED, name: "Scheduled" },
  { id: AuditInstanceStatus.IN_PROGRESS, name: "In Progress" },
  { id: AuditInstanceStatus.COMPLETED, name: "Completed" },
  { id: AuditInstanceStatus.CANCELLED, name: "Cancelled" },
  { id: AuditInstanceStatus.ON_HOLD, name: "On Hold" },
];

export interface AuditInstance {
  id: string;
  auditId?: string;
  auditProgram: AuditProgram;
  auditProgramId: string;
  auditDocumentId?: string;
  startDate?: number;
  endDate?: number;
  ChecklistDefinitions?: {
    id: string;
    title: string;
  }[];
  checklistDefinitionVersionId?: string;
  status: AuditInstanceStatus;
  scheduledBy: User;
  scheduledByUserId: string;
  location?: string;
  auditSummary?: string;
  createdAt: number;
  updatedAt: number;
  teamMembers?: AuditTeamMemberResponse[];
  auditCriteria?: AuditCriteriaDto;
  auditCriteriaId?: string;
  scope?: string;
  objective?: string;
}

export interface AuditInstanceResponse {
  id: string;
  auditId: string;
  auditProgram: {
    id: string;
    title: string;
    expectedDate: number;
    objective?: string;
    scope?: string;
    auditActivityType?: {
      id: string;
      name: string;
    };
    organizationUnits?: Array<{
      id: number;
      title: any;
      members?: Array<{
        id: number;
        role: string;
        user?: {
          id: string;
          fname: string;
          lname: string;
          email: string;
        };
      }>;
    }>;
  };
  auditDocumentId?: string;
  startDate?: number;
  endDate?: number;
  ChecklistDefinitions?: { id: string; title: string }[];
  status: AuditInstanceStatus;
  scheduledBy: {
    id: string;
    fname: string;
    lname: string;
  };
  location?: string;
  auditSummary?: string;
  createdAt: number;
  updatedAt: number;
  teamMembers?: AuditTeamMemberResponse[];
  auditChecklistResponses?: Array<{
    id: string;
    responseAnswer?: string;
    auditorObservation?: string;
    questionDefinition?: {
      id: string;
      questionText: string;
      orderIndex: number;
      sectionDefinition?: {
        id: string;
        title: string;
        orderIndex: number;
        checklistDefinition?: {
          id: string;
          title: string;
        };
      };
    };
    auditFindings?: Array<{
      id: string;
      title: string;
      description?: string;
      classification?: string;
      severity?: string;
      raisedNc: boolean;
      nonConformity?: {
        id: string;
        problemStatement?: string;
        dueDate?: number;
      };
      auditFindingEvidences?: Array<{
        id: string;
        description?: string;
        evidenceType?: string;
        documentId?: string;
        documentName?: string;
        fileName?: string;
      }>;
    }>;
  }>;
}
export interface ChecklistDefinition {
  id: number;
  title: string;
  description?: string;
  version: number;
  isDraft?: boolean;
  activityType: AuditActivityType;
  createdAt: number;
  updatedAt: number;
  createdBy: User;
  sectionsCount?: number;
  questionsCount?: number;
}

export interface ChecklistSectionDefinition {
  id: number;
  name: string;
  description?: string;
  orderIndex: number;
  checklistDefinitionId: number;
  checklistDefinition?: ChecklistDefinition;
  isActive?: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: User;
  questionsCount?: number;
}

export interface ChecklistQuestionDefinition {
  id: number;
  question: string;
  description?: string;
  orderIndex: number;
  sectionDefinitionId: number;
  sectionDefinition?: ChecklistSectionDefinition;
  isRequired: boolean;
  questionType: string;
  isActive?: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: User;
}

export interface AuditProgram {
  id: string;
  title: string;
  scope?: string;
  objective?: string;
  expectedDate: number;
  status: AuditProgramStatus;
  includeChildren?: boolean;
  organizationUnits?: {
    id: number;
    title: string;
  }[];
  auditActivityType: AuditActivityType;
  auditInstances?: AuditInstance[];
}

export enum AuditReportType {
  GENERATED = "GENERATED",
  UPLOADED = "UPLOADED",
}

export interface AuditReport {
  id: string;
  auditInstanceId: string;
  filePath: string;
  type: AuditReportType;
  title: string;
  description?: string;
  notes?: string;
  originalDate?: number;
  createdBy: {
    id: string;
    fname: string;
    lname: string;
  };
  createdAt: number;
  updatedAt: number;
}

export const AUDIT_STATUS_OPTIONS: StatusOption[] = [
  { id: "", name: "All Status" },
  { id: AuditProgramStatus.DRAFT, name: "Draft" },
  { id: AuditProgramStatus.PLANNED, name: "Planned" },
  { id: AuditProgramStatus.SCHEDULED, name: "Scheduled" },
  { id: AuditProgramStatus.CANCELLED, name: "Cancelled Plan" },
];

export enum AuditFindingClassification {
  NON_CONFORMITY = "NON_CONFORMITY",
  OBSERVATION = "OBSERVATION",
  OPPORTUNITY = "OPPORTUNITY_FOR_IMPROVEMENT",
}

export enum AuditFindingSeverity {
  MAJOR = "MAJOR",
  MINOR = "MINOR",
}
export interface AuditCriteriaDto {
  id: string;
  name: string;
  description: string;
}

export interface AuditCriteriaDto {
  id: string;
  name: string;
  description: string;
}

export interface AddAuditCriteriaDto {
  name: string;
  description?: string;
}

export const AUDIT_FINDING_CLASSIFICATION_OPTIONS: StatusOption[] = [
  { id: "", name: "All Classification" },
  { id: AuditFindingClassification.NON_CONFORMITY, name: "Non-Conformity" },
  { id: AuditFindingClassification.OBSERVATION, name: "Observation" },
  {
    id: AuditFindingClassification.OPPORTUNITY,
    name: "Opportunity for Improvement",
  },
];

export const AUDIT_FINDING_SEVERITY_OPTIONS: StatusOption[] = [
  { id: "", name: "All Severity" },
  { id: AuditFindingSeverity.MAJOR, name: "Major" },
  { id: AuditFindingSeverity.MINOR, name: "Minor" },
];

export enum AuditFindingEvidenceType {
  DOCUMENT = "DOCUMENT",
  AUDIT_EVIDENCE_FILE = "AUDIT_EVIDENCE_FILE",
}

export const AUDIT_FINDING_EVIDENCE_TYPE_OPTIONS: StatusOption[] = [
  { id: "", name: "All Type" },
  { id: AuditFindingEvidenceType.DOCUMENT, name: "Link Internal Document" },
  { id: AuditFindingEvidenceType.AUDIT_EVIDENCE_FILE, name: "Upload New File" },
];

export interface Evidence {
  description: string;
  evidenceType: string;
  documentId?: string;
  documentName?: string;
}

export interface Finding {
  title: string;
  description: string;
  classification: string;
  severity?: string | null;
  evidences?: Evidence[];
  files?: File[];
}

export interface AuditFindingDetailResponseDTO {
  id: string;
  title: string;
  description: string;
  classification: AuditFindingClassification;
  severity?: AuditFindingSeverity | null;
  linkedNcId?: string | null;
  ncName?: string | null;
  raisedNc: boolean;
  createdAt: number;
  auditTeamMember?: AuditTeamMemberResponse | null;
  auditChecklistResponse?: any;
  evidences?: {
    id?: string;
    description?: string;
    documentName?: string | null;
    evidenceType?: string;
    documentId?: string | null;
    fileName?: string | null;
  }[];
}

export interface AuditFindingResponseDTO {
  id: string;
  title: string;
  questionText: string | null;
  classification: AuditFindingClassification;
  severity: AuditFindingSeverity | null;
  numberOfEvidences: number;
  auditTeamMember: {
    id: string;
    fname: string | null;
    lname: string | null;
  } | null;
}

// Report Types
export type ReportCategory =
  | "maintenance"
  | "fleet"
  | "inventory"
  | "compliance"
  | "customer"
  | "operations"
  | "financial";

export interface ReportListItem {
  key: string;
  name: string;
  description: string;
  category: ReportCategory;
  subject: string;
}

export interface ReportColumnConfig {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "currency" | "percentage" | "boolean";
}

export interface ReportConfig {
  key: string;
  name: string;
  description: string;
  category: ReportCategory;
  subject: string;
  columns: ReportColumnConfig[];
}

export interface ReportQueryResult {
  key: string;
  name: string;
  description: string;
  category: ReportCategory;
  columns: ReportColumnConfig[];
  rows: Record<string, unknown>[];
  totalCount: number;
}

// Audit Report Data Interfaces
export interface AuditReportRecord {
  questionNumber: number;
  questionText: string;
  responseAnswer?: string;
  auditorObservation?: string;
  findings: string;
  findingClassification?: string;
  evidences: string;
  evidenceSourceType?: string;
}

export interface AuditReportNonConformity {
  question: string;
  findings: string;
  evidences: string;
  recommendations: string;
  ncr: string;
  dueDate: number;
}

export interface AuditReportChecklist {
  id: string;
  title: string;
  records: AuditReportRecord[];
  nonConformities: AuditReportNonConformity[];
}

export interface AuditReportData {
  // Header Section
  auditProgramTitle: string;
  auditProgramExpectedDate: number;
  auditInstanceId: string;
  auditId: string;
  auditInstanceStatus: AuditInstanceStatus;
  auditProgramOrgUnit: string;

  // Objective & Scope Section
  objective: string;
  scope: string;

  // Details Section
  startDate: number;
  endDate: number;
  startTime: number;
  auditType: string;
  processOwners: string;
  auditMembers: string;

  // Checklists & Findings Section
  checklists: AuditReportChecklist[];

  // Audit Summary Section
  auditSummary: string;
}

export interface OperationLocationDocument {
  id: string;
  operationLocationId: string;
  documentTypeId: number;
  documentCodeId: number | null;
  documentType: DocumentType;
  documentCode: DocumentCode | null;
}

export interface OperationLocation {
  id: string;
  country: string | null;
  state: string | null;
  city: string | null;
  isActive: boolean;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  requiredDocuments: OperationLocationDocument[];
}
