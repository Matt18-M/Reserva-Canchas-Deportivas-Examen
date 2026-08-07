import { z } from 'zod';

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora inválido. Use HH:mm');

const diaSemanaSchema = z.enum(
  ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
  { error: 'El día de la semana es obligatorio' },
);

export const scheduleFormSchema = z
  .object({
    canchaId: z
      .number({ error: 'La cancha es obligatoria' })
      .int('La cancha debe ser un número entero')
      .positive('La cancha debe ser un número positivo'),
    diaSemana: diaSemanaSchema,
    horaInicio: timeSchema,
    horaFin: timeSchema,
    activo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.horaInicio >= data.horaFin) {
      ctx.addIssue({
        code: 'custom',
        message: 'La hora de inicio debe ser menor que la hora de fin',
        path: ['horaFin'],
      });
    }
  });

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
