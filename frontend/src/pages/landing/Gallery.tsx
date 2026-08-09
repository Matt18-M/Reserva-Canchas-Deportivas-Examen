import { cn } from '@/utils/cn';

type GalleryItem = {
  title: string;
  subtitle: string;
  src: string;
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    title: 'Cancha principal',
    subtitle: 'Fútbol 11 · Iluminación LED',
    src: '/images/cancha.jpg',
  },
  {
    title: 'Zona de tenis',
    subtitle: 'Superficie dura · Vestuarios',
    src: '/images/tenis.jpg',
  },
  {
    title: 'Área indoor',
    subtitle: 'Pádel y vóley · Climatizado',
    src: '/images/indor.jpg',
  },
  {
    title: 'Complejo nocturno',
    subtitle: 'Reservas hasta las 22:00',
    src: '/images/nocturno.jpg',
  },
  {
    title: 'Zona de entrenamiento',
    subtitle: 'Grupos y academias',
    src: '/images/cancha2.jpg',
  },
  {
    title: 'Espacio premium',
    subtitle: 'Césped sintético profesional',
    src: '/images/premium.jpg',
  },
];

type GalleryProps = {
  className?: string;
};

const Gallery = ({ className }: GalleryProps) => {
  return (
    <section id="galeria" className={cn('py-16 sm:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
            Galería
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Instalaciones listas para tu próximo partido
          </h2>
          <p className="mt-4 text-base text-text-muted">
            Canchas cuidadas, entornos seguros y espacios diseñados para una experiencia
            deportiva de calidad.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY_ITEMS.map((item, index) => (
            <article
              key={item.title}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border shadow-sm',
                index === 0 && 'sm:col-span-2 lg:col-span-2 lg:row-span-1',
              )}
            >
              <img
                src={item.src}
                alt={item.title}
                className={cn(
                  'aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]',
                  index === 0 && 'sm:aspect-[21/9]',
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-text/70 via-text/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-white/85">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
