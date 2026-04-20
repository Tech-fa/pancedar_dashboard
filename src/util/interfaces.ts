import type { PermissionTree, UserDetails } from "@/stores/auth";

export interface TableEntity {
  id: number | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalCount: number;
  perPage: number;
}
export interface AuthStore {
  state: {
    token: string | null;
    expiryDate: number;
    teamId: string | null;
  };
  setLoginState: (token: string, userDetails: UserDetails) => void;
  logout: () => void;
  hasPermissions: ({
    subject,
    actions,
  }: {
    subject: string;
    actions: string[];
  }) => boolean;
  renewToken: (token: string, userDetails: UserDetails) => void;
  setPermissionTree: (permissionTree: {
    [key: string]: PermissionTree;
  }) => void;
  permissions: { [key: string]: PermissionTree };
}
