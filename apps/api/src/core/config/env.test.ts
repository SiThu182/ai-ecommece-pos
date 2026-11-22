import { describe, expect, it } from 'vitest';
import { EnvValidationError, loadEnv } from './env';

describe('loadEnv', () => {
  it('applies defaults when optional variables are missing', () => {
    const env = loadEnv({});
    expect(env).toEqual({
      NODE_ENV: 'development',
      PORT: 4000,
      LOG_LEVEL: 'info',
      CORS_ORIGIN: 'http://localhost:5173',
    });
  });

  it('coerces PORT from string to number', () => {
    expect(loadEnv({ PORT: '5000' }).PORT).toBe(5000);
  });

  it('rejects an invalid PORT', () => {
    expect(() => loadEnv({ PORT: 'not-a-port' })).toThrow(EnvValidationError);
    expect(() => loadEnv({ PORT: '70000' })).toThrow(EnvValidationError);
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() => loadEnv({ NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });
});
