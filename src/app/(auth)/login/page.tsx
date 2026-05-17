import { LoginForm } from '@/modules/auth/components/LoginForm';
import { AuthNavbar } from '@/modules/auth/components/AuthNavbar';
import { AUTH_ROUTES } from '@/@common/constants/routes';
import Link from 'next/link';
import { GoogleAuthButton } from '@/modules/auth/components/GoogleAuthButton';

export default function LoginPage() {
  return (
    <>
      <AuthNavbar action={{ label: 'Crear cuenta', href: AUTH_ROUTES.REGISTER }} />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-green-100 bg-white/90 px-6 py-8 shadow-xl shadow-green-900/5 backdrop-blur-sm">
            <div className="mb-6 flex flex-col items-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Inicia sesión
              </h1>
              <p className="text-center text-sm text-slate-600">
                ¿No tienes cuenta?{' '}
                <Link href={AUTH_ROUTES.REGISTER} className="font-medium text-primary hover:underline">
                  Regístrate gratis
                </Link>
              </p>
            </div>
            <GoogleAuthButton />

            <div className="relative flex items-center py-0.5 my-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="mx-3 text-xs text-gray-500">o</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>
            <LoginForm />
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            Gestión de cultivos para agricultores o cooperativas derechos reservados a @thonyiuci
          </p>
        </div>
      </div>
    </>
  );
}
