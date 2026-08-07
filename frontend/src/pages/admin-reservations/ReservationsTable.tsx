import { Eye } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getReservationStatusLabel } from '@/pages/admin-reservations/ReservationFilters';
import type { AdminReservation, ReservationStatus } from '@/services/admin-reservations.service';

type ReservationsTableProps = {
  reservations: AdminReservation[];
  onViewDetail: (reservation: AdminReservation) => void;
};

const statusVariantMap: Record<
  ReservationStatus,
  'warning' | 'success' | 'danger' | 'primary'
> = {
  PENDIENTE: 'warning',
  CONFIRMADA: 'success',
  CANCELADA: 'danger',
  COMPLETADA: 'primary',
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const formatCurrency = (value: string): string =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));

const ReservationsTable = ({ reservations, onViewDetail }: ReservationsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de reservas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-3 py-3 font-medium">Código</th>
                <th className="px-3 py-3 font-medium">Usuario</th>
                <th className="px-3 py-3 font-medium">Cancha</th>
                <th className="px-3 py-3 font-medium">Fecha</th>
                <th className="px-3 py-3 font-medium">Horario</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium">Monto</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-text-muted">
                    No se encontraron reservas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <td className="px-3 py-3 font-medium text-text">{reservation.codigo}</td>
                    <td className="px-3 py-3 text-text">
                      {reservation.user.nombre} {reservation.user.apellido}
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {reservation.court.codigo} — {reservation.court.nombre}
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {formatDate(reservation.fechaInicio)}
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {formatTime(reservation.fechaInicio)} — {formatTime(reservation.fechaFin)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={statusVariantMap[reservation.estado]}>
                        {getReservationStatusLabel(reservation.estado)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 font-medium text-text">
                      {formatCurrency(reservation.montoTotal)}
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="size-4" />}
                        onClick={() => onViewDetail(reservation)}
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationsTable;
