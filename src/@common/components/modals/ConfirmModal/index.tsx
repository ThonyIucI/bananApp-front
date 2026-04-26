'use client';

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

const CONFIRM_CLASS: Record<NonNullable<ConfirmModalProps['variant']>, string> = {
  danger:
    'cursor-pointer rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-[160ms] ease-out hover:bg-red-600 active:scale-[0.97]',
  default:
    'cursor-pointer rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-[160ms] ease-out hover:bg-[#219a52] active:scale-[0.97]',
};

/** Generic styled confirmation dialog. Always use this — never window.confirm(). */
export const ConfirmModal = ({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
}: ConfirmModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        style={{ animation: 'modal-in 200ms cubic-bezier(0.23,1,0.32,1) both' }}
      >
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-gray-500">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-[transform,background-color] duration-160 ease-out hover:bg-gray-50 active:scale-[0.97]"
          >
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={CONFIRM_CLASS[variant]}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
