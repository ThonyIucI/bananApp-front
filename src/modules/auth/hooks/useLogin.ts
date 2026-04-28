'use client';

import { useRouter } from 'next/navigation';
import { loginRequest, getProfileRequest } from '../services/auth.service';
import type { LoginFormValues } from '../schemas/login.schema';
import { useAuthContext } from '../context/auth.context';
import useRequest from '@/@common/hooks/useRequest';
import { APP_ROUTES } from '@/@common/constants/routes';
import type { AuthUser } from '../types/auth.types';

const ACCESS_TOKEN_KEY = 'cultiv_at';

export function useLogin() {
  const router = useRouter();
  const { setSession } = useAuthContext();

  const { loading, handler } = useRequest<AuthUser, [LoginFormValues]>(
    false,
    async (values) => {
      const loginResult = await loginRequest(values);

      // Store token so apiClient interceptor can attach it to the profile request
      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        JSON.stringify({ token: loginResult.accessToken, user: loginResult.user }),
      );

      const profile = await getProfileRequest();

      setSession(profile, loginResult.accessToken);
      router.push(APP_ROUTES.DASHBOARD);
      return profile;
    },
  );

  return { login: handler, isPending: loading };
}
