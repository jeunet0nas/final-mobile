export type Tab =
  | 'dermascan'
  | 'dermaingredient'
  | 'dermacoach'
  | 'derma_knowledge'
  | 'dermaroutine'
  | 'aiskinlab';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string; // For user's uploaded image
  sources?: RagSource[]; // For model's citations
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Unknown';

/**
 * Represents the analysis result for a specific skin zone.
 * Part of Explainable AI (XAI) to help users understand the reasoning.
 */
export interface ZoneAnalysis {
  zone: string; // e.g., 'Forehead', 'Cheek Area', 'Chin'
  condition: string;
  riskLevel: RiskLevel;
  explanation: string;
  visualEvidence: string; // Description of visual evidence seen by the AI
}

/**
 * The new overall analysis result structure, supporting multiple zones.
 */
export interface AnalysisResult {
  skinType: SkinType | null;
  overallSummary: string; // Overall summary of the skin condition
  zones: ZoneAnalysis[]; // Array of detailed analyses for each zone
  recommendations: string[];
  // NEW XAI & SAFETY FEATURES
  aiReasoning: string; // Detailed natural language explanation of the AI's logic
  isUncertain: boolean; // Flag for when AI is not confident
  uncertaintyMessage: string; // Message to show to the user when uncertain
  confidenceScore: number; // NEW: AI's confidence in the overall analysis (0-100)
  expertInfo?: RagResult; // NEW: RAG result for the primary condition
}

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

export type SkinType = 'dầu' | 'khô' | 'nhạy cảm' | 'hỗn hợp';

// FIX: Add missing CapturedFrame type for GuidedCaptureView component
export interface CapturedFrame {
  poseName: string;
  dataUrl: string;
}

// NEW TYPE FOR DERMA COACH
export interface CoachingResult {
  escalation: boolean;
  coach_message: string;
  explanation: string;
  routine: {
    created: boolean;
    morning: string[];
    night: string[];
  };
  micro_education: string;
  follow_up: string;
}

// FIX: Add missing types for personalized routine generation.
export interface SkincareDirection {
  summary: string;
  priorityGoals: string[];
}

export interface RoutineStep {
  step: number;
  name: string;
  productType: string;
  instructions: string;
  frequency: string;
}

export interface PersonalizedRoutine {
  morning: RoutineStep[];
  evening: RoutineStep[];
  weekly: RoutineStep[];
  tips: string[];
  warnings: string[];
}

export interface LifestyleData {
  sleepHours: number;
  dietAndHydration: string;
  stressLevel: 'Thấp' | 'Trung bình' | 'Cao';
  sunExposure: 'Thấp' | 'Trung bình' | 'Cao';
}

// Types for Ingredient AI feature
export interface UserProfileForIngredients {
  skinType: 'Khô' | 'Dầu' | 'Nhạy cảm' | 'Hỗn hợp' | 'Da mụn';
  allergies: 'Không' | 'Hương liệu' | 'Cồn' | 'Paraben';
  goals: 'Dưỡng ẩm' | 'Làm sáng' | 'Chống lão hóa' | 'Làm dịu' | 'Trị mụn';
}

export interface Ingredient {
  name: string;
  func: string; // 'function' is a reserved word
  ewgScore: number;
  riskLevel: string; // e.g., '✅ Safe'
  note: string;
  irritationPotential?: string;
}

export interface IngredientAnalysisResult {
  ingredientTable: Ingredient[];
  safetySummary: {
    score: number;
    compatibility: string;
  };
  recommendations: string[];
  explanation: string;
  usageRecommendation: {
    verdict: 'Nên dùng' | 'Thận trọng' | 'Không nên dùng';
    reason: string;
  };
  riskyIngredients: Array<{
    name: string;
    reason: string;
  }>;
}

// Types for AI Routine Builder feature
export interface RoutineBuilderInput {
  skinType: string;
  skinConditions: string[];
  environment: string; // City name
  currentProducts: string;
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
// Types for Skin DNA (Learning Mode) feature.
export interface GeneticTrait {
  trait: string;
  riskLevel: number; // Percentage
  explanation: string;
}

export interface Forecast {
  period: '1 năm tới' | '5 năm tới' | '10 năm tới';
  prediction: string;
  imageUrl?: string;
}

export interface SkinDNAResult {
  geneticReport: GeneticTrait[];
  forecastSummary: Forecast[];
  carePlan: string[];
}

// Types for the new DermaPredict AI feature
export interface PredictionInput {
  currentSkinState: string; // Summary from a past analysis or user description
  currentRoutine: string; // User-described routine
  lifestyleHabits: LifestyleData;
  environment: string; // City
  baseImage: {
    base64: string;
    mimeType: string;
  };
}

export interface PredictionPeriod {
  period: '7 ngày tới' | '14 ngày tới' | '30 ngày tới';
  predictedState: string; // Text description of the skin's future state
  potentialRisks: string[]; // List of potential risks like acne, dryness
  imageUrl?: string; // To be populated after generation
}

// Types for DermaTimeline AI feature
export interface SkinMetricPoint {
  day: number; // 0, 7, 14, 30
  acne: number; // Score 0-100 (lower is better)
  hydration: number; // Score 0-100 (higher is better)
  elasticity: number; // Score 0-100 (higher is better)
  tone: number; // Score 0-100 (higher is better)
}

export interface SkinPredictionResult {
  skinFutureScore: number; // Overall score from 0-100
  predictionPeriods: PredictionPeriod[]; // Array of 3 periods
  recommendations: string[]; // Actionable advice
  scoreExplanation: string; // Explanation of the score
  timelineData: SkinMetricPoint[]; // Data for the timeline chart
}

// --- NEW TYPES FOR RAG (DermaKnowledge) FEATURE ---
export interface KnowledgeChunk {
  source: string;
  url: string;
  content: string;
  keywords: string[];
}

export interface RagSource {
  sourceName: string;
  url: string;
}

export interface RagResult {
  answer: string;
  sources: RagSource[];
}
// --- END NEW TYPES ---

export interface User {
  email: string;
  password: string; // In a real app, this should be a hash.
  history: HistoryEntry[];
  coachHistory: ChatMessage[];
}
