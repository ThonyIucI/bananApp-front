import { apiClient } from '@/lib/api/client';

export interface SectorResponse {
  id: string;
  name: string;
  cooperativeId: string;
  createdAt: string;
}

export interface SectorPlotInput {
  name: string;
  ownerUserId: string;
  workerUserId?: string;
  areaHectares: number;
  cadastralCode?: string;
}

export interface CreateSectorPayload {
  name: string;
  plots?: SectorPlotInput[];
}

export interface UpdateSectorPayload {
  name: string;
}

/** Lists all sectors for a cooperative. */
export async function listSectorsRequest(cooperativeId: string): Promise<SectorResponse[]> {
  const res = await apiClient.get<SectorResponse[]>(`/cooperatives/${cooperativeId}/sectors`);
  return res.data;
}

/** Gets a single sector by id. */
export async function getSectorRequest(id: string): Promise<SectorResponse> {
  const res = await apiClient.get<SectorResponse>(`/sectors/${id}`);
  return res.data;
}

/** Creates a sector with optional initial plots. */
export async function createSectorRequest(
  cooperativeId: string,
  payload: CreateSectorPayload,
): Promise<SectorResponse> {
  const res = await apiClient.post<SectorResponse>(`/cooperatives/${cooperativeId}/sectors`, payload);
  return res.data;
}

/** Updates a sector's name. */
export const updateSectorRequest = (id: string, payload: UpdateSectorPayload) => 
  apiClient.patch<SectorResponse>(`/sectors/${id}`, payload);

/** Soft-deletes a sector by id. */
export async function deleteSectorRequest(id: string): Promise<void> {
  await apiClient.delete(`/sectors/${id}`);
}
