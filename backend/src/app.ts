import './config';

import express from 'express';
import cors from 'cors';

import { errorMiddleware } from './middlewares/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import courtTypesRoutes from './modules/court-types/court-types.routes';
import courtsRoutes from './modules/courts/courts.routes';
import schedulesRoutes, {
  courtSchedulesRouter,
} from './modules/schedules/schedules.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import reservationsRoutes, {
  courtAvailabilityRouter,
} from './modules/reservations/reservations.routes';
import usersRoutes from './modules/users/users.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/court-types', courtTypesRoutes);
app.use('/api/courts', courtSchedulesRouter);
app.use('/api/courts', courtAvailabilityRouter);
app.use('/api/courts', courtsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/payments', paymentsRoutes);

app.use(errorMiddleware);

export default app;
