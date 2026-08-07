import type { DiaSemana } from '@/services/schedules.service';

export const DIA_SEMANA_OPTIONS: { value: DiaSemana; label: string }[] = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

export const getDiaSemanaLabel = (diaSemana: DiaSemana): string =>
  DIA_SEMANA_OPTIONS.find((option) => option.value === diaSemana)?.label ?? diaSemana;

export const toTimeInputValue = (value: string): string => {
  if (!value) {
    return '';
  }

  if (value.includes('T')) {
    const date = new Date(value);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  return value.slice(0, 5);
};

export const formatScheduleTime = (value: string): string => toTimeInputValue(value);
