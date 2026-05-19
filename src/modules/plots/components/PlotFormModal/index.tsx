'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useCreatePlot } from '../../hooks/useCreatePlot';
import { useUpdatePlot } from '../../hooks/useUpdatePlot';
import { useGetPlot } from '../../hooks/useGetPlot';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { Modal } from '@/@common/components/modals/Modal';
import { ConfirmCloseDialog } from '@/@common/components/modals/ConfirmCloseDialog';
import { Input } from '@/@common/components/form/Input';
import { Select } from '@/@common/components/form/Select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { IOption } from '@/@common/types/IOption';
import type { SectorResponse } from '@/modules/sectors/services/sector.service';
import type { UserResponse } from '@/modules/users/services/user.service';
import type { PlotResponse } from '../../services/plot.service';
import { PLOT_FORM_DEFAULT_VALUES, PlotFormValues } from './constants';
import { FormFieldset } from '@/@common/components/form/FormFieldset';

interface PlotFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (plot: PlotResponse) => void;
  plot?: PlotResponse;
  sectors: SectorResponse[];
  users: UserResponse[];
  defaultSectorId?: string;
  /** When true, hides sector/owner fields and auto-fills ownerUserId with currentUserId. */
  isIndependentFarmer?: boolean;
  currentUserId?: string;
}

