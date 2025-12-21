/**
 * Chatbot Request/Response Schemas
 * Zod validation schemas for chatbot endpoints
 */

import { z } from 'zod';
import { CommonSchemas } from '../middlewares/validation.middleware';

/**
 * Schema for RAG question request
 * POST /api/chatbot/question
 */
export const ChatQuestionRequestSchema = z.object({
  question: z.string().min(3, 'Câu hỏi phải có ít nhất 3 ký tự').max(500, 'Câu hỏi quá dài'),
});

export type ChatQuestionRequest = z.infer<typeof ChatQuestionRequestSchema>;

/**
 * Schema for expert info request
 * POST /api/chatbot/expert-info
 */
export const ExpertInfoRequestSchema = z.object({
  condition: z.string().min(2, 'Tên tình trạng da phải có ít nhất 2 ký tự').max(100),
});

export type ExpertInfoRequest = z.infer<typeof ExpertInfoRequestSchema>;

/**
 * Chat message schema
 * Used in conversation history
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model'], {
    errorMap: () => ({ message: 'Role phải là "user" hoặc "model"' }),
  }),
  text: z.string().min(1, 'Nội dung tin nhắn không được để trống'),
  imageUrl: z.string().url().optional(),
  image: z
    .object({
      base64: z.string(),
      mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'MIME type không hợp lệ'),
    })
    .optional(),
  sources: z
    .array(
      z.object({
        sourceName: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Schema for conversational chat request
 * POST /api/chatbot/chat
 */
export const ChatConversationRequestSchema = z.object({
  history: z.array(ChatMessageSchema).max(50, 'Lịch sử hội thoại tối đa 50 tin nhắn').default([]),
  text: z.string().min(1, 'Tin nhắn không được để trống').max(1000, 'Tin nhắn quá dài'),
  image: z
    .object({
      base64: CommonSchemas.base64Image,
      mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'MIME type không hợp lệ'),
    })
    .optional(),
});

export type ChatConversationRequest = z.infer<typeof ChatConversationRequestSchema>;
