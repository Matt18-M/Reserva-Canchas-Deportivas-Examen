import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  formatCurrency,
  formatPaymentDate,
  getPaymentAdminActions,
  getPaymentDisplayStatusLabel,
  getPaymentMethodLabel,
  getPaymentProcessObservation,
  getPaymentReservationStatusLabel,
  getPaymentStatusLabel,
} from '@/pages/payments/payment.constants';
import type { AuthUser } from '@/modules/auth/types';
import {
  getPaymentDisplayStatus,
  type PaymentDisplayStatus,
  type PaymentOverview,
  type PaymentStatus,
} from '@/services/payments.service';

type PaymentDetailProps = {
  item: PaymentOverview;
  user: AuthUser | null;
  isUpdating?: boolean;
  onClose: () => void;
  onStatusChange: (paymentId: number, status: PaymentStatus) => void;
};

const paymentStatusVariantMap: Record<
  PaymentDisplayStatus,
  'default' | 'primary' | 'success' | 'danger' | 'warning'
> = {
  SIN_REGISTRAR: 'default',
  PENDIENTE: 'warning',
  PAGADO: 'success',
  FALLIDO: 'danger',
  REEMBOLSADO: 'warning',
};

const getActionLabel = (status: PaymentStatus): string => {
  if (status === 'PAGADO') {
    return 'Aprobar';
  }

  if (status === 'FALLIDO') {
    return 'Rechazar';
  }

  return getPaymentStatusLabel(status);
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border/70 py-3 last:border-b-0">
    <span className="text-sm text-text-muted">{label}</span>
    <span className="text-right text-sm font-medium text-text">{value}</span>
  </div>
);

const PaymentDetail = ({
  item,
  user,
  isUpdating = false,
  onClose,
  onStatusChange,
}: PaymentDetailProps) => {
  const displayStatus = getPaymentDisplayStatus(item);
  const payment = item.payment;
  const observation = getPaymentProcessObservation(displayStatus);
  const adminActions = payment ? getPaymentAdminActions(displayStatus) : [];

  return (
    <Card className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Detalle del pago</CardTitle>
            <p className="text-sm text-text-muted">Reserva {item.reservation.codigo}</p>
          </div>
          <Badge variant={paymentStatusVariantMap[displayStatus]}>
            {getPaymentDisplayStatusLabel(displayStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border border-border bg-surface-muted p-4">
          <DetailRow label="Reserva" value={item.reservation.codigo} />
          <DetailRow
            label="Cliente"
            value={user ? `${user.nombre} ${user.apellido}` : '—'}
          />
          <DetailRow label="Cancha" value={item.reservation.court.codigo} />
          <DetailRow
            label="Monto"
            value={formatCurrency(payment?.monto ?? item.reservation.montoTotal)}
          />
          <DetailRow
            label="Estado reserva"
            value={getPaymentReservationStatusLabel(item.reservation.estado)}
          />
          <DetailRow
            label="Estado pago"
            value={getPaymentDisplayStatusLabel(displayStatus)}
          />
          {payment ? (
            <>
              <DetailRow
                label="Método"
                value={
                  payment.metodoPago ? getPaymentMethodLabel(payment.metodoPago) : '—'
                }
              />
              <DetailRow label="Referencia" value={payment.referencia ?? '—'} />
              <DetailRow
                label="Fecha"
                value={formatPaymentDate(payment.fechaPago ?? payment.createdAt)}
              />
            </>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Observación
          </p>
          <p className="mt-2 whitespace-pre-line text-sm text-text">{observation}</p>
        </div>

        {adminActions.length > 0 && payment ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-text">Acciones</p>
            <div className="flex flex-wrap gap-2">
              {adminActions.map((status) => (
                <Button
                  key={status}
                  variant={status === 'FALLIDO' ? 'danger' : 'secondary'}
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(payment.id, status)}
                >
                  {getActionLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">No existen acciones disponibles.</p>
        )}
      </CardContent>

      <CardFooter className="justify-end">
        <Button variant="outline" onClick={onClose} disabled={isUpdating}>
          Cerrar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentDetail;
