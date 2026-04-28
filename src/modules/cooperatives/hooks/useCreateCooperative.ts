'use client';

import useRequest from '@/@common/hooks/useRequest';
import {
  createCooperativeRequest,
  type CooperativeResponse,
  type CreateCooperativePayload,
} from '../services/cooperative.service';
import { toast } from 'react-toastify';

export function useCreateCooperative() {
  const { loading, data, handler } = useRequest<CooperativeResponse, [CreateCooperativePayload]>(
    false,
    async (payload) => {
      const result = await createCooperativeRequest(payload);
      toast.success(`Cooperativa "${result.name}" creada correctamente`);
      return result;
    },
  );

  return { loading, data, handler };
}
