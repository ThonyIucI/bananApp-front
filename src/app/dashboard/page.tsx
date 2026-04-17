'use client';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated, clearSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl">🍌</span>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido, {user.fullName}!
        </h1>
        <p className="text-sm text-gray-500">{user.email}</p>
        {user.isSuperadmin && (
          <span className="mt-1 rounded-full bg-[#27ae60]/10 px-3 py-1 text-xs font-medium text-[#27ae60]">
            Superadmin
          </span>
        )}
      </div>

      <button
        onClick={() => {
          clearSession();
          router.replace('/login');
        }}
        className="h-12 rounded-xl border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-[.98]"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
