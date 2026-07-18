import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingRequestId = req.header('x-request-id');
  req.requestId = incomingRequestId && incomingRequestId.trim() ? incomingRequestId : randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
};
