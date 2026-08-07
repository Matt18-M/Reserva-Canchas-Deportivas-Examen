import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

import Button from '@/components/ui/Button';
import ReserveNowLink from '@/components/routing/ReserveNowLink';
import { cn } from '@/utils/cn';

type FooterProps = {
  className?: string;
};

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn('border-t border-border bg-text text-surface', className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-surface text-text">
                <Trophy className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Canchas Pro</p>
                <p className="text-xs text-white/70">Sistema de reservas deportivas</p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/75">
              Plataforma integral para reservar canchas, gestionar horarios y organizar pagos de
              forma simple y segura.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Enlaces</p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <a href="#beneficios" className="transition-colors hover:text-white">
                  Beneficios
                </a>
              </li>
              <li>
                <a href="#tipos" className="transition-colors hover:text-white">
                  Tipos de cancha
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="transition-colors hover:text-white">
                  Cómo funciona
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Acceso</p>
            <div className="mt-4 flex flex-col items-start gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                  Registrarse
                </Button>
              </Link>
              <ReserveNowLink variant="secondary" size="sm">
                Reservar ahora
              </ReserveNowLink>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60">
          © {new Date().getFullYear()} Canchas Pro. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
