import { Prisma } from '@prisma/client';

import prisma from '../../database/prisma';

const userWithRoleSelect = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  telefono: true,
  fotoPerfil: true,
  activo: true,
  rolId: true,
  createdAt: true,
  updatedAt: true,
  role: true,
} satisfies Prisma.UsuarioSelect;

export type UserWithRole = Prisma.UsuarioGetPayload<{
  select: typeof userWithRoleSelect;
}>;

export type CreateUserData = Pick<
  Prisma.UsuarioUncheckedCreateInput,
  'nombre' | 'apellido' | 'email' | 'password' | 'rolId'
> &
  Partial<Pick<Prisma.UsuarioUncheckedCreateInput, 'telefono' | 'fotoPerfil' | 'activo'>>;

export type UpdateUserData = Pick<
  Prisma.UsuarioUpdateInput,
  'nombre' | 'apellido' | 'telefono' | 'fotoPerfil'
>;

export class UsersService {
  async findAll(): Promise<UserWithRole[]> {
    return prisma.usuario.findMany({
      select: userWithRoleSelect,
      orderBy: { id: 'asc' },
    });
  }

  async findByEmail(email: string): Promise<UserWithRole | null> {
    return prisma.usuario.findUnique({
      where: { email },
      select: userWithRoleSelect,
    });
  }

  async findById(id: number): Promise<UserWithRole | null> {
    return prisma.usuario.findUnique({
      where: { id },
      select: userWithRoleSelect,
    });
  }

  async create(data: CreateUserData): Promise<UserWithRole> {
    return prisma.usuario.create({
      data,
      select: userWithRoleSelect,
    });
  }

  async update(id: number, data: UpdateUserData): Promise<UserWithRole> {
    return prisma.usuario.update({
      where: { id },
      data,
      select: userWithRoleSelect,
    });
  }

  async updateStatus(id: number, activo: boolean): Promise<UserWithRole> {
    return prisma.usuario.update({
      where: { id },
      data: { activo },
      select: userWithRoleSelect,
    });
  }
}

export default new UsersService();
