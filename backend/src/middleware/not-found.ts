import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../shared/http/http-error.js';

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new HttpError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found`));
};
