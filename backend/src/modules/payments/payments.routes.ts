import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import paymentsController from './payments.controller';
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
} from './payments.validation';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(['ADMIN']),
  paymentsController.getAll.bind(paymentsController),
);

router.get(
  '/reservation/:reservationId',
  authenticate,
  paymentsController.getByReservation.bind(paymentsController),
);

router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  paymentsController.getById.bind(paymentsController),
);

router.post(
  '/',
  authenticate,
  validate(createPaymentSchema),
  paymentsController.create.bind(paymentsController),
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN']),
  validate(updatePaymentStatusSchema),
  paymentsController.updateStatus.bind(paymentsController),
);

export default router;
