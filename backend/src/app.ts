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
import { handleDashboardEvents } from './modules/dashboard/realtime.js';
import { downloadInvoice } from './modules/invoices/controller.js';

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
  
  // Realtime SSE event channel (C04)
  app.get(`/api/${env.apiVersion}/admin/dashboard/events`, handleDashboardEvents);
  
  // Invoice download handler (C06)
  app.get(`/api/${env.apiVersion}/rentals/:rentalId/invoice`, downloadInvoice);

  // System Metrics endpoint (C08)
  app.get(`/api/${env.apiVersion}/metrics`, (req, res) => {
    const memoryUsage = process.memoryUsage();
    res.status(200).json({
      success: true,
      data: {
        uptime: process.uptime(),
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100} MB`,
        },
        cpu: process.cpuUsage(),
        nodeVersion: process.version,
      },
      meta: {
        requestId: req.headers["x-request-id"]
      }
    });
  });
  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
};
