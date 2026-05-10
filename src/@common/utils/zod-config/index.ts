import { z } from 'zod';

// 1. Configuramos el idioma base
if (typeof window !== 'undefined' || !global.__zod_globalRegistry) {
    z.config({
        localeError: z.locales.es().localeError,
        customError: (iss) => {           
            if (iss.code === "invalid_type") {
                switch (iss.expected) {
                    case 'undefined':
                        return 'Requerido';
                    case 'null':
                        return 'Requerido';
                    case 'number':
                        return 'Debe ser un número';
                    case 'int':
                        return 'Debe ser entero';
                    case 'bigint':
                        return 'Debe ser un número entero';
                    default:
                        return iss.message;
                }
            }
            if (iss.code === "too_small") {
                return `Mínimo ${iss.minimum} ${originValidation(iss.origin)}`;
            }
            if (iss.code === "too_big") {
                return `Máximo ${iss.maximum} ${originValidation(iss.origin)}`;
            }
            if (iss.code === "invalid_format") {
                switch (iss.format) {
                    case 'email':
                        return 'Debe ser un email válido';
                    case 'date':
                        return 'Debe ser una fecha válida';
                    default:
                        return iss.message;
                }
            }
        },
    });
}
/**
 * Retorna el tipo correcto en español según el tipo de dato recibido
 * @param zodOrigin 
 * @returns 
 */
const originValidation = (zodOrigin: string) => {
    switch (zodOrigin) {
        case 'string':
            return 'caracteres';
        default:
            return '';
    }
};

/**
 * Valida un resultado de safeParse y traslada los errores al contexto principal.
 * @param result El resultado del safeParse interno.
 * @param ctx El contexto del superRefine (RefinementCtx).
 * @param basePath El camino (path) donde deben aparecer los errores en el formulario.
 */
export const forwardZodIssues = (
    result: z.ZodSafeParseResult<any>,
    ctx: z.RefinementCtx,
    basePath: (string | number)[]
) => {
    if (!result.success) {
        result.error.issues.forEach((issue) => {
            ctx.addIssue({
                ...issue,
                // Combinamos el path base con el path interno del error 
                // (por si el esquema interno es un objeto o array)
                path: [...basePath, ...issue.path],
            });
        });
    }
};


export { z as customZ };