/**
 * User & Authentication Types
 */

import { z } from 'zod';
import { HistoryEntry, HistoryEntrySchema } from './analysis.types';
import { ChatMessage, ChatMessageSchema } from './rag.types';

// ============================================================================
// USER
// ============================================================================

export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  history: HistoryEntry[];
  coachHistory: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  history: z.array(HistoryEntrySchema),
  coachHistory: z.array(ChatMessageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// AUTH REQUESTS
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
  token: z.string(),
});
