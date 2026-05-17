import { z } from 'zod';

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'Solo se permiten dígitos numéricos'),
});

export type TVerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
