import { NextFunction, Request, Response } from 'express';

export const authorize = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      next(new Error('No autorizado.'));
      return;
    }

    next();
  };
};
