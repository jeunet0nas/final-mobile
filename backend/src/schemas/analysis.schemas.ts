/**
 * Analysis Request/Response Schemas
 * Zod validation schemas for analysis endpoints
 */

import { z } from 'zod';
import { CommonSchemas } from '../middlewares/validation.middleware';

/**
 * Schema for skin image analysis request
 * POST /api/analysis/skin
 */
export const AnalyzeSkinRequestSchema = z.object({
  image: CommonSchemas.base64Image,
  includeExpertInfo: z.boolean().optional().default(false),
});

export type AnalyzeSkinRequest = z.infer<typeof AnalyzeSkinRequestSchema>;

/**
 * Schema for saving analysis result
 * POST /api/analysis/save
 */
export const SaveAnalysisRequestSchema = z.object({
  result: z.object({
    skinType: z
      .enum(['dầu (oily)', 'khô (dry)', 'nhạy cảm (sensitive)', 'hỗn hợp (combination)'])
      .nullable(),
    zones: z.array(
      z.object({
        zone: z.string(),
        condition: z.string(),
        riskLevel: z.enum(['Low', 'Medium', 'High']),
        visualEvidence: z.object({
          visualClues: z.string(),
          reasoning: z.string(),
          certainty: z.number().min(0).max(100),
        }),
        explanation: z.string(),
      })
    ),
    overallSummary: z.string(),
    recommendations: z.array(z.string()),
    isUncertain: z.boolean(),
    uncertaintyReason: z.string().optional(),
    confidenceScore: z.number().min(0).max(100),
    expertInfo: z
      .object({
        answer: z.string(),
        sources: z.array(
          z.object({
            sourceName: z.string(),
            url: z.string(),
          })
        ),
      })
      .optional(),
  }),
  image: z.string().optional(), // Optional base64 image for thumbnail
});

export type SaveAnalysisRequest = z.infer<typeof SaveAnalysisRequestSchema>;
