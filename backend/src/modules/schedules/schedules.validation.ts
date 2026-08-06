import { DiaSemana } from '@prisma/client';
import { z } from 'zod';

const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
    'Formato de hora inválido. Use HH:mm o HH:mm:ss',
  );

const scheduleTimeRefine = (
  data: { horaInicio: string; horaFin: string },
  ctx: z.RefinementCtx,
): void => {
  if (data.horaInicio >= data.horaFin) {
    ctx.addIssue({
      code: 'custom',
      message: 'horaInicio debe ser menor que horaFin',
      path: ['horaFin'],
    });
  }
};

export const createScheduleSchema = z
  .object({
    canchaId: z.coerce
      .number({ error: 'La cancha es obligatoria' })
      .int('La cancha debe ser un número entero')
      .positive('La cancha debe ser un número positivo'),
    diaSemana: z.nativeEnum(DiaSemana, {
      error: 'Día de semana inválido',
    }),
    horaInicio: timeSchema,
    horaFin: timeSchema,
    activo: z.boolean().optional(),
  })
  .superRefine(scheduleTimeRefine);

export const updateScheduleSchema = z
  .object({
    canchaId: z.coerce.number().int().positive().optional(),
    diaSemana: z.nativeEnum(DiaSemana).optional(),
    horaInicio: timeSchema.optional(),
    horaFin: timeSchema.optional(),
    activo: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: 'Debe proporcionar al menos un campo para actualizar.' },
  )
  .superRefine((data, ctx) => {
    if (data.horaInicio !== undefined && data.horaFin !== undefined) {
      scheduleTimeRefine(
        { horaInicio: data.horaInicio, horaFin: data.horaFin },
        ctx,
      );
    }
  });

export const updateScheduleStatusSchema = z.object({
  activo: z.boolean({ error: 'El campo activo debe ser booleano' }),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type UpdateScheduleStatusInput = z.infer<typeof updateScheduleStatusSchema>;
