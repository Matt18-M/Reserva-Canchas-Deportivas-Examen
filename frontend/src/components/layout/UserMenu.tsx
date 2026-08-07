import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const name = user ? `${user.nombre} ${user.apellido}`.trim() : 'Usuario';
  const email = user?.email ?? '';
  const role = user?.role.nombre ?? '';

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-3 rounded-xl border border-border bg-surface px-2.5 py-1.5',
          'transition-colors hover:bg-surface-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          <UserRound className="size-4" strokeWidth={1.75} />
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-none text-text">{name}</p>
          <p className="mt-1 text-xs text-text-muted">{role}</p>
        </div>
        <ChevronDown
          className={cn(
            'hidden size-4 text-text-muted transition-transform sm:block',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Cerrar menú de usuario"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-lg"
            role="menu"
          >
            <div className="border-b border-border px-3 py-3">
              <p className="text-sm font-medium text-text">{name}</p>
              <p className="mt-1 truncate text-xs text-text-muted">{email}</p>
            </div>

            <div className="py-1">
              <Button
                variant="ghost"
                className="w-full justify-start px-3 text-danger hover:bg-red-50 hover:text-danger"
                leftIcon={<LogOut className="size-4" />}
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default UserMenu;
