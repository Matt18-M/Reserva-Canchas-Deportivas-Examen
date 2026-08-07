import { z } from 'zod';

export const userFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  apellido: z.string().min(3, 'El apellido debe tener al menos 3 caracteres'),
  telefono: z.string().optional(),
  fotoPerfil: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim() === '' || z.string().url().safeParse(value).success,
      'La URL de la foto debe ser válida',
    ),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
