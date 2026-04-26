'use client';

import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createBundlingSchema,
  type CreateBundlingFormValues,
} from '../../schemas/create-bundling.schema';
import { RIBBON_COLORS, RIBBON_COLOR_LABELS, RIBBON_COLOR_HEX } from '@/@common/constants/ribbon-colors';
import type { RibbonColor } from '@/@common/constants/ribbon-colors';
import { todayIso } from '@/@common/utils/date';
import { useCreateBundling } from '../../hooks/useCreateBundling';
import { useUpdateBundling } from '../../hooks/useUpdateBundling';
import { Modal } from '@/@common/components/modals/Modal';
import { Input } from '@/@common/components/form/Input';
import { Select } from '@/@common/components/form/Select';
import type { IOption } from '@/@common/types/IOption';
import type { PlotResponse, SubPlotResponse } from '@/modules/plots/services/plot.service';
import { useGetPlot } from '@/modules/plots/hooks/useGetPlot';
import type { UserResponse } from '@/modules/users/services/user.service';
import type { BundlingResponse } from '../../services/bundling.service';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { ConfirmCloseDialog } from '@/@common/components/modals/ConfirmCloseDialog';

interface BundlingFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (bundling: BundlingResponse) => void;
  plots: PlotResponse[];
  users: UserResponse[];
  userId?: string;
  cooperativeId?: string;
  bundling?: BundlingResponse;
}

