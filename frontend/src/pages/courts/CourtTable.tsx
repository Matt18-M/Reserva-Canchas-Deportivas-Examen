import { Pencil, Power, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { Court } from '@/services/courts.service';
import { cn } from '@/utils/cn';

type CourtTableProps = {
  courts: Court[];
  onEdit: (court: Court) => void;
  onDelete: (court: Court) => void;
  onToggleStatus: (court: Court) => void;
};

const formatCurrency = (value: string): string =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));

const CourtTable = ({
  courts,
  onEdit,
  onDelete,
  onToggleStatus,
}: CourtTableProps) => {
  const [codeSearch, setCodeSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  const filteredCourts = useMemo(() => {
    const normalizedCode = codeSearch.trim().toLowerCase();
    const normalizedName = nameSearch.trim().toLowerCase();
    const normalizedLocation = locationSearch.trim().toLowerCase();

    return courts.filter((court) => {
      const matchesCode =
        normalizedCode.length === 0 ||
        court.codigo.toLowerCase().includes(normalizedCode);
      const matchesName =
        normalizedName.length === 0 ||
        court.nombre.toLowerCase().includes(normalizedName);
      const location = court.ubicacion?.toLowerCase() ?? '';
      const matchesLocation =
        normalizedLocation.length === 0 || location.includes(normalizedLocation);

      return matchesCode && matchesName && matchesLocation;
    });
  }, [courts, codeSearch, nameSearch, locationSearch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de canchas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={codeSearch}
              onChange={(event) => setCodeSearch(event.target.value)}
              placeholder="Buscar por código..."
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
              value={locationSearch}
              onChange={(event) => setLocationSearch(event.target.value)}
              placeholder="Buscar por ubicación..."
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text',
                'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-3 py-3 font-medium">Código</th>
                <th className="px-3 py-3 font-medium">Nombre</th>
                <th className="px-3 py-3 font-medium">Tipo de cancha</th>
                <th className="px-3 py-3 font-medium">Precio/hora</th>
                <th className="px-3 py-3 font-medium">Capacidad</th>
                <th className="px-3 py-3 font-medium">Ubicación</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-text-muted">
                    No se encontraron canchas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredCourts.map((court) => (
                  <tr
                    key={court.id}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <td className="px-3 py-3 font-medium text-text">{court.codigo}</td>
                    <td className="px-3 py-3 text-text">{court.nombre}</td>
                    <td className="px-3 py-3 text-text-muted">{court.courtType.nombre}</td>
                    <td className="px-3 py-3 text-text">
                      {formatCurrency(court.precioHora)}
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {court.capacidad ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {court.ubicacion ?? '—'}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={court.activa ? 'success' : 'danger'}>
                        {court.activa ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Pencil className="size-4" />}
                          onClick={() => onEdit(court)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Power className="size-4" />}
                          onClick={() => onToggleStatus(court)}
                        >
                          {court.activa ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-red-50 hover:text-danger"
                          leftIcon={<Trash2 className="size-4" />}
                          onClick={() => onDelete(court)}
                        >
                          Eliminar
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

export default CourtTable;
