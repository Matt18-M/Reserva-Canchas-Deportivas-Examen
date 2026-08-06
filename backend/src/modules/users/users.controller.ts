import { NextFunction, Request, Response } from 'express';

import usersService, { type UpdateUserData } from './users.service';

type UpdateStatusBody = {
  activo: boolean;
};

const parseUserId = (id: string | string[]): number => {
  const rawId = Array.isArray(id) ? id[0] : id;
  const userId = Number(rawId);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('ID de usuario inválido.');
  }

  return userId;
};

export class UsersController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await usersService.findAll();

      res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos correctamente.',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseUserId(req.params.id);
      const user = await usersService.findById(userId);

      if (!user) {
        throw new Error('Usuario no encontrado.');
      }

      res.status(200).json({
        success: true,
        message: 'Usuario obtenido correctamente.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('Usuario no autenticado.');
      }

      const user = await usersService.findById(req.user.id);

      if (!user) {
        throw new Error('Usuario no encontrado.');
      }

      res.status(200).json({
        success: true,
        message: 'Perfil obtenido correctamente.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseUserId(req.params.id);
      const body = req.body as UpdateUserData;

      const existingUser = await usersService.findById(userId);

      if (!existingUser) {
        throw new Error('Usuario no encontrado.');
      }

      const user = await usersService.update(userId, body);

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado correctamente.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseUserId(req.params.id);
      const { activo } = req.body as UpdateStatusBody;

      if (typeof activo !== 'boolean') {
        throw new Error('El campo activo debe ser booleano.');
      }

      const existingUser = await usersService.findById(userId);

      if (!existingUser) {
        throw new Error('Usuario no encontrado.');
      }

      const user = await usersService.updateStatus(userId, activo);

      res.status(200).json({
        success: true,
        message: 'Estado del usuario actualizado correctamente.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();
