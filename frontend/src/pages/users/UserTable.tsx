import { Pencil, Power, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { AuthUser } from '@/modules/auth/types';
import { cn } from '@/utils/cn';

type UserTableProps = {
  users: AuthUser[];
  onEdit: (user: AuthUser) => void;
  onToggleStatus: (user: AuthUser) => void;
};

const UserTable = ({ users, onEdit, onToggleStatus }: UserTableProps) => {
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const normalizedName = nameSearch.trim().toLowerCase();
    const normalizedEmail = emailSearch.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const matchesName =
        normalizedName.length === 0 || fullName.includes(normalizedName);
      const matchesEmail =
        normalizedEmail.length === 0 ||
        user.email.toLowerCase().includes(normalizedEmail);

      return matchesName && matchesEmail;
    });
  }, [users, nameSearch, emailSearch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de usuarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={nameSearch}
              onChange={(event) => setNameSearch(event.target.value)}
              placeholder="Buscar por nombre..."
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text',
                'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            />
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={emailSearch}
              onChange={(event) => setEmailSearch(event.target.value)}
              placeholder="Buscar por correo..."
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text',
                'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-3 py-3 font-medium">Usuario</th>
                <th className="px-3 py-3 font-medium">Correo</th>
                <th className="px-3 py-3 font-medium">Teléfono</th>
                <th className="px-3 py-3 font-medium">Rol</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-text-muted">
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
                          {user.fotoPerfil ? (
                            <img
                              src={user.fotoPerfil}
                              alt={`${user.nombre} ${user.apellido}`}
                              className="size-full object-cover"
                            />
                          ) : (
                            `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text">
                            {user.nombre} {user.apellido}
                          </p>
                          <p className="text-xs text-text-muted">ID #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-text">{user.email}</td>
                    <td className="px-3 py-3 text-text-muted">
                      {user.telefono ?? '—'}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={user.role.nombre === 'ADMIN' ? 'primary' : 'outline'}
                      >
                        {user.role.nombre}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={user.activo ? 'success' : 'danger'}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Pencil className="size-4" />}
                          onClick={() => onEdit(user)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Power className="size-4" />}
                          onClick={() => onToggleStatus(user)}
                        >
                          {user.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTable;
