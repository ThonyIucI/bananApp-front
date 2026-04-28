'use client';

import { useForm, Controller } from 'react-hook-form';
import { useAssignUserCooperative } from '@/modules/users/hooks/useAssignUserCooperative';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { Modal } from '@/@common/components/modals/Modal';
import { Select } from '@/@common/components/form/Select';
import { Input } from '@/@common/components/form/Input';
import { ConfirmCloseDialog } from '@/@common/components/modals/ConfirmCloseDialog';
import type { IOption } from '@/@common/types/IOption';
import {
  ERoles,
  type UserResponse,
  type AssignCooperativePayload,
  TRoleKey,
} from '@/modules/users/services/user.service';
import type { CooperativeResponse } from '@/modules/cooperatives/services/cooperative.service';
import { roleOptions } from '../../constants';

interface AssignFormValues {
  cooperativeId: string;
  roleKey: ERoles;
  memberCode: string;
}

interface AssignCooperativeModalProps {
  user: UserResponse;
  cooperatives: CooperativeResponse[];
  onClose: () => void;
  /** Called with the assigned cooperative data on success. */
  onAssigned: (cooperativeId: string, TroleKey: ERoles, memberCode?: string) => void;
}

/** Modal for assigning a user to a cooperative with role and member code. */
export const AssignCooperativeModal = ({ user, cooperatives, onClose, onAssigned }: AssignCooperativeModalProps) => {
  const showConfirm = useBoolean();
  const AssignCoop = useAssignUserCooperative();

  const coopOptions: IOption[] = cooperatives.map((c) => ({ value: c.id, label: c.name }));

  const { register, handleSubmit, control, formState: { isDirty, errors } } =
    useForm<AssignFormValues>({
      defaultValues: { cooperativeId: cooperatives[0]?.id ?? '', roleKey: ERoles.MEMBER, memberCode: '' },
    });

  const tryClose = () => (isDirty ? showConfirm.on() : onClose());

  const onSubmit = async (v: AssignFormValues) => {
    const payload: AssignCooperativePayload = {
      cooperativeId: v.cooperativeId,
      roleKey: v.roleKey,
      memberCode: v.memberCode.trim() || undefined,
    };
    const result = await AssignCoop.handler(user.id, payload);
    if (result !== null) {
      onAssigned(v.cooperativeId, v.roleKey, v.memberCode.trim() || undefined);
      onClose();
    }
  };

  return (
    <>
      <Modal
        open={true}
        onClose={tryClose}
        title="Asignar cooperativa"
        footer={
          <>
            <button
              type="button"
              onClick={tryClose}
              className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-[transform,background-color] duration-160 ease-out hover:bg-gray-50 active:scale-[0.97]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="assign-form"
              disabled={AssignCoop.loading}
              className="cursor-pointer rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] disabled:opacity-60 active:scale-[0.97]"
            >
              {AssignCoop.loading ? 'Asignando…' : 'Asignar'}
            </button>
          </>
        }
      >
        <form id="assign-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <p className="text-xs text-gray-400">{user.fullName}</p>
          <Controller
            name="cooperativeId"
            control={control}
            rules={{ required: 'Selecciona una cooperativa' }}
            render={({ field }) => (
              <Select
                label="Cooperativa"
                error={errors.cooperativeId?.message}
                options={coopOptions}
                value={coopOptions.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => field.onChange((opt as IOption | null)?.value ?? '')}
                placeholder="Seleccionar cooperativa..."
              />
            )}
          />
          <Controller
            name="roleKey"
            control={control}
            rules={{ required: 'Selecciona un rol' }}
            render={({ field }) => (
              <Select
                label="Rol"
                error={errors.roleKey?.message}
                options={roleOptions.filter((k) => k as unknown as TRoleKey !== ERoles.SUPERADMIN)}
                value={roleOptions.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => field.onChange((opt as IOption | null)?.value ?? '')}
                placeholder="Seleccionar el rol"
              />
            )}
          />
          <Input
            {...register('memberCode', { pattern: { value: /^[A-Z0-9\-]{3,20}$/, message: '3–20 caracteres alfanuméricos en mayúscula' } })}
            label="Código de socio"
            placeholder="ABC-001"
            error={errors.memberCode?.message}
          />
        </form>
      </Modal>

      {showConfirm.active && (
        <ConfirmCloseDialog
          onConfirm={() => { showConfirm.off(); onClose(); }}
          onCancel={showConfirm.off}
        />
      )}
    </>
  );
};
