import { ApiErrorCode } from '@ai-commerce-pos/shared';
import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';

/** Registered after all routes: any request that reaches it matched no route. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, ApiErrorCode.NotFound, `Route ${req.method} ${req.path} not found`));
};
