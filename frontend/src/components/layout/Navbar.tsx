import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';

import UserMenu from '@/components/layout/UserMenu';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

type NavbarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
};

const Navbar = ({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
}: NavbarProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onOpenMobile}
            aria-label="Abrir menú"
            leftIcon={<Menu className="size-4" />}
          />

          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:inline-flex"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            leftIcon={
              collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )
            }
          />

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Buscar canchas, reservas, usuarios..."
              className={cn(
                'h-10 w-full rounded-xl border border-border bg-surface-muted pl-10 pr-4 text-sm',
                'text-text placeholder:text-text-muted',
                'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
              aria-label="Buscar"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
