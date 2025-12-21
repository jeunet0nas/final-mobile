/**
 * Common Types - Shared across multiple domains
 */

import { z } from 'zod';

// ============================================================================
// ENUMS & LITERALS
// ============================================================================

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type SkinType = 'dầu' | 'khô' | 'nhạy cảm' | 'hỗn hợp';

export type Tab =
  | 'dermascan'
  | 'dermaingredient'
  | 'dermacoach'
  | 'derma_knowledge'
  | 'dermaroutine'
  | 'aiskinlab';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const RiskLevelSchema = z.enum(['Low', 'Medium', 'High']);

export const SkinTypeSchema = z.enum(['dầu', 'khô', 'nhạy cảm', 'hỗn hợp']);

export const TabSchema = z.enum([
  'dermascan',
  'dermaingredient',
  'dermacoach',
  'derma_knowledge',
  'dermaroutine',
  'aiskinlab',
]);

// ============================================================================
// LIFESTYLE DATA
// ============================================================================

export interface LifestyleData {
  sleepHours: string;
  dietAndHydration: string;
  stressLevel: string;
  sunExposure: string;
}

export const LifestyleDataSchema = z.object({
  sleepHours: z.string(),
  dietAndHydration: z.string(),
  stressLevel: z.string(),
  sunExposure: z.string(),
});

// ============================================================================
// IMAGE DATA
// ============================================================================

export interface ImageData {
  base64: string;
  mimeType: string;
}

export const ImageDataSchema = z.object({
  base64: z.string().min(1, 'Base64 image data is required'),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Invalid image MIME type'),
});

// ============================================================================
// CAPTURED FRAME
// ============================================================================

export interface CapturedFrame {
  poseName: string;
  dataUrl: string;
}

export const CapturedFrameSchema = z.object({
  poseName: z.string(),
  dataUrl: z.string().url(),
});
