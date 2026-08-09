import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import schedulesController from './schedules.controller';
import {
  createScheduleSchema,
  updateScheduleSchema,
  updateScheduleStatusSchema,
} from './schedules.validation';

const router = Router();

export const courtSchedulesRouter = Router();

courtSchedulesRouter.get(
  '/:id/schedules/admin',
  authenticate,
  authorize(['ADMIN']),
  schedulesController.getAllByCourtAdmin.bind(schedulesController),
);

courtSchedulesRouter.get(
  '/:id/schedules',
  schedulesController.getByCourt.bind(schedulesController),
);

router.get('/:id', schedulesController.getById.bind(schedulesController));

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createScheduleSchema),
  schedulesController.create.bind(schedulesController),
);

router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(updateScheduleSchema),
  schedulesController.update.bind(schedulesController),
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN']),
  validate(updateScheduleStatusSchema),
  schedulesController.updateStatus.bind(schedulesController),
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  schedulesController.delete.bind(schedulesController),
);

export default router;
