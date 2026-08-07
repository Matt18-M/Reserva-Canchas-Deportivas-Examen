import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

import ReserveNowLink from '@/components/routing/ReserveNowLink';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

type LandingNavbarProps = {
  className?: string;
};

const LandingNavbar = ({ className }: LandingNavbarProps) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border/70 bg-surface/90 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-text text-surface shadow-sm">
            <Trophy className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-text">Canchas Pro</p>
            <p className="text-xs text-text-muted">Reservas deportivas</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#beneficios" className="text-sm text-text-muted transition-colors hover:text-text">
            Beneficios
          </a>
          <a href="#tipos" className="text-sm text-text-muted transition-colors hover:text-text">
            Canchas
          </a>
          <a href="#galeria" className="text-sm text-text-muted transition-colors hover:text-text">
            Galería
          </a>
          <a href="#como-funciona" className="text-sm text-text-muted transition-colors hover:text-text">
            Cómo funciona
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link to="/register" className="hidden sm:block">
            <Button variant="outline" size="sm">
              Registrarse
            </Button>
          </Link>
          <ReserveNowLink variant="secondary" size="sm">
            Reservar ahora
          </ReserveNowLink>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
