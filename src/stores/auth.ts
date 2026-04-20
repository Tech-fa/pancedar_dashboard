// stores/auth.ts
import { getRootUnits, parseJwt } from "@/util/util";
import { defineStore } from "pinia";
import { ref } from "vue";
export interface UserDetails {
  permissions: Permission[];
  companyName: string;
  id: string;
}
interface Permission {
  subject: string;
  action: string;
}
export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  userDetails: UserDetails;
  expiryDate: number;
  teamId: string | null;
}
export interface PermissionTree {
  subject: string;
  actions: string[];
  submodules?: PermissionTree[];
  label: string;
}
export const useAuthStore = defineStore("auth", () => {
  const initialAuth = JSON.parse(localStorage.getItem("auth") || "{}");
  const initialPermissions = JSON.parse(
    localStorage.getItem("permissions") || "{}",
  );

  const permissions = ref<{ [key: string]: PermissionTree }>(
    initialPermissions,
  );

  const state = ref<AuthState>({
    isLoggedIn: initialAuth.isLoggedIn || false,
    token: initialAuth.token || null,
    userDetails: initialAuth.userDetails || {},
    expiryDate: initialAuth.expiryDate || 0,
    teamId: initialAuth.teamId || null,
  });
  function setLoginState(token: string, userDetails: UserDetails) {
    const expiryDate = parseJwt(token).exp;
    const teamId = parseJwt(token).teamId;
    state.value.token = token;
    state.value.isLoggedIn = true;
    state.value.userDetails = userDetails;
    state.value.expiryDate = expiryDate;
    state.value.teamId = teamId;
    localStorage.setItem(
      "auth",
      JSON.stringify({
        token,
        isLoggedIn: true,
        userDetails,
        expiryDate,
        teamId,
      }),
    );
  }
  function renewToken(token: string, userDetails: UserDetails) {
    const expiryDate = parseJwt(token).exp;
    const teamId = parseJwt(token).teamId;
    state.value = { ...state.value, token, expiryDate, userDetails };
    localStorage.setItem(
      "auth",
      JSON.stringify({
        token,
        isLoggedIn: true,
        userDetails,
        expiryDate,
        teamId,
      }),
    );
  }
  function logout() {
    state.value.token = null;
    state.value.isLoggedIn = false;
    state.value.userDetails = {} as UserDetails;
    state.value.expiryDate = 0;
    state.value.teamId = null;
    localStorage.removeItem("auth");
    localStorage.removeItem("client");
    localStorage.removeItem("permissions");
  }

  function hasPermissions({
    subject,
    actions,
  }: {
    subject: string;
    actions: string[];
  }) {
    if (!subject || !actions) {
      return false;
    }
    const userPermissions = state.value.userDetails.permissions;

    if (!Object.values(permissions.value).find((p) => p.subject === subject)) {
      return false;
    }

    const userHasPermission = userPermissions?.find((permission) => {
      return (
        (permission.subject === subject ||
          permission.subject === "all" ||
          Object.values(permissions.value)
            .find((p) => p.subject === permission.subject)
            ?.submodules?.some((submodule) => submodule.subject == subject)) &&
        (actions.includes(permission.action) || permission.action === "manage")
      );
    });
    return !!userHasPermission;
  }
  function setPermissionTree(permissionTree: {
    [key: string]: PermissionTree;
  }) {
    permissions.value = permissionTree;
    localStorage.setItem("permissions", JSON.stringify(permissionTree));
  }
  return {
    state,
    setLoginState,
    logout,
    hasPermissions,
    renewToken,
    setPermissionTree,
    permissions,
  };
});
