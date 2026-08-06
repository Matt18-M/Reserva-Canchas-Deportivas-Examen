import { Router } from 'express';

import { validate } from '../../middlewares/validate.middleware';
import authController from './auth.controller';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  authController.register.bind(authController),
);

router.post(
  '/login',
  validate(loginSchema),
  authController.login.bind(authController),
);

export default router;