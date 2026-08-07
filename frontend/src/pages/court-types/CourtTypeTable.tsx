import { Pencil, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { CourtType } from '@/services/court-types.service';
import { cn } from '@/utils/cn';

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
  const [nameSearch, setNameSearch] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');

  const filteredCourtTypes = useMemo(() => {
    const normalizedName = nameSearch.trim().toLowerCase();
    const normalizedDescription = descriptionSearch.trim().toLowerCase();

    return courtTypes.filter((courtType) => {
      const matchesName =
        normalizedName.length === 0 ||
        courtType.nombre.toLowerCase().includes(normalizedName);
      const description = courtType.descripcion?.toLowerCase() ?? '';
      const matchesDescription =
        normalizedDescription.length === 0 ||
        description.includes(normalizedDescription);

      return matchesName && matchesDescription;
    });
  }, [courtTypes, nameSearch, descriptionSearch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de tipos de cancha</CardTitle>
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
              value={descriptionSearch}
              onChange={(event) => setDescriptionSearch(event.target.value)}
              placeholder="Buscar por descripción..."
              className={cn(
                'h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text',
                'placeholder:text-text-muted focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:outline-none',
              )}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-3 py-3 font-medium">Nombre</th>
                <th className="px-3 py-3 font-medium">Descripción</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourtTypes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-text-muted">
                    No se encontraron tipos de cancha con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredCourtTypes.map((courtType) => (
                  <tr
                    key={courtType.id}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      <p className="font-medium text-text">{courtType.nombre}</p>
                      <p className="text-xs text-text-muted">ID #{courtType.id}</p>
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {courtType.descripcion ?? '—'}
                    </td>
                    <td className="px-3 py-3">
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
  );
};

export default CourtTypeTable;
