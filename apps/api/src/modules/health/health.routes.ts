import type { HealthResponse } from '@ai-commerce-pos/shared';
import { Router } from 'express';

/**
 * Liveness check. Intentionally has no database or auth dependency, so it answers
 * "is the process up?" even when downstream services are unavailable.
 */
export function createHealthRouter(): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    const body: HealthResponse = {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
    res.set('Cache-Control', 'no-store').status(200).json(body);
  });

  return router;
}
