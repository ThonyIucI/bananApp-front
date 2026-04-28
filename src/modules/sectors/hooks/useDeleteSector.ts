'use client';

import useRequest from '@/@common/hooks/useRequest';
import { toast } from 'react-toastify';
import { deleteSectorRequest } from '../services/sector.service';

export function useDeleteSector(): {
  loading: boolean;
  handler: (id: string) => Promise<null>;
} {
  const { loading, handler } = useRequest<null, [string]>(
    false,
    async (id) => {
      await deleteSectorRequest(id);
      toast.success('Sector eliminado');
      return null;
    },
  );

  return { loading, handler };
}
