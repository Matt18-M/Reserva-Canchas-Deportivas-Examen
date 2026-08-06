import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';

type ValidationErrorItem = {
  field: string;
  message: string;
};

type ValidationErrorResponse = {
  success: false;
  message: string;
  errors: ValidationErrorItem[];
};

const formatZodErrors = (error: ZodError): ValidationErrorItem[] => {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : 'body',
    message: issue.message,
  }));
};

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const response: ValidationErrorResponse = {
        success: false,
        message: 'Error de validación.',
        errors: formatZodErrors(result.error),
      };

      res.status(400).json(response);
      return;
    }

    req.body = result.data;
    next();
  };
};
