import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/utils/cn';

type NavItemProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  end?: boolean;
  onNavigate?: () => void;
};

const NavItem = ({
  to,
  label,
  icon: Icon,
  collapsed = false,
  end = false,
  onNavigate,
}: NavItemProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-2',
          isActive
            ? 'bg-surface-muted text-text shadow-sm ring-1 ring-border'
            : 'text-text-muted hover:bg-surface-muted hover:text-text',
        )
      }
    >
      <Icon
        className="size-[18px] shrink-0"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </NavLink>
  );
};

export default NavItem;
