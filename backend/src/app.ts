import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundMiddleware } from './middleware/not-found.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { productsRouter } from './modules/products/products.routes.js';
import { pricingRouter } from './modules/pricing/pricing.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestIdMiddleware);

  if (env.nodeEnv !== 'test') {
    app.use(morgan('combined'));
  }

  app.use(`/api/${env.apiVersion}`, healthRouter);
  app.use(`/api/${env.apiVersion}/auth`, authRouter);
  app.use(`/api/${env.apiVersion}/users`, usersRouter);
  app.use(`/api/${env.apiVersion}`, productsRouter);
  app.use(`/api/${env.apiVersion}`, pricingRouter);
  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
};
