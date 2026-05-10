import { forwardZodIssues, customZ } from '@/@common/utils/zod-config';
import { RIBBON_COLORS } from '@/@common/constants/ribbon-colors';
import { todayIso } from '@/@common/utils/date';

/** Schema for a single subplot row in multi-mode submit. */
const baseFields = {
  plotId: customZ.uuid('Selecciona una parcela'),
  subPlotId: customZ.uuid('Selecciona una subparcela').optional(),
  enfundadorUserId: customZ.uuid('Selecciona un enfundador'),
  notes: customZ.string().max(500).optional(),
  localUuid: customZ.uuid(),
  bundledAt: customZ.string().refine((d) => d <= todayIso(), 'La fecha no puede ser futura'),
};

export const subPlotEntryRowSchema = customZ.discriminatedUnion("included", [
  customZ.object({
    included: customZ.literal(true),
    quantity: customZ.coerce.number().int().min(1).max(99999),
    ribbonColorFree: customZ.enum(RIBBON_COLORS),
    ...baseFields,
  }),
  customZ.object({
    included: customZ.literal(false),
    quantity: customZ.coerce.number().optional(),
    ribbonColorFree: customZ.enum(RIBBON_COLORS).optional().nullable(),
    ...baseFields,
  }),
]);

export const createBundlingSchema = customZ
  .object({
    plotId: customZ.uuid('Selecciona una parcela'),
    subPlotId: customZ.uuid().optional(),
    enfundadorUserId: customZ.uuid('Selecciona un enfundador'),
    notes: customZ.string().max(500).optional(),
    quantity: customZ.coerce
      .number()
      .optional(),
    ribbonColorFree: customZ.enum(RIBBON_COLORS).optional(),
    bundledAt: customZ
      .string()
      .min(1, 'La fecha es requerida')
      .refine((d) => d <= todayIso(), 'La fecha no puede ser futura'),

    // Multi modo
    hasSubPlots: customZ.boolean().nullish().default(false),
    subPlotEntries: customZ.array(subPlotEntryRowSchema).optional().default([]),
  })
  .superRefine((v, ctx) => {
    // MODO MULTI: Solo validamos que haya algo marcado
    if (v.hasSubPlots) {
      const hasSubIncludes = v.subPlotEntries.some((e) => e.included);
      if (!hasSubIncludes) {
        ctx.addIssue({
          code: customZ.ZodIssueCode.custom,
          message: 'Selecciona al menos una subparcela de la lista',
          path: ['subPlotEntries'],
        });
      }
    } else {
      const qResult = customZ.coerce.number().int().min(1).max(99999).safeParse(v.quantity);
      forwardZodIssues(qResult, ctx, ['quantity']);

      const cResult = customZ.enum(RIBBON_COLORS).safeParse(v.ribbonColorFree);
      forwardZodIssues(cResult, ctx, ['ribbonColorFree']);
    }
  });
export type CreateBundlingFormValues = customZ.input<typeof createBundlingSchema>;
export type CreateBundlingFormOutput = customZ.output<typeof createBundlingSchema>;
export type SubPlotEntryRowValues = customZ.input<typeof subPlotEntryRowSchema>;
