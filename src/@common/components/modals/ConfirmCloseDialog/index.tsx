'use client';

import { ConfirmModal } from '@/@common/components/modals/ConfirmModal';

interface ConfirmCloseDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/** Discard-changes guard. Shown when closing a dirty form. */
export const ConfirmCloseDialog = ({ onConfirm, onCancel }: ConfirmCloseDialogProps) => (
  <ConfirmModal
    open
    title="¿Descartar cambios?"
    description="Tienes cambios sin guardar. Si cierras, se perderán."
    confirmLabel="Descartar"
    cancelLabel="Seguir editando"
    variant="danger"
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);
