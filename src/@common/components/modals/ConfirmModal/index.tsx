'use client';

import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
}


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
    createPortal(
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
            <Button onClick={onCancel} variant='outline'>
              {cancelLabel}
            </Button>
            <Button onClick={onConfirm} variant={variant}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>,
       document.getElementById('overlays') as HTMLElement)
  );
};
