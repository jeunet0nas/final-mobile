/**
 * Analysis Controller
 * Handles skin analysis API endpoints
 */

import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { GeminiError, ValidationError } from '../utils/errorClasses';
import { ErrorMessages } from '../constants/errorMessages';
import { logger } from '../config/logger.config';
import { RequestWithId } from '../utils/requestLogger';
import { AuthRequest } from '../middlewares/auth.middleware';
import { analyzeSkinImage } from '../services/gemini/analysis.service';
import { getExpertInfoForCondition } from '../services/gemini/rag.service';
import type { AnalyzeSkinRequest } from '../schemas/analysis.schemas';

/**
 * Helper to extract base64 and mimeType from data URL or raw base64
 */
const parseBase64Image = (imageData: string): { base64: string; mimeType: string } => {
  // Check if it's a data URL: data:image/png;base64,iVBORw0...
  if (imageData.startsWith('data:image/')) {
    const matches = imageData.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (matches) {
      return {
        mimeType: matches[1],
        base64: matches[2],
      };
    }
  }

  // Assume raw base64 with default mime type
  return {
    base64: imageData,
    mimeType: 'image/jpeg',
  };
};

/**
 * POST /api/analysis/skin
 * Analyze skin image using Gemini AI
 *
 * Flow:
 * 1. Parse base64 image
 * 2. Call analyzeSkinImage service
 * 3. Optionally get expert info for main condition
 * 4. Return analysis result with metadata
 */
export const analyzeSkin = asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req as RequestWithId).id;
  const userId = (req as AuthRequest).user?.uid;
  const body = req.body as AnalyzeSkinRequest;

  logger.info('Starting skin analysis', {
    requestId,
    userId,
    includeExpertInfo: body.includeExpertInfo,
  });

  try {
    // Parse image
    const { base64, mimeType } = parseBase64Image(body.image);

    // Analyze skin image
    const analysisResult = await analyzeSkinImage(base64, mimeType);

    // Optionally get expert info for the most severe condition
    let expertInfo = undefined;
    if (body.includeExpertInfo && analysisResult.zones.length > 0) {
      // Find zone with highest risk
      const highRiskZone =
        analysisResult.zones.find((z) => z.riskLevel === 'High') || analysisResult.zones[0];

      if (highRiskZone) {
        logger.info('Fetching expert info for condition', {
          requestId,
          condition: highRiskZone.condition,
        });

        try {
          expertInfo = await getExpertInfoForCondition(highRiskZone.condition);
        } catch (error) {
          logger.warn('Failed to fetch expert info', {
            requestId,
            error: (error as Error).message,
          });
          // Continue without expert info
        }
      }
    }

    // Add expert info to result if available
    if (expertInfo) {
      analysisResult.expertInfo = expertInfo;
    }

    const processingTime = Date.now() - startTime;

    logger.info('Skin analysis completed', {
      requestId,
      userId,
      skinType: analysisResult.skinType,
      zonesCount: analysisResult.zones.length,
      processingTime: `${processingTime}ms`,
    });

    return successResponse(
      res,
      {
        analysisId: requestId,
        result: analysisResult,
      },
      200,
      {
        requestId,
        processingTime,
      }
    );
  } catch (error) {
    logger.error('Skin analysis failed', {
      requestId,
      userId,
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    throw new GeminiError(ErrorMessages.GEMINI_API_ERROR, {
      details: (error as Error).message,
    });
  }
});

/**
 * POST /api/analysis/save
 * Save analysis result to user's history
 * Requires authentication
 *
 * Flow:
 * 1. Verify user is authenticated
 * 2. Save analysis result to Firestore
 * 3. Return saved document ID
 */
export const saveAnalysisResult = asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req as RequestWithId).id;
  const userId = (req as AuthRequest).user!.uid; // Required by authenticate middleware
  const { result, image } = req.body;

  logger.info('Saving analysis', {
    requestId,
    userId,
    hasImage: !!image,
  });

  try {
    // Save to Firestore
    const docRef = await admin
      .firestore()
      .collection('analyses')
      .add({
        userId,
        result,
        imageUrl: image || null, // Optional: Could upload to Storage
        savedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    const processingTime = Date.now() - startTime;

    logger.info('Analysis saved successfully', {
      requestId,
      userId,
      docId: docRef.id,
      processingTime: `${processingTime}ms`,
    });

    return successResponse(
      res,
      {
        id: docRef.id,
        savedAt: new Date().toISOString(),
        message: 'Phân tích đã được lưu thành công',
      },
      201,
      {
        requestId,
        processingTime,
      }
    );
  } catch (error) {
    logger.error('Failed to save analysis', {
      requestId,
      userId,
      error: (error as Error).message,
    });

    throw new Error('Không thể lưu phân tích. Vui lòng thử lại.');
  }
});

/**
 * GET /api/analysis/history
 * Get user's analysis history
 * Requires authentication
 *
 * Query params:
 * - limit: number (default 50, max 100)
 *
 * Flow:
 * 1. Verify user is authenticated
 * 2. Query Firestore for user's analyses
 * 3. Return paginated results
 */
export const getAnalysisHistory = asyncHandler(async (req: Request, res: Response) => {
  const requestId = (req as RequestWithId).id;
  const userId = (req as AuthRequest).user!.uid;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

  logger.info('Fetching analysis history', {
    requestId,
    userId,
    limit,
  });

  try {
    const snapshot = await admin
      .firestore()
      .collection('analyses')
      .where('userId', '==', userId)
      .orderBy('savedAt', 'desc')
      .limit(limit)
      .get();

    const analyses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      savedAt: doc.data().savedAt?.toDate().toISOString(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    logger.info('Analysis history fetched', {
      requestId,
      userId,
      count: analyses.length,
    });

    return successResponse(res, {
      analyses,
      total: analyses.length,
    });
  } catch (error) {
    logger.error('Failed to fetch analysis history', {
      requestId,
      userId,
      error: (error as Error).message,
    });

    throw new Error('Không thể tải lịch sử. Vui lòng thử lại.');
  }
});

/**
 * DELETE /api/analysis/history/:id
 * Delete an analysis from user's history
 * Requires authentication
 *
 * Flow:
 * 1. Verify user is authenticated
 * 2. Verify analysis ownership
 * 3. Delete from Firestore
 */
export const deleteAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const requestId = (req as RequestWithId).id;
  const userId = (req as AuthRequest).user!.uid;
  const analysisId = req.params.id;

  logger.info('Deleting analysis', {
    requestId,
    userId,
    analysisId,
  });

  try {
    const docRef = admin.firestore().collection('analyses').doc(analysisId);
    const doc = await docRef.get();

    // Check if document exists
    if (!doc.exists) {
      throw new ValidationError('Không tìm thấy phân tích');
    }

    // Verify ownership
    if (doc.data()?.userId !== userId) {
      throw new ValidationError('Bạn không có quyền xóa phân tích này');
    }

    // Delete document
    await docRef.delete();

    logger.info('Analysis deleted successfully', {
      requestId,
      userId,
      analysisId,
    });

    return successResponse(res, {
      message: 'Đã xóa phân tích thành công',
    });
  } catch (error) {
    logger.error('Failed to delete analysis', {
      requestId,
      userId,
      analysisId,
      error: (error as Error).message,
    });

    throw error;
  }
});
