import express, { type Express } from 'express';
import type { Env } from './core/config/env';
import { createErrorHandler } from './core/errors/error-handler';
import { notFoundHandler } from './core/middleware/not-found';
import { createHealthRouter } from './modules/health/health.routes';

export interface AppOptions {
  env: Env;
}

/**
 * Builds the Express application. Never calls listen(), so tests can use it with Supertest
 * without opening a port. Configuration is passed in rather than read from process.env.
 */
export function createApp({ env }: AppOptions): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // Routes
  app.use('/health', createHealthRouter());

  // Must be registered last, in this order.
  app.use(notFoundHandler);
  app.use(createErrorHandler({ exposeInternalErrors: env.NODE_ENV !== 'production' }));

  return app;
}
