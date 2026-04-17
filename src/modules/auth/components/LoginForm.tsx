'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const { login, isPending, serverError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(login)}
      className="flex flex-col gap-5"
      noValidate
      style={{ touchAction: 'manipulation' }}
    >
      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* Email field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-slate-700"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@correo.com"
          disabled={isPending}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={[
            'h-14 w-full rounded-xl border-2 px-4 text-base text-slate-900 outline-none',
            'placeholder:text-slate-400',
            'transition-all duration-150',
            'focus:ring-4',
            'disabled:cursor-not-allowed disabled:opacity-50',
            errors.email
              ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 bg-white focus:border-[#27ae60] focus:ring-[#27ae60]/10',
          ].join(' ')}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-slate-700"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isPending}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className={[
            'h-14 w-full rounded-xl border-2 px-4 text-base text-slate-900 outline-none',
            'placeholder:text-slate-400',
            'transition-all duration-150',
            'focus:ring-4',
            'disabled:cursor-not-allowed disabled:opacity-50',
            errors.password
              ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 bg-white focus:border-[#27ae60] focus:ring-[#27ae60]/10',
          ].join(' ')}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={[
          'mt-2 flex h-14 w-full cursor-pointer items-center justify-center gap-2.5',
          'rounded-xl text-base font-semibold text-white',
          'bg-[#27ae60]',
          'transition-all duration-150',
          'hover:bg-[#219a52] hover:shadow-lg hover:shadow-[#27ae60]/25',
          'active:scale-[.98] active:bg-[#1e8449]',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#27ae60]/30 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
        ].join(' ')}
      >
        {isPending ? (
          <>
            <svg
              className="h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Ingresando...
          </>
        ) : (
          'Ingresar'
        )}
      </button>
    </form>
  );
}
