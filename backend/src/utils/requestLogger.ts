/**
 * Request Logger Utility
 * Helpers for logging request details
 */

import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Extended Request interface with custom properties
 */
export interface RequestWithId extends Request {
  id?: string;
  startTime?: number;
}

/**
 * Generate unique request ID
 * Used for tracing requests across logs
 */
export const generateRequestId = (): string => {
  return `req_${uuidv4()}`;
};

/**
 * Calculate request processing time
 */
export const getProcessingTime = (startTime: number): number => {
  return Date.now() - startTime;
};

/**
 * Extract user ID from request
 * Returns Firebase UID if authenticated
 */
export const getUserId = (req: Request): string | undefined => {
  return (req as any).user?.uid;
};

/**
 * Get client IP address
 * Handles proxy forwarding
 */
export const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

/**
 * Sanitize request body for logging
 * Removes sensitive data like passwords, tokens
 */
export const sanitizeRequestBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];

  sensitiveFields.forEach((field) => {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  });

  // Truncate large base64 images for logging
  if (sanitized.image && typeof sanitized.image === 'string' && sanitized.image.length > 100) {
    sanitized.image = `[BASE64_IMAGE ${sanitized.image.length} chars]`;
  }

  return sanitized;
};
