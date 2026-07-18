import type { ErrorRequestHandler } from 'express';
import { errorResponse } from '../shared/http/api-response.js';
import { HttpError } from '../shared/http/http-error.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json(errorResponse(err.code, err.message, req.requestId, err.details));
    return;
  }

  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', message, req.requestId));
};
