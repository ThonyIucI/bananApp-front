'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/@common/components/form/Input';
import { Button } from '@/components/ui/button';
import { FormFieldset } from '@/@common/components/form/FormFieldset';
import { useCountdown } from '@/@common/hooks/useCountdown';
import { maskEmail } from '@/@common/utils/string';
import { verifyEmailSchema, type TVerifyEmailFormValues } from '../../schemas/verify-email.schema';
import { useVerifyEmail } from '../../hooks/useVerifyEmail';
import { useResendVerification } from '../../hooks/useResendVerification';

interface EmailVerificationFormProps {
  userId: string;
  email: string;
  onSuccess: () => void;
}

/** Pantalla de verificación de email con código de 6 dígitos y reenvío con cooldown. */
export const EmailVerificationForm = ({ userId, email, onSuccess }: EmailVerificationFormProps) => {
  const VerifyEmail = useVerifyEmail();
  const Resend = useResendVerification();
  const countdown = useCountdown();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TVerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const onSubmit = async (values: TVerifyEmailFormValues) => {
    const result = await VerifyEmail.handler({ userId, code: values.code });
    if (result) onSuccess();
  };

  const handleResend = async () => {
    const result = await Resend.handler(userId);
    if (result) countdown.start(60);
  };

  const isDisabled = VerifyEmail.loading || Resend.loading;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-center text-slate-600">
        Enviamos un código de 6 dígitos a{' '}
        <strong className="text-slate-800">{maskEmail(email)}</strong>
      </p>

      <FormFieldset
        id="verify-email-form"
        onSubmit={handleSubmit(onSubmit)}
        disabled={isDisabled}
        noValidate
      >
        <Input
          label="Código de verificación"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          error={errors.code?.message}
          {...register('code')}
        />

        <Button
          type="submit"
          size="lg"
          isLoading={VerifyEmail.loading}
          disabled={isDisabled}
          className="h-12 w-full font-bold"
        >
          {VerifyEmail.loading ? 'Validando...' : 'Validar código'}
        </Button>
      </FormFieldset>

      <button
        type="button"
        onClick={handleResend}
        disabled={countdown.seconds > 0 || isDisabled}
        className="text-sm text-center text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {countdown.seconds > 0 ? `Reenviar en ${countdown.seconds}s` : 'No recibí el código'}
      </button>
    </div>
  );
};
