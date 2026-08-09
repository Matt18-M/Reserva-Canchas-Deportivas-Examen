import { Filter, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { CourtType } from '@/services/court-types.service';
import { cn } from '@/utils/cn';

type CourtTypeFiltersState = {
  nombre: string;
  descripcion: string;
};

const EMPTY_COURT_TYPE_FILTERS: CourtTypeFiltersState = {
  nombre: '',
  descripcion: '',
};

const DESCRIPTION_FILTER_OPTIONS = [
  { value: 'with', label: 'Con descripción' },
  { value: 'without', label: 'Sin descripción' },
] as const;

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text',
  'transition-all duration-200',
  'focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
  'hover:border-primary-300',
);

type CourtTypeTableProps = {
  courtTypes: CourtType[];
  onEdit: (courtType: CourtType) => void;
  onDelete: (courtType: CourtType) => void;
};

const CourtTypeTable = ({
  courtTypes,
  onEdit,
  onDelete,
}: CourtTypeTableProps) => {
  const [filters, setFilters] = useState<CourtTypeFiltersState>(EMPTY_COURT_TYPE_FILTERS);

  const nameOptions = useMemo(
    () =>
      [...courtTypes]
        .sort((first, second) => first.nombre.localeCompare(second.nombre))
        .map((courtType) => ({
          value: String(courtType.id),
          label: courtType.nombre,
        })),
    [courtTypes],
  );

  const filteredCourtTypes = useMemo(() => {
    const selectedId = filters.nombre ? Number(filters.nombre) : null;

    return courtTypes.filter((courtType) => {
      const matchesName = selectedId === null || courtType.id === selectedId;

      const matchesDescription =
        filters.descripcion.length === 0 ||
        (filters.descripcion === 'with' && Boolean(courtType.descripcion?.trim())) ||
        (filters.descripcion === 'without' && !courtType.descripcion?.trim());

      return matchesName && matchesDescription;
    });
  }, [courtTypes, filters]);

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
                onClick={() => setFilters(EMPTY_COURT_TYPE_FILTERS)}
                className="border-primary-200 text-primary-700 hover:bg-primary-50"
              >
                Limpiar filtros
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="court-type-name-filter" className="text-sm font-medium text-text">
                Nombre
              </label>
              <select
                id="court-type-name-filter"
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
              <label
                htmlFor="court-type-description-filter"
                className="text-sm font-medium text-text"
              >
                Descripción
              </label>
              <select
                id="court-type-description-filter"
                value={filters.descripcion}
                onChange={(event) =>
                  setFilters({ ...filters, descripcion: event.target.value })
                }
                className={selectClassName}
              >
                <option value="">Todas las descripciones</option>
                {DESCRIPTION_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-surface via-primary-50/30 to-secondary-50/30">
          <CardTitle>Tipos de cancha ({filteredCourtTypes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/80 text-text-muted">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourtTypes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-text-muted">
                      No se encontraron tipos de cancha con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredCourtTypes.map((courtType, index) => (
                    <tr
                      key={courtType.id}
                      className={cn(
                        'border-b border-border/60 border-l-4 border-l-primary-400 transition-colors duration-200 last:border-b-0 hover:bg-primary-50/50',
                        'animate-fade-in-up opacity-0',
                      )}
                      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-primary-800">{courtType.nombre}</p>
                        <p className="text-xs text-text-muted">ID #{courtType.id}</p>
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {courtType.descripcion ?? '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Pencil className="size-4" />}
                            onClick={() => onEdit(courtType)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-red-50 hover:text-danger"
                            leftIcon={<Trash2 className="size-4" />}
                            onClick={() => onDelete(courtType)}
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

export default CourtTypeTable;
