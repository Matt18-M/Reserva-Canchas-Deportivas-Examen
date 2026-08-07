import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import reservationsController from './reservations.controller';
import {
  createReservationSchema,
  updateReservationStatusSchema,
} from './reservations.validation';

const router = Router();

export const courtAvailabilityRouter = Router();

courtAvailabilityRouter.get(
  '/:id/availability',
  reservationsController.getAvailability.bind(reservationsController),
);

router.get(
  '/me',
  authenticate,
  reservationsController.getMine.bind(reservationsController),
);

router.get(
  '/search',
  authenticate,
  authorize(['ADMIN']),
  reservationsController.search.bind(reservationsController),
);

router.get(
  '/court/:courtId',
  authenticate,
  authorize(['ADMIN']),
  reservationsController.getByCourt.bind(reservationsController),
);

router.get(
  '/user/:userId',
  authenticate,
  authorize(['ADMIN']),
  reservationsController.getByUserAdmin.bind(reservationsController),
);

router.get(
  '/history',
  authenticate,
  authorize(['ADMIN']),
  reservationsController.getHistory.bind(reservationsController),
);

router.get(
  '/',
  authenticate,
  authorize(['ADMIN']),
  reservationsController.getAll.bind(reservationsController),
);

router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  reservationsController.getById.bind(reservationsController),
);

router.post(
  '/',
  authenticate,
  validate(createReservationSchema),
  reservationsController.create.bind(reservationsController),
);

router.patch(
  '/:id/cancel',
  authenticate,
  reservationsController.cancel.bind(reservationsController),
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN']),
  validate(updateReservationStatusSchema),
  reservationsController.updateStatus.bind(reservationsController),
);

export default router;
