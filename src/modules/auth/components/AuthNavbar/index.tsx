import Link from 'next/link';
import { CultivAppLogo } from '../CultivAppLogo';
import { Button } from '@/components/ui/button';

interface AuthNavbarProps {
  /** Texto y destino del botón de acción derecho. */
  action: { label: string; href: string };
}

/**
 * Barra superior para páginas de auth — logo izquierda, botón acción derecha.
 * Inspirado en el diseño de Vercel/Railway.
 */
export const AuthNavbar = ({ action }: AuthNavbarProps) => (
  <nav className="flex w-full items-center justify-between px-6 py-4">
    <Link href="/" className="flex items-center gap-2.5 outline-none" aria-label="Ir al inicio">
      <CultivAppLogo />
      <span className="text-base font-bold tracking-tight text-slate-900">CultivApp</span>
    </Link>

    <Link
      href={action.href}
      // className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm
      //   transition-all duration-150 ease-out
      //   hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900
      //   active:scale-[0.97] active:shadow-none"
    >
      <Button variant='outline' size='lg'>
      {action.label}
      </Button>
    </Link>
  </nav>
);
