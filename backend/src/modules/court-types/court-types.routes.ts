import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import courtTypesController from './court-types.controller';
import {
  createCourtTypeSchema,
  updateCourtTypeSchema,
} from './court-types.validation';

const router = Router();

router.get('/', courtTypesController.getAll.bind(courtTypesController));

router.get('/:id', courtTypesController.getById.bind(courtTypesController));

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createCourtTypeSchema),
  courtTypesController.create.bind(courtTypesController),
);

router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(updateCourtTypeSchema),
  courtTypesController.update.bind(courtTypesController),
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  courtTypesController.delete.bind(courtTypesController),
);

export default router;
