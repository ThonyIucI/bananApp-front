'use client';

import useRequest from '@/@common/hooks/useRequest';
import { toast } from 'react-toastify';
import {
  updateSectorRequest,
  type UpdateSectorPayload,
} from '../services/sector.service';

export function useUpdateSector() {
  const { loading, handler } = useRequest(
    false,
    async (id: string, payload: UpdateSectorPayload) => {
      const { data } = await updateSectorRequest(id, payload);
      toast.success(`Sector "${data?.name?? ''}" actualizado`);
      return data;
    },
  );

  return { loading, handler };
}
