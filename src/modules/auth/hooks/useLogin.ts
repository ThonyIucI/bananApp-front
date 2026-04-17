'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { loginRequest } from '../services/auth.service';
import type { LoginFormValues } from '../schemas/login.schema';
import { useAuthContext } from '../context/auth.context';
import { ApiError } from '@/lib/api/client';

export function useLogin() {
  const router = useRouter();
  const { setSession } = useAuthContext();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const login = (values: LoginFormValues) => {
    setServerError(null);

    startTransition(async () => {
      try {
        const result = await loginRequest(values);
        setSession(result.user, result.accessToken);
        router.push('/dashboard');
      } catch (error) {
        if (error instanceof ApiError) {
          setServerError(error.message);
        } else {
          setServerError('Error de conexión. Verifica tu internet e intenta de nuevo.');
        }
      }
    });
  };

  return { login, isPending, serverError };
}
