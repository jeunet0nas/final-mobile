/**
 * Chatbot Routes
 * Defines API endpoints for chatbot and RAG Q&A
 */

import { Router } from 'express';
import { answerQuestion, getExpertInfo, chat } from '../controllers/chatbot.controller';
import { optionalAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { chatbotRateLimit } from '../middlewares/rateLimit.middleware';
import {
  ChatQuestionRequestSchema,
  ExpertInfoRequestSchema,
  ChatConversationRequestSchema,
} from '../schemas/chatbot.schemas';

const router = Router();

/**
 * POST /api/chatbot/question
 * Get grounded answer using RAG (Retrieval-Augmented Generation)
 *
 * Middlewares:
 * - optionalAuth: Try to authenticate (for tracking)
 * - chatbotRateLimit: 20 requests/minute per user/IP
 * - validateBody: Validate with ChatQuestionRequestSchema
 *
 * Request:
 * {
 *   "question": "BHA là gì và cách sử dụng như thế nào?"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "questionId": "req_abc123",
 *     "question": "BHA là gì...",
 *     "answer": "BHA (Beta Hydroxy Acid) là acid hòa tan trong dầu...",
 *     "sources": [
 *       {
 *         "sourceName": "Dermatology Handbook",
 *         "url": "https://example.com/bha-guide"
 *       }
 *     ]
 *   }
 * }
 *
 * Use case:
 * - Medical/skincare questions
 * - Need fact-based answers with citations
 * - Educational content
 *
 * RAG benefits:
 * - Reduces AI hallucination
 * - Provides verifiable sources
 * - Up-to-date medical information from knowledge base
 */
router.post(
  '/question',
  optionalAuth,
  chatbotRateLimit,
  validateBody(ChatQuestionRequestSchema),
  answerQuestion
);

/**
 * POST /api/chatbot/expert-info
 * Get expert information about a specific skin condition
 *
 * Middlewares:
 * - optionalAuth: Try to authenticate
 * - chatbotRateLimit: 20 requests/minute
 * - validateBody: Validate with ExpertInfoRequestSchema
 *
 * Request:
 * {
 *   "condition": "Mụn đầu đen"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "infoId": "req_def456",
 *     "condition": "Mụn đầu đen",
 *     "answer": "Mụn đầu đen (blackheads) là...\n\n**Nguyên nhân:**\n- Bã nhờn bị oxy hóa...\n\n**Cách điều trị:**\n- BHA (Salicylic Acid)...\n\n**Phòng ngừa:**\n- Làm sạch da đều đặn...",
 *     "sources": [...]
 *   }
 * }
 *
 * Use case:
 * - Deep dive into specific condition
 * - Post-analysis explanation
 * - Educational content for users
 *
 * Info structure:
 * - Definition and explanation
 * - Common causes
 * - Treatment options
 * - Prevention tips
 * - When to see a dermatologist
 */
router.post(
  '/expert-info',
  optionalAuth,
  chatbotRateLimit,
  validateBody(ExpertInfoRequestSchema),
  getExpertInfo
);

/**
 * POST /api/chatbot/chat
 * Conversational chatbot with context history
 *
 * Middlewares:
 * - optionalAuth: Try to authenticate
 * - chatbotRateLimit: 20 requests/minute
 * - validateBody: Validate with ChatConversationRequestSchema
 *
 * Request:
 * {
 *   "history": [
 *     {
 *       "role": "user",
 *       "text": "Tôi có mụn đầu đen nhiều"
 *     },
 *     {
 *       "role": "model",
 *       "text": "Mụn đầu đen thường do...",
 *       "sources": [...]
 *     }
 *   ],
 *   "text": "Tôi nên dùng BHA nồng độ bao nhiêu?",
 *   "image": {
 *     "base64": "...",
 *     "mimeType": "image/jpeg"
 *   }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "chatId": "req_ghi789",
 *     "response": {
 *       "role": "model",
 *       "text": "Dựa vào lịch sử trò chuyện và ảnh bạn gửi, tôi khuyên bạn nên bắt đầu với BHA 1%...",
 *       "sources": [
 *         {
 *           "sourceName": "BHA Usage Guidelines",
 *           "url": "https://example.com/bha-dosage"
 *         }
 *       ]
 *     }
 *   }
 * }
 *
 * Use case:
 * - Multi-turn conversation
 * - Follow-up questions with context
 * - Image-based questions ("What's this?")
 * - Personalized advice based on history
 *
 * Features:
 * - Maintains conversation context (up to 50 messages)
 * - Image support (analyze skin photos in chat)
 * - Auto RAG for medical questions
 * - Source citations when appropriate
 * - Friendly, empathetic tone
 *
 * Chat personality:
 * - Vietnamese language
 * - Medical accuracy + empathy
 * - Helpful without being prescriptive
 * - Encourages seeing dermatologist when needed
 */
router.post(
  '/chat',
  optionalAuth,
  chatbotRateLimit,
  validateBody(ChatConversationRequestSchema),
  chat
);

export default router;
