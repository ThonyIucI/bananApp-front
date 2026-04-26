import { LoginForm } from '@/modules/auth/components/LoginForm';

// Sprout/leaf SVG icon — represents organic agriculture
function CultivAppIcon() {
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
      style={{ background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <CultivAppIcon />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            CultivApp
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa para continuar
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-green-100 bg-white/90 px-6 py-8 shadow-xl shadow-green-900/5 backdrop-blur-sm">
        <LoginForm />
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-slate-400">
        Gestión de cultivos para cooperativas agrícolas derechos reservados a @ThonyIucI
      </p>
    </>
  );
}
