import { NextFunction, Request, Response } from 'express';

import courtsService from './courts.service';
import {
  type CreateCourtInput,
  type UpdateCourtInput,
  type UpdateCourtStatusInput,
} from './courts.validation';

const parseCourtId = (id: string | string[]): number => {
  const rawId = Array.isArray(id) ? id[0] : id;
  const courtId = Number(rawId);

  if (!Number.isInteger(courtId) || courtId <= 0) {
    throw new Error('ID de cancha inválido.');
  }

  return courtId;
};

export class CourtsController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courts = await courtsService.findAllActive();

      res.status(200).json({
        success: true,
        message: 'Canchas obtenidas correctamente.',
        data: courts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courtId = parseCourtId(req.params.id);
      const court = await courtsService.findById(courtId);

      if (!court) {
        throw new Error('Cancha no encontrada.');
      }

      res.status(200).json({
        success: true,
        message: 'Cancha obtenida correctamente.',
        data: court,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateCourtInput;
      const court = await courtsService.create(body);

      res.status(201).json({
        success: true,
        message: 'Cancha creada correctamente.',
        data: court,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courtId = parseCourtId(req.params.id);
      const body = req.body as UpdateCourtInput;

      const existingCourt = await courtsService.findById(courtId);

      if (!existingCourt) {
        throw new Error('Cancha no encontrada.');
      }

      const court = await courtsService.update(courtId, body);

      res.status(200).json({
        success: true,
        message: 'Cancha actualizada correctamente.',
        data: court,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const courtId = parseCourtId(req.params.id);
      const { activa } = req.body as UpdateCourtStatusInput;

      const existingCourt = await courtsService.findById(courtId);

      if (!existingCourt) {
        throw new Error('Cancha no encontrada.');
      }

      const court = await courtsService.updateStatus(courtId, activa);

      res.status(200).json({
        success: true,
        message: 'Estado de la cancha actualizado correctamente.',
        data: court,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courtId = parseCourtId(req.params.id);

      await courtsService.delete(courtId);

      res.status(200).json({
        success: true,
        message: 'Cancha eliminada correctamente.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CourtsController();
