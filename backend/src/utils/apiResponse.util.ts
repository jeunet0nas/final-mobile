import { Response } from 'express';
import { HttpStatus } from '../constants/httpStatus';

interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    version: string;
    [key: string]: any;
  };
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Success',
    statusCode: number = HttpStatus.OK
  ): Response {
    const response: ApiResponseData<T> = {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Error',
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string
  ): Response {
    const response: ApiResponseData = {
      success: false,
      message,
      error,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data?: T, message: string = 'Created'): Response {
    return this.success(res, data, message, HttpStatus.CREATED);
  }

  static noContent(res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
