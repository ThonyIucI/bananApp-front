'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customZ } from '@/@common/utils/zod-config';
import { Input } from '@/@common/components/form/Input';
import { Button } from '@/components/ui/button';
import { GoogleAuthButton } from '@/modules/auth/components/GoogleAuthButton';
import { useRequestRegistration } from '@/modules/auth/hooks/useRequestRegistration';
import { FormFieldset } from '@/@common/components/form/FormFieldset';
import Link from 'next/link';
import { AUTH_ROUTES } from '@/@common/constants/routes';

const emailStepSchema = customZ.object({
  email: customZ.email().max(150),
});

type TEmailStepValues = customZ.infer<typeof emailStepSchema>;

interface IEmailStepProps {
  onSuccess: (email: string) => void;
}

/**
 * Paso 1 del registro: ingresa email y recibe el código de verificación.
 */
export const EmailStep = ({ onSuccess }: IEmailStepProps) => {
  const RequestRegistration = useRequestRegistration();

  const { register, handleSubmit, formState: { errors } } = useForm<TEmailStepValues>({
    resolver: zodResolver(emailStepSchema),
  });

  const onSubmit = async ({ email }: TEmailStepValues) => {
    const result = await RequestRegistration.handler(email);
    if (result) onSuccess(email);
  };

  return (
    <FormFieldset
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
      disabled={RequestRegistration.loading}
    >
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Crea tu cuenta
        </h2>
        <p className="text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link href={AUTH_ROUTES.LOGIN} className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
      
      <GoogleAuthButton />

      <div className="relative flex items-center py-0.5">
        <div className="flex-1 border-t border-slate-200" />
        <span className="mx-3 text-xs text-gray-500">o</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      <Input
        label="Usa tu correo electrónico"
        type="email"
        autoComplete="email"
        autoFocus
        placeholder="tu@correo.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button
        type="submit"
        size="lg"
        isLoading={RequestRegistration.loading}
        className="w-full font-semibold"
      >
        {RequestRegistration.loading ? 'Enviando...' : 'Continuar con email'}
      </Button>
    </FormFieldset>
  );
};
