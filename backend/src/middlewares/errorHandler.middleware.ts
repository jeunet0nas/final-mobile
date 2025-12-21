/**
 * Error Handler Middleware
 * Global error handler - catches all errors and formats response
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errorClasses';
import { errorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorMessages } from '../constants/errorMessages';
import { logger } from '../config/logger.config';
import { RequestWithId } from '../utils/requestLogger';

/**
 * Global error handler
 * Must be registered LAST in middleware chain
 *
 * Handles:
 * - ApiError (our custom errors)
 * - Validation errors (Zod, express-validator)
 * - Firebase errors
 * - Unexpected errors
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const requestId = (req as RequestWithId).id;

  // Handle ApiError (our custom errors)
  if (err instanceof ApiError) {
    logger.error('API Error', {
      requestId,
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      details: err.details,
      stack: err.stack,
    });

    return errorResponse(res, err.statusCode, err.message, err.name, err.details, requestId);
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const zodError = err as any;
    logger.warn('Zod validation error', {
      requestId,
      errors: zodError.errors,
    });

    return errorResponse(
      res,
      HttpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_REQUEST,
      'VALIDATION_ERROR',
      zodError.errors,
      requestId
    );
  }

  // Handle express-validator errors
  if (err.name === 'ValidationError') {
    logger.warn('Validation error', {
      requestId,
      error: err.message,
    });

    return errorResponse(
      res,
      HttpStatus.BAD_REQUEST,
      err.message,
      'VALIDATION_ERROR',
      undefined,
      requestId
    );
  }

  // Handle Firebase Admin errors
  if (err.name === 'FirebaseError' || (err as any).code?.startsWith('auth/')) {
    logger.error('Firebase error', {
      requestId,
      code: (err as any).code,
      message: err.message,
    });

    return errorResponse(
      res,
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorMessages.FIREBASE_ERROR,
      'FIREBASE_ERROR',
      { code: (err as any).code },
      requestId
    );
  }

  // Handle JSON parsing errors (malformed request body)
  if (err instanceof SyntaxError && (err as any).status === 400) {
    logger.warn('JSON parse error', {
      requestId,
      error: err.message,
    });

    return errorResponse(
      res,
      HttpStatus.BAD_REQUEST,
      'Dữ liệu JSON không hợp lệ',
      'JSON_PARSE_ERROR',
      undefined,
      requestId
    );
  }

  // Handle unexpected errors
  logger.error('Unexpected error', {
    requestId,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  return errorResponse(
    res,
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorMessages.INTERNAL_SERVER_ERROR,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined,
    requestId
  );
};

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  const requestId = (req as RequestWithId).id;

  logger.warn('Route not found', {
    requestId,
    method: req.method,
    path: req.path,
  });

  return errorResponse(
    res,
    HttpStatus.NOT_FOUND,
    `Không tìm thấy route: ${req.method} ${req.path}`,
    'NOT_FOUND',
    undefined,
    requestId
  );
};
