import { ArrowRight, CalendarCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import ReserveNowLink from '@/components/routing/ReserveNowLink';
import { cn } from '@/utils/cn';

type HeroProps = {
  className?: string;
};

const Hero = ({ className }: HeroProps) => {
  return (
    <section className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.08),_transparent_40%)]" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            Reserva en minutos, juega sin complicaciones
          </span>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl">
              Reserva tu cancha deportiva de forma{' '}
              <span className="text-primary-700">rápida y segura</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
              Encuentra canchas disponibles, elige horario, confirma tu reserva y gestiona tus
              pagos desde un solo lugar. Ideal para equipos, grupos y deportistas individuales.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ReserveNowLink variant="secondary" size="lg" rightIcon={<ArrowRight className="size-4" />}>
              Reservar ahora
            </ReserveNowLink>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Crear cuenta gratis
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
              <CalendarCheck className="mt-0.5 size-5 text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-text">Disponibilidad en tiempo real</p>
                <p className="text-sm text-text-muted">Consulta horarios libres al instante.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
              <ShieldCheck className="mt-0.5 size-5 text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-text">Reservas confirmadas</p>
                <p className="text-sm text-text-muted">Proceso claro desde la reserva al pago.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 size-24 rounded-full bg-primary-100 blur-2xl" />
          <div className="absolute -bottom-8 -right-8 size-32 rounded-full bg-secondary-100 blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-lg">
            <div className="aspect-[4/3] bg-[linear-gradient(135deg,#064e3b_0%,#10b981_45%,#6ee7b7_100%)]" />
            <div className="space-y-4 p-6">
              <p className="text-sm font-medium uppercase tracking-wide text-primary-700">
                Canchas premium
              </p>
              <h2 className="text-2xl font-semibold text-text">
                Fútbol, tenis, pádel y más deportes
              </h2>
              <p className="text-sm text-text-muted">
                Espacios equipados, horarios flexibles y una experiencia pensada para que solo te
                preocupes por jugar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