export const PlotFormModal = ({
  open,
  onClose,
  onSaved,
  plot,
  sectors,
  users,
  defaultSectorId,
  isIndependentFarmer = false,
  currentUserId,
}: PlotFormModalProps) => {
  const isEdit = !!plot;
  const { handler: createPlot, loading: creating } = useCreatePlot();
  const { handler: updatePlot, loading: updating } = useUpdatePlot();
  const { handler: fetchFullPlot, loading: fetching } = useGetPlot();
  const showSubPlots = useBoolean();
  const showConfirmClose = useBoolean();

  const isSaving = creating || updating;
console.log(isSaving);

  const sectorOptions = useMemo(() =>
    sectors.map((s) => ({ value: s.id, label: s.name })), [sectors]);

  const userOptions = useMemo(() =>
    users.map((u) => ({ value: u.id, label: u.fullName })), [users]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<PlotFormValues>({ defaultValues: PLOT_FORM_DEFAULT_VALUES });

  const {
    fields: subPlotFields,
    append: appendSubPlotField,
    remove: removeSubPlotField,
  } = useFieldArray({ control, name: 'subPlots' });

  useEffect(() => {
    if (!open) return;

    const loadFormData = async () => {
      if (isEdit && plot?.id) {
        const fullData = await fetchFullPlot(plot.id);

        if (fullData) {
          if ((fullData.subPlots?.length ?? 0) > 0) showSubPlots.on();
          else showSubPlots.off();

          reset({
            name: fullData.name,
            sectorId: fullData.sector.id,
            ownerUserId: fullData.ownerUser.id,
            workerUserId: fullData.workerUser?.id ?? '',
            areaHectares: String(fullData.areaHectares),
            cadastralCode: fullData.cadastralCode ?? '',
            subPlots: (fullData.subPlots ?? []).map((m) => ({
              id: m.id,
              name: m.name,
              areaHectares: String(m.areaHectares),
              responsibleUserId: m.responsibleUserId ?? '',
            })),
          });
        }
      } else {
        showSubPlots.off();
        reset({
          ...PLOT_FORM_DEFAULT_VALUES,
          sectorId: defaultSectorId ?? '',
          ownerUserId: isIndependentFarmer ? (currentUserId ?? '') : '',
        });
      }
    };

    loadFormData();
  }, [open, plot?.id, reset]);

  const tryClose = () => {
    if (isDirty) {
      showConfirmClose.on();
    } else {
      onClose();
    }
  };

  const onSubmit = async (v: PlotFormValues) => {
    const payloadSubPlots = showSubPlots.active
      ? v.subPlots.map((s) => ({
          id: s.id,
          name: s.name.trim(),
          areaHectares: parseFloat(s.areaHectares),
          responsibleUserId: s.responsibleUserId || undefined,
        }))
      : undefined;

    const ownerUserId = isIndependentFarmer ? (currentUserId ?? '') : v.ownerUserId;

    const commonData = {
      name: v.name.trim(),
      sectorId: v.sectorId || undefined,
      ownerUserId,
      workerUserId: v.workerUserId || (isEdit ? null : undefined),
      areaHectares: parseFloat(v.areaHectares),
      cadastralCode: v.cadastralCode.trim() || (isEdit ? null : undefined),
      subPlots: payloadSubPlots,
    };

    const result = isEdit
      ? await updatePlot(plot!.id, commonData)
      : await createPlot({
          ...commonData,
          workerUserId: commonData.workerUserId ?? undefined,
          cadastralCode: commonData.cadastralCode ?? undefined,
        });

    if (result) {
      onSaved(result);
      onClose();
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={tryClose}
        title={isEdit ? 'Editar parcela' : 'Nueva parcela'}
        footer={
          <div className="flex w-full sm:w-auto justify-end gap-2 px-1 pb-1">
            <Button
              variant="outline"
              onClick={tryClose}
              disabled={isSaving || fetching}
              className="flex-1 sm:flex-none h-11 sm:h-9 sm:px-4"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="plot-form"
              disabled={isSaving || fetching}
              isLoading={isSaving}
              className="flex-1 sm:flex-none h-11 sm:h-9 sm:px-4"
            >
              {isEdit ? 'Guardar cambios' : 'Crear parcela'}
            </Button>
          </div>
        }
      >
        <FormFieldset
          id="plot-form"
          onSubmit={handleSubmit(onSubmit)}
          isLoading={fetching}
          disabled={isSaving}
        >
          <Input
            label="Nombre de la parcela"
            placeholder="Ingrese el nombre"
            autoFocus
            error={errors.name?.message}
            {...register('name', { required: 'Campo requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isIndependentFarmer && (
              <Controller
                name="sectorId"
                control={control}
                rules={{ required: 'Selecciona un sector' }}
                render={({ field }) => (
                  <Select
                    label="Sector"
                    isDisabled={isSaving}
                    error={errors.sectorId?.message}
                    options={sectorOptions}
                    value={sectorOptions.find((o) => o.value === field.value) ?? null}
                    onChange={(opt) => field.onChange((opt as IOption)?.value ?? '')}
                    menuPortalTarget={document.getElementById('overlays')}
                  />
                )}
              />
            )}

            {!isIndependentFarmer && (
              <Controller
                name="ownerUserId"
                control={control}
                rules={{ required: 'Selecciona un propietario' }}
                render={({ field }) => (
                  <Select
                    label="Propietario"
                    isDisabled={isSaving}
                    error={errors.ownerUserId?.message}
                    options={userOptions}
                    value={userOptions.find((o) => o.value === field.value) ?? null}
                    onChange={(opt) => field.onChange((opt as IOption)?.value ?? '')}
                  />
                )}
              />
            )}
          </div>

          {!isIndependentFarmer && (
            <Controller
              name="workerUserId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Arrendatario"
                  isDisabled={isSaving}
                  isClearable
                  options={userOptions}
                  value={userOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(opt) => field.onChange((opt as IOption)?.value ?? '')}
                  placeholder="Sin asignar"
                />
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Área (ha)"
              placeholder="0"
              type="number"
              step="0.0001"
              error={errors.areaHectares?.message}
              {...register('areaHectares', {
                required: 'Requerido',
                min: { value: 0.0001, message: 'Debe ser mayor a 0' },
              })}
            />
            <Input
              label="Cód. catastral"
              placeholder="Ingresa el código"
              isOptional
              {...register('cadastralCode')}
            />
          </div>

          <div className="flex items-center space-x-2 border-t pt-4">
            <Checkbox
              id="show-subplots"
              checked={showSubPlots.active}
              onCheckedChange={(v) => showSubPlots.set(!!v)}
            />
            <label htmlFor="show-subplots" className="text-sm font-medium leading-none cursor-pointer">
              Agregar sub divisiones
            </label>
          </div>

          {showSubPlots.active && (
            <div className="rounded-lg border bg-gray-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-500">Sub divisiones de terreno</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSubPlotField({ name: '', areaHectares: '', responsibleUserId: '' })}
                >
                  <Plus className="mr-1 h-3 w-3" /> Añadir
                </Button>
              </div>

              {subPlotFields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-[1fr_100px_1fr_auto] gap-2 items-start">
                  <Input
                    placeholder="Nombre"
                    error={errors.subPlots?.[i]?.name?.message}
                    {...register(`subPlots.${i}.name`, { required: 'Requerido' })}
                  />
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Área"
                    error={errors.subPlots?.[i]?.areaHectares?.message}
                    {...register(`subPlots.${i}.areaHectares`, {
                      required: 'Requerido',
                      min: { value: 0.0001, message: 'Debe ser mayor a 0' },
                    })}
                  />
                  <Controller
                    name={`subPlots.${i}.responsibleUserId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={userOptions}
                        isDisabled={isSaving}
                        isClearable
                        menuPosition="fixed"
                        value={userOptions.find((o) => o.value === field.value) ?? null}
                        onChange={(opt) => field.onChange((opt as IOption)?.value ?? '')}
                        placeholder="Titular"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubPlotField(i)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </FormFieldset>
      </Modal>

      {showConfirmClose.active && (
        <ConfirmCloseDialog
          onConfirm={() => { showConfirmClose.off(); onClose(); }}
          onCancel={showConfirmClose.off}
        />
      )}
    </>
  );
};
