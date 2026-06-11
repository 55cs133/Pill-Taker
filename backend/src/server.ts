import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';

import sequelize from '@/config/database.js';
import { verifyAccess } from '@/middlewares/verifyAccess';
import loginRouter from '@/routes/login.js';
import treatmentRouter from '@/routes/treatment.js';
import userInfo from '@/routes/user-info.js';

export async function createServer() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleErrors(error, request, response, next) {
    console.error(error);
    response.sendStatus(500);
  }

  sequelize.sync({ force: true });
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: `http://localhost:${process.env.FRONT}`,
    credentials: true,
  }));
  app.use(verifyAccess());
  app.use('/login', loginRouter);
  app.use('/treatments', treatmentRouter);
  app.use('/user-info', userInfo);
  app.use(handleErrors);

  return app;
}
