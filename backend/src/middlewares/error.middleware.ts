import { Request, Response, NextFunction } from 'express';

import { ApiError } from '../utils/ApiError';
import { errorResponse } from '../utils/ApiResponse';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  res.status(500).json(errorResponse('Internal server error'));
};
