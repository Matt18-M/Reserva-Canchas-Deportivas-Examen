import { NextFunction, Request, Response } from 'express';

import reservationsService from './reservations.service';
import {
  type CreateReservationInput,
  type SearchReservationQuery,
  type UpdateReservationStatusInput,
  availabilityQuerySchema,
  searchReservationQuerySchema,
} from './reservations.validation';

const parseReservationId = (id: string | string[]): number => {
  const rawId = Array.isArray(id) ? id[0] : id;
  const reservationId = Number(rawId);

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    throw new Error('ID de reserva inválido.');
  }

  return reservationId;
};

const parseCourtId = (courtId: string | string[]): number => {
  const rawId = Array.isArray(courtId) ? courtId[0] : courtId;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID de cancha inválido.');
  }

  return id;
};

const parseUserId = (userId: string | string[]): number => {
  const rawId = Array.isArray(userId) ? userId[0] : userId;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID de usuario inválido.');
  }

  return id;
};

const parseSearchQuery = (query: Request['query']): SearchReservationQuery => {
  const result = searchReservationQuerySchema.safeParse(query);

  if (!result.success) {
    throw new Error('Parámetros de búsqueda inválidos.');
  }

  return result.data;
};

export class ReservationsController {
  async getMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('Usuario no autenticado.');
      }

      const reservations = await reservationsService.findByUser(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Reservas obtenidas correctamente.',
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservations = await reservationsService.findAll();

      res.status(200).json({
        success: true,
        message: 'Reservas obtenidas correctamente.',
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCourt(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const courtId = parseCourtId(req.params.courtId);
      const reservations = await reservationsService.findByCourt(courtId);

      res.status(200).json({
        success: true,
        message: 'Reservas de la cancha obtenidas correctamente.',
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByUserAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseUserId(req.params.userId);
      const reservations = await reservationsService.findByUser(userId);

      res.status(200).json({
        success: true,
        message: 'Reservas del usuario obtenidas correctamente.',
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = parseSearchQuery(req.query);
      const reservations = await reservationsService.search(filters);

      res.status(200).json({
        success: true,
        message: 'Búsqueda de reservas realizada correctamente.',
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservationId = parseReservationId(req.params.id);
      const reservation = await reservationsService.findById(reservationId);

      if (!reservation) {
        throw new Error('Reserva no encontrada.');
      }

      res.status(200).json({
        success: true,
        message: 'Reserva obtenida correctamente.',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('Usuario no autenticado.');
      }

      const body = req.body as CreateReservationInput;
      const reservation = await reservationsService.create(req.user.id, body);

      res.status(201).json({
        success: true,
        message: 'Reserva creada correctamente.',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailability(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const courtId = parseCourtId(req.params.id);
      const queryResult = availabilityQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        throw new Error('Parámetro date inválido.');
      }

      const availability = await reservationsService.getAvailability(
        courtId,
        queryResult.data.date,
      );

      res.status(200).json({
        success: true,
        message: 'Disponibilidad obtenida correctamente.',
        data: availability,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('Usuario no autenticado.');
      }

      const reservationId = parseReservationId(req.params.id);
      const reservation = await reservationsService.cancel(
        reservationId,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: 'Reserva cancelada correctamente.',
        data: reservation,
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
      const reservationId = parseReservationId(req.params.id);
      const { estado } = req.body as UpdateReservationStatusInput;
      const reservation = await reservationsService.updateStatus(
        reservationId,
        estado,
      );

      res.status(200).json({
        success: true,
        message: 'Estado de la reserva actualizado correctamente.',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReservationsController();
