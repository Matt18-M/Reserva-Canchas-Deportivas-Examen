import { formatInvoiceCurrency } from '@/utils/invoice.utils';
import type { InvoiceData } from '@/types/invoice';

type InvoiceDocumentProps = {
  data: InvoiceData;
};

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-700/80">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-text">{value}</p>
  </div>
);

const InvoiceDocument = ({ data }: InvoiceDocumentProps) => {
  return (
    <article className="invoice-print-sheet mx-auto w-full max-w-[820px] bg-white text-text shadow-none">
      <header className="overflow-hidden rounded-t-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-600 px-8 py-7 text-white">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
              Comprobante de servicio
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Canchas Pro</h1>
            <p className="mt-2 text-sm text-white/85">
              Sistema de reservas de canchas deportivas
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-white/70">Factura N°</p>
            <p className="mt-1 text-xl font-bold">{data.invoiceNumber}</p>
            <p className="mt-3 text-xs text-white/70">Fecha de emisión</p>
            <p className="text-sm font-medium">{data.issueDate}</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-8 py-7">
        <section className="grid gap-6 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:grid-cols-2">
          <InfoBlock label="Cliente" value={data.clientName} />
          <InfoBlock label="Correo" value={data.clientEmail} />
          <InfoBlock label="Teléfono" value={data.clientPhone ?? '—'} />
          <InfoBlock label="Reserva" value={data.reservationCode} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-800">
            Detalle del servicio
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary-50/80 text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Concepto</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Precio unit.</th>
                  <th className="px-4 py-3 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/70">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">
                      Reserva {data.courtCode} — {data.courtName}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {data.courtType}
                      {data.courtLocation ? ` · ${data.courtLocation}` : ''}
                    </p>
                    <p className="mt-2 text-xs text-text-muted">
                      {data.startDate} — {data.endDate}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-text">{data.durationHours} h</td>
                  <td className="px-4 py-4 text-text">
                    {formatInvoiceCurrency(data.unitPrice)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-primary-800">
                    {formatInvoiceCurrency(data.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1fr_260px]">
          <div className="rounded-2xl border border-border bg-surface-muted/60 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-800">
              Información de pago
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Estado del pago" value={data.paymentStatus} />
              <InfoBlock label="Estado de reserva" value={data.reservationStatus} />
              <InfoBlock label="Método" value={data.paymentMethod ?? '—'} />
              <InfoBlock label="Referencia" value={data.paymentReference ?? '—'} />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-white shadow-lg shadow-primary-500/20">
            <p className="text-xs uppercase tracking-wide text-white/75">Total a pagar</p>
            <p className="mt-2 text-3xl font-bold">{formatInvoiceCurrency(data.total)}</p>
            <p className="mt-4 text-xs leading-relaxed text-white/80">
              Documento generado automáticamente por el panel administrativo de Canchas Pro.
            </p>
          </div>
        </section>

        <footer className="border-t border-border pt-4 text-center text-xs text-text-muted">
          Gracias por confiar en Canchas Pro. Este comprobante respalda la reserva de cancha
          deportiva indicada.
        </footer>
      </div>
    </article>
  );
};

export default InvoiceDocument;
