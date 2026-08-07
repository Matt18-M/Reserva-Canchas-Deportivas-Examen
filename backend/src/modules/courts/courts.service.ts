import { Prisma } from '@prisma/client';

import prisma from '../../database/prisma';
import {
  type CreateCourtInput,
  type UpdateCourtInput,
} from './courts.validation';

const courtWithTypeSelect = {
  id: true,
  codigo: true,
  nombre: true,
  descripcion: true,
  precioHora: true,
  capacidad: true,
  ubicacion: true,
  imagen: true,
  activa: true,
  tipoCanchaId: true,
  createdAt: true,
  updatedAt: true,
  courtType: true,
} satisfies Prisma.CanchaSelect;

export type CourtWithType = Prisma.CanchaGetPayload<{
  select: typeof courtWithTypeSelect;
}>;

const handlePrismaError = (error: unknown): Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new Error('El código de la cancha ya existe.');
    }

    if (error.code === 'P2003') {
      return new Error('Tipo de cancha no encontrado.');
    }

    if (error.code === 'P2025') {
      return new Error('Cancha no encontrada.');
    }
  }

  return new Error('Error al procesar la solicitud de la cancha.');
};

const assertCourtTypeExists = async (tipoCanchaId: number): Promise<void> => {
  const courtType = await prisma.tipoCancha.findUnique({
    where: { id: tipoCanchaId },
  });

  if (!courtType) {
    throw new Error('Tipo de cancha no encontrado.');
  }
};

const generateCourtCode = async (): Promise<string> => {
  const totalCourts = await prisma.cancha.count();
  const candidate = `CAN-${String(totalCourts + 1).padStart(3, '0')}`;

  const existing = await prisma.cancha.findUnique({
    where: { codigo: candidate },
    select: { id: true },
  });

  if (!existing) {
    return candidate;
  }

  const suffix = Date.now().toString(36).toUpperCase();
  return `CAN-${suffix}`.slice(0, 20);
};

export class CourtsService {
  async findAllActive(): Promise<CourtWithType[]> {
    try {
      return await prisma.cancha.findMany({
        where: { activa: true },
        select: courtWithTypeSelect,
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(): Promise<CourtWithType[]> {
    try {
      return await prisma.cancha.findMany({
        select: courtWithTypeSelect,
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(id: number): Promise<CourtWithType | null> {
    try {
      return await prisma.cancha.findUnique({
        where: { id },
        select: courtWithTypeSelect,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async create(data: CreateCourtInput): Promise<CourtWithType> {
    try {
      await assertCourtTypeExists(data.tipoCanchaId);

      const codigo = data.codigo?.trim() || (await generateCourtCode());

      return await prisma.cancha.create({
        data: {
          ...data,
          codigo,
        },
        select: courtWithTypeSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async update(id: number, data: UpdateCourtInput): Promise<CourtWithType> {
    try {
      if (data.tipoCanchaId !== undefined) {
        await assertCourtTypeExists(data.tipoCanchaId);
      }

      return await prisma.cancha.update({
        where: { id },
        data,
        select: courtWithTypeSelect,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw handlePrismaError(error);
    }
  }

  async updateStatus(id: number, activa: boolean): Promise<CourtWithType> {
    try {
      return await prisma.cancha.update({
        where: { id },
        data: { activa },
        select: courtWithTypeSelect,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const court = await prisma.cancha.findUnique({
        where: { id },
        include: {
          _count: {
            select: { reservations: true },
          },
        },
      });

      if (!court) {
        throw new Error('Cancha no encontrada.');
      }

      if (court._count.reservations > 0) {
        throw new Error(
          'No se puede eliminar la cancha porque tiene reservas asociadas.',
        );
      }

      await prisma.cancha.delete({
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

export default new CourtsService();
