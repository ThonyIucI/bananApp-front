'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateUser } from '@/modules/users/hooks/useCreateUser';
import { useUpdateUser } from '@/modules/users/hooks/useUpdateUser';
import { useAssignUserCooperative } from '@/modules/users/hooks/useAssignUserCooperative';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { Modal } from '@/@common/components/modals/Modal';
import { Input } from '@/@common/components/form/Input';
import { Select } from '@/@common/components/form/Select';
import { ConfirmCloseDialog } from '@/@common/components/modals/ConfirmCloseDialog';
import type { IOption } from '@/@common/types/IOption';
import {
  type UserResponse,
  ERoles,
} from '@/modules/users/services/user.service';
import type { CooperativeResponse } from '@/modules/cooperatives/services/cooperative.service';
import { roleOptions } from '../../constants';
import { Button } from '@/components/ui/button';
import { CheckBoxInput } from '@/@common/components/form/CheckBoxInput';
import { useAuthContext } from '@/modules/auth/context/auth.context';

interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dni: string;
  isActive: boolean;
  mustChangePassword: boolean;
  cooperativeId: string;
  roleKey: ERoles;
  memberCode: string;
}

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the saved user and optional cooperative assignment data. */
  onSaved: (u: UserResponse, assignedCoopId?: string, assignedRole?: ERoles, memberCode?: string) => void;
  user?: UserResponse;
  cooperatives: CooperativeResponse[];
}

/** Modal for creating or editing a user. Handles cooperative assignment on create. */
export const UserFormModal = ({ open, onClose, onSaved, user, cooperatives }: UserFormModalProps) => {
  const isEdit = !!user;
  const showConfirm = useBoolean();
  const CreateUser = useCreateUser();
  const UpdateUser = useUpdateUser();
  const AssignCoop = useAssignUserCooperative();
  const { isSuperadmin  } = useAuthContext();
  const loading = isEdit ? UpdateUser.loading : (CreateUser.loading || AssignCoop.loading);

  const coopOptions: IOption[] = cooperatives.map((c) => ({ value: c.id, label: c.name }));

  const { register, handleSubmit, control, reset, formState: { isDirty, errors } } =
    useForm<UserFormValues>({
      defaultValues: {
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        password: '',
        dni: user?.dni ?? '',
        isActive: user?.isActive ?? true,
        mustChangePassword: user?.mustChangePassword ?? true,
        cooperativeId: cooperatives[0]?.id ?? '',
        roleKey: ERoles.MEMBER,
        memberCode: '',
      },
    });

  useEffect(() => {
    if (open) {
      reset({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        password: '',
        dni: user?.dni ?? '',
        isActive: user?.isActive ?? true,
        mustChangePassword: user?.mustChangePassword ?? true,
        cooperativeId: cooperatives[0]?.id ?? '',
        roleKey: ERoles.MEMBER,
        memberCode: '',
      });
    }
  }, [open, user, cooperatives, reset]);

  const tryClose = () => (isDirty ? showConfirm.on() : onClose());

  const onSubmit = async (v: UserFormValues) => {
    if (isEdit) {
      const result = await UpdateUser.handler(user!.id, {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        dni: v.dni.trim() || undefined,
        isActive: v.isActive,
        password: isSuperadmin ? v.password : undefined,
        mustChangePassword: v.mustChangePassword,
      });
      if (result) { onSaved(result); onClose(); }
    } else {
      const result = await CreateUser.handler({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        password: v.password,
        dni: v.dni.trim() || undefined,
        mustChangePassword: v.mustChangePassword,
      });
      if (result) {
        if (v.cooperativeId) {
          await AssignCoop.handler(result.id, {
            cooperativeId: v.cooperativeId,
            roleKey: v.roleKey,
            memberCode: v.memberCode.trim() || undefined,
          });
        }
        onSaved(result, v.cooperativeId || undefined, v.roleKey, v.memberCode.trim() || undefined);
        onClose();
      }
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={tryClose}
        title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        footer={
          <>
            <Button
              onClick={tryClose}
              variant='outline'
              size='lg'
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="user-form"
              disabled={loading || (isEdit && !isDirty)}
              size='lg'
            >
              {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nombre"
              required
              autoFocus
              placeholder="Juan"
              error={errors.firstName?.message}
              {...register('firstName', { required: 'Campo requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' }, maxLength: 100 })}
            />
            <Input
              label="Apellido"
              required
              placeholder="Pérez"
              error={errors.lastName?.message}
              {...register('lastName', { required: 'Campo requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' }, maxLength: 100 })}
            />
          </div>
          <Input
            label="Correo"
            required
            type="email"
            placeholder="juan@ejemplo.com"
            error={errors.email?.message}
            {...register('email', { required: 'Campo requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' } })}
          />
          {(isSuperadmin || !isEdit) && (
            <Input
              label="Contraseña"
              required
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register('password', { required: isEdit ? undefined : 'Campo requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' }, maxLength: 100 })}
            />
          )}
          <Input
            label="DNI"
            placeholder="12345678"
            maxLength={8}
            error={errors.dni?.message}
            {...register('dni', { pattern: { value: /^\d{8}$/, message: 'Debe tener exactamente 8 dígitos' } })}
          />
          <div className="space-y-2">
            {
              isEdit && (
                <Controller
                  name="isActive"
                  control={control}
                  rules={{ required: 'Campo requerido' }}
                  render={({ field }) => (
                    <CheckBoxInput
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v)}
                      label="Usuario activo"
                      error={errors.isActive?.message}
                    />
                  )}
                />
              )
            }
            <Controller
              name="mustChangePassword"
              control={control}
              render={({ field }) => (
                <CheckBoxInput
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v)}
                  label={isEdit ? 'Forzar cambio de contraseña' : 'Solicitar cambio de contraseña al ingresar'}
                  error={errors.mustChangePassword?.message}
                />
              )}
            />
          </div>
          {!isEdit && cooperatives.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Asignar cooperativa</p>
              <div className="space-y-3">
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
                      options={roleOptions}
                      value={roleOptions.find((o) => o.value === field.value) ?? null}
                      onChange={(opt) => field.onChange((opt as IOption | null)?.value ?? '')}  
                      placeholder="Seleccionar el rol"
                    />
                  )}
                />
                <Input
                  label="Código de socio"
                  placeholder="ABC-001"
                  error={errors.memberCode?.message}
                  {...register('memberCode', { pattern: { value: /^[A-Z0-9\-]{3,20}$/, message: '3–20 caracteres alfanuméricos en mayúscula' } })}
                />
              </div>
            </div>
          )}
        </form>
      </Modal>

      {showConfirm.active && (
        <ConfirmCloseDialog
          onConfirm={() => {
            showConfirm.off();
            onClose();
          }}
          onCancel={showConfirm.off}
        />
      )}
    </>
  );
};
