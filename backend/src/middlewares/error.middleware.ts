import { NextFunction, Request, Response } from 'express';

type ErrorResponse = {
  success: false;
  message: string;
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof Error) {
    const response: ErrorResponse = {
      success: false,
      message: error.message,
    };

    res.status(400).json(response);
    return;
  }

  const response: ErrorResponse = {
    success: false,
    message: 'Error interno del servidor.',
  };

  res.status(500).json(response);
};
