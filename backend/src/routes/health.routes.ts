import { Router } from 'express';
import { env } from '../config/env.js';
import { successResponse } from '../shared/http/api-response.js';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  res.json(
    successResponse(
      {
        status: 'ok',
        service: 'rental-management-backend',
        environment: env.nodeEnv,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
      },
      req.requestId
    )
  );
});
