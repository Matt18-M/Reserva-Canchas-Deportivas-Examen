import { z } from 'zod';

export const courtTypeFormSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  descripcion: z
    .string()
    .max(255, 'La descripción no puede superar 255 caracteres')
    .optional(),
});

export type CourtTypeFormValues = z.infer<typeof courtTypeFormSchema>;
