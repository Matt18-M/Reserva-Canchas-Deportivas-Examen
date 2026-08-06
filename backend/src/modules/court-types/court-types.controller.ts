import { NextFunction, Request, Response } from 'express';

import courtTypesService from './court-types.service';
import {
  type CreateCourtTypeInput,
  type UpdateCourtTypeInput,
} from './court-types.validation';

const parseCourtTypeId = (id: string | string[]): number => {
  const rawId = Array.isArray(id) ? id[0] : id;
  const courtTypeId = Number(rawId);

  if (!Number.isInteger(courtTypeId) || courtTypeId <= 0) {
    throw new Error('ID de tipo de cancha inválido.');
  }

  return courtTypeId;
};

export class CourtTypesController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courtTypes = await courtTypesService.findAll();

      res.status(200).json({
        success: true,
        message: 'Tipos de cancha obtenidos correctamente.',
        data: courtTypes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courtTypeId = parseCourtTypeId(req.params.id);
      const courtType = await courtTypesService.findById(courtTypeId);

      if (!courtType) {
        throw new Error('Tipo de cancha no encontrado.');
      }

      res.status(200).json({
        success: true,
        message: 'Tipo de cancha obtenido correctamente.',
        data: courtType,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateCourtTypeInput;
      const courtType = await courtTypesService.create(body);

      res.status(201).json({
        success: true,
        message: 'Tipo de cancha creado correctamente.',
        data: courtType,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courtTypeId = parseCourtTypeId(req.params.id);
      const body = req.body as UpdateCourtTypeInput;

      const existingCourtType = await courtTypesService.findById(courtTypeId);

      if (!existingCourtType) {
        throw new Error('Tipo de cancha no encontrado.');
      }

      const courtType = await courtTypesService.update(courtTypeId, body);

      res.status(200).json({
        success: true,
        message: 'Tipo de cancha actualizado correctamente.',
        data: courtType,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courtTypeId = parseCourtTypeId(req.params.id);

      await courtTypesService.delete(courtTypeId);

      res.status(200).json({
        success: true,
        message: 'Tipo de cancha eliminado correctamente.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CourtTypesController();
