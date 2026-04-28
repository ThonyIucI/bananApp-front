import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/@common/types/api.types';

export interface CooperativeResponse {
  id: string;
  name: string;
  ruc: string;
  address: string | null;
  department: string | null;
  province: string | null;
  district: string | null;
  createdAt: string;
}

export interface SectorResponse {
  id: string;
  name: string;
  cooperativeId: string;
}

export interface CreateCooperativePayload {
  name: string;
  ruc: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  sectors?: string[];
}

export async function listCooperativesRequest(): Promise<PaginatedResponse<CooperativeResponse>> {
  const res = await apiClient.get<PaginatedResponse<CooperativeResponse>>('/cooperatives');
  return res.data;
}

export async function getCooperativeRequest(id: string): Promise<CooperativeResponse> {
  const res = await apiClient.get<CooperativeResponse>(`/cooperatives/${id}`);
  return res.data;
}

export interface UpdateCooperativePayload {
  name?: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  isActive?: boolean;
}

export async function createCooperativeRequest(
  payload: CreateCooperativePayload,
): Promise<CooperativeResponse> {
  const res = await apiClient.post<CooperativeResponse>('/cooperatives', payload);
  return res.data;
}

export async function updateCooperativeRequest(
  id: string,
  payload: UpdateCooperativePayload,
): Promise<CooperativeResponse> {
  const res = await apiClient.patch<CooperativeResponse>(`/cooperatives/${id}`, payload);
  return res.data;
}

/** Soft-deletes a cooperative by id. */
export async function deleteCooperativeRequest(id: string): Promise<void> {
  await apiClient.delete(`/cooperatives/${id}`);
}

export async function listSectorsRequest(cooperativeId: string): Promise<SectorResponse[]> {
  const res = await apiClient.get<SectorResponse[]>(`/cooperatives/${cooperativeId}/sectors`);
  return res.data;
}
