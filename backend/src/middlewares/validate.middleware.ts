import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

import { ApiError } from '../utils/ApiError';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      next(new ApiError(400, 'Validation error'));
      return;
    }

    next();
  };
};
