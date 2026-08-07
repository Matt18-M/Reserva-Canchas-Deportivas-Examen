import { Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const TESTIMONIALS = [
  {
    name: 'María González',
    role: 'Capitana de equipo amateur',
    quote:
      'Reservamos cancha cada semana sin problemas. La disponibilidad es clara y el proceso es rapidísimo.',
  },
  {
    name: 'Carlos Mendoza',
    role: 'Entrenador de tenis',
    quote:
      'Mis alumnos reservan horarios fácilmente y yo puedo organizar clases con mucha más eficiencia.',
  },
  {
    name: 'Andrea Ruiz',
    role: 'Jugadora de pádel',
    quote:
      'Me encanta poder ver horarios libres, confirmar y pagar desde el mismo sistema. Muy práctico.',
  },
];

type TestimonialsProps = {
  className?: string;
};

const Testimonials = ({ className }: TestimonialsProps) => {
  return (
    <section className={cn('py-16 sm:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
            Opiniones
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-base text-text-muted">
            Deportistas y organizadores que ya confían en la plataforma para gestionar sus
            reservas.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name} className="h-full">
              <CardContent className="space-y-4 pt-6">
                <div className="flex gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-text">“{testimonial.quote}”</p>
                <div>
                  <p className="text-sm font-semibold text-text">{testimonial.name}</p>
                  <p className="text-sm text-text-muted">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
