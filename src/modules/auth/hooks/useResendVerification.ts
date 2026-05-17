'use client';

import { toast } from 'react-toastify';
import useRequest from '@/@common/hooks/useRequest';
import { resendVerificationRequest } from '../services/auth.service';

export const useResendVerification = () => {
  const { loading, handler } = useRequest<{ success: true }, [string]>(
    false,
    async (userId) => {
      const { data } = await resendVerificationRequest({ userId });
      toast.success('Código reenviado. Revisa tu bandeja de entrada.');
      return data;
    },
  );

  return { loading, handler };
};
