import { Prisma } from '@prisma/client';

import prisma from '../../database/prisma';
import {
  type CreateCourtTypeInput,
  type UpdateCourtTypeInput,
} from './court-types.validation';

export type CourtType = Prisma.TipoCanchaGetPayload<object>;

const handlePrismaError = (error: unknown): Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new Error('El nombre del tipo de cancha ya existe.');
    }

    if (error.code === 'P2025') {
      return new Error('Tipo de cancha no encontrado.');
    }
  }

  return new Error('Error al procesar la solicitud del tipo de cancha.');
};

export class CourtTypesService {
  async findAll(): Promise<CourtType[]> {
    try {
      return await prisma.tipoCancha.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(id: number): Promise<CourtType | null> {
    try {
      return await prisma.tipoCancha.findUnique({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async create(data: CreateCourtTypeInput): Promise<CourtType> {
    try {
      return await prisma.tipoCancha.create({ data });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(id: number, data: UpdateCourtTypeInput): Promise<CourtType> {
    try {
      return await prisma.tipoCancha.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const courtType = await prisma.tipoCancha.findUnique({
        where: { id },
        include: {
          _count: {
            select: { courts: true },
          },
        },
      });

      if (!courtType) {
        throw new Error('Tipo de cancha no encontrado.');
      }

      if (courtType._count.courts > 0) {
        throw new Error(
          'No se puede eliminar el tipo de cancha porque tiene canchas asociadas.',
        );
      }

      await prisma.tipoCancha.delete({
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

export default new CourtTypesService();
