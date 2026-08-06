import { z } from 'zod';

const MS_PER_HOUR = 1000 * 60 * 60;

export const createReservationSchema = z
  .object({
    canchaId: z.coerce
      .number({ error: 'La cancha es obligatoria' })
      .int('La cancha debe ser un número entero')
      .positive('La cancha debe ser un número positivo'),
    fechaInicio: z.coerce.date({ error: 'fechaInicio inválida' }),
    fechaFin: z.coerce.date({ error: 'fechaFin inválida' }),
    notas: z.string().max(500, 'Las notas no pueden superar 500 caracteres').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fechaInicio >= data.fechaFin) {
      ctx.addIssue({
        code: 'custom',
        message: 'fechaInicio debe ser menor que fechaFin',
        path: ['fechaFin'],
      });
    }

    if (data.fechaInicio <= new Date()) {
      ctx.addIssue({
        code: 'custom',
        message: 'fechaInicio debe ser una fecha futura',
        path: ['fechaInicio'],
      });
    }

    const durationHours =
      (data.fechaFin.getTime() - data.fechaInicio.getTime()) / MS_PER_HOUR;

    if (durationHours < 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'La duración mínima de la reserva es de 1 hora',
        path: ['fechaFin'],
      });
    }
  });

export const updateReservationStatusSchema = z.object({
  estado: z.enum(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'], {
    error: 'Estado de reserva inválido',
  }),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<
  typeof updateReservationStatusSchema
>;

export const searchReservationQuerySchema = z
  .object({
    estado: z
      .enum(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
      .optional(),
    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),
    canchaId: z.coerce.number().int().positive().optional(),
    usuarioId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) =>
      data.fechaInicio === undefined ||
      data.fechaFin === undefined ||
      data.fechaInicio < data.fechaFin,
    { message: 'fechaInicio debe ser menor que fechaFin' },
  );

export type SearchReservationQuery = z.infer<typeof searchReservationQuerySchema>;

export const availabilityQuerySchema = z.object({
  date: z.coerce.date({ error: 'date inválida' }),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
