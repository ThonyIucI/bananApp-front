'use client';

import useRequest from '@/@common/hooks/useRequest';
import { completeRegistrationRequest, getProfileRequest } from '../services/auth.service';
import { useAuthContext } from '../context/auth.context';
import type { TCompleteRegistrationPayload } from '../types/auth.types';
import type { AuthUser } from '../types/auth.types';

const ACCESS_TOKEN_KEY = 'cultiv_at';

/**
 * Verifica el código y crea la cuenta con los datos del perfil.
 * Si tiene éxito, inicia la sesión automáticamente.
 */
export const useCompleteRegistration = () => {
  const { setSession } = useAuthContext();

  const { loading, handler } = useRequest<AuthUser, [TCompleteRegistrationPayload]>(
    false,
    async (payload) => {
      const res = await completeRegistrationRequest(payload);
      const result = res.data;

      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        JSON.stringify({ token: result.accessToken, user: result.user }),
      );

      const profile = await getProfileRequest();
      setSession(profile, result.accessToken);
      return profile;
    },
  );

  return { loading, handler };
};
