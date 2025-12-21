/**
 * Analysis Service - Skin analysis
 * Handles: analyzeSkinImage
 */

import { getGeminiClient } from './core.service';
import { analysisResponseSchema } from './schemas/analysis.schemas';
import { SKIN_ANALYSIS_PROMPT } from './prompts/analysis.prompts';
import { logger } from '../../config/logger.config';
import { GeminiError } from '../../utils/errorClasses';

// Configuration for retries
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 3000; // 3 seconds
// Use Gemini 2.5 Flash - latest model with enhanced capabilities
const PRIMARY_MODEL = 'gemini-2.5-flash';

// Type definitions (will be moved to types/ later)
export type SkinType = 'dầu' | 'khô' | 'nhạy cảm' | 'hỗn hợp';

export type RiskLevel = 'Low' | 'Medium' | 'High';

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

export interface AnalysisResult {
  skinType: SkinType | null;
  zones: ZoneAnalysis[];
  overallSummary: string;
  recommendations: string[];
  safetyNote: string;
  isUncertain: boolean;
  uncertaintyReason?: string;
  confidenceScore: number;
  expertInfo?: {
    answer: string;
    sources: Array<{ sourceName: string; url: string }>;
  };
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if error is retryable
 */
const isRetryableError = (error: any): boolean => {
  // Retry on 503 (Service Unavailable) and network errors
  if (error?.status === 503 || error?.statusCode === 503) return true;
  if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') return true;
  if (error?.message?.includes('503') || error?.message?.includes('unavailable')) return true;
  if (error?.message?.includes('RESOURCE_EXHAUSTED')) return true;
  if (error?.message?.includes('temporarily unavailable')) return true;
  if (error?.message?.includes('overloaded')) return true;
  if (error?.message?.includes('UNAVAILABLE')) return true;
  return false;
};

/**
 * Extract meaningful error message from Gemini error
 */
const extractGeminiErrorMessage = (error: any): string => {
  if (error?.message) {
    // Check for specific Gemini error patterns
    if (error.message.includes('quota')) {
      return 'API đã đạt giới hạn. Vui lòng thử lại sau ít phút.';
    }
    if (error.message.includes('RESOURCE_EXHAUSTED')) {
      return 'Tài nguyên API tạm thời không khả dụng. Vui lòng thử lại sau.';
    }
    if (error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) {
      return 'AI đang bận xử lý nhiều yêu cầu. Vui lòng chờ 1-2 phút và thử lại.';
    }
    if (error.message.includes('Invalid image')) {
      return 'Hình ảnh không hợp lệ. Vui lòng thử lại với hình ảnh khác.';
    }
  }
  return 'Không thể phân tích hình ảnh lúc này. Vui lòng thử lại sau.';
};

/**
 * Analyze skin image using Gemini AI
 */
export const analyzeSkinImage = async (
  base64Image: string,
  mimeType: string,
  confidenceThreshold: number = 70
): Promise<AnalysisResult> => {
  let lastError: any;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const ai = getGeminiClient();
      const prompt = SKIN_ANALYSIS_PROMPT(confidenceThreshold);

      logger.info('Starting skin analysis with Gemini AI', {
        attempt: attempt + 1,
        maxRetries: MAX_RETRIES,
        model: PRIMARY_MODEL,
      });

      const model = ai.getGenerativeModel({ model: PRIMARY_MODEL });
      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Image } }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: analysisResponseSchema,
        },
      });

      if (!response.response.text()) {
        throw new Error('No response text from Gemini');
      }

      const jsonText = response.response.text().trim();
      const result = JSON.parse(jsonText) as AnalysisResult;

      logger.info('Skin analysis completed successfully', {
        isUncertain: result.isUncertain,
        confidenceScore: result.confidenceScore,
        attempt: attempt + 1,
        model: PRIMARY_MODEL,
      });

      return result;
    } catch (error) {
      lastError = error;

      // Log the error with full details
      logger.error('Error analyzing skin image with Gemini:', {
        attempt: attempt + 1,
        maxRetries: MAX_RETRIES,
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorDetails: error,
        model: PRIMARY_MODEL,
      });

      // Check if error is retryable
      if (isRetryableError(error) && attempt < MAX_RETRIES - 1) {
        // Exponential backoff with more gradual increase
        const delay = INITIAL_RETRY_DELAY * Math.pow(1.5, attempt);
        logger.info(`Retrying in ${delay}ms...`, {
          attempt: attempt + 1,
          nextAttempt: attempt + 2,
        });
        await sleep(delay);
        continue;
      }

      // If not retryable or last attempt, throw GeminiError
      const errorMessage = extractGeminiErrorMessage(error);
      throw new GeminiError(errorMessage, {
        originalError: error instanceof Error ? error.message : String(error),
        attempt: attempt + 1,
      });
    }
  }

  // Should not reach here, but just in case
  const errorMessage = extractGeminiErrorMessage(lastError);
  throw new GeminiError(errorMessage, {
    originalError: lastError instanceof Error ? lastError.message : String(lastError),
    attempts: MAX_RETRIES,
  });
};
