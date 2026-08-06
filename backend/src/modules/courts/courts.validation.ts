import { z } from 'zod';

const codigoSchema = z
  .string()
  .min(1, 'El código es obligatorio')
  .max(20, 'El código no puede superar 20 caracteres');

const nombreSchema = z
  .string()
  .min(3, 'El nombre debe tener al menos 3 caracteres')
  .max(100, 'El nombre no puede superar 100 caracteres');

const descripcionSchema = z
  .string()
  .max(255, 'La descripción no puede superar 255 caracteres')
  .optional();

const precioHoraSchema = z.coerce
  .number({ error: 'El precio por hora es obligatorio' })
  .positive('El precio por hora debe ser mayor que 0');

const capacidadSchema = z.coerce
  .number()
  .int('La capacidad debe ser un número entero')
  .positive('La capacidad debe ser un número positivo')
  .optional();

const tipoCanchaIdSchema = z.coerce
  .number({ error: 'El tipo de cancha es obligatorio' })
  .int('El tipo de cancha debe ser un número entero')
  .positive('El tipo de cancha debe ser un número positivo');

export const createCourtSchema = z.object({
  codigo: codigoSchema,
  nombre: nombreSchema,
  descripcion: descripcionSchema,
  precioHora: precioHoraSchema,
  capacidad: capacidadSchema,
  ubicacion: z.string().optional(),
  imagen: z.string().optional(),
  tipoCanchaId: tipoCanchaIdSchema,
});

export const updateCourtSchema = z
  .object({
    codigo: codigoSchema.optional(),
    nombre: nombreSchema.optional(),
    descripcion: descripcionSchema,
    precioHora: precioHoraSchema.optional(),
    capacidad: capacidadSchema,
    ubicacion: z.string().optional(),
    imagen: z.string().optional(),
    tipoCanchaId: tipoCanchaIdSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: 'Debe proporcionar al menos un campo para actualizar.' },
  );

export const updateCourtStatusSchema = z.object({
  activa: z.boolean({ error: 'El campo activa debe ser booleano' }),
});

export type CreateCourtInput = z.infer<typeof createCourtSchema>;
export type UpdateCourtInput = z.infer<typeof updateCourtSchema>;
export type UpdateCourtStatusInput = z.infer<typeof updateCourtStatusSchema>;
