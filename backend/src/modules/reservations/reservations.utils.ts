import { DiaSemana, EstadoReserva, Prisma } from '@prisma/client';

export const MS_PER_HOUR = 1000 * 60 * 60;
export const MS_PER_MINUTE = 1000 * 60;

const DIA_SEMANA_BY_JS_DAY: Record<number, DiaSemana> = {
  0: DiaSemana.DOMINGO,
  1: DiaSemana.LUNES,
  2: DiaSemana.MARTES,
  3: DiaSemana.MIERCOLES,
  4: DiaSemana.JUEVES,
  5: DiaSemana.VIERNES,
  6: DiaSemana.SABADO,
};

export type TimeInterval = {
  inicio: Date;
  fin: Date;
};

const CALENDAR_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseCalendarDate = (value: string | Date): Date => {
  if (value instanceof Date) {
    return startOfDay(value);
  }

  const match = CALENDAR_DATE_REGEX.exec(value.trim());

  if (!match) {
    throw new Error('Formato de fecha inválido. Use YYYY-MM-DD.');
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    throw new Error('Fecha inválida.');
  }

  return date;
};

export const formatCalendarDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const dateToDiaSemana = (date: Date): DiaSemana => {
  const diaSemana = DIA_SEMANA_BY_JS_DAY[date.getDay()];

  if (!diaSemana) {
    throw new Error('No se pudo determinar el día de la semana.');
  }

  return diaSemana;
};

export const isSameCalendarDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const minutesOfDay = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes();

export const scheduleTimeToMinutes = (time: Date): number =>
  time.getUTCHours() * 60 + time.getUTCMinutes();

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const combineDateWithScheduleTime = (
  date: Date,
  scheduleTime: Date,
): Date => {
  const result = startOfDay(date);
  result.setHours(
    scheduleTime.getUTCHours(),
    scheduleTime.getUTCMinutes(),
    scheduleTime.getUTCSeconds(),
    0,
  );
  return result;
};

export const intervalsOverlap = (
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean => firstStart < secondEnd && firstEnd > secondStart;

export const clipIntervalToDay = (
  intervalStart: Date,
  intervalEnd: Date,
  day: Date,
): TimeInterval | null => {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const inicio = intervalStart > dayStart ? intervalStart : dayStart;
  const fin = intervalEnd < dayEnd ? intervalEnd : dayEnd;

  if (inicio >= fin) {
    return null;
  }

  return { inicio, fin };
};

export const mergeIntervals = (intervals: TimeInterval[]): TimeInterval[] => {
  if (intervals.length === 0) {
    return [];
  }

  const sorted = [...intervals].sort(
    (first, second) => first.inicio.getTime() - second.inicio.getTime(),
  );

  const merged: TimeInterval[] = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const last = merged[merged.length - 1];

    if (current.inicio <= last.fin) {
      if (current.fin > last.fin) {
        last.fin = current.fin;
      }
    } else {
      merged.push(current);
    }
  }

  return merged;
};

export const subtractIntervals = (
  available: TimeInterval,
  busyIntervals: TimeInterval[],
): TimeInterval[] => {
  let freeIntervals: TimeInterval[] = [available];

  for (const busy of busyIntervals) {
    const nextFreeIntervals: TimeInterval[] = [];

    for (const free of freeIntervals) {
      if (!intervalsOverlap(free.inicio, free.fin, busy.inicio, busy.fin)) {
        nextFreeIntervals.push(free);
        continue;
      }

      if (busy.inicio > free.inicio) {
        nextFreeIntervals.push({ inicio: free.inicio, fin: busy.inicio });
      }

      if (busy.fin < free.fin) {
        nextFreeIntervals.push({ inicio: busy.fin, fin: free.fin });
      }
    }

    freeIntervals = nextFreeIntervals;
  }

  return freeIntervals.filter(
    (interval) =>
      interval.fin.getTime() - interval.inicio.getTime() >= MS_PER_HOUR,
  );
};

export const buildOverlapWhere = (
  canchaId: number,
  fechaInicio: Date,
  fechaFin: Date,
  excludeReservationId?: number,
): Prisma.ReservaWhereInput => ({
  canchaId,
  estado: {
    in: [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA],
  },
  fechaInicio: { lt: fechaFin },
  fechaFin: { gt: fechaInicio },
  ...(excludeReservationId !== undefined
    ? { id: { not: excludeReservationId } }
    : {}),
});
