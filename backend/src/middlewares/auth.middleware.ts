/**
 * Authentication Middleware
 * Verifies Firebase ID token and attaches user info to request
 */

import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticationError } from '../utils/errorClasses';
import { ErrorMessages } from '../constants/errorMessages';
import { logger } from '../config/logger.config';

/**
 * Extended Request interface with user info
 */
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    phoneNumber?: string;
  };
}

/**
 * Authenticate middleware
 * Verifies Firebase ID token from Authorization header
 *
 * Usage:
 * router.post('/protected', authenticate, controller)
 *
 * Mobile app sends:
 * Authorization: Bearer <FIREBASE_ID_TOKEN>
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError(ErrorMessages.INVALID_TOKEN);
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      throw new AuthenticationError(ErrorMessages.INVALID_TOKEN);
    }

    try {
      // Verify token with Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Attach user info to request
      (req as AuthRequest).user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        phoneNumber: decodedToken.phone_number,
      };

      logger.info('User authenticated', {
        userId: decodedToken.uid,
        email: decodedToken.email,
      });

      next();
    } catch (error: any) {
      logger.error('Firebase auth verification failed', {
        error: error.message,
        token: token.substring(0, 20) + '...',
      });

      // Handle specific Firebase errors
      if (error.code === 'auth/id-token-expired') {
        throw new AuthenticationError('Token đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.code === 'auth/id-token-revoked') {
        throw new AuthenticationError('Token đã bị thu hồi. Vui lòng đăng nhập lại.');
      } else if (error.code === 'auth/argument-error') {
        throw new AuthenticationError('Token không hợp lệ.');
      } else {
        throw new AuthenticationError(ErrorMessages.INVALID_TOKEN);
      }
    }
  }
);

/**
 * Optional authentication middleware
 * Tries to authenticate but doesn't throw error if token is missing/invalid
 * Useful for endpoints that work both with and without auth
 *
 * Usage:
 * router.get('/public', optionalAuth, controller)
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    (req as AuthRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      phoneNumber: decodedToken.phone_number,
    };

    logger.debug('Optional auth: User authenticated', {
      userId: decodedToken.uid,
    });
  } catch (error) {
    // Silently fail, don't throw error
    logger.debug('Optional auth: Token verification failed', {
      error: (error as Error).message,
    });
  }

  next();
};
