'use client';

import useRequest from '@/@common/hooks/useRequest';
import { toast } from 'react-toastify';
import {
  updatePlotRequest,
  type UpdatePlotPayload,
  type PlotResponse,
} from '../services/plot.service';

/** Updates a plot. Returns the updated result for optimistic list sync. */
export function useUpdatePlot(): {
  loading: boolean;
  handler: (id: string, payload: UpdatePlotPayload) => Promise<PlotResponse | null>;
} {
  const { loading, handler } = useRequest<PlotResponse, [string, UpdatePlotPayload]>(
    false,
    async (id, payload) => {
      const result = await updatePlotRequest(id, payload);
      toast.success(`Parcela "${result.name}" actualizada`);
      return result;
    },
  );

  return { loading, handler };
}
