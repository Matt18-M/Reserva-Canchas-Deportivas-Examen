import { z } from 'zod';

export const paymentFormSchema = z.object({
  metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'PAYPHONE'], {
    error: 'El método de pago es obligatorio',
  }),
  referencia: z
    .string()
    .max(100, 'La referencia no puede superar 100 caracteres')
    .optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
