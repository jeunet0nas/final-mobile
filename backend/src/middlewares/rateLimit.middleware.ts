/**
 * Rate Limiting Middleware
 * Protects API from abuse and excessive requests
 */

import rateLimit from 'express-rate-limit';
import { ErrorMessages } from '../constants/errorMessages';
import { HttpStatus } from '../constants/httpStatus';
import { errorResponse } from '../utils/apiResponse';
import { Request, Response } from 'express';

/**
 * Rate limiter handler
 * Custom handler for rate limit exceeded
 */
const rateLimitHandler = (req: Request, res: Response) => {
  return errorResponse(
    res,
    HttpStatus.TOO_MANY_REQUESTS,
    ErrorMessages.TOO_MANY_REQUESTS,
    'RATE_LIMIT_EXCEEDED',
    {
      retryAfter: (req as any).rateLimit?.resetTime,
    }
  );
};

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 *
 * Applied to all routes
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: ErrorMessages.TOO_MANY_REQUESTS,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: rateLimitHandler,
  // Use IP address as key
  keyGenerator: (req: Request) => {
    return req.ip || 'unknown';
  },
});

/**
 * AI Analysis rate limiter
 * 10 requests per minute per IP
 *
 * For expensive AI operations (Gemini API calls)
 * Applied to: /api/analysis/*, /api/skincare/coaching
 */
export const aiAnalysisRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Bạn đã gửi quá nhiều yêu cầu phân tích. Vui lòng chờ 1 phút.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => {
    // Use userId if authenticated, otherwise IP
    const userId = (req as any).user?.uid;
    return userId || req.ip || 'unknown';
  },
  // Skip if request is from admin
  skip: (req: Request) => {
    const userId = (req as any).user?.uid;
    return userId === process.env.ADMIN_UID; // Optional admin bypass
  },
});

/**
 * Chatbot rate limiter
 * 20 requests per minute per user
 *
 * For chatbot conversations
 * Applied to: /api/chatbot/*
 */
export const chatbotRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng chờ 1 phút.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.uid;
    return userId || req.ip || 'unknown';
  },
});

/**
 * Skincare routine rate limiter
 * 15 requests per minute per user
 *
 * For skincare recommendations
 * Applied to: /api/skincare/direction, /api/skincare/routine
 */
export const skincareRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute
  message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ 1 phút.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.uid;
    return userId || req.ip || 'unknown';
  },
});

/**
 * Report webhook rate limiter
 * 5 requests per minute per IP
 *
 * For webhook submissions
 * Applied to: /api/report/*
 */
export const reportRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Bạn đã gửi quá nhiều báo cáo. Vui lòng chờ 1 phút.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => {
    return req.ip || 'unknown';
  },
});

/**
 * Strict rate limiter for sensitive operations
 * 3 requests per minute per user
 *
 * For critical operations
 */
export const strictRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ 1 phút.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.uid;
    return userId || req.ip || 'unknown';
  },
});
