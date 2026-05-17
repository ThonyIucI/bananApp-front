'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/@common/components/form/Input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormFieldset } from '@/@common/components/form/FormFieldset';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { registerSchema, type TRegisterFormValues } from '../../schemas/register.schema';
import { useRegister } from '../../hooks/useRegister';
import { GoogleAuthButton } from '../GoogleAuthButton';
import type { TRegisterResponse } from '../../types/auth.types';

interface RegisterFormProps {
  onSuccess: (result: TRegisterResponse) => void;
}

/** Formulario de registro con email/password y opción de Google OAuth. */
export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const Register = useRegister();
  const showPassword = useBoolean();
  const showConfirm = useBoolean();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TRegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: TRegisterFormValues) => {
    const { confirmPassword: _c, ...payload } = values;
    const result = await Register.handler(payload);
    if (result) onSuccess(result);
  };

  return (
    <FormFieldset
      id="register-form"
      onSubmit={handleSubmit(onSubmit)}
      disabled={Register.loading}
      noValidate
      suppressHydrationWarning
    >
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nombre"
          placeholder="Juan"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Apellido"
          placeholder="Pérez"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="relative">
        <Input
          label="Contraseña"
          type={showPassword.active ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={showPassword.toggle}
          className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
          tabIndex={-1}
        >
          {showPassword.active ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirmar contraseña"
          type={showConfirm.active ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repite la contraseña"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <button
          type="button"
          onClick={showConfirm.toggle}
          className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
          tabIndex={-1}
        >
          {showConfirm.active ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <Controller
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true ? true : false)}
              />
              <span className="text-sm text-gray-700">Acepto los términos y condiciones</span>
            </label>
          )}
        />
        {errors.acceptTerms && (
          <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={Register.loading}
        disabled={Register.loading}
        className="h-12 w-full font-bold"
      >
        {Register.loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-gray-200" />
        <span className="mx-3 text-xs text-gray-500">O regístrate con</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <GoogleAuthButton />
    </FormFieldset>
  );
};
