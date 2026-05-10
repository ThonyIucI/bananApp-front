'use client';

import useRequest from '@/@common/hooks/useRequest';
import { registerRequest } from '../services/auth.service';
import type { TRegisterPayload, TRegisterResponse } from '../types/auth.types';

export const useRegister = () => {
  const { loading, handler } = useRequest<TRegisterResponse, [TRegisterPayload]>(
    false,
    async (payload) => {
      const { data } = await registerRequest(payload);
      return data;
    },
  );

  return { loading, handler };
};
