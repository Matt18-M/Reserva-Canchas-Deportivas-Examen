import express from 'express';
import cors from 'cors';

import { errorMiddleware } from './middlewares/error.middleware';
import authRoutes from './modules/auth/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use(errorMiddleware);

export default app;
