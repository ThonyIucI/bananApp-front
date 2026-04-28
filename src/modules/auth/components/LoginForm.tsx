'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';
import { Input } from '@/@common/components/form/Input';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const { login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    // suppressHydrationWarning prevents false hydration mismatches caused by
    // browser extensions (e.g. LastPass) injecting elements into the form.
    <form
      onSubmit={handleSubmit(login)}
      className="flex flex-col gap-5"
      noValidate
      suppressHydrationWarning
      style={{ touchAction: 'manipulation' }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          Correo electrónico
        </label>
        <Input
          type='email'
          autoComplete="email"
          required
          placeholder="tu@correo.com"
          error={errors.email?.message}
          disabled={isPending}
          {...register('email')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
          Contraseña
        </label>
        <Input
          type='password'
          autoComplete="current-password"
          placeholder="******"
          error={errors.password?.message}
          disabled={isPending}
          {...register('password')}
        />
      </div>
      <Button
        type='submit'
        size='lg'
        isLoading={isPending}
        className='h-12 font-bold'
      >
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  );
}
