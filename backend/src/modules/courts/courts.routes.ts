import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import courtsController from './courts.controller';
import {
  createCourtSchema,
  updateCourtSchema,
  updateCourtStatusSchema,
} from './courts.validation';

const router = Router();

router.get('/', courtsController.getAll.bind(courtsController));

router.get('/:id', courtsController.getById.bind(courtsController));

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createCourtSchema),
  courtsController.create.bind(courtsController),
);

router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(updateCourtSchema),
  courtsController.update.bind(courtsController),
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN']),
  validate(updateCourtStatusSchema),
  courtsController.updateStatus.bind(courtsController),
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  courtsController.delete.bind(courtsController),
);

export default router;
