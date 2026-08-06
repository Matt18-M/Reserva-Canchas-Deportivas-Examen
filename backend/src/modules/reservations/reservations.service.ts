import { EstadoReserva, Prisma } from '@prisma/client';

import prisma from '../../database/prisma';
import { type CreateReservationInput, type SearchReservationQuery } from './reservations.validation';
import {
  MS_PER_HOUR,
  buildOverlapWhere,
  clipIntervalToDay,
  combineDateWithScheduleTime,
  dateToDiaSemana,
  endOfDay,
  isSameCalendarDay,
  mergeIntervals,
  minutesOfDay,
  scheduleTimeToMinutes,
  startOfDay,
  subtractIntervals,
  type TimeInterval,
} from './reservations.utils';

const userSummarySelect = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  telefono: true,
  fotoPerfil: true,
  activo: true,
  rolId: true,
  role: true,
} satisfies Prisma.UsuarioSelect;

const courtSummarySelect = {
  id: true,
  codigo: true,
  nombre: true,
  precioHora: true,
  activa: true,
  ubicacion: true,
  courtType: true,
} satisfies Prisma.CanchaSelect;

const reservationSelect = {
  id: true,
  codigo: true,
  fechaInicio: true,
  fechaFin: true,
  duracionHoras: true,
  estado: true,
  notas: true,
  montoTotal: true,
  usuarioId: true,
  canchaId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: userSummarySelect,
  },
  court: {
    select: courtSummarySelect,
  },
} satisfies Prisma.ReservaSelect;

const scheduleSummarySelect = {
  id: true,
  diaSemana: true,
  horaInicio: true,
  horaFin: true,
  activo: true,
  canchaId: true,
} satisfies Prisma.HorarioSelect;

const reservationAvailabilitySelect = {
  id: true,
  codigo: true,
  fechaInicio: true,
  fechaFin: true,
  duracionHoras: true,
  estado: true,
  montoTotal: true,
} satisfies Prisma.ReservaSelect;

export type Reservation = Prisma.ReservaGetPayload<{
  select: typeof reservationSelect;
}>;

type PrismaClientLike = Prisma.TransactionClient | typeof prisma;

export type FreeSlot = {
  fechaInicio: Date;
  fechaFin: Date;
};

export type CourtAvailability = {
  date: string;
  diaSemana: string;
  courtId: number;
  horarios: Prisma.HorarioGetPayload<{ select: typeof scheduleSummarySelect }>[];
  reservas: Prisma.ReservaGetPayload<{
    select: typeof reservationAvailabilitySelect;
  }>[];
  slotsLibres: FreeSlot[];
};

const handlePrismaError = (error: unknown): Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new Error('Ya existe una reserva con los mismos datos.');
    }

    if (error.code === 'P2003') {
      return new Error('Usuario o cancha no encontrados.');
    }

    if (error.code === 'P2025') {
      return new Error('Reserva no encontrada.');
    }
  }

  return new Error('Error al procesar la solicitud de la reserva.');
};

const generateReservationCode = (): string => {
  const suffix = Date.now().toString(36).toUpperCase();
  return `RES-${suffix}`.slice(0, 30);
};

const calculateDurationHours = (fechaInicio: Date, fechaFin: Date): number => {
  const durationHours =
    (fechaFin.getTime() - fechaInicio.getTime()) / MS_PER_HOUR;

  return Math.ceil(durationHours);
};

const assertActiveUser = async (userId: number): Promise<void> => {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!user || !user.activo) {
    throw new Error('Usuario no encontrado o inactivo.');
  }
};

const assertActiveCourt = async (
  canchaId: number,
): Promise<{ precioHora: Prisma.Decimal }> => {
  const court = await prisma.cancha.findUnique({
    where: { id: canchaId },
  });

  if (!court || !court.activa) {
    throw new Error('Cancha no encontrada o inactiva.');
  }

  return { precioHora: court.precioHora };
};

