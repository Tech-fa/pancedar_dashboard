import { apiDelete, apiGet } from "@/util/api";
import type { AuthStore, Skill, User } from "@/util/interfaces";

export const browsePilots = (
  authStore: AuthStore,
  filters: { search?: string; status?: string } = {},
) => {
  return apiGet<User[]>("/users", authStore, { ...filters, userType: "pilot" });
};

export const getPilotById = (pilotId: string, authStore: AuthStore) => {
  return apiGet<User>(`/users/${pilotId}`, authStore);
};

export const deletePilot = (pilotId: string, authStore: AuthStore) => {
  return apiDelete(`/users/${pilotId}`, authStore);
};

export const getSkills = (authStore: AuthStore) => {
  return apiGet<Skill[]>("/skills", authStore);
};
