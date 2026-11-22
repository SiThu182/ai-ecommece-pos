import { apiErrorResponseSchema, healthResponseSchema } from '@ai-commerce-pos/shared';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { loadEnv } from '../src/core/config/env';

const app = createApp({ env: loadEnv({ NODE_ENV: 'test' }) });

describe('GET /health', () => {
  it('returns 200 with a payload matching the shared HealthResponse schema', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(healthResponseSchema.safeParse(res.body).success).toBe(true);
    expect(res.body).toMatchObject({ status: 'ok', service: 'api' });
  });

  it('does not expose the X-Powered-By header', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('error handling', () => {
  it('returns a 404 ApiErrorResponse for unknown routes', async () => {
    const res = await request(app).get('/does-not-exist');

    expect(res.status).toBe(404);
    expect(apiErrorResponseSchema.safeParse(res.body).success).toBe(true);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns a 400 INVALID_JSON ApiErrorResponse for malformed JSON bodies', async () => {
    const res = await request(app)
      .post('/health')
      .set('Content-Type', 'application/json')
      .send('{"broken":');

    expect(res.status).toBe(400);
    expect(apiErrorResponseSchema.safeParse(res.body).success).toBe(true);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });
});
