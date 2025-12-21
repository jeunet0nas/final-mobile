/**
 * Custom Error Classes
 * Structured error types for different scenarios
 */

import { HttpStatus, HttpStatusCode } from '../constants/httpStatus';

/**
 * Base API Error class
 * All custom errors extend from this
 */
export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(statusCode: HttpStatusCode, message: string, isOperational = true, details?: any) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this);
  }
}

/**
 * Validation Error - 400
 * Used when request data is invalid
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(HttpStatus.BAD_REQUEST, message, true, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error - 401
 * Used when authentication fails
 */
export class AuthenticationError extends ApiError {
  constructor(message: string, details?: any) {
    super(HttpStatus.UNAUTHORIZED, message, true, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error - 403
 * Used when user lacks permission
 */
export class AuthorizationError extends ApiError {
  constructor(message: string, details?: any) {
    super(HttpStatus.FORBIDDEN, message, true, details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error - 404
 * Used when resource is not found
 */
export class NotFoundError extends ApiError {
  constructor(message: string, details?: any) {
    super(HttpStatus.NOT_FOUND, message, true, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Rate Limit Error - 429
 * Used when rate limit is exceeded
 */
export class RateLimitError extends ApiError {
  constructor(message: string, details?: any) {
    super(HttpStatus.TOO_MANY_REQUESTS, message, true, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Gemini AI Error - 503
 * Used when Gemini AI service fails
 */
export class GeminiError extends ApiError {
  constructor(message: string, details?: any) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message, true, details);
    this.name = 'GeminiError';
  }
}

/**
 * Firebase Error - 503
 * Used when Firebase service fails
 */
export class FirebaseError extends ApiError {
  constructor(message: string, details?: any) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message, true, details);
    this.name = 'FirebaseError';
  }
}

/**
 * Internal Server Error - 500
 * Used for unexpected errors
 */
export class InternalError extends ApiError {
  constructor(message: string, details?: any) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message, false, details);
    this.name = 'InternalError';
  }
}
