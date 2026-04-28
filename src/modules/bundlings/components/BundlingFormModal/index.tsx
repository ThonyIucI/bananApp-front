'use client';

import { useEffect } from 'react';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
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
import type { PlotResponse } from '@/modules/plots/services/plot.service';
import { useGetPlot } from '@/modules/plots/hooks/useGetPlot';
import type { UserResponse } from '@/modules/users/services/user.service';
import type { BundlingResponse } from '../../services/bundling.service';
import { isBundlingArray } from '../../services/bundling.service';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { ConfirmCloseDialog } from '@/@common/components/modals/ConfirmCloseDialog';
import { SubPlotEntryRow } from './SubPlotEntryRow';

interface BundlingFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with one bundling (single mode) or an array (multi mode). */
  onSaved: (bundling: BundlingResponse | BundlingResponse[]) => void;
  plots: PlotResponse[];
  users: UserResponse[];
  /** ID of the currently logged-in user — auto-filled as enfundador for non-admins. */
  userId?: string;
  /** When true, shows the enfundador selector (admin/superadmin). */
  isAdmin?: boolean;
  cooperativeId?: string;
  bundling?: BundlingResponse;
}

/** Modal for registering (single or multi-subplot) or editing a bundling operation. */
export const BundlingFormModal = ({
  open,
  onClose,
  onSaved,
  plots,
  users,
  userId,
  isAdmin = false,
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

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isDirty, errors },
  } = useForm<CreateBundlingFormValues>({
    resolver: zodResolver(createBundlingSchema),
    defaultValues: {
      bundledAt: todayIso(),
      plotId: '',
      subPlotId: undefined,
      enfundadorUserId: '',
      notes: '',
      subPlotEntries: [],
      defaultEnfundadorUserId: '',
    },
  });

  const { fields, replace } = useFieldArray({ control, name: 'subPlotEntries' });

  const selectedPlotId = useWatch({ control, name: 'plotId' });
  const defaultEnfundadorUserId = useWatch({ control, name: 'defaultEnfundadorUserId' });
  const subPlotEntries = useWatch({ control, name: 'subPlotEntries' });

  const selectedListPlot = plots.find((p) => p.id === selectedPlotId);
  const hasSubPlots = (selectedListPlot?.subPlotsQuantity ?? 0) > 0;
  const isMultiMode = hasSubPlots && !isEditing;

  const subPlots = GetPlot.data?.subPlots ?? [];
  const includedCount = (subPlotEntries ?? []).filter((e) => e.included).length;

  // ── Load subplots when plot changes ─────────────────────────────────────────

  useEffect(() => {
    if (!selectedPlotId || !hasSubPlots) return;
    GetPlot.handler(selectedPlotId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlotId]);

  // ── Initialize rows when subplots load in multi mode ────────────────────────

  useEffect(() => {
    if (!isMultiMode || !subPlots.length) return;
    const enfundadorId = isAdmin
      ? (defaultEnfundadorUserId || userId || '')
      : (userId || '');

    replace(
      subPlots.map((sp) => ({
        subPlotId: sp.id,
        included: true,
        quantity: 0,
        ribbonColorFree: RIBBON_COLORS[0],
        notes: '',
        localUuid: crypto.randomUUID(),
        enfundadorUserId: enfundadorId,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subPlots]);

  // ── Propagate defaultEnfundadorUserId to all rows ───────────────────────────

  useEffect(() => {
    if (!isAdmin || !defaultEnfundadorUserId || !fields.length) return;
    fields.forEach((_, i) => {
      setValue(`subPlotEntries.${i}.enfundadorUserId`, defaultEnfundadorUserId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultEnfundadorUserId]);

  // ── Reset on open ────────────────────────────────────────────────────────────

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
        subPlotEntries: [],
        defaultEnfundadorUserId: '',
      });
    } else {
      reset({
        bundledAt: todayIso(),
        plotId: '',
        subPlotId: undefined,
        enfundadorUserId: isAdmin ? '' : (userId ?? ''),
        notes: '',
        subPlotEntries: [],
        defaultEnfundadorUserId: isAdmin ? (userId ?? '') : '',
      });
    }
  }, [open, bundling, userId, isAdmin, reset]);

  const tryClose = () => (isDirty ? showConfirm.on() : onClose());

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit = async (v: CreateBundlingFormValues) => {
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
      return;
    }

    if (isMultiMode && v.subPlotEntries?.length) {
      const includedEntries = v.subPlotEntries.filter((e) => e.included);
      const result = await CreateBundling.handler({
        cooperativeId,
        plotId: v.plotId,
        bundledAt: v.bundledAt,
        subPlotEntries: includedEntries.map((e) => ({
          subPlotId: e.subPlotId,
          enfundadorUserId: e.enfundadorUserId,
          quantity: e.quantity,
          localUuid: e.localUuid,
          ribbonColorFree: e.ribbonColorFree,
          notes: e.notes || undefined,
        })),
      });
      if (result) {
        onSaved(result);
        onClose();
      }
      return;
    }

    // Single mode
    const result = await CreateBundling.handler({
      cooperativeId,
      plotId: v.plotId,
      subPlotId: v.subPlotId,
      enfundadorUserId: v.enfundadorUserId ?? userId,
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
  };

  // ── Primary button label ──────────────────────────────────────────────────────

  const submitLabel = (() => {
    if (isLoading) return 'Guardando…';
    if (isEditing) return 'Guardar cambios';
    if (isMultiMode) return includedCount > 0 ? `Guardar ${includedCount} enfunde${includedCount !== 1 ? 's' : ''}` : 'Selecciona subparcelas';
    return 'Registrar';
  })();

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Modal
        open={open}
        onClose={tryClose}
        title={isEditing ? 'Editar enfunde' : 'Registrar enfunde'}
        maxWidth="md"
        footer={
          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={tryClose}
              disabled={isLoading}
              className="flex-1 cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-[transform,background-color] duration-160 ease-out hover:bg-gray-50 active:scale-[0.97] disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="bundling-form"
              disabled={isLoading || (isMultiMode && includedCount === 0 && fields.length > 0)}
              className="flex-1 cursor-pointer rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] active:scale-[0.97] disabled:opacity-60"
            >
              {submitLabel}
            </button>
          </div>
        }
      >
        <form id="bundling-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ── Plot select ────────────────────────────────────────────── */}
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
                  if (newId !== field.value) replace([]);
                  field.onChange(newId);
                }}
                placeholder="Seleccionar parcela..."
              />
            )}
          />

          {/* ── Date ──────────────────────────────────────────────────── */}
          <Input
            label="Fecha"
            required
            type="date"
            max={todayIso()}
            error={errors.bundledAt?.message}
            {...register('bundledAt')}
          />

          {/* ── MULTI MODE: admin enfundador header + subplot rows ─────── */}
          {isMultiMode && fields.length > 0 && (
            <>
              {isAdmin && (
                <Controller
                  name="defaultEnfundadorUserId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Enfundador"
                      required
                      error={errors.defaultEnfundadorUserId?.message}
                      options={userOptions}
                      value={userOptions.find((o) => o.value === field.value) ?? null}
                      onChange={(opt) => field.onChange((opt as IOption | null)?.value ?? '')}
                      placeholder="Seleccionar enfundador..."
                    />
                  )}
                />
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Subparcelas de &ldquo;{selectedListPlot?.name}&rdquo;
                </p>
                <div className="space-y-2">
                  {fields.map((field, i) => {
                    const sp = subPlots.find((s) => s.id === field.subPlotId);
                    if (!sp) return null;
                    return (
                      <SubPlotEntryRow
                        key={field.id}
                        index={i}
                        subPlot={sp}
                        control={control}
                        register={register}
                        errors={errors}
                        isLoading={isLoading}
                      />
                    );
                  })}
                </div>
                {errors.subPlotEntries && !Array.isArray(errors.subPlotEntries) && (
                  <p className="mt-1 text-xs text-red-500">
                    {(errors.subPlotEntries as { message?: string }).message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── SINGLE MODE fields ────────────────────────────────────── */}
          {!isMultiMode && (
            <>
              {hasSubPlots && (
                <Controller
                  name="subPlotId"
                  control={control}
                  render={({ field }) => {
                    const subPlotOptions: IOption[] = subPlots.map((sp) => ({
                      value: sp.id,
                      label: sp.name,
                    }));
                    return (
                      <Select
                        label="Subparcela"
                        required
                        error={(errors.subPlotId as { message?: string } | undefined)?.message}
                        options={subPlotOptions}
                        value={subPlotOptions.find((o) => o.value === field.value) ?? null}
                        onChange={(opt) =>
                          field.onChange((opt as IOption | null)?.value ?? undefined)
                        }
                        placeholder="Seleccionar subparcela..."
                      />
                    );
                  }}
                />
              )}

              {(isAdmin || isEditing) && !!users.length && (
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

              {/* Color picker */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Color de cinta <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {RIBBON_COLORS.map((color) => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="radio"
                        value={color}
                        {...register('ribbonColorFree')}
                        className="peer sr-only"
                      />
                      <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-transparent p-2 transition-colors peer-checked:border-[#27ae60] peer-checked:bg-[#27ae60]/5">
                        <span
                          className="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: RIBBON_COLOR_HEX[color as RibbonColor] }}
                        />
                        <span className="text-center text-[10px] font-medium text-gray-600">
                          {RIBBON_COLOR_LABELS[color as RibbonColor]}
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
                {errors.notes && (
                  <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>
                )}
              </div>
            </>
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
