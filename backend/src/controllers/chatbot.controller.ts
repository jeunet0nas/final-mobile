/**
 * Chatbot Controller
 * Handles chatbot and RAG (Retrieval-Augmented Generation) API endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { GeminiError } from '../utils/errorClasses';
import { ErrorMessages } from '../constants/errorMessages';
import { logger } from '../config/logger.config';
import { RequestWithId } from '../utils/requestLogger';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  getGroundedAnswer,
  getExpertInfoForCondition,
  getChatbotResponse,
} from '../services/gemini/rag.service';
import type {
  ChatQuestionRequest,
  ExpertInfoRequest,
  ChatConversationRequest,
} from '../schemas/chatbot.schemas';

/**
 * POST /api/chatbot/question
 * Get grounded answer using RAG (Retrieval-Augmented Generation)
 *
 * Flow:
 * 1. Extract question from request
 * 2. Call getGroundedAnswer service
 *    - Search knowledge base for relevant chunks
 *    - Generate answer with Gemini + grounding
 *    - Return answer with source citations
 * 3. Return answer and sources
 *
 * Use case:
 * - Medical/skincare questions
 * - Need authoritative, fact-based answers
 * - Source verification important
 *
 * RAG benefits:
 * - Reduces hallucination (grounded in knowledge base)
 * - Provides citations/sources
 * - Up-to-date medical information
 */
export const answerQuestion = asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req as RequestWithId).id;
  const userId = (req as AuthRequest).user?.uid;
  const body = req.body as ChatQuestionRequest;

  logger.info('Processing RAG question', {
    requestId,
    userId,
    questionLength: body.question.length,
  });

  try {
    // Get grounded answer from RAG service
    const result = await getGroundedAnswer(body.question);

    const processingTime = Date.now() - startTime;

    logger.info('RAG question answered', {
      requestId,
      userId,
      sourcesCount: result.sources.length,
      answerLength: result.answer.length,
      processingTime: `${processingTime}ms`,
    });

    return successResponse(
      res,
      {
        questionId: requestId,
        question: body.question,
        answer: result.answer,
        sources: result.sources,
      },
      200,
      {
        requestId,
        processingTime,
      }
    );
  } catch (error) {
    logger.error('Failed to answer RAG question', {
      requestId,
      userId,
      question: body.question,
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    throw new GeminiError(ErrorMessages.GEMINI_API_ERROR, {
      details: (error as Error).message,
    });
  }
});

/**
 * POST /api/chatbot/expert-info
 * Get expert information about a skin condition
 *
 * Flow:
 * 1. Extract skin condition name
 * 2. Call getExpertInfoForCondition service
 *    - Search knowledge base for condition-specific info
 *    - Generate comprehensive explanation
 *    - Include treatment options, causes, prevention
 * 3. Return expert info with sources
 *
 * Use case:
 * - Deep dive into specific condition (e.g., "Mụn đầu đen")
 * - Post-analysis detailed explanation
 * - Educational content for users
 *
 * Info includes:
 * - What is the condition?
 * - Common causes
 * - Treatment options
 * - Prevention tips
 * - When to see a doctor
 */
export const getExpertInfo = asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req as RequestWithId).id;
  const userId = (req as AuthRequest).user?.uid;
  const body = req.body as ExpertInfoRequest;

  logger.info('Fetching expert info', {
    requestId,
    userId,
    condition: body.condition,
  });

  try {
    // Get expert info from RAG service
    const result = await getExpertInfoForCondition(body.condition);

    const processingTime = Date.now() - startTime;

    logger.info('Expert info retrieved', {
      requestId,
      userId,
      condition: body.condition,
      sourcesCount: result.sources.length,
      processingTime: `${processingTime}ms`,
    });

    return successResponse(
      res,
      {
        infoId: requestId,
        condition: body.condition,
        answer: result.answer,
        sources: result.sources,
      },
      200,
      {
        requestId,
        processingTime,
      }
    );
  } catch (error) {
    logger.error('Failed to get expert info', {
      requestId,
      userId,
      condition: body.condition,
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    throw new GeminiError(ErrorMessages.GEMINI_API_ERROR, {
      details: (error as Error).message,
    });
  }
});

/**
 * POST /api/chatbot/chat
 * Conversational chatbot with context history
 *
 * Flow:
 * 1. Extract conversation history and new message
 * 2. Optionally extract attached image (base64)
 * 3. Call getChatbotResponse service
 *    - Maintain conversation context
 *    - Optional RAG for medical questions
 *    - Support image analysis in chat
 * 4. Return chatbot response with optional sources
 *
 * Use case:
 * - Multi-turn conversation
 * - Follow-up questions
 * - Context-aware responses
 * - Image-based questions ("What's this on my skin?")
 *
 * Features:
 * - Conversation history (up to 50 messages)
 * - Image support (user can send skin photos)
 * - RAG integration (auto-trigger for medical questions)
 * - Source citations (when RAG is used)
 *
 * Chat personality:
 * - Friendly, helpful assistant
 * - Vietnamese language
 * - Medical accuracy + empathy
 */
export const chat = asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req as RequestWithId).id;
  const userId = (req as AuthRequest).user?.uid;
  const body = req.body as ChatConversationRequest;

  logger.info('Processing chat message', {
    requestId,
    userId,
    historyLength: body.history.length,
    hasImage: !!body.image,
    messageLength: body.text.length,
  });

  try {
    // Extract and clean base64 image if provided
    const cleanedImage = body.image
      ? {
          base64: body.image.base64.includes('base64,')
            ? body.image.base64.split('base64,')[1]
            : body.image.base64,
          mimeType: body.image.mimeType,
        }
      : undefined;

    // Get chatbot response (pass history, text, image separately)
    const result = await getChatbotResponse(body.history, body.text, cleanedImage);

    const processingTime = Date.now() - startTime;

    logger.info('Chat message processed', {
      requestId,
      userId,
      responseLength: result.text.length,
      hasSources: !!result.sources && result.sources.length > 0,
      processingTime: `${processingTime}ms`,
    });

    return successResponse(
      res,
      {
        chatId: requestId,
        response: {
          role: 'model',
          text: result.text,
          sources: result.sources,
        },
      },
      200,
      {
        requestId,
        processingTime,
      }
    );
  } catch (error) {
    logger.error('Failed to process chat message', {
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
