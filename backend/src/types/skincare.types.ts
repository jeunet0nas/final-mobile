/**
 * Skincare Types - Routines, directions, coaching
 */

import { z } from 'zod';

// ============================================================================
// SKINCARE DIRECTION
// ============================================================================

export interface SkincareDirection {
  summary: string;
  priorityGoals: string[];
}

export const SkincareDirectionSchema = z.object({
  summary: z.string(),
  priorityGoals: z.array(z.string()),
});

// ============================================================================
// ROUTINE STEP
// ============================================================================

export interface RoutineStep {
  step: number;
  name: string;
  productType: string;
  instructions: string;
  frequency: string;
}

export const RoutineStepSchema = z.object({
  step: z.number().int().positive(),
  name: z.string(),
  productType: z.string(),
  instructions: z.string(),
  frequency: z.string(),
});

// ============================================================================
// PERSONALIZED ROUTINE
// ============================================================================

export interface PersonalizedRoutine {
  morning: RoutineStep[];
  evening: RoutineStep[];
  weekly: RoutineStep[];
  tips: string[];
  warnings: string[];
}

export const PersonalizedRoutineSchema = z.object({
  morning: z.array(RoutineStepSchema),
  evening: z.array(RoutineStepSchema),
  weekly: z.array(RoutineStepSchema),
  tips: z.array(z.string()),
  warnings: z.array(z.string()),
});

// ============================================================================
// ROUTINE BUILDER
// ============================================================================

export interface RoutineBuilderInput {
  skinType: string;
  skinConditions: string[];
  environment: string;
  currentProducts?: string;
  goals: string[];
}

export interface RoutineProduct {
  step: number;
  name: string;
  productType: string;
  reason: string;
}

export interface RoutineScheduleEntry {
  category: string;
  frequency: string;
  note: string;
}

export interface RoutineBuilderResult {
  morningRoutine: RoutineProduct[];
  eveningRoutine: RoutineProduct[];
  explanationsAndWarnings: string[];
  productSuggestions: string[];
  routineSchedule: RoutineScheduleEntry[];
}

export const RoutineBuilderInputSchema = z.object({
  skinType: z.string(),
  skinConditions: z.array(z.string()),
  environment: z.string(),
  currentProducts: z.string().optional(),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
});

export const RoutineProductSchema = z.object({
  step: z.number().int().positive(),
  name: z.string(),
  productType: z.string(),
  reason: z.string(),
});

export const RoutineScheduleEntrySchema = z.object({
  category: z.string(),
  frequency: z.string(),
  note: z.string(),
});

export const RoutineBuilderResultSchema = z.object({
  morningRoutine: z.array(RoutineProductSchema),
  eveningRoutine: z.array(RoutineProductSchema),
  explanationsAndWarnings: z.array(z.string()),
  productSuggestions: z.array(z.string()),
  routineSchedule: z.array(RoutineScheduleEntrySchema),
});

// ============================================================================
// COACHING
// ============================================================================

export interface RoutineForCoach {
  created: boolean;
  morning: RoutineStep[];
  night: RoutineStep[];
}

export interface CoachingResult {
  coach_message: string;
  explanation: string;
  escalation: boolean;
  routine: RoutineForCoach;
  micro_education: string;
  follow_up: string;
}

export const RoutineForCoachSchema = z.object({
  created: z.boolean(),
  morning: z.array(RoutineStepSchema),
  night: z.array(RoutineStepSchema),
});

export const CoachingResultSchema = z.object({
  coach_message: z.string(),
  explanation: z.string(),
  escalation: z.boolean(),
  routine: RoutineForCoachSchema,
  micro_education: z.string(),
  follow_up: z.string(),
});

// ============================================================================
// DIRECTION INPUT
// ============================================================================

export interface DirectionInput {
  skinType: string;
  conditions: string[];
  goals: string[];
}

export const DirectionInputSchema = z.object({
  skinType: z.string(),
  conditions: z.array(z.string()),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
});
