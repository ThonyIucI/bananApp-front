'use client';

import { useEffect } from 'react';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ListChecks, Package2, TriangleAlert } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { FormFieldset } from '@/@common/components/form/FormFieldset';
import type { IOption } from '@/@common/types/IOption';
import { useGetPlot } from '@/modules/plots/hooks/useGetPlot';
import type { UserResponse } from '@/modules/users/services/user.service';
import type { BundlingResponse } from '../../services/bundling.service';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { ConfirmCloseDialog } from '@/@common/components/modals/ConfirmCloseDialog';
import { SubPlotEntryRow } from './SubPlotEntryRow';
import type { UserPlotResponse } from '@/modules/users/services/user-plot.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle } from '@/components/ui/alert';

interface BundlingFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with one bundling (single mode) or an array (multi mode). */
  onSaved: (bundling: BundlingResponse | BundlingResponse[]) => void;
  plots: UserPlotResponse[];
  users: UserResponse[];
  /** ID of the currently logged-in user — auto-filled as enfundador for non-admins. */
  userId?: string;
  /** When true, shows the enfundador selector (admin/superadmin). */
  isAdmin?: boolean;
  cooperativeId?: string;
  bundling?: BundlingResponse;
}

const buildDefaultEnfundadorId = (isAdmin: boolean, userId?: string) =>
  isAdmin ? '' : (userId ?? '');
