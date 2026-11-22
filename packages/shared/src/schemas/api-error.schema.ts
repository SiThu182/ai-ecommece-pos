import { z } from 'zod';

/** Machine-readable error codes returned by the API. Extend as features are added. */
export const ApiErrorCode = {
  BadRequest: 'BAD_REQUEST',
  InvalidJson: 'INVALID_JSON',
  ValidationError: 'VALIDATION_ERROR',
  NotFound: 'NOT_FOUND',
  InternalError: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/** Every API error response has this shape, so the frontend can handle errors uniformly. */
export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
