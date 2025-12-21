/**
 * Request Logger Middleware
 * Logs all incoming requests with details
 */

import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { logger } from '../config/logger.config';
import {
  generateRequestId,
  getClientIp,
  sanitizeRequestBody,
  RequestWithId,
} from '../utils/requestLogger';

/**
 * Attach request ID and start time to request
 */
export const attachRequestMetadata = (req: Request, res: Response, next: NextFunction) => {
  const requestWithId = req as RequestWithId;

  // Generate unique request ID
  requestWithId.id = generateRequestId();

  // Attach start time for duration calculation
  requestWithId.startTime = Date.now();

  // Attach request ID to response headers
  res.setHeader('X-Request-ID', requestWithId.id);

  next();
};

/**
 * Morgan HTTP logger
 * Logs HTTP request/response with custom format
 */
export const morganLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  }
);

/**
 * Detailed request logger
 * Logs request details after response is sent
 */
export const detailedRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestWithId = req as RequestWithId;
  const startTime = requestWithId.startTime || Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = (req as any).user?.uid;

    logger.info('Request completed', {
      requestId: requestWithId.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      body: sanitizeRequestBody(req.body),
    });
  });

  next();
};

/**
 * Combined request logger middleware
 * Use this in app.ts
 */
export const requestLogger = [attachRequestMetadata, morganLogger, detailedRequestLogger];
