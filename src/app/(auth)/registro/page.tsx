'use client';

import { useState } from 'react';
import { AuthNavbar } from '@/modules/auth/components/AuthNavbar';
import { EmailStep } from '@/modules/auth/components/EmailStep';
import { CodeStep } from '@/modules/auth/components/CodeStep';
import { ProfileStep } from '@/modules/auth/components/ProfileStep';
import { EligeModalidadPanel } from '@/modules/auth/components/EligeModalidadPanel';
import { APP_ROUTES, AUTH_ROUTES } from '@/@common/constants/routes';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { useRouter } from 'next/navigation';

enum EStep {
  EMAIL = 'email',
  CODE = 'code',
  PROFILE = 'profile',
  CHOOSE_MODE = 'choose-mode',
}

export default function RegistroPage() {
  const router = useRouter();

  const [step, setStep] = useState<EStep>(EStep.EMAIL);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState('');

  const handleEmailSuccess = (receivedEmail: string) => {
    setEmail(receivedEmail);
    setStep(EStep.CODE);
  };

  const handleCodeSuccess = (receivedCode: string) => {
    setCode(receivedCode);
    setStep(EStep.PROFILE);
  };

  const handleProfileSuccess = (profile: AuthUser) => {
    setUserId(profile.id);
    // TODO Implement choose mode when is available cooperatives view and rol
    // setStep(EStep.CHOOSE_MODE);
    router.push(APP_ROUTES.INDEPENDENT_DASHBOARD);
  };

  return (
    <>
      <AuthNavbar action={{ label: 'Iniciar sesión', href: AUTH_ROUTES.LOGIN }} />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-green-100 bg-white/90 px-6 py-8 shadow-xl shadow-green-900/5 backdrop-blur-sm">
            <div
              key={step}
              className="animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              {step === EStep.EMAIL && (
                <EmailStep onSuccess={handleEmailSuccess} />
              )}

              {step === EStep.CODE && (
                <CodeStep
                  email={email}
                  onSuccess={handleCodeSuccess}
                  onBack={() => setStep(EStep.EMAIL)}
                />
              )}

              {step === EStep.PROFILE && (
                <ProfileStep
                  email={email}
                  code={code}
                  onSuccess={handleProfileSuccess}
                />
              )}

              {step === EStep.CHOOSE_MODE && (
                <EligeModalidadPanel userId={userId} />
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            Gestión de cultivos para agricultores o cooperativas derechos reservados a @thonyiuci
          </p>
        </div>
      </div>
    </>
  );
}
