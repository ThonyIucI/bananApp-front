// import { z } from 'zod';
import { forwardZodIssues, z } from '@/@common/utils/zod-config';
import { RIBBON_COLORS } from '@/@common/constants/ribbon-colors';
import { todayIso } from '@/@common/utils/date';

/** Schema for a single subplot row in multi-mode submit. */
const baseFields = {
  plotId: z.uuid('Selecciona una parcela'),
  subPlotId: z.uuid('Selecciona una subparcela').optional(),
  enfundadorUserId: z.uuid('Selecciona un enfundador'),
  notes: z.string().max(500).optional(),
  localUuid: z.uuid(),
  bundledAt: z.string().refine((d) => d <= todayIso(), 'La fecha no puede ser futura'),
};

export const subPlotEntryRowSchema = z.discriminatedUnion("included", [
  z.object({
    included: z.literal(true),
    quantity: z.coerce.number().int().min(1).max(99999),
    ribbonColorFree: z.enum(RIBBON_COLORS),
    ...baseFields,
  }),
  z.object({
    included: z.literal(false),
    quantity: z.coerce.number().optional(),
    ribbonColorFree: z.enum(RIBBON_COLORS).optional().nullable(),
    ...baseFields,
  }),
]);

export const createBundlingSchema = z
  .object({
    plotId: z.uuid('Selecciona una parcela'),
    subPlotId: z.uuid().optional(),
    enfundadorUserId: z.uuid('Selecciona un enfundador'),
    notes: z.string().max(500).optional(),
    quantity: z.coerce
      .number()
      .optional(),
    ribbonColorFree: z.enum(RIBBON_COLORS).optional(),
    bundledAt: z
      .string()
      .min(1, 'La fecha es requerida')
      .refine((d) => d <= todayIso(), 'La fecha no puede ser futura'),

    // Multi modo
    hasSubPlots: z.boolean().nullish().default(false),
    subPlotEntries: z.array(subPlotEntryRowSchema).optional().default([]),
  })
  .superRefine((v, ctx) => {
    // MODO MULTI: Solo validamos que haya algo marcado
    if (v.hasSubPlots) {
      const hasSubIncludes = v.subPlotEntries.some((e) => e.included);
      if (!hasSubIncludes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecciona al menos una subparcela de la lista',
          path: ['subPlotEntries'],
        });
      }
    } else {
      const qResult = z.coerce.number().int().min(1).max(99999).safeParse(v.quantity);
      forwardZodIssues(qResult, ctx, ['quantity']);

      const cResult = z.enum(RIBBON_COLORS).safeParse(v.ribbonColorFree);
      forwardZodIssues(cResult, ctx, ['ribbonColorFree']);
    }
  });
export type CreateBundlingFormValues = z.input<typeof createBundlingSchema>;
export type CreateBundlingFormOutput = z.output<typeof createBundlingSchema>;
export type SubPlotEntryRowValues = z.input<typeof subPlotEntryRowSchema>;
