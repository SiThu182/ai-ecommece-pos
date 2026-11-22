import { ApiErrorCode, type ApiErrorResponse } from '@ai-commerce-pos/shared';
import type { ErrorRequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from './app-error';

interface ErrorHandlerOptions {
  /** Include internal error messages in 500 responses. Must be false in production. */
  exposeInternalErrors: boolean;
}

/** Shape of errors raised by Express/body-parser (e.g. malformed JSON, payload too large). */
interface HttpLikeError {
  status: number;
  expose?: boolean;
  type?: string;
  message: string;
}

function isClientHttpError(err: unknown): err is HttpLikeError {
  if (typeof err !== 'object' || err === null) return false;
  const status = (err as { status?: unknown }).status;
  return typeof status === 'number' && status >= 400 && status < 500;
}

function sendError(res: Response, status: number, body: ApiErrorResponse): void {
  res.status(status).json(body);
}

/** Final middleware: converts any thrown error into the standard ApiErrorResponse shape. */
export function createErrorHandler({
  exposeInternalErrors,
}: ErrorHandlerOptions): ErrorRequestHandler {
  return (err: unknown, _req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }

    if (err instanceof AppError) {
      sendError(res, err.statusCode, {
        error: { code: err.code, message: err.message, details: err.details },
      });
      return;
    }

    if (err instanceof ZodError) {
      sendError(res, 400, {
        error: {
          code: ApiErrorCode.ValidationError,
          message: 'Request validation failed',
          details: err.issues,
        },
      });
      return;
    }

    if (isClientHttpError(err)) {
      const isJsonParseError = err.type === 'entity.parse.failed';
      sendError(res, err.status, {
        error: {
          code: isJsonParseError ? ApiErrorCode.InvalidJson : ApiErrorCode.BadRequest,
          message: err.expose ? err.message : 'Bad request',
        },
      });
      return;
    }

    // Unexpected error: log full details server-side, return a generic message to the client.
    // TODO(logging): replace console.error with the structured logger when it is added.
    console.error(err);
    sendError(res, 500, {
      error: {
        code: ApiErrorCode.InternalError,
        message:
          exposeInternalErrors && err instanceof Error ? err.message : 'Internal server error',
      },
    });
  };
}
