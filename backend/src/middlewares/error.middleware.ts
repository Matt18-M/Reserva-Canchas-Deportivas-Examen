import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/ApiError';

type ErrorResponse = {
  success: false;
  message: string;
};

const isNotFoundMessage = (message: string): boolean => {
  if (message.includes(' o inactiv')) {
    return false;
  }

  return /\bno encontrad[oa]\b/i.test(message);
};

const isConflictMessage = (message: string): boolean => {
  return (
    /\bya existe\b/i.test(message) ||
    /\bya tiene\b/i.test(message) ||
    /\bsolapa\b/i.test(message) ||
    /\bya está registrado\b/i.test(message)
  );
};

const isUnauthorizedMessage = (message: string): boolean => {
  return (
    message === 'Token no proporcionado.' ||
    message === 'Token inválido.' ||
    message === 'Usuario no autenticado.' ||
    message === 'Credenciales inválidas.'
  );
};

const isForbiddenMessage = (message: string): boolean => {
  return (
    message === 'No autorizado.' ||
    message === 'El usuario se encuentra deshabilitado.' ||
    message.startsWith('No autorizado para')
  );
};

const isInternalErrorMessage = (message: string): boolean => {
  return (
    message.startsWith('Error al procesar') ||
    message === 'El rol CLIENTE no existe.' ||
    message === 'JWT_SECRET no está configurado.'
  );
};

const resolveStatusCode = (error: Error): number => {
  if (error instanceof ApiError) {
    return error.statusCode;
  }

  const { message } = error;

  if (isUnauthorizedMessage(message)) {
    return 401;
  }

  if (isForbiddenMessage(message)) {
    return 403;
  }

  if (isNotFoundMessage(message)) {
    return 404;
  }

  if (isConflictMessage(message)) {
    return 409;
  }

  if (isInternalErrorMessage(message)) {
    return 500;
  }

  return 400;
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof Error) {
    const statusCode = resolveStatusCode(error);
    const response: ErrorResponse = {
      success: false,
      message: error.message,
    };

    res.status(statusCode).json(response);
    return;
  }

  const response: ErrorResponse = {
    success: false,
    message: 'Error interno del servidor.',
  };

  res.status(500).json(response);
};
