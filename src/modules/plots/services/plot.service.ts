import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/@common/types/api.types';

export interface SubPlotResponse {
  id: string;
  name: string;
  areaHectares: number;
  responsibleUserId?: string;
  responsibleUser?: { id: string; fullName: string } | null;
}

export interface PlotSectorResponse {
  id: string;
  name: string;
  cooperative: { id: string; name: string };
}

export interface PlotUserResponse {
  id: string;
  fullName: string;
  email: string;
}

export interface PlotResponse {
  id: string;
  name: string;
  areaHectares: number;
  cadastralCode: string | null;
  /** Available when loaded from the list endpoint. */
  subPlotsQuantity?: number;
  /** Available when loaded from the detail endpoint. */
  subPlots?: SubPlotResponse[];
  sector: PlotSectorResponse;
  ownerUser: PlotUserResponse;
  workerUser: PlotUserResponse | null;
  createdAt: string;
}

export interface PlotFilters {
  cooperativeId?: string;
  sectorId?: string;
  ownerUserId?: string;
  workerUserId?: string;
  limit?: number;
  offset?: number;
}

export interface SubPlotPayload {
  id?: string;
  name: string;
  areaHectares: number;
  responsibleUserId?: string;
}

export interface CreatePlotPayload {
  name: string;
  sectorId?: string;
  ownerUserId: string;
  workerUserId?: string;
  areaHectares: number;
  cadastralCode?: string;
  subPlots?: SubPlotPayload[];
}

export interface UpdatePlotPayload {
  name?: string;
  sectorId?: string;
  ownerUserId?: string;
  workerUserId?: string | null;
  areaHectares?: number;
  cadastralCode?: string | null;
  subPlots?: SubPlotPayload[];
}

/** Lists plots with optional filters. */
export async function listPlotsRequest(
  filters?: PlotFilters,
): Promise<PaginatedResponse<PlotResponse>> {
  const res = await apiClient.get<PaginatedResponse<PlotResponse>>('/plots', {
    params: filters,
  });
  return res.data;
}

/** Gets a single plot by id. */
export async function getPlotRequest(id: string): Promise<PlotResponse> {
  const res = await apiClient.get<PlotResponse>(`/plots/${id}`);
  return res.data;
}

/** Creates a plot. */
export async function createPlotRequest(payload: CreatePlotPayload): Promise<PlotResponse> {
  const res = await apiClient.post<PlotResponse>('/plots', payload);
  return res.data;
}

/** Updates a plot. */
export async function updatePlotRequest(
  id: string,
  payload: UpdatePlotPayload,
): Promise<PlotResponse> {
  const res = await apiClient.patch<PlotResponse>(`/plots/${id}`, payload);
  return res.data;
}

/** Soft-deletes a plot by id. */
export async function deletePlotRequest(id: string): Promise<void> {
  await apiClient.delete(`/plots/${id}`);
}

export interface CreateSubPlotPayload {
  name: string;
  areaHectares: number;
  responsibleUserId?: string;
}

export interface UpdateSubPlotPayload {
  name?: string;
  areaHectares?: number;
  responsibleUserId?: string | null;
}

/** Creates an internal subPlot (lote interno) for a plot. */
export async function createSubPlotRequest(
  plotId: string,
  payload: CreateSubPlotPayload,
): Promise<SubPlotResponse> {
  const res = await apiClient.post<SubPlotResponse>(`/plots/${plotId}/sub-plots`, payload);
  return res.data;
}

/** Updates an internal subPlot by id. */
export async function updateSubPlotRequest(
  id: string,
  payload: UpdateSubPlotPayload,
): Promise<SubPlotResponse> {
  const res = await apiClient.patch<SubPlotResponse>(`/sub-plots/${id}`, payload);
  return res.data;
}

/** Soft-deletes an internal subPlot by id. */
export async function deleteSubPlotRequest(id: string): Promise<void> {
  await apiClient.delete(`/sub-plots/${id}`);
}
