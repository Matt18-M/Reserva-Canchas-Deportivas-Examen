import {
  CalendarDays,
  CreditCard,
  History,
  LayoutDashboard,
  Layers3,
  MapPin,
  Users,
  Clock3,
} from 'lucide-react';

import Logo from '@/components/layout/Logo';
import NavItem from '@/components/layout/NavItem';
import { cn } from '@/utils/cn';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/court-types', label: 'Tipos de cancha', icon: Layers3 },
  { to: '/admin/courts', label: 'Canchas', icon: MapPin },
  { to: '/admin/schedules', label: 'Horarios', icon: Clock3 },
  { to: '/admin/reservations', label: 'Reservas', icon: CalendarDays },
  { to: '/admin/reservations/history', label: 'Historial', icon: History },
  { to: '/admin/payments', label: 'Pagos', icon: CreditCard },
  { to: '/admin/users', label: 'Usuarios', icon: Users },
] as const;

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const Sidebar = ({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) => {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-text/20 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-border px-4',
            collapsed && 'justify-center px-3',
          )}
        >
          <Logo collapsed={collapsed} />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {adminNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              collapsed={collapsed}
              end={'end' in item ? item.end : false}
              onNavigate={onCloseMobile}
            />
          ))}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <p
            className={cn(
              'text-xs text-text-muted',
              collapsed ? 'text-center' : 'px-1',
            )}
          >
            {collapsed ? 'v1' : 'Canchas Pro v1.0'}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
