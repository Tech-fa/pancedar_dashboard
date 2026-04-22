import type { User } from "../users/user.interface";

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  createdAt: number;
  updatedAt: number;
  memberCount?: number;
}

export interface TeamMember {
  id: string;
  team: Team;
  user: User;
  groupIds: number[];
  createdAt: number;
}
