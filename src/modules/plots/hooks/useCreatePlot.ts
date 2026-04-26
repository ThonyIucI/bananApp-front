'use client';

import useRequest from '@/@common/hooks/useRequest';
import { toast } from 'react-toastify';
import {
  createPlotRequest,
  type CreatePlotPayload,
  type PlotResponse,
} from '../services/plot.service';

/** Creates a plot. Returns the result so the caller can optimistically update the list. */
export function useCreatePlot(): {
  loading: boolean;
  handler: (payload: CreatePlotPayload) => Promise<PlotResponse | null>;
} {
  const { loading, handler } = useRequest<PlotResponse, [CreatePlotPayload]>(
    false,
    async (payload) => {
      const result = await createPlotRequest(payload);
      toast.success(`Parcela "${result.name}" creada correctamente`);
      return result;
    },
  );

  return { loading, handler };
}
