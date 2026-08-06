import { Router } from 'express';

import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import usersController from './users.controller';

const router = Router();

router.get(
  '/profile',
  authenticate,
  usersController.getProfile.bind(usersController),
);

router.get(
  '/',
  authenticate,
  authorize(['ADMIN']),
  usersController.getAll.bind(usersController),
);

router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  usersController.getById.bind(usersController),
);

router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  usersController.update.bind(usersController),
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN']),
  usersController.updateStatus.bind(usersController),
);

export default router;
