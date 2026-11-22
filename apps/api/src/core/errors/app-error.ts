import type { ApiErrorCode } from '@ai-commerce-pos/shared';

interface AppErrorOptions {
  details?: unknown;
  cause?: unknown;
}

/**
 * An expected, client-facing error. Throw it from routes or services;
 * the central error handler turns it into a consistent JSON response.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details: unknown;

  constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = options.details;
  }
}
