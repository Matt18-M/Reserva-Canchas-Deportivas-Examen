import { Eye } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getReservationStatusLabel } from '@/pages/admin-reservations/ReservationFilters';
import type { AdminReservation, ReservationStatus } from '@/services/admin-reservations.service';
import { cn } from '@/utils/cn';

type ReservationsTableProps = {
  reservations: AdminReservation[];
  onViewDetail: (reservation: AdminReservation) => void;
  title?: string;
  animated?: boolean;
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

const statusBorderMap: Record<ReservationStatus, string> = {
  PENDIENTE: 'border-l-amber-400',
  CONFIRMADA: 'border-l-emerald-500',
  CANCELADA: 'border-l-red-400',
  COMPLETADA: 'border-l-primary-500',
};

const statusRowTintMap: Record<ReservationStatus, string> = {
  PENDIENTE: 'hover:bg-amber-50/60',
  CONFIRMADA: 'hover:bg-emerald-50/60',
  CANCELADA: 'hover:bg-red-50/50',
  COMPLETADA: 'hover:bg-primary-50/60',
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

const ReservationsTable = ({
  reservations,
  onViewDetail,
  title = 'Listado de reservas',
  animated = false,
}: ReservationsTableProps) => {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-surface via-primary-50/30 to-secondary-50/30">
        <CardTitle className="text-text">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/80 text-text-muted">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Cancha</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Horario</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-text-muted">
                    No se encontraron reservas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation, index) => (
                  <tr
                    key={reservation.id}
                    className={cn(
                      'border-b border-border/60 border-l-4 transition-all duration-200 last:border-b-0',
                      statusBorderMap[reservation.estado],
                      statusRowTintMap[reservation.estado],
                      animated && 'animate-fade-in-up opacity-0',
                    )}
                    style={
                      animated
                        ? { animationDelay: `${Math.min(index * 40, 400)}ms` }
                        : undefined
                    }
                  >
                    <td className="px-4 py-3.5 font-semibold text-primary-800">
                      {reservation.codigo}
                    </td>
                    <td className="px-4 py-3.5 text-text">
                      {reservation.user.nombre} {reservation.user.apellido}
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {reservation.court.codigo} — {reservation.court.nombre}
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {formatDate(reservation.fechaInicio)}
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {formatTime(reservation.fechaInicio)} — {formatTime(reservation.fechaFin)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariantMap[reservation.estado]}>
                        {getReservationStatusLabel(reservation.estado)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700">
                      {formatCurrency(reservation.montoTotal)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="size-4" />}
                        onClick={() => onViewDetail(reservation)}
                        className="transition-transform duration-200 hover:scale-[1.02] hover:border-primary-300 hover:text-primary-700"
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
