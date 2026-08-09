import { CircleDot, Goal, Volleyball } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

type CourtTypeItem = {
  icon: LucideIcon;
  name: string;
  description: string;
  tag: string;
  image: string;
};

const COURT_TYPES: CourtTypeItem[] = [
  {
    icon: Goal,
    name: 'Fútbol',
    description: 'Canchas sintéticas y de césped con medidas reglamentarias para partidos y entrenamientos.',
    tag: 'Más popular',
    image: '/images/cancha.jpg',
  },
  {
    icon: CircleDot,
    name: 'Tenis',
    description: 'Superficies duras y arcilla para singles, doubles y clínicas deportivas.',
    tag: 'Alta demanda',
    image: '/images/tenis.jpg',
  },
  {
    icon: Volleyball,
    name: 'Vóley / Pádel',
    description: 'Espacios indoor y outdoor con iluminación para juego nocturno.',
    tag: 'Grupos',
    image: '/images/indor.jpg',
  },
];

type CourtTypesSectionProps = {
  className?: string;
};

const CourtTypesSection = ({ className }: CourtTypesSectionProps) => {
  return (
    <section id="tipos" className={cn('bg-surface-muted py-16 sm:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
            Tipos de cancha
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Espacios para cada disciplina
          </h2>
          <p className="mt-4 text-base text-text-muted">
            Elige el tipo de cancha que mejor se adapte a tu deporte, equipo y nivel de juego.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {COURT_TYPES.map((courtType) => {
            const Icon = courtType.icon;

            return (
              <Card key={courtType.name} className="overflow-hidden">
                <img
                  src={courtType.image}
                  alt={courtType.name}
                  className="h-40 w-full object-cover"
                />
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="primary">{courtType.tag}</Badge>
                  </div>
                  <CardTitle>{courtType.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-text-muted">{courtType.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CourtTypesSection;
