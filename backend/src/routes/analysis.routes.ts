/**
 * Analysis Routes
 * Defines API endpoints for skin analysis
 */

import { Router } from 'express';
import {
  analyzeSkin,
  saveAnalysisResult,
  getAnalysisHistory,
  deleteAnalysis,
} from '../controllers/analysis.controller';
import { optionalAuth, authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { aiAnalysisRateLimit } from '../middlewares/rateLimit.middleware';
import { AnalyzeSkinRequestSchema } from '../schemas/analysis.schemas';

const router = Router();

/**
 * POST /api/analysis/skin
 * Analyze skin image using Gemini AI
 *
 * Middlewares:
 * - optionalAuth: Try to authenticate (for user tracking)
 * - aiAnalysisRateLimit: 10 requests/minute per user/IP
 * - validateBody: Validate request with AnalyzeSkinRequestSchema
 *
 * Request:
 * {
 *   "image": "base64_string_or_data_url",
 *   "includeExpertInfo": false,
 *   "includeAdvancedAnalysis": false
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "analysisId": "req_abc123",
 *     "result": { ... AnalysisResult }
 *   },
 *   "meta": {
 *     "timestamp": "2025-11-22T10:30:00Z",
 *     "requestId": "req_abc123",
 *     "processingTime": 2341
 *   }
 * }
 */
router.post(
  '/skin',
  optionalAuth,
  aiAnalysisRateLimit,
  validateBody(AnalyzeSkinRequestSchema),
  analyzeSkin
);

/**
 * POST /api/analysis/save
 * Save analysis result to user's history
 *
 * Middlewares:
 * - authenticate: REQUIRED - User must be logged in
 *
 * Request:
 * {
 *   "result": { ...AnalysisResult },
 *   "image": "base64_string" (optional)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "doc_id",
 *     "savedAt": "2025-12-01T10:00:00Z",
 *     "message": "Phân tích đã được lưu thành công"
 *   }
 * }
 */
router.post('/save', authenticate, saveAnalysisResult);

/**
 * GET /api/analysis/history
 * Get user's analysis history
 *
 * Middlewares:
 * - authenticate: REQUIRED - User must be logged in
 *
 * Query params:
 * - limit: number (optional, default 50, max 100)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "analyses": [...SavedAnalysis],
 *     "total": 10
 *   }
 * }
 */
router.get('/history', authenticate, getAnalysisHistory);

/**
 * DELETE /api/analysis/history/:id
 * Delete an analysis from history
 *
 * Middlewares:
 * - authenticate: REQUIRED - User must be logged in
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "message": "Đã xóa phân tích thành công"
 *   }
 * }
 */
router.delete('/history/:id', authenticate, deleteAnalysis);

export default router;
