import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ingresar — CultivApp',
  description: 'Ingresa a tu cuenta de CultivApp',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #86efac 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4ade80 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
