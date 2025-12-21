/**
 * API Response Formatter
 * Standardized response structure for all endpoints
 */

import { Response } from 'express';
import { HttpStatus } from '../constants/httpStatus';

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    processingTime?: number;
  };
}

/**
 * Success Response
 * Used for successful operations
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  statusCode: number = HttpStatus.OK,
  meta?: {
    requestId?: string;
    processingTime?: number;
  }
): Response<ApiResponse<T>> => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return res.status(statusCode).json(response);
};

/**
 * Error Response
 * Used for error cases
 */
export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: any,
  requestId?: string
): Response<ApiResponse> => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: code || `ERROR_${statusCode}`,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  return res.status(statusCode).json(response);
};

/**
 * Created Response - 201
 * Used when a resource is successfully created
 */
export const createdResponse = <T>(
  res: Response,
  data: T,
  meta?: {
    requestId?: string;
    processingTime?: number;
  }
): Response<ApiResponse<T>> => {
  return successResponse(res, data, HttpStatus.CREATED, meta);
};

/**
 * No Content Response - 204
 * Used when operation succeeds but returns no data
 */
export const noContentResponse = (res: Response): Response => {
  return res.status(HttpStatus.NO_CONTENT).send();
};

/**
 * Pagination Response
 * Used for paginated results
 */
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  meta?: {
    requestId?: string;
    processingTime?: number;
  }
): Response<ApiResponse<T[]>> => {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
      ...pagination,
    },
  };

  return res.status(HttpStatus.OK).json(response);
};
