'use client';

import { toast } from 'react-toastify';
import useRequest from '@/@common/hooks/useRequest';
import { validateRegistrationCodeRequest } from '../services/auth.service';
import type { TValidateRegistrationCodePayload, TValidateRegistrationCodeResponse } from '../types/auth.types';

export const useValidateRegistrationCode = () => {
  const { loading, handler } = useRequest<TValidateRegistrationCodeResponse, [TValidateRegistrationCodePayload]>(
    false,
    async (payload) => {
      const { data } = await validateRegistrationCodeRequest(payload);
      toast.success(data.message);
      return data;
    },
  );

  return { loading, handler };
};
