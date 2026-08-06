import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config';
import { JwtPayload } from '../modules/auth/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Token no proporcionado.');
    }

    if (!config.jwtSecret) {
      throw new Error('JWT_SECRET no está configurado.');
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, config.jwtSecret);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('id' in decoded) ||
      !('email' in decoded) ||
      !('rol' in decoded)
    ) {
      throw new Error('Token inválido.');
    }

    req.user = decoded as JwtPayload;
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('Token inválido.'));
  }
};
