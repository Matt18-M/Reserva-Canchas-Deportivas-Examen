import { NextFunction, Request, Response } from 'express';

import authService, { type LoginData, type RegisterData } from './auth.service';

export class AuthController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body = req.body as RegisterData;
      const usuario = await authService.register(body);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente.',
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as LoginData;
      const { user, token } = await authService.login(body);

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
