import { z } from 'zod';
import { RIBBON_COLORS } from '@/@common/constants/ribbon-colors';
export { RIBBON_COLOR_LABELS, RIBBON_COLOR_HEX } from '@/@common/constants/ribbon-colors';

const today = () => new Date().toISOString().split('T')[0];

/** Schema for a single subplot row in multi-mode submit. */
export const subPlotEntryRowSchema = z.object({
  subPlotId: z.string().uuid(),
  included: z.boolean(),
  quantity: z
    .number({ error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 funda')
    .max(99999, 'Máximo 99 999 fundas'),
  ribbonColorFree: z.enum(RIBBON_COLORS, { message: 'Selecciona un color' }),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
  localUuid: z.string().uuid(),
  enfundadorUserId: z.string().uuid(),
});

export const createBundlingSchema = z
  .object({
    plotId: z.string().uuid({ message: 'Selecciona una parcela' }),
    bundledAt: z
      .string()
      .min(1, 'La fecha es requerida')
      .refine((d) => d <= today(), 'La fecha no puede ser futura'),
    // Single mode:
    subPlotId: z.string().uuid().optional(),
    enfundadorUserId: z.string().uuid().optional(),
    quantity: z
      .number({ error: 'Debe ser un número' })
      .int('Debe ser un número entero')
      .min(1, 'Mínimo 1 funda')
      .max(99999, 'Máximo 99 999 fundas')
      .optional(),
    ribbonColorFree: z.enum(RIBBON_COLORS, { message: 'Selecciona un color de cinta' }).optional(),
    notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
    // Multi mode:
    subPlotEntries: z.array(subPlotEntryRowSchema).optional(),
    defaultEnfundadorUserId: z.string().uuid().optional(),
  })
  .superRefine((v, ctx) => {
    const isMulti = (v.subPlotEntries?.length ?? 0) > 0;
    if (isMulti) {
      const included = v.subPlotEntries!.filter((e) => e.included);
      if (included.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecciona al menos una subparcela',
          path: ['subPlotEntries'],
        });
      }
    } else {
      if (!v.enfundadorUserId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecciona un enfundador',
          path: ['enfundadorUserId'],
        });
      }
      if (!v.quantity || v.quantity < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mínimo 1 funda',
          path: ['quantity'],
        });
      }
      if (!v.ribbonColorFree) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecciona un color de cinta',
          path: ['ribbonColorFree'],
        });
      }
    }
  });

export type CreateBundlingFormValues = z.input<typeof createBundlingSchema>;
export type CreateBundlingFormOutput = z.output<typeof createBundlingSchema>;
export type SubPlotEntryRowValues = z.input<typeof subPlotEntryRowSchema>;
