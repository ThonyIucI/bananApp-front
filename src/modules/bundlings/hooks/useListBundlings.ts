'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  listBundlingsRequest,
  type BundlingFilters,
  type BundlingResponse,
} from '../services/bundling.service';
import type { PaginatedResponse } from '@/@common/types/api.types';

/**
 * List bundlings with optional filters.
 * Call handler() in component useEffect.
 * onUpsert / onRemove for immediate optimistic updates.
 */
export const useListBundlings = () => {
  const { loading, data, handler, setData } = useRequest(
    false,
    async (filters?: BundlingFilters) => listBundlingsRequest(filters),
  );

  const onUpsert = (item: BundlingResponse) => {
    setData((prev: PaginatedResponse<BundlingResponse> | null) => {
      if (!prev) return { items: [item], total: 1, limit: 50, offset: 0 };
      const idx = prev.items.findIndex((x) => x.id === item.id);
      const items = idx >= 0
        ? prev.items.map((x) => (x.id === item.id ? item : x))
        : [item, ...prev.items];
      return { ...prev, items, total: idx >= 0 ? prev.total : prev.total + 1 };
    });
  };

  const onRemove = (id: string) => {
    setData((prev: PaginatedResponse<BundlingResponse> | null) => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter((x) => x.id !== id), total: prev.total - 1 };
    });
  };

  return { loading, data, handler, onUpsert, onRemove };
};
