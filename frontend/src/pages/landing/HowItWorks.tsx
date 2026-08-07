import { cn } from '@/utils/cn';

const STEPS = [
  {
    step: '01',
    title: 'Crea tu cuenta',
    description: 'Regístrate como cliente y accede al sistema de reservas en segundos.',
  },
  {
    step: '02',
    title: 'Elige cancha y horario',
    description: 'Consulta disponibilidad real y selecciona la franja que prefieras.',
  },
  {
    step: '03',
    title: 'Confirma tu reserva',
    description: 'Revisa el resumen, confirma la reserva y recibe tu código de seguimiento.',
  },
  {
    step: '04',
    title: 'Registra el pago',
    description: 'Gestiona el pago desde Mis Reservas con el método que prefieras.',
  },
];

type HowItWorksProps = {
  className?: string;
};

const HowItWorks = ({ className }: HowItWorksProps) => {
  return (
    <section id="como-funciona" className={cn('bg-surface-muted py-16 sm:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
            Cómo funciona
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Cuatro pasos para reservar
          </h2>
          <p className="mt-4 text-base text-text-muted">
            Un flujo simple y guiado para que reserves, pagues y organices tu actividad deportiva
            sin fricción.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <p className="text-sm font-semibold text-primary-700">{item.step}</p>
              <h3 className="mt-3 text-lg font-semibold text-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
