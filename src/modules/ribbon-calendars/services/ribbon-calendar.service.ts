import { apiClient } from '@/lib/api/client';
import type { RibbonColor } from '@/@common/constants/ribbon-colors';

export interface WeekEntry {
  week: number;
  color: RibbonColor;
}

export interface RibbonCalendarResponse {
  id: string;
  year: number;
  startColorIndex: number;
  weeks: WeekEntry[];
}

export interface CurrentWeekResponse {
  week: number;
  year: number;
  color: RibbonColor;
}

export async function getCurrentWeekRequest(
  cooperativeId: string,
): Promise<CurrentWeekResponse> {
  const res = await apiClient.get<CurrentWeekResponse>(
    `/cooperatives/${cooperativeId}/ribbon-calendar/current-week`,
  );
  return res.data;
}

export async function getRibbonCalendarRequest(
  cooperativeId: string,
  year: number,
): Promise<RibbonCalendarResponse> {
  const res = await apiClient.get<RibbonCalendarResponse>(
    `/cooperatives/${cooperativeId}/ribbon-calendar/${year}`,
  );
  return res.data;
}

export async function createRibbonCalendarRequest(
  cooperativeId: string,
  year: number,
  startColorIndex = 0,
): Promise<RibbonCalendarResponse> {
  const res = await apiClient.post<RibbonCalendarResponse>(
    `/cooperatives/${cooperativeId}/ribbon-calendar`,
    { year, startColorIndex },
  );
  return res.data;
}

export async function updateRibbonCalendarRequest(
  cooperativeId: string,
  year: number,
  startColorIndex: number,
): Promise<RibbonCalendarResponse> {
  const res = await apiClient.patch<RibbonCalendarResponse>(
    `/cooperatives/${cooperativeId}/ribbon-calendar/${year}`,
    { startColorIndex },
  );
  return res.data;
}
