import { Search } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  PAYMENT_DISPLAY_STATUS_OPTIONS,
  PAYMENT_RESERVATION_STATUS_OPTIONS,
} from '@/pages/payments/payment.constants';
import type { PaymentDisplayStatus } from '@/services/payments.service';
import { cn } from '@/utils/cn';

export type PaymentFiltersState = {
  paymentStatus: PaymentDisplayStatus | '';
  reservationStatus: 'PENDIENTE' | 'CONFIRMADA' | '';
  search: string;
};

type PaymentFiltersProps = {
  filters: PaymentFiltersState;
  onChange: (filters: PaymentFiltersState) => void;
};

const PaymentFilters = ({ filters, onChange }: PaymentFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="payment-status-filter" className="text-sm font-medium text-text">
              Estado pago
            </label>
            <select
              id="payment-status-filter"
              value={filters.paymentStatus}
              onChange={(event) =>
                onChange({
                  ...filters,
                  paymentStatus: event.target.value as PaymentFiltersState['paymentStatus'],
                })
              }
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            >
              <option value="">Todos los estados</option>
              {PAYMENT_DISPLAY_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="reservation-status-filter" className="text-sm font-medium text-text">
              Estado reserva
            </label>
            <select
              id="reservation-status-filter"
              value={filters.reservationStatus}
              onChange={(event) =>
                onChange({
                  ...filters,
                  reservationStatus: event.target.value as PaymentFiltersState['reservationStatus'],
                })
              }
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            >
              <option value="">Todos los estados</option>
              {PAYMENT_RESERVATION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="payment-search-filter" className="text-sm font-medium text-text">
              Buscar reserva
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
              <input
                id="payment-search-filter"
                type="search"
                value={filters.search}
                onChange={(event) => onChange({ ...filters, search: event.target.value })}
                placeholder="Código de reserva"
                className={cn(
                  'h-11 w-full rounded-xl border border-border bg-surface pr-4 pl-10 text-sm text-text',
                  'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentFilters;
