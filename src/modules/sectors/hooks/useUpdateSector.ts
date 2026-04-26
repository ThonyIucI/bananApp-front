'use client';

import useRequest from '@/@common/hooks/useRequest';
import { toast } from 'react-toastify';
import {
  updateSectorRequest,
  type UpdateSectorPayload,
  type SectorResponse,
} from '../services/sector.service';

/** Updates a sector's name. Toasts on success. */
export function useUpdateSector(): {
  loading: boolean;
  handler: (id: string, payload: UpdateSectorPayload) => Promise<SectorResponse | null>;
} {
  const { loading, handler } = useRequest<SectorResponse, [string, UpdateSectorPayload]>(
    false,
    async (id, payload) => {
      const result = await updateSectorRequest(id, payload);
      toast.success(`Sector "${result.name}" actualizado`);
      return result;
    },
  );

  return { loading, handler };
}
