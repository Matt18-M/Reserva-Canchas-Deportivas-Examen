import { randomUUID } from 'node:crypto';

import { EstadoPago, EstadoReserva, Prisma } from '@prisma/client';

import prisma from '../../database/prisma';
import { type CreateReservationInput, type SearchReservationQuery } from './reservations.validation';
import {
  MS_PER_HOUR,
  buildOverlapWhere,
  clipIntervalToDay,
  combineDateWithScheduleTime,
  dateToDiaSemana,
  endOfDay,
  formatCalendarDate,
  isSameCalendarDay,
  mergeIntervals,
  parseCalendarDate,
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

const paymentSummarySelect = {
  id: true,
  monto: true,
  estado: true,
  metodoPago: true,
  referencia: true,
  fechaPago: true,
  reservaId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PagoSelect;

const reservationDetailSelect = {
  ...reservationSelect,
  payment: {
    select: paymentSummarySelect,
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

export type ReservationPaymentSummary = Prisma.PagoGetPayload<{
  select: typeof paymentSummarySelect;
}>;

export type ReservationDetail = Reservation & {
  payment: ReservationPaymentSummary | null;
  hasPayment: boolean;
};

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

const getUniqueConstraintFields = (target: unknown): string[] => {
  if (Array.isArray(target)) {
    return target.map(String);
  }

  if (typeof target === 'string') {
    if (target.includes('codigo')) {
      return ['codigo'];
    }

    if (target.includes('cancha_id') && target.includes('fecha')) {
      return ['canchaId', 'fechaInicio', 'fechaFin'];
    }
  }

  return [];
};

const handlePrismaError = (error: unknown): Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const fields = getUniqueConstraintFields(error.meta?.target);

      if (fields.includes('codigo')) {
        return new Error('No se pudo generar un código único para la reserva.');
      }

      if (
        fields.includes('canchaId') &&
        fields.includes('fechaInicio') &&
        fields.includes('fechaFin')
      ) {
        return new Error('La cancha ya tiene una reserva en ese horario.');
      }

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

const resolveServiceError = (error: unknown): Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Error) {
    return error;
  }

  return handlePrismaError(error);
};

const generateReservationCode = (): string => {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 22).toUpperCase();
  return `RES-${suffix}`;
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
    const scheduleStart = combineDateWithScheduleTime(
      fechaInicio,
      schedule.horaInicio,
    );
    let scheduleEnd = combineDateWithScheduleTime(fechaInicio, schedule.horaFin);

    if (scheduleEnd <= scheduleStart) {
      scheduleEnd = new Date(scheduleEnd);
      scheduleEnd.setDate(scheduleEnd.getDate() + 1);
    }

    return fechaInicio >= scheduleStart && fechaFin <= scheduleEnd;
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

const activeReservationsWhere: Prisma.ReservaWhereInput = {
  estado: { not: EstadoReserva.COMPLETADA },
};

const assertApprovedPayment = async (
  reservaId: number,
  client: PrismaClientLike = prisma,
): Promise<void> => {
  const payment = await client.pago.findUnique({
    where: { reservaId },
    select: { estado: true },
  });

  if (!payment || payment.estado !== EstadoPago.PAGADO) {
    throw new Error('No se puede confirmar una reserva sin un pago aprobado.');
  }
};

const assertValidStatusTransition = async (
  current: EstadoReserva,
  next: EstadoReserva,
  reservaId: number,
  client: PrismaClientLike = prisma,
): Promise<void> => {
  if (current === next) {
    throw new Error('La reserva ya se encuentra en ese estado.');
  }

  if (current === EstadoReserva.CANCELADA || current === EstadoReserva.COMPLETADA) {
    throw new Error('No se puede modificar una reserva cancelada o completada.');
  }

  switch (next) {
    case EstadoReserva.CONFIRMADA:
      if (current !== EstadoReserva.PENDIENTE) {
        throw new Error('Solo se puede confirmar una reserva pendiente.');
      }
      await assertApprovedPayment(reservaId, client);
      break;

    case EstadoReserva.COMPLETADA:
      if (current !== EstadoReserva.CONFIRMADA) {
        throw new Error('Solo se puede completar una reserva confirmada.');
      }
      await assertApprovedPayment(reservaId, client);
      break;

    case EstadoReserva.CANCELADA:
      if (
        current !== EstadoReserva.PENDIENTE &&
        current !== EstadoReserva.CONFIRMADA
      ) {
        throw new Error(
          'Solo se pueden cancelar reservas pendientes o confirmadas.',
        );
      }
      break;

    case EstadoReserva.PENDIENTE:
      throw new Error('No se puede revertir una reserva a pendiente.');

    default:
      throw new Error('Transición de estado inválida.');
  }
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
        where: activeReservationsWhere,
        select: reservationSelect,
        orderBy: { fechaInicio: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findHistory(): Promise<Reservation[]> {
    try {
      return await prisma.reserva.findMany({
        where: { estado: EstadoReserva.COMPLETADA },
        select: reservationSelect,
        orderBy: { fechaInicio: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(id: number): Promise<ReservationDetail | null> {
    try {
      const reservation = await prisma.reserva.findUnique({
        where: { id },
        select: reservationDetailSelect,
      });

      if (!reservation) {
        return null;
      }

      return {
        ...reservation,
        hasPayment: reservation.payment !== null,
      };
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

      if (fechaInicio.getTime() < Date.now()) {
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

        const reservation = await tx.reserva.create({
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

        await tx.pago.create({
          data: {
            reservaId: reservation.id,
            monto: montoTotal,
            estado: EstadoPago.PENDIENTE,
            metodoPago: data.metodoPago,
            referencia: data.referencia,
          },
        });

        return reservation;
      });
    } catch (error) {
      throw resolveServiceError(error);
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
      const where: Prisma.ReservaWhereInput = {
        ...activeReservationsWhere,
      };

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

      const targetDate = parseCalendarDate(date);
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
        date: formatCalendarDate(targetDate),
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

      await assertValidStatusTransition(existing.estado, estado, id);

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
