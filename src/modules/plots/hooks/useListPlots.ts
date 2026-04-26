'use client';

import useRequest from '@/@common/hooks/useRequest';
import { listPlotsRequest, type PlotFilters, type PlotResponse } from '../services/plot.service';
import type { PaginatedResponse } from '@/@common/types/api.types';

/**
 * List plots with optional filters.
 * Call handler() in component useEffect.
 * onUpsert / onRemove for immediate optimistic updates.
 */
export const useListPlots = () => {
  const { loading, data, handler, setData } = useRequest(
    false,
    async (filters?: PlotFilters) => listPlotsRequest(filters),
  );

  const onUpsert = (item: PlotResponse) => {
    setData((prev: PaginatedResponse<PlotResponse> | null) => {
      if (!prev) return { items: [item], total: 1, limit: 100, offset: 0 };
      const idx = prev.items.findIndex((x) => x.id === item.id);
      const items = idx >= 0
        ? prev.items.map((x) => (x.id === item.id ? item : x))
        : [item, ...prev.items];
      return { ...prev, items, total: idx >= 0 ? prev.total : prev.total + 1 };
    });
  };

  const onRemove = (id: string) => {
    setData((prev: PaginatedResponse<PlotResponse> | null) => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter((x) => x.id !== id), total: prev.total - 1 };
    });
  };

  return { loading, data, handler, onUpsert, onRemove };
};
