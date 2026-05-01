'use client';

import { MessageSquare, ChevronDown, ChevronUp, MinusCircle } from 'lucide-react';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { Input } from '@/@common/components/form/Input';
import { Select } from '@/@common/components/form/Select';
import { RIBBON_COLORS, RIBBON_COLOR_HEX, RIBBON_COLOR_LABELS } from '@/@common/constants/ribbon-colors';
import type { RibbonColor } from '@/@common/constants/ribbon-colors';
import type { IOption } from '@/@common/types/IOption';
import type { SubPlotResponse } from '@/modules/plots/services/plot.service';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import type { CreateBundlingFormValues } from '../../../schemas/create-bundling.schema';
import { cn } from '@/lib/utils';

interface SubPlotEntryRowProps {
  /** Position in the subPlotEntries field array. */
  index: number;
  subPlot: SubPlotResponse;
  control: Control<CreateBundlingFormValues>;
  register: UseFormRegister<CreateBundlingFormValues>;
  errors: FieldErrors<CreateBundlingFormValues>;
  isLoading: boolean;
}

const colorOptions: IOption[] = RIBBON_COLORS.map((color) => ({
  value: color,
  label: RIBBON_COLOR_LABELS[color as RibbonColor],
}));

/** Renders the option label for the color select — colored dot + name. */
const formatColorOption = (opt: IOption) => (
  <div className="flex items-center gap-2">
    <span
      className="h-3 w-3 shrink-0 rounded-full border border-black/10"
      style={{ backgroundColor: RIBBON_COLOR_HEX[opt.value as RibbonColor] }}
    />
    <span>{opt.label}</span>
  </div>
);

/**
 * A single row in the multi-subplot bundling form.
 * Toggle (pill switch) includes/excludes the subplot. When excluded, inputs collapse and
 * a "Sin enfunde" indicator is shown.
 */
export const SubPlotEntryRow = ({
  index,
  subPlot,
  control,
  register,
  errors,
  isLoading,
}: SubPlotEntryRowProps) => {
  const showNotes = useBoolean();

  const included = useWatch({
    control,
    name: `subPlotEntries.${index}.included`,
  });
  const rowErrors = (errors.subPlotEntries as FieldErrors[] | undefined)?.[index];

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-150',
        included ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50',
      )}
    >
      {/* ── Row header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 p-3">
        {/* Toggle pill */}
        <Controller
          name={`subPlotEntries.${index}.included`}
          control={control}
          render={({ field }) => (
            <button
              type="button"
              role="switch"
              aria-checked={field.value}
              disabled={isLoading}
              onClick={() => field.onChange(!field.value)}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 disabled:pointer-events-none',
                field.value ? 'bg-[#27ae60]' : 'bg-gray-200',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200',
                  field.value ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          )}
        />

        <div className="flex justify-between min-w-0 flex-1 items-center gap-1.5">
          <span
            className={cn(
              'truncate text-sm font-medium',
              included ? 'text-gray-800' : 'text-gray-400',
            )}
          >
            {subPlot.name}
          </span>
          {!included && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
              <MinusCircle className="h-3.5 w-3.5" />
              Sin enfunde
            </span>
          )}
        </div>

        {/* Notes toggle — only when included */}
        {included && (
          <button
            type="button"
            onClick={showNotes.toggle}
            disabled={isLoading}
            aria-label={showNotes.active ? 'Ocultar notas' : 'Añadir comentario'}
            className={cn(
              'flex items-center gap-0.5 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none',
              showNotes.active && 'bg-gray-100 font-bold text-gray-600',
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {showNotes.active ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* ── Quantity + color (only when included) ────────────────────────── */}
      {included && (
        <div className="px-3 pb-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Cantidad"
              type="number"
              inputMode="numeric"
              placeholder="0"
              disabled={isLoading}
              error={(rowErrors as Record<string, { message?: string }> | undefined)?.['quantity']?.message}
              {...register(`subPlotEntries.${index}.quantity`, { valueAsNumber: true })}
            />
            <Controller
              name={`subPlotEntries.${index}.ribbonColorFree`}
              control={control}
              render={({ field }) => (
                <Select
                  label="Color de cinta"
                  required
                  isDisabled={isLoading}
                  options={colorOptions}
                  value={colorOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(opt) => field.onChange((opt as IOption | null)?.value ?? '')}
                  formatOptionLabel={formatColorOption}
                  error={(rowErrors as Record<string, { message?: string }> | undefined)?.['ribbonColorFree']?.message}
                  placeholder="Color…"
                />
              )}
            />
          </div>

          {/* Collapsible notes */}
          {showNotes.active && (
            <textarea
              rows={2}
              placeholder="Observaciones de esta subparcela…"
              disabled={isLoading}
              {...register(`subPlotEntries.${index}.notes`)}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20 disabled:opacity-60"
            />
          )}
        </div>
      )}
    </div>
  );
};
