'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuthContext } from '@/modules/auth/context/auth.context';
import { getProfileRequest } from '@/modules/auth/services/auth.service';
import { APP_ROUTES, AUTH_ROUTES } from '@/@common/constants/routes';

const ACCESS_TOKEN_KEY = 'cultiv_at';

const GoogleSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuthContext();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      router.replace(AUTH_ROUTES.LOGIN);
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify({ token, user: null }));

    getProfileRequest()
      .then((profile) => {
        setSession(profile, token);
        router.replace(APP_ROUTES.DASHBOARD);
      })
      .catch(() => {
        toast.error('Error al iniciar sesión con Google. Intenta de nuevo.');
        router.replace(AUTH_ROUTES.LOGIN);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />
    </div>
  );
};

export default GoogleSuccessPage;
