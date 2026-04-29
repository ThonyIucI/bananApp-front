'use client';

import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/@common/components/form/Input';
import { RIBBON_COLORS, RIBBON_COLOR_HEX, RIBBON_COLOR_LABELS } from '@/@common/constants/ribbon-colors';
import type { RibbonColor } from '@/@common/constants/ribbon-colors';
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

/**
 * A single row in the multi-subplot bundling form.
 * Contains a checkbox (include/exclude), quantity input, color swatch picker,
 * and a collapsible notes field.
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
        'rounded-xl border border-gray-200 bg-white p-3 transition-opacity duration-150',
        !included && 'opacity-40',
      )}
    >
      {/* ── Row header: checkbox + name + area + notes toggle ─────────────── */}
      <div className="flex items-center gap-2">
        <Controller
          name={`subPlotEntries.${index}.included`}
          control={control}
          render={({ field }) => (
            <Checkbox
              id={`row-${index}-included`}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isLoading}
              className="cursor-pointer"
            />
          )}
        />

        <label
          htmlFor={`row-${index}-included`}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 select-none"
        >
          <span className="truncate text-sm font-medium text-gray-800">{subPlot.name}</span>
          <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
            {Number(subPlot.areaHectares).toFixed(2)} ha
          </span>
        </label>

        {/* Notes toggle */}
        <button
          type="button"
          onClick={showNotes.toggle}
          disabled={!included || isLoading}
          aria-label={showNotes.active ? 'Ocultar notas' : 'Añadir comentario'}
          className={cn(
            'flex items-center gap-0.5 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none',
            showNotes.active && 'bg-gray-100 text-gray-600',
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {showNotes.active ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* ── Quantity + color ──────────────────────────────────────────────── */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <Input
          label="Cantidad"
          type="number"
          inputMode="numeric"
          min={1}
          max={99999}
          placeholder="0"
          disabled={!included || isLoading}
          error={(rowErrors as Record<string, { message?: string }> | undefined)?.['quantity']?.message}
          {...register(`subPlotEntries.${index}.quantity`, { valueAsNumber: true })}
        />

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Color de cinta <span className="text-red-500">*</span>
          </label>
          <Controller
            name={`subPlotEntries.${index}.ribbonColorFree`}
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-1.5">
                {RIBBON_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    disabled={!included || isLoading}
                    title={RIBBON_COLOR_LABELS[color]}
                    aria-label={RIBBON_COLOR_LABELS[color]}
                    className={cn(
                      'h-6 w-6 rounded-full border-2 transition-transform duration-100 active:scale-90 disabled:pointer-events-none',
                      field.value === color
                        ? 'border-[#27ae60] scale-110 shadow-sm'
                        : 'border-black/10 hover:border-gray-400',
                    )}
                    style={{ backgroundColor: RIBBON_COLOR_HEX[color as RibbonColor] }}
                  />
                ))}
              </div>
            )}
          />
          {(rowErrors as Record<string, { message?: string }> | undefined)?.['ribbonColorFree']?.message && (
            <p className="mt-1 text-xs text-red-500">
              {(rowErrors as Record<string, { message?: string }>)['ribbonColorFree']?.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Collapsible notes ─────────────────────────────────────────────── */}
      {showNotes.active && included && (
        <div className="mt-2.5">
          <textarea
            rows={2}
            placeholder="Observaciones de esta subparcela…"
            disabled={isLoading}
            {...register(`subPlotEntries.${index}.notes`)}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20 disabled:opacity-60"
          />
        </div>
      )}
    </div>
  );
};
