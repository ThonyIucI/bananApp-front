'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customZ } from '@/@common/utils/zod-config';
import { Input } from '@/@common/components/form/Input';
import { Button } from '@/components/ui/button';
import { useCompleteRegistration } from '@/modules/auth/hooks/useCompleteRegistration';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { FormFieldset } from '@/@common/components/form/FormFieldset';

const profileStepSchema = customZ
  .object({
    firstName: customZ.string().min(2).max(80),
    lastName: customZ.string().min(2).max(80),
    password: customZ.string().min(8, 'Mínimo 8 caracteres').max(128),
    confirmPassword: customZ.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type TProfileStepValues = customZ.infer<typeof profileStepSchema>;

interface IProfileStepProps {
  email: string;
  code: string;
  onSuccess: (profile: AuthUser) => void;
}

/**
 * Paso 3 del registro: nombre, apellido y contraseña.
 * Llama a complete-registration y notifica al padre con el perfil creado.
 */
export const ProfileStep = ({ email, code, onSuccess }: IProfileStepProps) => {
  const CompleteRegistration = useCompleteRegistration();

  const { register, handleSubmit, formState: { errors } } = useForm<TProfileStepValues>({
    resolver: zodResolver(profileStepSchema),
  });

  const onSubmit = async ({ firstName, lastName, password }: TProfileStepValues) => {
    const result = await CompleteRegistration.handler({
      email,
      code,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password,
    });
    if (result) onSuccess(result);
  };

  return (
    <FormFieldset
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
      disabled={CompleteRegistration.loading}
    >
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Completa tu perfil
        </h2>
        <p className="text-sm text-slate-600">
          Solo necesitamos unos datos más
        </p>
      </div>
      <div className="flex gap-3">
        <Input
          label="Nombre"
          autoComplete="given-name"
          autoFocus
          placeholder="Juan"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Apellido"
          autoComplete="family-name"
          placeholder="Pérez"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Repite la contraseña"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        size="lg"
        isLoading={CompleteRegistration.loading}
        className="h-11 w-full font-semibold active:scale-[0.97]"
      >
        {CompleteRegistration.loading ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>
    </FormFieldset>
  );
};
