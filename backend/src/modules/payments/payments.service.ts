import { EstadoPago, Prisma } from '@prisma/client';

import prisma from '../../database/prisma';
import { type CreatePaymentInput } from './payments.validation';

const reservationSummarySelect = {
  id: true,
  codigo: true,
  fechaInicio: true,
  fechaFin: true,
  duracionHoras: true,
  estado: true,
  montoTotal: true,
  usuarioId: true,
  canchaId: true,
} satisfies Prisma.ReservaSelect;

const paymentSelect = {
  id: true,
  monto: true,
  estado: true,
  metodoPago: true,
  referencia: true,
  fechaPago: true,
  reservaId: true,
  createdAt: true,
  updatedAt: true,
  reservation: {
    select: reservationSummarySelect,
  },
} satisfies Prisma.PagoSelect;

export type Payment = Prisma.PagoGetPayload<{
  select: typeof paymentSelect;
}>;

const handlePrismaError = (error: unknown): Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new Error('La reserva ya tiene un pago registrado.');
    }

    if (error.code === 'P2003') {
      return new Error('Reserva no encontrada.');
    }

    if (error.code === 'P2025') {
      return new Error('Pago no encontrado.');
    }
  }

  return new Error('Error al procesar la solicitud del pago.');
};

const assertReservationAccess = (
  reservationUserId: number,
  userId: number,
  userRole: string,
): void => {
  if (userRole !== 'ADMIN' && reservationUserId !== userId) {
    throw new Error('No autorizado para acceder a esta reserva.');
  }
};

export class PaymentsService {
  async findAll(): Promise<Payment[]> {
    try {
      return await prisma.pago.findMany({
        select: paymentSelect,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(id: number): Promise<Payment | null> {
    try {
      return await prisma.pago.findUnique({
        where: { id },
        select: paymentSelect,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findByReservationId(
    reservationId: number,
    userId: number,
    userRole: string,
  ): Promise<Payment | null> {
    try {
      const reservation = await prisma.reserva.findUnique({
        where: { id: reservationId },
        select: { usuarioId: true },
      });

      if (!reservation) {
        throw new Error('Reserva no encontrada.');
      }

      assertReservationAccess(reservation.usuarioId, userId, userRole);

      return await prisma.pago.findUnique({
        where: { reservaId: reservationId },
        select: paymentSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async create(
    userId: number,
    userRole: string,
    data: CreatePaymentInput,
  ): Promise<Payment> {
    try {
      const reservation = await prisma.reserva.findUnique({
        where: { id: data.reservaId },
        select: {
          id: true,
          usuarioId: true,
          montoTotal: true,
        },
      });

      if (!reservation) {
        throw new Error('Reserva no encontrada.');
      }

      assertReservationAccess(reservation.usuarioId, userId, userRole);

      const existingPayment = await prisma.pago.findUnique({
        where: { reservaId: data.reservaId },
        select: { id: true },
      });

      if (existingPayment) {
        throw new Error('La reserva ya tiene un pago registrado.');
      }

      return await prisma.pago.create({
        data: {
          reservaId: data.reservaId,
          monto: reservation.montoTotal,
          estado: EstadoPago.PAGADO,
          metodoPago: data.metodoPago,
          referencia: data.referencia,
          fechaPago: new Date(),
        },
        select: paymentSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async updateStatus(id: number, estado: EstadoPago): Promise<Payment> {
    try {
      const existing = await prisma.pago.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Pago no encontrado.');
      }

      return await prisma.pago.update({
        where: { id },
        data: { estado },
        select: paymentSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }
}

export default new PaymentsService();
