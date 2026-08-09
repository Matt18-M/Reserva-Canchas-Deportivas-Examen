import { NextFunction, Request, Response } from 'express';

import schedulesService from './schedules.service';
import {
  type CreateScheduleInput,
  type UpdateScheduleInput,
  type UpdateScheduleStatusInput,
} from './schedules.validation';

const parseScheduleId = (id: string | string[]): number => {
  const rawId = Array.isArray(id) ? id[0] : id;
  const scheduleId = Number(rawId);

  if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
    throw new Error('ID de horario inválido.');
  }

  return scheduleId;
};

const parseCourtId = (id: string | string[]): number => {
  const rawId = Array.isArray(id) ? id[0] : id;
  const courtId = Number(rawId);

  if (!Number.isInteger(courtId) || courtId <= 0) {
    throw new Error('ID de cancha inválido.');
  }

  return courtId;
};

export class SchedulesController {
  async getByCourt(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const courtId = parseCourtId(req.params.id);
      const schedules = await schedulesService.findActiveByCourt(courtId);

      res.status(200).json({
        success: true,
        message: 'Horarios obtenidos correctamente.',
        data: schedules,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllByCourtAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const courtId = parseCourtId(req.params.id);
      const schedules = await schedulesService.findByCourtForAdmin(courtId);

      res.status(200).json({
        success: true,
        message: 'Horarios administrativos obtenidos correctamente.',
        data: schedules,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheduleId = parseScheduleId(req.params.id);
      const schedule = await schedulesService.findById(scheduleId);

      if (!schedule) {
        throw new Error('Horario no encontrado.');
      }

      res.status(200).json({
        success: true,
        message: 'Horario obtenido correctamente.',
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateScheduleInput;
      const schedule = await schedulesService.create(body);

      res.status(201).json({
        success: true,
        message: 'Horario creado correctamente.',
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheduleId = parseScheduleId(req.params.id);
      const body = req.body as UpdateScheduleInput;
      const schedule = await schedulesService.update(scheduleId, body);

      res.status(200).json({
        success: true,
        message: 'Horario actualizado correctamente.',
        data: schedule,
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
      const scheduleId = parseScheduleId(req.params.id);
      const { activo } = req.body as UpdateScheduleStatusInput;
      const schedule = await schedulesService.updateStatus(scheduleId, activo);

      res.status(200).json({
        success: true,
        message: 'Estado del horario actualizado correctamente.',
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheduleId = parseScheduleId(req.params.id);

      await schedulesService.delete(scheduleId);

      res.status(200).json({
        success: true,
        message: 'Horario eliminado correctamente.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SchedulesController();
