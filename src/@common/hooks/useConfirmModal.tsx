'use client';

import { useState, useCallback } from 'react';
import { ConfirmModal } from '@/@common/components/modals/ConfirmModal';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface DialogState extends ConfirmOptions {
  open: boolean;
  resolve?: (value: boolean) => void;
}

const CLOSED: DialogState = { open: false, title: '' };

/**
 * Promise-based confirm dialog.
 * Usage: `const ok = await confirm({ title, description, variant: 'danger' })`.
 * Render `{dialog}` in JSX to mount the portal.
 */
export const useConfirmModal = () => {
  const [state, setState] = useState<DialogState>(CLOSED);

  const confirm = useCallback(
    (opts: ConfirmOptions): Promise<boolean> =>
      new Promise((resolve) => {
        setState({ ...opts, open: true, resolve });
      }),
    [],
  );

  const handleConfirm = () => {
    state.resolve?.(true);
    setState(CLOSED);
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState(CLOSED);
  };

  const dialog = (
    <ConfirmModal
      open={state.open}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
};
