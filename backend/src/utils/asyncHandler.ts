/**
 * Async Handler Wrapper
 * Automatically catches async errors and passes to error middleware
 */

import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps async route handlers to catch errors automatically
 * Eliminates need for try-catch in every controller
 *
 * Usage:
 * router.post('/endpoint', asyncHandler(async (req, res) => {
 *   // Your async code here
 *   // Errors automatically caught and passed to error middleware
 * }));
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Type-safe async handler with custom request type
 * Useful when you extend Request interface
 */
export const asyncHandlerWithType = <T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
};
