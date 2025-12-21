/**
 * Validation Middleware
 * Validates request body/params/query using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errorClasses';

/**
 * Validate request body with Zod schema
 *
 * Usage:
 * router.post('/endpoint',
 *   validateBody(MySchema),
 *   controller
 * )
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Parse and validate body
      const validated = schema.parse(req.body);

      // Replace request body with validated data
      req.body = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        throw new ValidationError('Dữ liệu không hợp lệ', errors);
      }

      throw error;
    }
  };
};

/**
 * Validate request params with Zod schema
 *
 * Usage:
 * router.get('/user/:id',
 *   validateParams(z.object({ id: z.string().uuid() })),
 *   controller
 * )
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        throw new ValidationError('Tham số không hợp lệ', errors);
      }

      throw error;
    }
  };
};

/**
 * Validate request query with Zod schema
 *
 * Usage:
 * router.get('/search',
 *   validateQuery(z.object({ q: z.string().min(1) })),
 *   controller
 * )
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        throw new ValidationError('Query string không hợp lệ', errors);
      }

      throw error;
    }
  };
};

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  // UUID parameter
  uuidParam: z.object({
    id: z.string().uuid('ID không hợp lệ'),
  }),

  // Pagination query
  paginationQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // Base64 image validation
  base64Image: z
    .string()
    .min(1, 'Hình ảnh không được để trống')
    .refine(
      (val) => {
        // Check if valid base64
        const base64Regex = /^data:image\/(png|jpg|jpeg|webp);base64,/;
        return base64Regex.test(val) || /^[A-Za-z0-9+/=]+$/.test(val);
      },
      { message: 'Định dạng base64 không hợp lệ' }
    ),

  // Email validation
  email: z.string().email('Email không hợp lệ'),

  // Phone validation (Vietnamese)
  phone: z.string().regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
};
