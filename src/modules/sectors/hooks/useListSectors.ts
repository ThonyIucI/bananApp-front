'use client';

import useRequest from '@/@common/hooks/useRequest';
import { listSectorsRequest, type SectorResponse } from '../services/sector.service';

/**
 * List sectors for a cooperative.
 * Call handler() in component useEffect.
 * onUpsert / onRemove for immediate optimistic updates.
 */
export const useListSectors = () => {
  const { loading, data, handler, setData } = useRequest(
    false,
    async (cooperativeId: string) => listSectorsRequest(cooperativeId),
  );

  const onUpsert = (item: SectorResponse) => {
    setData((prev) => {
      if (!prev) return [item];
      const idx = prev.findIndex((x) => x.id === item.id);
      return idx >= 0 ? prev.map((x) => (x.id === item.id ? item : x)) : [item, ...prev];
    });
  };

  const onRemove = (id: string) => {
    setData((prev) => prev?.filter((x) => x.id !== id) ?? []);
  };

  return { loading, data, handler, onUpsert, onRemove };
};
