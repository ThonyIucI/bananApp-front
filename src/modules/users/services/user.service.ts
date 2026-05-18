import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/@common/types/api.types';

export enum EGaiaPlan {
  FREE = 'free',
  PRO = 'pro',
  PROMAX = 'promax',
}

export type TGaiaPlan = `${EGaiaPlan}`;

export const GAIA_PLAN_LABELS: Record<TGaiaPlan, string> = {
  [EGaiaPlan.FREE]: 'Gratuito',
  [EGaiaPlan.PRO]: 'Pro',
  [EGaiaPlan.PROMAX]: 'Pro Max',
};

export type TRoleKey = `${ERoles}`;

export enum ERoles {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MEMBER = 'member',
  BAGGER = 'bagger',
  HARVEST_CHIEF = 'harvest_chief',
  CALIBRATOR = 'calibrator',
}
export const ROLE_KEYS: TRoleKey[] = [
  'superadmin',
  'admin',
  'member',
  'bagger',
  'harvest_chief',
  'calibrator',
];

export const ROLE_LABELS: Record<TRoleKey, string> = {
  superadmin: 'Superadmin',
  admin: 'Administrador',
  member: 'Socio',
  bagger: 'Enfundador',
  harvest_chief: 'Jefe de cosecha',
  calibrator: 'Calibrador',
};

export interface UserCooperativeSummary {
  cooperativeId: string;
  cooperativeName: string;
  memberCode: string | null;
  roles: string[];
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  dni: string | null;
  isActive: boolean;
  isSuperadmin: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  cooperatives: UserCooperativeSummary[];
  subscriptionTier: TGaiaPlan;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dni?: string;
  mustChangePassword?: boolean;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  dni?: string;
  isActive?: boolean;
  password?: string;
  mustChangePassword?: boolean;
  subscriptionTier?: TGaiaPlan;
}

export interface AssignCooperativePayload {
  cooperativeId: string;
  roleKey: ERoles;
  memberCode?: string;
}

export async function listUsersRequest(): Promise<PaginatedResponse<UserResponse>> {
  const res = await apiClient.get<PaginatedResponse<UserResponse>>('/users');
  return res.data;
}

export async function createUserRequest(payload: CreateUserPayload): Promise<UserResponse> {
  const res = await apiClient.post<UserResponse>('/users', payload);
  return res.data;
}

export async function updateUserRequest(id: string, payload: UpdateUserPayload): Promise<UserResponse> {
  const res = await apiClient.patch<UserResponse>(`/users/${id}`, payload);
  return res.data;
}

/** Soft-deletes a user by id. */
export async function deleteUserRequest(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

export async function assignUserCooperativeRequest(
  userId: string,
  payload: AssignCooperativePayload,
): Promise<void> {
  await apiClient.post(`/users/${userId}/cooperatives`, payload);
}