const defaultValues = {
  bundledAt: todayIso(),
  plotId: '',
  subPlotId: undefined,
  ribbonColorFree: undefined,
  notes: '',
  subPlotEntries: [],
};
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
  const isSaving = CreateBundling.loading || UpdateBundling.loading;

  const plotOptions: IOption[] = plots.map((p) => ({
    value: p.plot.id,
    label: `${p.plot.name} — ${p.plot.sector.name}`,
  }));
  const userOptions: IOption[] = users.map((u) => ({ value: u.id, label: u.fullName }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { isDirty, errors },
  } = useForm<CreateBundlingFormValues>({
    resolver: zodResolver(createBundlingSchema),
    defaultValues: {
      ...defaultValues,
      enfundadorUserId: buildDefaultEnfundadorId(isAdmin, userId),
    },
  });

  const {
    fields: subPlotFields,
    replace: replaceSubPlotFields,
  } = useFieldArray({ control, name: 'subPlotEntries' });

  const subPlotEntries = useWatch({ control, name: 'subPlotEntries' });

  const isMultiMode = !isEditing && !!GetPlot.data?.subPlots?.length;

  const includedCount = (subPlotEntries ?? []).filter((e) => e.included).length;
  const totalFundas = (subPlotEntries ?? [])
    .filter((e) => e.included)
    .reduce((sum, e) => sum + (e.quantity as number || 0), 0);

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
      });
    } else {
      reset({
        ...defaultValues,
        enfundadorUserId: buildDefaultEnfundadorId(isAdmin, userId),
      });
    }
  }, [open, bundling, userId, isAdmin, reset]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const tryClose = () => (isDirty ? showConfirm.on() : onClose());

  /** Propagates the selected enfundador to all subplot rows (multi mode). */
  const handleEnfundadorChange = (enfundadorId: string) => {
    setValue('enfundadorUserId', enfundadorId, { shouldDirty: true });
    subPlotFields.forEach((_, i) => {
      setValue(`subPlotEntries.${i}.enfundadorUserId`, enfundadorId);
    });
  };

  /** Fetches plot detail and initialises subplot rows when a plot is selected. */
  const handlePlotChange = async (newPlotId: string) => {
    setValue('plotId', newPlotId, { shouldDirty: true, shouldValidate: true });
    replaceSubPlotFields([]);

    const plotData = await GetPlot.handler(newPlotId);
    const hasSubPlots = !!plotData?.subPlots?.length;
    setValue('hasSubPlots', hasSubPlots, { shouldDirty: true });

    if (!plotData?.subPlots?.length) return;

    const enfundadorId = getValues('enfundadorUserId') || userId || '';
    replaceSubPlotFields(
      plotData?.subPlots?.map((sp) => ({
        included: true,
        plotId: newPlotId,
        subPlotId: sp.id,
        enfundadorUserId: enfundadorId,
        quantity: 0,
        ribbonColorFree: RIBBON_COLORS[0],
        localUuid: crypto.randomUUID(),
        bundledAt: todayIso(),
        notes: '',
      })),
    );
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = async (v: CreateBundlingFormValues) => {
    if (isEditing) {
      const result = await UpdateBundling.handler(
        bundling.id,
        {
          subPlotId: v.subPlotId ?? null,
          quantity: (v.quantity ?? 0) as number,
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
      if (includedEntries.length === 0) return;
      const results: BundlingResponse[] = [];
      for (const entry of includedEntries) {
        const result = await CreateBundling.handler({
          cooperativeId,
          plotId: v.plotId,
          bundledAt: v.bundledAt,
          subPlotId: entry.subPlotId,
          enfundadorUserId: entry.enfundadorUserId,
          quantity: entry.quantity as number,
          localUuid: entry.localUuid,
          ribbonColorFree: entry.ribbonColorFree,
          notes: entry.notes || undefined,
        });
        if (result === null) return;
        results.push(result);
      }
      onSaved(results);
      onClose();
      return;
    }

    // Single mode
    const result = await CreateBundling.handler({
      cooperativeId,
      plotId: v.plotId,
      subPlotId: v.subPlotId,
      enfundadorUserId: v.enfundadorUserId ?? userId,
      quantity: (v.quantity ?? 0) as number,
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

  // ── Submit button label ───────────────────────────────────────────────────────

  const getSunmitLabel= () => {
    if (isEditing) return 'Guardar cambios';
    if (isMultiMode) {
      return includedCount > 0
        ? `Guardar ${includedCount} enfunde${includedCount !== 1 ? 's' : ''}`
        : 'Selecciona subparcelas';
    }
    return 'Registrar';
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Modal
        open={open}
        onClose={tryClose}
        title={isEditing ? 'Editar enfunde' : 'Registrar enfunde'}
        maxWidth="md"
        footer={
          <div className="flex w-full sm:w-auto justify-end gap-2 px-1 pb-1">
            <Button
              type="button"
              variant="outline"
              onClick={tryClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none h-11 sm:h-9 sm:px-4"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="bundling-form"
              disabled={isSaving}
              isLoading={isSaving}
              className="flex-1 sm:flex-none h-11 sm:h-9 sm:px-4"
            >
              {getSunmitLabel()}
            </Button>
          </div>
        }
      >
        <FormFieldset
          id="bundling-form"
          onSubmit={handleSubmit(onSubmit)}
          disabled={isSaving}
        >
          {/* ── Plot + Fecha/Cantidad ─────────────────────────────────────── */}
          <Controller
            name="plotId"
            control={control}
            render={() => (
              <Select
                label="Parcela"
                isDisabled={isEditing}
                error={errors.plotId?.message}
                options={plotOptions}
                value={plotOptions.find((o) => o.value === getValues('plotId')) ?? null}
                onChange={(opt) => {
                  const newId = (opt as IOption | null)?.value ?? '';
                  if (newId) handlePlotChange(newId);
                }}
                placeholder="Seleccionar parcela..."
              />
            )}
          />
          {GetPlot.loading ?
            <Skeleton className='h-15' /> :
            <div className={isMultiMode ? '' : 'grid grid-cols-2 gap-3'}>
              <Input
                label="Fecha"
                type="date"
                max={todayIso()}
                error={errors.bundledAt?.message}
                {...register('bundledAt')}
              />
              {!isMultiMode && (
                <Input
                  label="Cantidad de fundas"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  error={errors.quantity?.message}
                  {...register('quantity')}
                />
              )}
            </div>}

          {/* ── Enfundador: admin only, aplica a todas las filas en multi ── */}
          {isAdmin && !!users.length && (
            <Controller
              name="enfundadorUserId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Enfundador"
                  isDisabled={isEditing}
                  error={errors.enfundadorUserId?.message}
                  options={userOptions}
                  value={userOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(opt) => handleEnfundadorChange((opt as IOption | null)?.value ?? '')}
                  placeholder="Seleccionar enfundador..."
                />
              )}
            />
          )}

          {/* ── Multi mode: subplot rows ──────────────────────────────────── */}
          {isMultiMode && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Detalles
                </p>
                {subPlotFields.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Badge variant='outline' className='text-sm h-6'>
                      <ListChecks className="h-3.5 w-3.5 text-[#27ae60]" />
                      {includedCount} lote{includedCount !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant='outline' className='text-sm h-6 border-primary'>
                      <Package2 className="h-3.5 w-3.5 text-[#27ae60]" />
                      {totalFundas.toLocaleString()} fundas
                    </Badge>
                  </div>
                )}
              </div>
              {!GetPlot.loading && getValues('hasSubPlots') && errors.subPlotEntries && includedCount === 0 && subPlotFields.length > 0 && (
                <Alert className="w-full mb-2 " variant='warning'>
                  <TriangleAlert />
                  <AlertTitle>{errors.subPlotEntries?.root?.message || 'Debe seleccionar al menos un sub lote'}</AlertTitle>
                </Alert>
              )}
              <div className="space-y-2">
                {subPlotFields.map((field, i) => {
                  const subPlot = GetPlot.data?.subPlots?.find((s) => s.id === field.subPlotId);
                  if (!subPlot) return null;
                  return (
                    <SubPlotEntryRow
                      key={field.id}
                      index={i}
                      subPlot={subPlot}
                      control={control}
                      register={register}
                      errors={errors}
                      isLoading={isSaving}
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
          )}

          {/* ── Single mode: ribbon color + notes ────────────────────────── */}
          {GetPlot.loading ?
            <Skeleton className='aspect-video' /> :
            <>
              {!isMultiMode && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Color de cinta
                    </label>
                    <div className="grid grid-cols-6 gap-1">
                      {RIBBON_COLORS.map((color) => (
                        <label key={color} className="cursor-pointer">
                          <input
                            type="radio"
                            value={color}
                            {...register('ribbonColorFree')}
                            className="peer sr-only"
                          />
                          <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-transparent p-1 transition-colors peer-checked:border-[#27ae60] peer-checked:bg-[#27ae60]/5">
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
                    <label className="flex justify-between mb-1 text-sm font-medium text-gray-700">
                      Observaciones <Badge variant="secondary" className='text-sm'>Opcional</Badge>
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
            </>
          }
        </FormFieldset>
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
