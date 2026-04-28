import { apiClient } from '@/lib/api/client';

export interface UserPlotSectorRef {
  id: string;
  name: string;
}

export interface UserPlotPlotRef {
  id: string;
  name: string;
  areaHectares: number;
  sector: UserPlotSectorRef;
}

/** Represents an active user–plot assignment. */
export interface UserPlotResponse {
  id: string;
  assignedAt: string;
  notes: string | null;
  plot: UserPlotPlotRef;
}

/** Payload for assigning plots to a user. `cooperativeId` is required by the guard. */
export interface AssignUserPlotsPayload {
  cooperativeId: string;
  plotIds: string[];
  notes?: string;
}

/** Payload for unassigning plots from a user. `cooperativeId` is required by the guard. */
export interface UnassignUserPlotsPayload {
  cooperativeId: string;
  plotIds: string[];
}

/** Lists active plot assignments for a user, scoped to a cooperative. */
export const listUserPlotsRequest = async (
  userId: string,
  cooperativeId: string,
): Promise<UserPlotResponse[]> => {
  const res = await apiClient.get<UserPlotResponse[]>(`/users/${userId}/plots`, {
    params: { cooperativeId },
  });
  return res.data;
};

/** Assigns plots to a user (idempotent — skips already-assigned plots). */
export const assignUserPlotsRequest = async (
  userId: string,
  payload: AssignUserPlotsPayload,
): Promise<UserPlotResponse[]> => {
  const res = await apiClient.post<UserPlotResponse[]>(`/users/${userId}/plots`, payload);
  return res.data;
};

/** Soft-unassigns plots from a user. */
export const unassignUserPlotsRequest = async (
  userId: string,
  payload: UnassignUserPlotsPayload,
): Promise<void> => {
  await apiClient.delete(`/users/${userId}/plots`, { data: payload });
};
