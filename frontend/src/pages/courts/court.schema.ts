import { z } from 'zod';

export const courtFormSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  descripcion: z
    .string()
    .max(255, 'La descripción no puede superar 255 caracteres')
    .optional(),
  precioHora: z
    .number({ error: 'El precio por hora es obligatorio' })
    .positive('El precio por hora debe ser mayor que 0'),
  capacidad: z
    .number({ error: 'La capacidad debe ser un número' })
    .int('La capacidad debe ser un número entero')
    .positive('La capacidad debe ser un número positivo')
    .optional(),
  ubicacion: z.string().optional(),
  imagen: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim() === '' || z.string().url().safeParse(value).success,
      'La URL de la imagen debe ser válida',
    ),
  tipoCanchaId: z
    .number({ error: 'El tipo de cancha es obligatorio' })
    .int('El tipo de cancha debe ser un número entero')
    .positive('El tipo de cancha debe ser un número positivo'),
  activa: z.boolean(),
});

export type CourtFormValues = z.infer<typeof courtFormSchema>;