/** Modal for registering or editing a bundling operation. Shows subPlot select when the selected plot has sub-plots. */
export const BundlingFormModal = ({
  open,
  onClose,
  onSaved,
  plots,
  users,
  userId,
  cooperativeId,
  bundling,
}: BundlingFormModalProps) => {
  const showConfirm = useBoolean();
  const CreateBundling = useCreateBundling();
  const UpdateBundling = useUpdateBundling();
  const GetPlot = useGetPlot();

  const isEditing = !!bundling;
  const isLoading = CreateBundling.loading || UpdateBundling.loading;

  const plotOptions: IOption[] = plots.map((p) => ({
    value: p.id,
    label: `${p.name} — ${(p.sector as { name: string }).name}`,
  }));
  const userOptions: IOption[] = users.map((u) => ({ value: u.id, label: u.fullName }));

  const { register, handleSubmit, control, reset, setError, setValue, formState: { isDirty, errors } } =
    useForm<CreateBundlingFormValues>({
      resolver: zodResolver(createBundlingSchema),
      defaultValues: {
        bundledAt: todayIso(),
        plotId: '',
        subPlotId: undefined,
        enfundadorUserId: '',
        notes: '',
      } as CreateBundlingFormValues,
    });

  const selectedPlotId = useWatch({ control, name: 'plotId' });
  const selectedListPlot = plots.find((p) => p.id === selectedPlotId);
  const hasSubPlots = (selectedListPlot?.subPlotsQuantity ?? 0) > 0;

  const subPlots: SubPlotResponse[] = GetPlot.data?.subPlots ?? [];
  const subPlotOptions: IOption[] = subPlots.map((sp) => ({
    value: sp.id,
    label: sp.name,
  }));

  useEffect(() => {
    if (!selectedPlotId || !hasSubPlots) return;
    GetPlot.handler(selectedPlotId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlotId]);

  useEffect(() => {
    if (!open) return;
    if (bundling) {
      reset({
        bundledAt: bundling.bundledAt,
        plotId: bundling.plot.id,
        subPlotId: bundling.subPlot?.id ?? undefined,
        enfundadorUserId: bundling.enfundadorUser.id,
        quantity: bundling.quantity,
        ribbonColorFree: bundling.ribbonColorFree as RibbonColor,
        notes: bundling.notes ?? '',
      });
    } else {
      reset({
        bundledAt: todayIso(),
        plotId: '',
        subPlotId: undefined,
        enfundadorUserId: userId ?? '',
        notes: '',
      } as CreateBundlingFormValues);
    }
  }, [open, bundling, userId, reset]);

  const tryClose = () => (isDirty ? showConfirm.on() : onClose());

  const onSubmit = async (v: CreateBundlingFormValues) => {
    if (hasSubPlots && !v.subPlotId) {
      setError('subPlotId', { message: 'Debe seleccionar una subparcela' });
      return;
    }

    if (isEditing) {
      const result = await UpdateBundling.handler(
        bundling.id,
        {
          subPlotId: v.subPlotId ?? null,
          quantity: v.quantity,
          bundledAt: v.bundledAt,
          ribbonColorFree: v.ribbonColorFree,
          notes: v.notes || null,
        },
        cooperativeId,
      );
      if (result) {
        onSaved(result);
        onClose();
      }
    } else {
      const result = await CreateBundling.handler({
        cooperativeId,
        plotId: v.plotId,
        subPlotId: v.subPlotId,
        enfundadorUserId: v.enfundadorUserId,
        quantity: v.quantity,
        bundledAt: v.bundledAt,
        ribbonColorFree: v.ribbonColorFree,
        notes: v.notes || undefined,
        localUuid: crypto.randomUUID(),
      });
      if (result) {
        onSaved(result);
        onClose();
      }
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={tryClose}
        title={isEditing ? 'Editar enfunde' : 'Registrar enfunde'}
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={tryClose}
              disabled={isLoading}
              className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-[transform,background-color] duration-160 ease-out hover:bg-gray-50 active:scale-[0.97] disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="bundling-form"
              disabled={isLoading}
              className="cursor-pointer rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] active:scale-[0.97] disabled:opacity-60"
            >
              {isLoading ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Registrar'}
            </button>
          </>
        }
      >
        <form id="bundling-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="plotId"
            control={control}
            render={({ field }) => (
              <Select
                label="Parcela"
                required
                isDisabled={isEditing}
                error={errors.plotId?.message}
                options={plotOptions}
                value={plotOptions.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => {
                  const newId = (opt as IOption | null)?.value ?? '';
                  if (newId !== field.value) {
                    setValue('subPlotId', undefined);
                  }
                  field.onChange(newId);
                }}
                placeholder="Seleccionar parcela..."
              />
            )}
          />

          {hasSubPlots && (
            <Controller
              name="subPlotId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Subparcela"
                  required
                  error={errors.subPlotId?.message}
                  options={subPlotOptions}
                  value={subPlotOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(opt) => field.onChange((opt as IOption | null)?.value ?? undefined)}
                  placeholder="Seleccionar subparcela..."
                />
              )}
            />
          )}

          {!!users.length && (
            <Controller
              name="enfundadorUserId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Enfundador"
                  required
                  isDisabled={isEditing}
                  error={errors.enfundadorUserId?.message}
                  options={userOptions}
                  value={userOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(opt) => field.onChange((opt as IOption | null)?.value ?? '')}
                  placeholder="Seleccionar enfundador..."
                />
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha"
              required
              type="date"
              max={todayIso()}
              error={errors.bundledAt?.message}
              {...register('bundledAt')}
            />
            <Input
              label="Cantidad de fundas"
              required
              type="number"
              inputMode="numeric"
              min={1}
              max={99999}
              placeholder="0"
              error={errors.quantity?.message}
              {...register('quantity', { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700">
              Color de cinta <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {RIBBON_COLORS.map((color) => (
                <label key={color} className="cursor-pointer">
                  <input type="radio" value={color} {...register('ribbonColorFree')} className="peer sr-only" />
                  <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-transparent p-2 transition-colors peer-checked:border-[#27ae60] peer-checked:bg-[#27ae60]/5">
                    <span
                      className="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: RIBBON_COLOR_HEX[color] }}
                    />
                    <span className="text-center text-[10px] font-medium text-gray-600">
                      {RIBBON_COLOR_LABELS[color]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errors.ribbonColorFree && (
              <p className="mt-1 text-xs text-red-500">{errors.ribbonColorFree.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Observaciones <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Mal clima, producción reducida…"
              {...register('notes')}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20"
            />
            {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>}
          </div>
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
