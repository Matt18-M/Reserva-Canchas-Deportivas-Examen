import { Filter, RotateCcw } from 'lucide-react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { AdminReservation } from '@/services/admin-reservations.service';
import { cn } from '@/utils/cn';

export type InvoiceFiltersState = {
  reservationId: string;
  paymentStatus: string;
};

export const EMPTY_INVOICE_FILTERS: InvoiceFiltersState = {
  reservationId: '',
  paymentStatus: '',
};

export const INVOICE_PAYMENT_STATUS_OPTIONS = [
  { value: 'PAGADO', label: 'Pago confirmado' },
  { value: 'PENDIENTE', label: 'Pago pendiente' },
  { value: 'SIN_REGISTRAR', label: 'Sin pago registrado' },
  { value: 'FALLIDO', label: 'Pago rechazado' },
  { value: 'REEMBOLSADO', label: 'Pago reembolsado' },
] as const;

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
  'transition-all duration-200',
  'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
  'hover:border-primary-300',
);

type InvoiceFiltersProps = {
  filters: InvoiceFiltersState;
  reservations: AdminReservation[];
  onChange: (filters: InvoiceFiltersState) => void;
};

const InvoiceFilters = ({ filters, reservations, onChange }: InvoiceFiltersProps) => {
  const hasActiveFilters = Object.values(filters).some((value) => value.length > 0);

  const reservationOptions = [...reservations]
    .sort((first, second) => second.id - first.id)
    .map((reservation) => ({
      value: String(reservation.id),
      label: `${reservation.codigo} — ${reservation.user.nombre} ${reservation.user.apellido}`,
    }));

  return (
    <Card className="overflow-hidden border-primary-200/70 bg-gradient-to-br from-primary-50/70 via-surface to-secondary-50/40 shadow-sm">
      <CardHeader className="border-b border-primary-100/80 bg-white/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-primary-800">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
              <Filter className="size-4" />
            </span>
            Filtros
          </CardTitle>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="size-3.5" />}
              onClick={() => onChange(EMPTY_INVOICE_FILTERS)}
              className="border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="invoice-reservation-filter" className="text-sm font-medium text-text">
              Reserva
            </label>
            <select
              id="invoice-reservation-filter"
              value={filters.reservationId}
              onChange={(event) =>
                onChange({ ...filters, reservationId: event.target.value })
              }
              className={selectClassName}
            >
              <option value="">Todas las reservas</option>
              {reservationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="invoice-payment-filter" className="text-sm font-medium text-text">
              Estado de pago
            </label>
            <select
              id="invoice-payment-filter"
              value={filters.paymentStatus}
              onChange={(event) =>
                onChange({ ...filters, paymentStatus: event.target.value })
              }
              className={selectClassName}
            >
              <option value="">Todos los estados</option>
              {INVOICE_PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceFilters;
