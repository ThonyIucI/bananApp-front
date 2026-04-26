'use client';

import useRequest from '@/@common/hooks/useRequest';
import { toast } from 'react-toastify';
import { deletePlotRequest } from '../services/plot.service';

/** Soft-deletes a plot. */
export function useDeletePlot(): {
  loading: boolean;
  handler: (id: string) => Promise<null>;
} {
  const { loading, handler } = useRequest<null, [string]>(
    false,
    async (id) => {
      await deletePlotRequest(id);
      toast.success('Parcela eliminada');
      return null;
    },
  );

  return { loading, handler };
}
