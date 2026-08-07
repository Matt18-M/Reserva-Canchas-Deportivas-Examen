import { CalendarDays, PlusCircle, Trophy } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import UserMenu from '@/components/layout/UserMenu';
import { cn } from '@/utils/cn';

const clientNavItems = [
  { to: '/mis-reservas', label: 'Mis reservas', icon: CalendarDays, end: true },
  { to: '/reservar', label: 'Reservar cancha', icon: PlusCircle },
] as const;

const ClientNavbar = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/mis-reservas"
          className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-text text-surface shadow-sm">
            <Trophy className="size-4" strokeWidth={2} />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-semibold tracking-tight text-text">
              Canchas Pro
            </p>
            <p className="truncate text-xs text-text-muted">Área de clientes</p>
          </div>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1">
          {clientNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text',
                )
              }
            >
              <item.icon className="size-4" strokeWidth={1.75} />
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <UserMenu />
      </div>
    </header>
  );
};

export default ClientNavbar;
