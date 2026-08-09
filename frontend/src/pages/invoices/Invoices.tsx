import { useQuery } from '@tanstack/react-query';
import { FileText, Printer, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import InvoicePreviewModal from '@/components/invoice/InvoicePreviewModal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { getPaymentDisplayStatusLabel, getPaymentStatusLabel } from '@/pages/payments/payment.constants';
import InvoiceFilters, {
  EMPTY_INVOICE_FILTERS,
  type InvoiceFiltersState,
} from '@/pages/invoices/InvoiceFilters';
import { getApiErrorMessage } from '@/contexts/AuthContext';
import adminReservationsService, {
  type AdminReservation,
} from '@/services/admin-reservations.service';
import type { PaymentStatus } from '@/services/payments.service';
import type { InvoiceData } from '@/types/invoice';
import { buildInvoiceFromReservation, formatInvoiceCurrency } from '@/utils/invoice.utils';
import { cn } from '@/utils/cn';

const getPaymentStatusForReservation = (reservation: AdminReservation): string => {
  if (!reservation.payment) {
    return 'SIN_REGISTRAR';
  }

  return reservation.payment.estado;
};

const paymentBadgeVariant = (
  status: string,
): 'default' | 'success' | 'warning' | 'danger' => {
  switch (status) {
    case 'PAGADO':
      return 'success';
    case 'PENDIENTE':
      return 'warning';
    case 'FALLIDO':
    case 'REEMBOLSADO':
      return 'danger';
    default:
      return 'default';
  }
};

const Invoices = () => {
  const [filters, setFilters] = useState<InvoiceFiltersState>(EMPTY_INVOICE_FILTERS);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  const reservationsQuery = useQuery({
    queryKey: ['admin-reservations', 'history'],
    queryFn: adminReservationsService.getHistory,
  });

  const filteredReservations = useMemo(() => {
    const reservations = reservationsQuery.data ?? [];
    const reservationId = filters.reservationId ? Number(filters.reservationId) : null;

    return reservations.filter((reservation) => {
      const paymentStatus = getPaymentStatusForReservation(reservation);
      const matchesReservation =
        reservationId === null || reservation.id === reservationId;
      const matchesPayment =
        filters.paymentStatus.length === 0 || paymentStatus === filters.paymentStatus;

      return matchesReservation && matchesPayment;
    });
  }, [reservationsQuery.data, filters]);

  const handleOpenInvoice = (reservation: AdminReservation) => {
    setSelectedInvoice(buildInvoiceFromReservation(reservation));
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 p-6 text-white shadow-lg sm:p-8">
        <div className="dashboard-shimmer pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              Comprobantes administrativos
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
                Genera e imprime comprobantes de reserva para entregar a los clientes.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-xs text-white/70">Comprobantes disponibles</p>
            <p className="mt-1 text-3xl font-bold">{filteredReservations.length}</p>
          </div>
        </div>
      </section>

      {reservationsQuery.isLoading ? (
        <Loading fullScreen label="Cargando facturas..." />
      ) : null}

      {reservationsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(reservationsQuery.error, 'No se pudieron cargar las reservas.')}
        </div>
      ) : null}

      {reservationsQuery.isSuccess ? (
        <>
          <InvoiceFilters
            filters={filters}
            reservations={reservationsQuery.data}
            onChange={setFilters}
          />

          <Card className="overflow-hidden border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-surface via-primary-50/30 to-secondary-50/30">
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-primary-700" />
                Comprobantes ({filteredReservations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-muted/80 text-text-muted">
                      <th className="px-4 py-3 font-medium">Factura</th>
                      <th className="px-4 py-3 font-medium">Reserva</th>
                      <th className="px-4 py-3 font-medium">Cliente</th>
                      <th className="px-4 py-3 font-medium">Cancha</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Pago</th>
                      <th className="px-4 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                          No se encontraron comprobantes con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((reservation, index) => {
                        const paymentStatus = getPaymentStatusForReservation(reservation);
                        const invoice = buildInvoiceFromReservation(reservation);

                        return (
                          <tr
                            key={reservation.id}
                            className={cn(
                              'border-b border-border/60 border-l-4 border-l-primary-400 transition-colors duration-200 last:border-b-0 hover:bg-primary-50/50',
                              'animate-fade-in-up opacity-0',
                            )}
                            style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
                          >
                            <td className="px-4 py-3.5 font-semibold text-primary-800">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="px-4 py-3.5 text-text">{reservation.codigo}</td>
                            <td className="px-4 py-3.5 text-text">
                              {reservation.user.nombre} {reservation.user.apellido}
                            </td>
                            <td className="px-4 py-3.5 text-text-muted">
                              {reservation.court.codigo} — {reservation.court.nombre}
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-emerald-700">
                              {formatInvoiceCurrency(reservation.montoTotal)}
                            </td>
                            <td className="px-4 py-3.5">
                              <Badge variant={paymentBadgeVariant(paymentStatus)}>
                                {paymentStatus === 'SIN_REGISTRAR'
                                  ? getPaymentDisplayStatusLabel('SIN_REGISTRAR')
                                  : getPaymentStatusLabel(paymentStatus as PaymentStatus)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3.5">
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Printer className="size-4" />}
                                onClick={() => handleOpenInvoice(reservation)}
                                className="transition-transform duration-200 hover:scale-[1.02] hover:border-primary-300 hover:text-primary-700"
                              >
                                Ver / Imprimir
                              </Button>
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
        </>
      ) : null}

      <InvoicePreviewModal data={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
};

export default Invoices;
