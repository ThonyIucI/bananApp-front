import { z } from 'zod';
import { RIBBON_COLORS } from '@/@common/constants/ribbon-colors';
export { RIBBON_COLOR_LABELS, RIBBON_COLOR_HEX } from '@/@common/constants/ribbon-colors';

const today = () => new Date().toISOString().split('T')[0];

export const createBundlingSchema = z.object({
  plotId: z.uuid({ error: 'Selecciona una parcela' }),
  subPlotId: z.string().uuid({ message: 'Selecciona una subparcela' }).optional(),
  enfundadorUserId: z.uuid({ error: 'Selecciona un enfundador' }),
  quantity: z
    .number({ error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 funda')
    .max(99999, 'Máximo 99 999 fundas'),
  bundledAt: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine((d) => d <= today(), 'La fecha no puede ser futura'),
  ribbonColorFree: z.enum(RIBBON_COLORS, { message: 'Selecciona un color de cinta' }),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export type CreateBundlingFormValues = z.input<typeof createBundlingSchema>;
export type CreateBundlingFormOutput = z.output<typeof createBundlingSchema>;
