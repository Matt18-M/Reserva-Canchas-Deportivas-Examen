import { Eye } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  formatCurrency,
  getPaymentAdminActions,
  getPaymentDisplayStatusLabel,
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

type PaymentTableProps = {
  items: PaymentOverview[];
  usersById: Map<number, AuthUser>;
  onViewDetail: (item: PaymentOverview) => void;
  onStatusChange: (paymentId: number, status: PaymentStatus) => void;
  isUpdating?: boolean;
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

const reservationStatusVariantMap: Record<string, 'warning' | 'success'> = {
  PENDIENTE: 'warning',
  CONFIRMADA: 'success',
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

const PaymentTable = ({
  items,
  usersById,
  onViewDetail,
  onStatusChange,
  isUpdating = false,
}: PaymentTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proceso de pagos por reserva</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-3 py-3 font-medium">Código</th>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Cancha</th>
                <th className="px-3 py-3 font-medium">Estado reserva</th>
                <th className="px-3 py-3 font-medium">Estado pago</th>
                <th className="px-3 py-3 font-medium">Monto</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-text-muted">
                    No se encontraron reservas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const user = usersById.get(item.reservation.usuarioId);
                  const displayStatus = getPaymentDisplayStatus(item);
                  const payment = item.payment;
                  const reservationStatus = item.reservation.estado;
                  const adminActions = payment ? getPaymentAdminActions(displayStatus) : [];

                  return (
                    <tr
                      key={item.reservation.id}
                      className="border-b border-border/70 last:border-b-0"
                    >
                      <td className="px-3 py-3 font-medium text-text">
                        {item.reservation.codigo}
                      </td>
                      <td className="px-3 py-3 text-text">
                        {user ? `${user.nombre} ${user.apellido}` : '—'}
                      </td>
                      <td className="px-3 py-3 text-text-muted">
                        {item.reservation.court.codigo}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant={
                            reservationStatusVariantMap[reservationStatus] ?? 'warning'
                          }
                        >
                          {getPaymentReservationStatusLabel(reservationStatus)}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={paymentStatusVariantMap[displayStatus]}>
                          {getPaymentDisplayStatusLabel(displayStatus)}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-medium text-text">
                        {formatCurrency(payment?.monto ?? item.reservation.montoTotal)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {displayStatus === 'SIN_REGISTRAR' ? (
                            <span className="text-xs text-text-muted">
                              Esperando que el cliente registre el pago.
                            </span>
                          ) : null}

                          {displayStatus === 'FALLIDO' ? (
                            <span className="text-xs text-text-muted">
                              Esperando nuevo pago.
                            </span>
                          ) : null}

                          {payment
                            ? adminActions.map((status) => (
                                <Button
                                  key={status}
                                  variant={status === 'FALLIDO' ? 'danger' : 'secondary'}
                                  size="sm"
                                  disabled={isUpdating}
                                  onClick={() => onStatusChange(payment.id, status)}
                                >
                                  {getActionLabel(status)}
                                </Button>
                              ))
                            : null}

                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye className="size-4" />}
                            onClick={() => onViewDetail(item)}
                          >
                            Ver detalle
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentTable;
