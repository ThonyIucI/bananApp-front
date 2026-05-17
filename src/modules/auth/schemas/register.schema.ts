import { customZ } from '@/@common/utils/zod-config';


export const registerSchema = customZ
  .object({
    firstName: customZ.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
    lastName: customZ.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
    email: customZ.email().max(150),
    password: customZ
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Debe contener letras y números'),
    confirmPassword: customZ.string(),
    acceptTerms: customZ.literal(true, 'Debes aceptar los términos y condiciones'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type TRegisterFormValues = customZ.infer<typeof registerSchema>;
