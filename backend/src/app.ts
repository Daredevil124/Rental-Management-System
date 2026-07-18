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
import cartRouter from './modules/cart/cart.routes.js';
import rentalsRouter from './modules/rentals/rentals.routes.js';
import quotationsRouter from './modules/quotations/quotations.routes.js';
import pickupReturnRouter from './modules/pickup-return/pickup-return.routes.js';
import depositsRouter from './modules/deposits/deposits.routes.js';
import dashboardRouter from './modules/dashboard/dashboard.routes.js';

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
  app.use(`/api/${env.apiVersion}/cart`, cartRouter);
  app.use(`/api/${env.apiVersion}/rentals`, rentalsRouter);
  app.use(`/api/${env.apiVersion}`, quotationsRouter);
  app.use(`/api/${env.apiVersion}`, pickupReturnRouter);
  app.use(`/api/${env.apiVersion}`, depositsRouter);
  app.use(`/api/${env.apiVersion}`, dashboardRouter);
  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
};
