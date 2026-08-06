import { DiaSemana, Prisma } from '@prisma/client';

import prisma from '../../database/prisma';
import {
  type CreateScheduleInput,
  type UpdateScheduleInput,
} from './schedules.validation';

const scheduleSelect = {
  id: true,
  diaSemana: true,
  horaInicio: true,
  horaFin: true,
  activo: true,
  canchaId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.HorarioSelect;

export type Schedule = Prisma.HorarioGetPayload<{
  select: typeof scheduleSelect;
}>;

const handlePrismaError = (error: unknown): Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new Error('Ya existe un horario idéntico para esta cancha.');
    }

    if (error.code === 'P2003') {
      return new Error('Cancha no encontrada.');
    }

    if (error.code === 'P2025') {
      return new Error('Horario no encontrado.');
    }
  }

  return new Error('Error al procesar la solicitud del horario.');
};

const parseTime = (time: string): Date => {
  const [hours, minutes, seconds = '0'] = time.split(':');
  return new Date(
    1970,
    0,
    1,
    Number(hours),
    Number(minutes),
    Number(seconds),
  );
};

const assertActiveCourtExists = async (canchaId: number): Promise<void> => {
  const court = await prisma.cancha.findUnique({
    where: { id: canchaId },
  });

  if (!court || !court.activa) {
    throw new Error('Cancha no encontrada o inactiva.');
  }
};

const assertNoOverlap = async (
  canchaId: number,
  diaSemana: DiaSemana,
  horaInicio: Date,
  horaFin: Date,
  excludeId?: number,
): Promise<void> => {
  const overlapping = await prisma.horario.findFirst({
    where: {
      canchaId,
      diaSemana,
      activo: true,
      id: excludeId !== undefined ? { not: excludeId } : undefined,
      horaInicio: { lt: horaFin },
      horaFin: { gt: horaInicio },
    },
  });

  if (overlapping) {
    throw new Error('El horario se solapa con otro horario activo.');
  }
};

export class SchedulesService {
  async findActiveByCourt(canchaId: number): Promise<Schedule[]> {
    try {
      const court = await prisma.cancha.findUnique({
        where: { id: canchaId },
      });

      if (!court || !court.activa) {
        throw new Error('Cancha no encontrada o inactiva.');
      }

      return await prisma.horario.findMany({
        where: {
          canchaId,
          activo: true,
        },
        select: scheduleSelect,
        orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async findById(id: number): Promise<Schedule | null> {
    try {
      return await prisma.horario.findUnique({
        where: { id },
        select: scheduleSelect,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async create(data: CreateScheduleInput): Promise<Schedule> {
    try {
      await assertActiveCourtExists(data.canchaId);

      const horaInicio = parseTime(data.horaInicio);
      const horaFin = parseTime(data.horaFin);
      const activo = data.activo ?? true;

      if (activo) {
        await assertNoOverlap(
          data.canchaId,
          data.diaSemana,
          horaInicio,
          horaFin,
        );
      }

      return await prisma.horario.create({
        data: {
          canchaId: data.canchaId,
          diaSemana: data.diaSemana,
          horaInicio,
          horaFin,
          activo,
        },
        select: scheduleSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async update(id: number, data: UpdateScheduleInput): Promise<Schedule> {
    try {
      const existing = await prisma.horario.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Horario no encontrado.');
      }

      const canchaId = data.canchaId ?? existing.canchaId;
      await assertActiveCourtExists(canchaId);

      const diaSemana = data.diaSemana ?? existing.diaSemana;
      const horaInicio =
        data.horaInicio !== undefined
          ? parseTime(data.horaInicio)
          : existing.horaInicio;
      const horaFin =
        data.horaFin !== undefined ? parseTime(data.horaFin) : existing.horaFin;
      const activo = data.activo ?? existing.activo;

      if (horaInicio >= horaFin) {
        throw new Error('horaInicio debe ser menor que horaFin.');
      }

      if (activo) {
        await assertNoOverlap(
          canchaId,
          diaSemana,
          horaInicio,
          horaFin,
          id,
        );
      }

      return await prisma.horario.update({
        where: { id },
        data: {
          canchaId: data.canchaId,
          diaSemana: data.diaSemana,
          horaInicio: data.horaInicio !== undefined ? horaInicio : undefined,
          horaFin: data.horaFin !== undefined ? horaFin : undefined,
          activo: data.activo,
        },
        select: scheduleSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async updateStatus(id: number, activo: boolean): Promise<Schedule> {
    try {
      const existing = await prisma.horario.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Horario no encontrado.');
      }

      await assertActiveCourtExists(existing.canchaId);

      if (activo) {
        await assertNoOverlap(
          existing.canchaId,
          existing.diaSemana,
          existing.horaInicio,
          existing.horaFin,
          id,
        );
      }

      return await prisma.horario.update({
        where: { id },
        data: { activo },
        select: scheduleSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existing = await prisma.horario.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Horario no encontrado.');
      }

      await prisma.horario.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }
}

export default new SchedulesService();
