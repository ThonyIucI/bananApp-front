'use client';

import useRequest from '@/@common/hooks/useRequest';
import { toast } from 'react-toastify';
import {
  createSectorRequest,
  type CreateSectorPayload,
  type SectorResponse,
} from '../services/sector.service';

export function useCreateSector(): {
  loading: boolean;
  handler: (cooperativeId: string, payload: CreateSectorPayload) => Promise<SectorResponse | null>;
} {
  const { loading, handler } = useRequest<SectorResponse, [string, CreateSectorPayload]>(
    false,
    async (cooperativeId, payload) => {
      const result = await createSectorRequest(cooperativeId, payload);
      toast.success(`Sector "${result.name}" creado correctamente`);
      return result;
    },
  );

  return { loading, handler };
}
