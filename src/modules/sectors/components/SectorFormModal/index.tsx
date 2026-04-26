'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuthContext } from '@/modules/auth/context/auth.context';
import { useCreateSector } from '../../hooks/useCreateSector';
import { useUpdateSector } from '../../hooks/useUpdateSector';
import { Modal } from '@/@common/components/modals/Modal';
import { Input } from '@/@common/components/form/Input';
import type { UserResponse } from '@/modules/users/services/user.service';
import type { SectorResponse } from '../../services/sector.service';

interface SectorFormValues {
  name: string;
  plots: {
    name: string;
    ownerUserId: string;
    workerUserId: string;
    areaHectares: string;
    cadastralCode: string;
  }[];
}

interface SectorFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (sector: SectorResponse) => void;
  sector?: SectorResponse;
  users: UserResponse[];
}

/** Modal for creating or editing a sector with optional initial plots. */
export const SectorFormModal = ({ open, onClose, onSaved, sector, users }: SectorFormModalProps) => {
  const cooperativeId = useAuthContext().user?.cooperatives?.[0]?.cooperativeId ?? '';
  const isEdit = !!sector;
  const { loading: loadingCreate, handler: create } = useCreateSector();
  const { loading: loadingUpdate, handler: update } = useUpdateSector();
  const loading = isEdit ? loadingUpdate : loadingCreate;

  const { register, handleSubmit, control, reset, formState: { errors } } =
    useForm<SectorFormValues>({
      defaultValues: { name: sector?.name ?? '', plots: [] },
    });

  const { fields, append, remove } = useFieldArray({ control, name: 'plots' });

  useEffect(() => {
    if (open) reset({ name: sector?.name ?? '', plots: [] });
  }, [open, sector, reset]);

  const onSubmit = async (v: SectorFormValues) => {
    let result: SectorResponse | null | undefined;

    if (isEdit) {
      result = await update(sector!.id, { name: v.name.trim() });
    } else {
      const plots = v.plots
        .filter((p) => p.name.trim() && p.ownerUserId)
        .map((p) => ({
          name: p.name.trim(),
          ownerUserId: p.ownerUserId,
          workerUserId: p.workerUserId || undefined,
          areaHectares: parseFloat(p.areaHectares) || 0,
          cadastralCode: p.cadastralCode.trim() || undefined,
        }));
      result = await create(cooperativeId, {
        name: v.name.trim(),
        plots: plots.length ? plots : undefined,
      });
    }
    if (result) { onSaved(result); onClose(); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar sector' : 'Nuevo sector'}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-[transform,background-color] duration-160 ease-out hover:bg-gray-50 active:scale-[0.97] disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="sector-form"
            disabled={loading}
            className="cursor-pointer rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] active:scale-[0.97] disabled:opacity-60"
          >
            {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear sector'}
          </button>
        </>
      }
    >
      <form id="sector-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre del sector"
          required
          autoFocus
          placeholder="Norte, Sur, Bloque A…"
          error={errors.name?.message}
          {...register('name', {
            required: 'Campo requerido',
            minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            maxLength: 100,
          })}
        />

        {!isEdit && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">
                Parcelas iniciales{' '}
                <span className="text-gray-400">({fields.length}/20, opcional)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  fields.length < 20 &&
                  append({ name: '', ownerUserId: '', workerUserId: '', areaHectares: '', cadastralCode: '' })
                }
                disabled={fields.length >= 20}
                className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#27ae60] hover:bg-[#27ae60]/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Añadir parcela
              </button>
            </div>

            {fields.length === 0 && (
              <p className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
                Sin parcelas. Puedes añadirlas después desde la sección Parcelas.
              </p>
            )}
{/* TODO: Mantener consistencia entre formularios, los campos mostrados aquí deberían ser los mismos que en el formulario propio de parcelas */}
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Parcela {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Input
                        label="Nombre"
                        required
                        placeholder="Parcela 01"
                        {...register(`plots.${idx}.name`, { required: true })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Propietario <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register(`plots.${idx}.ownerUserId`, { required: true })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20"
                      >
                        <option value="">Seleccionar…</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.fullName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Trabajador <span className="text-gray-400">(opcional)</span>
                      </label>
                      <select
                        {...register(`plots.${idx}.workerUserId`)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20"
                      >
                        <option value="">Sin asignar</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.fullName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Input
                        label="Área (ha)"
                        required
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        placeholder="1.2500"
                        {...register(`plots.${idx}.areaHectares`, { required: true })}
                      />
                    </div>
                    <div>
                      <Input
                        label="Cód. catastral"
                        placeholder="Opcional"
                        {...register(`plots.${idx}.cadastralCode`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
