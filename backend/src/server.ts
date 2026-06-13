import type { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';

import sequelize from '@/config/database.js';
import { setupAssociations } from '@/models/associations.js';
import '@/models/dose.js';
import '@/models/telegram-link-token.js';
import { verifyAccess } from '@/middlewares/verifyAccess';
import loginRouter from '@/routes/login.js';
import treatmentRouter from '@/routes/treatment.js';
import userInfo from '@/routes/user-info.js';
import flashRouter from '@/routes/flash.js';
import telegramRouter from '@/routes/telegram.js';

export async function createServer() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleErrors(error: Error, request: Request, response: Response, next: NextFunction) {
    console.error(error);
    response.sendStatus(500);
  }

  setupAssociations();
  await sequelize.sync();
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: `http://localhost:${process.env.FRONT}`,
    credentials: true,
  }));

  // Public routes (no auth)
  app.use('/flash', flashRouter);
  app.use('/telegram', telegramRouter);
  app.use('/login', loginRouter);

  // Protected routes
  app.use(verifyAccess());
  app.use('/treatments', treatmentRouter);
  app.use('/user-info', userInfo);
  app.use(handleErrors);

  return app;
}
