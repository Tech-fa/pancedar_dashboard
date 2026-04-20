import type { User } from "../users/user.interface";

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
