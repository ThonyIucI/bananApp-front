'use client';

import { useRouter } from 'next/navigation';
import { Sprout, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/@common/components/modals/Modal';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { APP_ROUTES } from '@/@common/constants/routes';

interface EligeModalidadPanelProps {
  userId: string;
}

/** Pantalla post-verificación para elegir modalidad de uso: independiente o cooperativa. */
export const EligeModalidadPanel = ({ userId: _userId }: EligeModalidadPanelProps) => {
  const router = useRouter();
  const showCoopModal = useBoolean();

  const handleIndependent = () => {
    router.push(APP_ROUTES.INDEPENDENT_DASHBOARD);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          ¿Cómo quieres usar CultivApp?        </h2>
        <p className="text-sm text-slate-600">
          Puedes cambiar esto más adelante desde tu perfil
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleIndependent}
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[#27ae60] bg-[#f0fdf4] p-6 text-center transition-all hover:bg-[#dcfce7] hover:shadow-md active:scale-[0.98]"
        >
          <Sprout className="h-10 w-10 text-[#27ae60]" strokeWidth={1.5} />
          <div>
            <p className="font-semibold text-slate-800">Soy productor independiente</p>
            <p className="mt-1 text-xs text-slate-500">Gestiona tus parcelas de forma autónoma</p>
          </div>
        </button>

        <button
          type="button"
          onClick={showCoopModal.on}
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-6 text-center transition-all hover:border-slate-300 hover:shadow-md active:scale-[0.98]"
        >
          <Users className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
          <div>
            <p className="font-semibold text-slate-800">Quiero unirme a una cooperativa</p>
            <p className="mt-1 text-xs text-slate-500">Trabaja junto a tu organización agrícola</p>
          </div>
        </button>
      </div>

      <Modal
        open={showCoopModal.active}
        onClose={showCoopModal.off}
        title="Próximamente"
        footer={
          <Button onClick={showCoopModal.off} className="w-full">
            Entendido
          </Button>
        }
      >
        <p className="text-sm text-slate-600">
          Pide a tu cooperativa que te invite desde su panel de administración.
        </p>
      </Modal>
    </div>
  );
};
