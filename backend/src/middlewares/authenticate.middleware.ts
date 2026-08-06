import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config';
import { JwtPayload } from '../modules/auth/auth.service';
import { ApiError } from '../utils/ApiError';

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
      throw new ApiError(401, 'Token no proporcionado.');
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
      throw new ApiError(401, 'Token inválido.');
    }

    req.user = decoded as JwtPayload;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError(401, 'Token inválido.'));
  }
};
