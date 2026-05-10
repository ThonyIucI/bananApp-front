'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { customZ } from '@/@common/utils/zod-config';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { GoogleAuthButton } from '@/modules/auth/components/GoogleAuthButton';
import { useRequestRegistration } from '@/modules/auth/hooks/useRequestRegistration';
import { ArrowLeft } from 'lucide-react';

const codeStepSchema = customZ.object({
  code: customZ
    .string()
    .min(6, 'El código debe tener 6 dígitos')
    .max(6, 'El código debe tener 6 dígitos'),
});

type TCodeStepValues = customZ.infer<typeof codeStepSchema>;

interface ICodeStepProps {
  email: string;
  onSuccess: (code: string) => void;
  onBack: () => void;
}

/**
 * Paso 2 del registro: ingresa el código de 6 dígitos enviado al email.
 * Solo valida el formato y notifica al padre con el código — no llama a la API.
 */
export const CodeStep = ({ email, onBack, onSuccess }: ICodeStepProps) => {
  const RequestRegistration = useRequestRegistration();

  const { handleSubmit, control, formState: { errors } } = useForm<TCodeStepValues>({
    resolver: zodResolver(codeStepSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = ({ code }: TCodeStepValues) => {
    onSuccess(code);
  };

  const handleResend = async () => {
    await RequestRegistration.handler(email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Revisa tu correo</h2>
        <p className="text-sm text-slate-600">
          Enviamos un código de 6 dígitos a{' '}
          <span className="font-medium text-slate-800">{email}</span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <InputOTP
              {...field}
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              autoFocus
              containerClassName="gap-2"
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="size-11 rounded-xl border-slate-200 text-base font-semibold text-slate-900
                      transition-[border-color,box-shadow] duration-150
                      data-[active=true]:border-[#15803d] data-[active=true]:ring-2 data-[active=true]:ring-[#15803d]/25"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />
        {errors.code && (
          <p className="text-xs text-red-500">{errors.code.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full font-semibold active:scale-[0.97]"
      >
        Verificar código
      </Button>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500
            transition-colors duration-150 hover:text-slate-800
            active:scale-[0.97]"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar email
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={RequestRegistration.loading}
          className="text-sm font-medium text-[#15803d]
            transition-colors duration-150 hover:text-[#166534]
            disabled:opacity-50 active:scale-[0.97]"
        >
          {RequestRegistration.loading ? 'Reenviando…' : 'Reenviar código'}
        </button>
      </div>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-slate-200" />
        <span className="mx-3 text-xs text-slate-500">o</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      <GoogleAuthButton />
    </form>
  );
};