const assertScheduleContains = async (
  canchaId: number,
  fechaInicio: Date,
  fechaFin: Date,
  client: PrismaClientLike = prisma,
): Promise<void> => {
  if (!isSameCalendarDay(fechaInicio, fechaFin)) {
    throw new Error('La reserva debe iniciar y finalizar el mismo día.');
  }

  const diaSemana = dateToDiaSemana(fechaInicio);
  const reservationStartMinutes = minutesOfDay(fechaInicio);
  const reservationEndMinutes = minutesOfDay(fechaFin);

  const schedules = await client.horario.findMany({
    where: {
      canchaId,
      diaSemana,
      activo: true,
    },
    select: {
      horaInicio: true,
      horaFin: true,
    },
  });

  const isContained = schedules.some((schedule) => {
    const scheduleStartMinutes = scheduleTimeToMinutes(schedule.horaInicio);
    const scheduleEndMinutes = scheduleTimeToMinutes(schedule.horaFin);

    return (
      scheduleStartMinutes <= reservationStartMinutes &&
      scheduleEndMinutes >= reservationEndMinutes
    );
  });

  if (!isContained) {
    throw new Error(
      'El horario solicitado no está dentro de un horario activo de la cancha.',
    );
  }
};

const assertNoOverlappingReservations = async (
  canchaId: number,
  fechaInicio: Date,
  fechaFin: Date,
  client: PrismaClientLike = prisma,
): Promise<void> => {
  const overlapping = await client.reserva.findFirst({
    where: buildOverlapWhere(canchaId, fechaInicio, fechaFin),
    select: { id: true },
  });

  if (overlapping) {
    throw new Error(
      'La cancha ya tiene una reserva activa que se solapa con el horario solicitado.',
    );
  }
};

const computeFreeSlots = (
  date: Date,
  schedules: Prisma.HorarioGetPayload<{ select: typeof scheduleSummarySelect }>[],
  reservations: Prisma.ReservaGetPayload<{
    select: typeof reservationAvailabilitySelect;
  }>[],
): TimeInterval[] => {
  const busyIntervals = mergeIntervals(
    reservations
      .map((reservation) =>
        clipIntervalToDay(
          reservation.fechaInicio,
          reservation.fechaFin,
          date,
        ),
      )
      .filter((interval): interval is TimeInterval => interval !== null),
  );

  const freeSlots: TimeInterval[] = [];

  for (const schedule of schedules) {
    const scheduleInterval: TimeInterval = {
      inicio: combineDateWithScheduleTime(date, schedule.horaInicio),
      fin: combineDateWithScheduleTime(date, schedule.horaFin),
    };

    freeSlots.push(...subtractIntervals(scheduleInterval, busyIntervals));
  }

  return freeSlots.sort(
    (first, second) => first.inicio.getTime() - second.inicio.getTime(),
  );
};

