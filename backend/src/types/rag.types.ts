/**
 * RAG (Retrieval-Augmented Generation) Types
 */

import { z } from 'zod';

// ============================================================================
// KNOWLEDGE CHUNK
// ============================================================================

export interface KnowledgeChunk {
  source: string;
  url: string;
  content: string;
  keywords: string[];
}

export const KnowledgeChunkSchema = z.object({
  source: z.string(),
  url: z.string().url(),
  content: z.string(),
  keywords: z.array(z.string()),
});

// ============================================================================
// RAG SOURCE
// ============================================================================

export interface RagSource {
  sourceName: string;
  url: string;
}

export const RagSourceSchema = z.object({
  sourceName: z.string(),
  url: z.string().url(),
});

// ============================================================================
// RAG RESULT
// ============================================================================

export interface RagResult {
  answer: string;
  sources: RagSource[];
}

export const RagResultSchema = z.object({
  answer: z.string(),
  sources: z.array(RagSourceSchema),
});

// ============================================================================
// CHAT MESSAGE
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  image?: {
    base64: string;
    mimeType: string;
  };
  sources?: RagSource[];
}

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
  imageUrl: z.string().url().optional(),
  image: z
    .object({
      base64: z.string(),
      mimeType: z.string(),
    })
    .optional(),
  sources: z.array(RagSourceSchema).optional(),
});

// ============================================================================
// CHATBOT INPUT
// ============================================================================

export interface ChatbotInput {
  history: ChatMessage[];
  text: string;
  image?: {
    base64: string;
    mimeType: string;
  };
}

export const ChatbotInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  text: z.string().min(1, 'Message text is required'),
  image: z
    .object({
      base64: z.string(),
      mimeType: z.string(),
    })
    .optional(),
});
