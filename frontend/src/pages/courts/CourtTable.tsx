import { Filter, Pencil, Power, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { Court } from '@/services/courts.service';
import { cn } from '@/utils/cn';

type CourtFiltersState = {
  codigo: string;
  nombre: string;
  ubicacion: string;
};

const EMPTY_COURT_FILTERS: CourtFiltersState = {
  codigo: '',
  nombre: '',
  ubicacion: '',
};

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
  'transition-all duration-200',
  'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
  'hover:border-primary-300',
);

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
  const [filters, setFilters] = useState<CourtFiltersState>(EMPTY_COURT_FILTERS);

  const codeOptions = useMemo(
    () =>
      [...new Set(courts.map((court) => court.codigo))]
        .sort((first, second) => first.localeCompare(second))
        .map((codigo) => ({ value: codigo, label: codigo })),
    [courts],
  );

  const nameOptions = useMemo(
    () =>
      [...courts]
        .sort((first, second) => first.nombre.localeCompare(second.nombre))
        .map((court) => ({
          value: String(court.id),
          label: court.nombre,
        })),
    [courts],
  );

  const locationOptions = useMemo(
    () =>
      [...new Set(courts.map((court) => court.ubicacion?.trim() || ''))]
        .filter(Boolean)
        .sort((first, second) => first.localeCompare(second))
        .map((ubicacion) => ({ value: ubicacion, label: ubicacion })),
    [courts],
  );

  const filteredCourts = useMemo(() => {
    const selectedId = filters.nombre ? Number(filters.nombre) : null;

    return courts.filter((court) => {
      const matchesCode =
        filters.codigo.length === 0 || court.codigo === filters.codigo;
      const matchesName = selectedId === null || court.id === selectedId;
      const matchesLocation =
        filters.ubicacion.length === 0 ||
        (court.ubicacion?.trim() ?? '') === filters.ubicacion;

      return matchesCode && matchesName && matchesLocation;
    });
  }, [courts, filters]);

  const hasActiveFilters = Object.values(filters).some((value) => value.length > 0);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-primary-200/70 bg-gradient-to-br from-primary-50/70 via-surface to-secondary-50/40 shadow-sm">
        <CardHeader className="border-b border-primary-100/80 bg-white/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-primary-800">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <Filter className="size-4" />
              </span>
              Filtros
            </CardTitle>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="size-3.5" />}
                onClick={() => setFilters(EMPTY_COURT_FILTERS)}
                className="border-primary-200 text-primary-700 hover:bg-primary-50"
              >
                Limpiar filtros
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="court-code-filter" className="text-sm font-medium text-text">
                Código
              </label>
              <select
                id="court-code-filter"
                value={filters.codigo}
                onChange={(event) => setFilters({ ...filters, codigo: event.target.value })}
                className={selectClassName}
              >
                <option value="">Todos los códigos</option>
                {codeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="court-name-filter" className="text-sm font-medium text-text">
                Nombre
              </label>
              <select
                id="court-name-filter"
                value={filters.nombre}
                onChange={(event) => setFilters({ ...filters, nombre: event.target.value })}
                className={selectClassName}
              >
                <option value="">Todos los nombres</option>
                {nameOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="court-location-filter" className="text-sm font-medium text-text">
                Ubicación
              </label>
              <select
                id="court-location-filter"
                value={filters.ubicacion}
                onChange={(event) =>
                  setFilters({ ...filters, ubicacion: event.target.value })
                }
                className={selectClassName}
              >
                <option value="">Todas las ubicaciones</option>
                {locationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de canchas</CardTitle>
        </CardHeader>
        <CardContent>
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
    </div>
  );
};

export default CourtTable;
