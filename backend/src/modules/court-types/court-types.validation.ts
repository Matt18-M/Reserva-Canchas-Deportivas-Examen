import { z } from 'zod';

export const createCourtTypeSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  descripcion: z
    .string()
    .max(255, 'La descripción no puede superar 255 caracteres')
    .optional(),
});

export const updateCourtTypeSchema = z
  .object({
    nombre: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede superar 100 caracteres')
      .optional(),
    descripcion: z
      .string()
      .max(255, 'La descripción no puede superar 255 caracteres')
      .optional(),
  })
  .refine(
    (data) => data.nombre !== undefined || data.descripcion !== undefined,
    { message: 'Debe proporcionar al menos un campo para actualizar.' },
  );

export type CreateCourtTypeInput = z.infer<typeof createCourtTypeSchema>;
export type UpdateCourtTypeInput = z.infer<typeof updateCourtTypeSchema>;
