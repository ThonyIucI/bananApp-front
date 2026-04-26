'use client';

import { useRouter } from 'next/navigation';
import { useAuthContext } from '../context/auth.context';
import { AUTH_ROUTES } from '@/@common/constants/routes';

export const SessionExpiredModal= () => {
  const { sessionExpired, clearSession } = useAuthContext();
  const router = useRouter();

  if (!sessionExpired) return null;

  const handleLogin = () => {
    clearSession();
    router.replace(AUTH_ROUTES.LOGIN);
  };

  const handleExit = () => {
    clearSession();
    // Close tab if possible, otherwise go to a neutral page
    if (window.history.length <= 1) {
      window.close();
    } else {
      router.replace(AUTH_ROUTES.LOGIN);
    }
  };

  return (
    // Backdrop — pointer-events-none removed so clicks don't pass through
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
            <svg
              className="h-8 w-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          Sesión expirada
        </h2>
        <p className="mb-8 text-center text-sm text-gray-500">
          Tu sesión ha expirado o no tienes acceso. Por favor vuelve a iniciar sesión para continuar.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogin}
            className="h-14 w-full cursor-pointer rounded-2xl bg-[#27ae60] text-sm font-semibold text-white transition-all hover:bg-[#219a52] active:scale-[.98]"
          >
            Iniciar sesión
          </button>
          <button
            onClick={handleExit}
            className="h-14 w-full cursor-pointer rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-[.98]"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
