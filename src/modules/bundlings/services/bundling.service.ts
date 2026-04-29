import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/@common/types/api.types';

export interface BundlingPlotRef {
  id: string;
  name: string;
}

export interface BundlingSubPlotRef {
  id: string;
  name: string;
}

export interface BundlingUserRef {
  id: string;
  fullName: string;
}

export interface BundlingRibbonCalendarRef {
  id: string;
  year: number;
}

export interface BundlingResponse {
  id: string;
  quantity: number;
  bundledAt: string;
  ribbonColorFree: string | null;
  ribbonCalendar: BundlingRibbonCalendarRef | null;
  notes: string | null;
  localUuid: string;
  syncedAt: string | null;
  createdAt: string;
  plot: BundlingPlotRef;
  subPlot: BundlingSubPlotRef | null;
  enfundadorUser: BundlingUserRef;
}

/** Type guard — true when createBundlingRequest returns an array (multi mode). */
export const isBundlingArray = (
  res: BundlingResponse | BundlingResponse[],
): res is BundlingResponse[] => Array.isArray(res);

export interface BundlingFilters {
  cooperativeId?: string;
  plotId?: string;
  plotIds?: string[];
  subPlotId?: string;
  enfundadorUserId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface SubPlotEntryPayload {
  subPlotId: string;
  enfundadorUserId: string;
  quantity: number;
  localUuid: string;
  ribbonColorFree?: string;
  ribbonCalendarId?: string;
  notes?: string;
}

export interface CreateBundlingPayload {
  cooperativeId?: string;
  plotId: string;
  bundledAt: string;
  // Single mode fields (omitted when subPlotEntries is provided):
  subPlotId?: string;
  enfundadorUserId?: string;
  quantity?: number;
  localUuid?: string;
  ribbonColorFree?: string;
  ribbonCalendarId?: string;
  notes?: string;
  // Multi mode:
  subPlotEntries?: SubPlotEntryPayload[];
}

export interface UpdateBundlingPayload {
  subPlotId?: string | null;
  quantity?: number;
  bundledAt?: string;
  ribbonCalendarId?: string | null;
  ribbonColorFree?: string | null;
  notes?: string | null;
}

export interface BundlingSubPlotSummaryItem {
  subPlotId: string;
  subPlotName: string;
  totalQuantity: number;
  totalRecords: number;
}

export interface BundlingPlotSummaryItem {
  plotId: string;
  plotName: string;
  totalQuantity: number;
  totalRecords: number;
  bySubPlot: BundlingSubPlotSummaryItem[];
}

export interface BundlingSummaryResponse {
  totalQuantity: number;
  totalRecords: number;
  byPlot: BundlingPlotSummaryItem[];
}

export interface StatsMonthEntry {
  month: string;
  label: string;
  totalQuantity: number;
  totalRecords: number;
  activeEnfundadores: number;
}

export interface StatsMonthlyResponse {
  months: StatsMonthEntry[];
}

export interface StatsWeekEntry {
  week: string;
  label: string;
  startDate: string;
  endDate: string;
  totalQuantity: number;
  totalRecords: number;
}

export interface StatsWeeklyResponse {
  weeks: StatsWeekEntry[];
}

export interface StatsPeriodKpi {
  totalQuantity: number;
  totalRecords: number;
  deltaPctVsLastPeriod: number | null;
}

export interface StatsLast30DaysKpi {
  totalQuantity: number;
  totalRecords: number;
  activeEnfundadores: number;
  activePlots: number;
}

export interface StatsTopEnfundador {
  userId: string;
  fullName: string;
  totalQuantity: number;
}

export interface StatsTopPlot {
  plotId: string;
  plotName: string;
  totalQuantity: number;
}

export interface StatsRibbonColor {
  color: string;
  totalQuantity: number;
}

export interface StatsOverviewResponse {
  thisWeek: StatsPeriodKpi;
  thisMonth: StatsPeriodKpi;
  last30Days: StatsLast30DaysKpi;
  topEnfundadores: StatsTopEnfundador[];
  topPlots: StatsTopPlot[];
  ribbonColorDistribution: StatsRibbonColor[];
}

/** Lists bundlings with optional filters. */
export const listBundlingsRequest = async (
  filters?: BundlingFilters,
): Promise<PaginatedResponse<BundlingResponse>> => {
  const res = await apiClient.get<PaginatedResponse<BundlingResponse>>('/bundlings', {
    params: filters,
  });
  return res.data;
};

/**
 * Creates one or multiple bundling records.
 * - Without subPlotEntries → single mode → returns BundlingResponse
 * - With subPlotEntries → multi mode → returns BundlingResponse[]
 */
export const createBundlingRequest = (payload: CreateBundlingPayload) => 
  apiClient.post<BundlingResponse>('/bundlings', payload);

/** Updates a bundling record. `cooperativeId` is sent as a query param for the guard. */
export const updateBundlingRequest = async (
  id: string,
  payload: UpdateBundlingPayload,
  cooperativeId?: string,
): Promise<BundlingResponse> => {
  const res = await apiClient.patch<BundlingResponse>(`/bundlings/${id}`, payload, {
    params: cooperativeId ? { cooperativeId } : undefined,
  });
  return res.data;
};

/** Soft-deletes a bundling record. `cooperativeId` is sent as a query param for the guard. */
export const deleteBundlingRequest = async (id: string, cooperativeId?: string): Promise<void> => {
  await apiClient.delete(`/bundlings/${id}`, {
    params: cooperativeId ? { cooperativeId } : undefined,
  });
};

/** Returns aggregated totals per plot and sub-plot for the cooperative. */
export const bundlingSummaryRequest = async (
  cooperativeId: string,
): Promise<BundlingSummaryResponse> => {
  const res = await apiClient.get<BundlingSummaryResponse>('/bundlings/summary', {
    params: { cooperativeId },
  });
  return res.data;
};

/** Monthly stats for the last N months. */
export const statsMonthlyRequest = async (
  cooperativeId: string,
  months = 12,
): Promise<StatsMonthlyResponse> => {
  const res = await apiClient.get<StatsMonthlyResponse>('/bundlings/stats/monthly', {
    params: { cooperativeId, months },
  });
  return res.data;
};

/** Weekly stats for the last N weeks, optionally filtered by enfundador. */
export const statsWeeklyRequest = async (
  cooperativeId: string,
  weeks = 8,
  enfundadorUserId?: string,
): Promise<StatsWeeklyResponse> => {
  const res = await apiClient.get<StatsWeeklyResponse>('/bundlings/stats/weekly', {
    params: { cooperativeId, weeks, enfundadorUserId },
  });
  return res.data;
};

/** Overview KPIs for the dashboard cards. */
export const statsOverviewRequest = async (
  cooperativeId: string,
): Promise<StatsOverviewResponse> => {
  const res = await apiClient.get<StatsOverviewResponse>('/bundlings/stats/overview', {
    params: { cooperativeId },
  });
  return res.data;
};
