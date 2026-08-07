import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/Button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { PAYMENT_METHOD_OPTIONS } from '@/pages/payments/payment.constants';
import { paymentFormSchema, type PaymentFormValues } from '@/pages/payments/payment.schema';
import { cn } from '@/utils/cn';

type PaymentFormProps = {
  reservationCode: string;
  amount: string;
  isSubmitting?: boolean;
  onSubmit: (values: PaymentFormValues) => void;
  onCancel: () => void;
};

const PaymentForm = ({
  reservationCode,
  amount,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: PaymentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      metodoPago: undefined,
      referencia: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardHeader>
        <CardTitle>Registrar pago</CardTitle>
        <CardDescription>
          Reserva {reservationCode} — monto a pagar: {amount}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="metodoPago" className="text-sm font-medium text-text">
            Método de pago
          </label>
          <select
            id="metodoPago"
            className={cn(
              'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
              'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              errors.metodoPago ? 'border-danger' : 'border-border',
            )}
            {...register('metodoPago')}
          >
            <option value="">Seleccionar método</option>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.metodoPago ? (
            <p className="text-xs text-danger">{errors.metodoPago.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="referencia" className="text-sm font-medium text-text">
            Referencia (opcional)
          </label>
          <input
            id="referencia"
            type="text"
            className={cn(
              'h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text',
              'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              errors.referencia ? 'border-danger' : 'border-border',
            )}
            placeholder="Número de transacción o comprobante"
            {...register('referencia')}
          />
          {errors.referencia ? (
            <p className="text-xs text-danger">{errors.referencia.message}</p>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="secondary" isLoading={isSubmitting}>
          Registrar pago
        </Button>
      </CardFooter>
    </form>
  );
};

export default PaymentForm;
