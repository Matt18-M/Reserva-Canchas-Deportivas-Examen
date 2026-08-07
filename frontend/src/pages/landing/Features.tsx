import { Clock3, CreditCard, MapPin, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Smartphone,
    title: 'Reserva 100% online',
    description:
      'Selecciona cancha, fecha y horario desde cualquier dispositivo sin llamadas ni trámites.',
  },
  {
    icon: Clock3,
    title: 'Horarios actualizados',
    description:
      'Visualiza la disponibilidad real según horarios activos y reservas existentes.',
  },
  {
    icon: CreditCard,
    title: 'Pagos centralizados',
    description:
      'Registra y consulta pagos asociados a cada reserva con métodos flexibles.',
  },
  {
    icon: MapPin,
    title: 'Canchas verificadas',
    description:
      'Información clara de ubicación, tipo de cancha, capacidad y tarifas por hora.',
  },
];

type FeaturesProps = {
  className?: string;
};

const Features = ({ className }: FeaturesProps) => {
  return (
    <section id="beneficios" className={cn('py-16 sm:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
            Beneficios
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Todo lo que necesitas para reservar mejor
          </h2>
          <p className="mt-4 text-base text-text-muted">
            Una plataforma moderna que conecta deportistas con canchas disponibles de manera
            simple, rápida y confiable.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-text-muted">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
