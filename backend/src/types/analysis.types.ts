/**
 * Analysis Types - Skin analysis results
 */

import { z } from 'zod';
import { RiskLevel, RiskLevelSchema, SkinType, SkinTypeSchema } from './common.types';
import type { RagResult } from './rag.types';

// ============================================================================
// ZONE ANALYSIS
// ============================================================================

export interface ZoneAnalysis {
  zone: string;
  condition: string;
  riskLevel: RiskLevel;
  visualEvidence: {
    visualClues: string;
    reasoning: string;
    certainty: number;
  };
  explanation: string;
}

export const ZoneAnalysisSchema = z.object({
  zone: z.string(),
  condition: z.string(),
  riskLevel: RiskLevelSchema,
  visualEvidence: z.object({
    visualClues: z.string(),
    reasoning: z.string(),
    certainty: z.number().min(0).max(100),
  }),
  explanation: z.string(),
});

// ============================================================================
// ANALYSIS RESULT
// ============================================================================

export interface AnalysisResult {
  skinType: SkinType | null;
  zones: ZoneAnalysis[];
  overallSummary: string;
  recommendations: string[];
  isUncertain: boolean;
  uncertaintyReason?: string;
  confidenceScore: number;
  expertInfo?: RagResult;
}

const RagResultSchemaLocal = z.object({
  answer: z.string(),
  sources: z.array(
    z.object({
      sourceName: z.string(),
      url: z.string().url(),
    })
  ),
});

export const AnalysisResultSchema = z.object({
  skinType: SkinTypeSchema.nullable(),
  zones: z.array(ZoneAnalysisSchema),
  overallSummary: z.string(),
  recommendations: z.array(z.string()),
  isUncertain: z.boolean(),
  uncertaintyReason: z.string().optional(),
  confidenceScore: z.number().min(0).max(100),
  expertInfo: RagResultSchemaLocal.optional(),
});

// ============================================================================
// HISTORY & FEEDBACK
// ============================================================================

export interface Feedback {
  rating: 'helpful' | 'unhelpful';
  reason?: 'inaccurate' | 'unclear' | 'unsuitable' | 'other';
  details?: string;
  doctorDiagnosis?: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  imageUrl: string;
  result: AnalysisResult;
  notes: string;
  feedback?: Feedback;
}

export const FeedbackSchema = z.object({
  rating: z.enum(['helpful', 'unhelpful']),
  reason: z.enum(['inaccurate', 'unclear', 'unsuitable', 'other']).optional(),
  details: z.string().optional(),
  doctorDiagnosis: z.string().optional(),
});

export const HistoryEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  imageUrl: z.string().url(),
  result: AnalysisResultSchema,
  notes: z.string(),
  feedback: FeedbackSchema.optional(),
});
