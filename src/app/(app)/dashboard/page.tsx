'use client';

import Link from 'next/link';
import { useAuthContext } from '@/modules/auth/context/auth.context';

export default function DashboardPage() {
  const { user } = useAuthContext();

  const userRoles = user?.cooperatives?.flatMap((c) => c.roles) ?? [];
  const isEnfundador = userRoles.includes('enfundador') || user?.isSuperadmin;
  const cooperative = user?.cooperatives?.[0];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        {cooperative && (
          <p className="mt-1 text-sm text-gray-500">
            {cooperative.cooperativeName}
            {cooperative.memberCode && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {cooperative.memberCode}
              </span>
            )}
          </p>
        )}
        {user?.isSuperadmin && (
          <span className="mt-2 inline-block rounded-full bg-[#27ae60]/10 px-3 py-1 text-xs font-semibold text-[#27ae60]">
            Superadministrador
          </span>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        {isEnfundador && (
          <Link
            href="/enfundado/nuevo"
            className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-[#27ae60]/30 hover:shadow-md"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10 transition-colors group-hover:bg-[#27ae60]/20">
              <svg className="h-5 w-5 text-[#27ae60]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Registrar enfunde</p>
              <p className="mt-0.5 text-sm text-gray-500">Ingresa los datos del enfundado</p>
            </div>
          </Link>
        )}

        <div className="flex items-start gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-400">Historial</p>
            <p className="mt-0.5 text-sm text-gray-400">Próximamente</p>
          </div>
        </div>
      </div>

      {/* Roles */}
      {userRoles.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Tus roles
          </p>
          <div className="flex flex-wrap gap-2">
            {userRoles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-[#27ae60]/10 px-3 py-1 text-xs font-medium capitalize text-[#27ae60]"
              >
                {role.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
