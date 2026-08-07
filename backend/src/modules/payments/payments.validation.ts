import { z } from 'zod';

export const createPaymentSchema = z.object({
  reservaId: z.coerce
    .number({ error: 'La reserva es obligatoria' })
    .int('La reserva debe ser un número entero')
    .positive('La reserva debe ser un número positivo'),
  metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'PAYPHONE'], {
    error: 'metodoPago inválido',
  }),
  referencia: z
    .string()
    .max(100, 'La referencia no puede superar 100 caracteres')
    .optional(),
});

export const updatePaymentStatusSchema = z.object({
  estado: z.enum(['PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO'], {
    error: 'Estado de pago inválido',
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