export class ReservationsService {
  async findByUser(userId: number): Promise<Reservation[]> {
    try {
      return await prisma.reserva.findMany({
        where: { usuarioId: userId },
        select: reservationSelect,
        orderBy: { fechaInicio: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(): Promise<Reservation[]> {
    try {
      return await prisma.reserva.findMany({
        select: reservationSelect,
        orderBy: { fechaInicio: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(id: number): Promise<Reservation | null> {
    try {
      return await prisma.reserva.findUnique({
        where: { id },
        select: reservationSelect,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async create(
    userId: number,
    data: CreateReservationInput,
  ): Promise<Reservation> {
    try {
      await assertActiveUser(userId);

      const { precioHora } = await assertActiveCourt(data.canchaId);

      const fechaInicio = new Date(data.fechaInicio);
      const fechaFin = new Date(data.fechaFin);

      if (fechaInicio >= fechaFin) {
        throw new Error('fechaInicio debe ser menor que fechaFin.');
      }

      if (fechaInicio <= new Date()) {
        throw new Error('fechaInicio debe ser una fecha futura.');
      }

      const duracionHoras = calculateDurationHours(fechaInicio, fechaFin);

      if (duracionHoras < 1) {
        throw new Error('La duración mínima de la reserva es de 1 hora.');
      }

      const montoTotal = Number(precioHora) * duracionHoras;

      return await prisma.$transaction(async (tx) => {
        await assertScheduleContains(data.canchaId, fechaInicio, fechaFin, tx);
        await assertNoOverlappingReservations(
          data.canchaId,
          fechaInicio,
          fechaFin,
          tx,
        );

        return tx.reserva.create({
          data: {
            codigo: generateReservationCode(),
            fechaInicio,
            fechaFin,
            duracionHoras,
            montoTotal,
            notas: data.notas,
            usuarioId: userId,
            canchaId: data.canchaId,
            estado: EstadoReserva.PENDIENTE,
          },
          select: reservationSelect,
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async findByCourt(courtId: number): Promise<Reservation[]> {
    try {
      const court = await prisma.cancha.findUnique({
        where: { id: courtId },
      });

      if (!court) {
        throw new Error('Cancha no encontrada.');
      }

      return await prisma.reserva.findMany({
        where: { canchaId: courtId },
        select: reservationSelect,
        orderBy: { fechaInicio: 'desc' },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async search(filters: SearchReservationQuery): Promise<Reservation[]> {
    try {
      const where: Prisma.ReservaWhereInput = {};

      if (filters.estado !== undefined) {
        where.estado = filters.estado;
      }

      if (filters.canchaId !== undefined) {
        where.canchaId = filters.canchaId;
      }

      if (filters.usuarioId !== undefined) {
        where.usuarioId = filters.usuarioId;
      }

      if (filters.fechaInicio !== undefined) {
        where.fechaInicio = { gte: filters.fechaInicio };
      }

      if (filters.fechaFin !== undefined) {
        where.fechaFin = { lte: filters.fechaFin };
      }

      return await prisma.reserva.findMany({
        where,
        select: reservationSelect,
        orderBy: { fechaInicio: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async cancel(id: number, userId: number): Promise<Reservation> {
    try {
      const existing = await prisma.reserva.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Reserva no encontrada.');
      }

      if (existing.usuarioId !== userId) {
        throw new Error('No autorizado para cancelar esta reserva.');
      }

      if (
        existing.estado !== EstadoReserva.PENDIENTE &&
        existing.estado !== EstadoReserva.CONFIRMADA
      ) {
        throw new Error(
          'Solo se pueden cancelar reservas en estado PENDIENTE o CONFIRMADA.',
        );
      }

      return await prisma.reserva.update({
        where: { id },
        data: { estado: EstadoReserva.CANCELADA },
        select: reservationSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async getAvailability(
    courtId: number,
    date: Date,
  ): Promise<CourtAvailability> {
    try {
      const court = await prisma.cancha.findUnique({
        where: { id: courtId },
      });

      if (!court || !court.activa) {
        throw new Error('Cancha no encontrada o inactiva.');
      }

      const targetDate = startOfDay(date);
      const diaSemana = dateToDiaSemana(targetDate);
      const dayStart = startOfDay(targetDate);
      const dayEnd = endOfDay(targetDate);

      const [horarios, reservas] = await Promise.all([
        prisma.horario.findMany({
          where: {
            canchaId: courtId,
            diaSemana,
            activo: true,
          },
          select: scheduleSummarySelect,
          orderBy: { horaInicio: 'asc' },
        }),
        prisma.reserva.findMany({
          where: {
            canchaId: courtId,
            estado: {
              in: [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA],
            },
            fechaInicio: { lt: dayEnd },
            fechaFin: { gt: dayStart },
          },
          select: reservationAvailabilitySelect,
          orderBy: { fechaInicio: 'asc' },
        }),
      ]);

      const slotsLibres = computeFreeSlots(targetDate, horarios, reservas).map(
        (slot) => ({
          fechaInicio: slot.inicio,
          fechaFin: slot.fin,
        }),
      );

      return {
        date: targetDate.toISOString().slice(0, 10),
        diaSemana,
        courtId,
        horarios,
        reservas,
        slotsLibres,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async updateStatus(id: number, estado: EstadoReserva): Promise<Reservation> {
    try {
      const existing = await prisma.reserva.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Reserva no encontrada.');
      }

      return await prisma.reserva.update({
        where: { id },
        data: { estado },
        select: reservationSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }
}

export default new ReservationsService();
