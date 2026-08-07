import { NextFunction, Request, Response } from 'express';

import paymentsService from './payments.service';
import {
  type CreatePaymentInput,
  type UpdatePaymentStatusInput,
} from './payments.validation';

const parsePaymentId = (id: string | string[]): number => {
  const rawId = Array.isArray(id) ? id[0] : id;
  const paymentId = Number(rawId);

  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    throw new Error('ID de pago inválido.');
  }

  return paymentId;
};

const parseReservationId = (reservationId: string | string[]): number => {
  const rawId = Array.isArray(reservationId) ? reservationId[0] : reservationId;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID de reserva inválido.');
  }

  return id;
};

export class PaymentsController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await paymentsService.findAll();

      res.status(200).json({
        success: true,
        message: 'Panel de pagos obtenido correctamente.',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByReservation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('Usuario no autenticado.');
      }

      const reservationId = parseReservationId(req.params.reservationId);
      const payment = await paymentsService.findByReservationId(
        reservationId,
        req.user.id,
        req.user.rol,
      );

      res.status(200).json({
        success: true,
        message: payment
          ? 'Pago obtenido correctamente.'
          : 'La reserva no tiene pago registrado.',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentId = parsePaymentId(req.params.id);
      const payment = await paymentsService.findById(paymentId);

      if (!payment) {
        throw new Error('Pago no encontrado.');
      }

      res.status(200).json({
        success: true,
        message: 'Pago obtenido correctamente.',
        data: payment,
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

      const body = req.body as CreatePaymentInput;
      const payment = await paymentsService.create(
        req.user.id,
        req.user.rol,
        body,
      );

      res.status(201).json({
        success: true,
        message: 'Pago registrado correctamente.',
        data: payment,
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
      const paymentId = parsePaymentId(req.params.id);
      const { estado } = req.body as UpdatePaymentStatusInput;
      const payment = await paymentsService.updateStatus(paymentId, estado);

      res.status(200).json({
        success: true,
        message: 'Estado del pago actualizado correctamente.',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentsController();
