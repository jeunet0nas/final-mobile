export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  requestId?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  requestId?: string;
}

export type SkinType = "dầu" | "khô" | "nhạy cảm" | "hỗn hợp";
export type RiskLevel = "Low" | "Medium" | "High";

export interface VisualEvidence {
  visualClues: string;
  reasoning: string;
  certainty: number;
}

export interface ZoneAnalysis {
  zone: string;
  condition: string;
  riskLevel: RiskLevel;
  visualEvidence: VisualEvidence;
  explanation: string;
}

export interface RagSource {
  sourceName: string;
  url: string;
}

export interface ExpertInfo {
  answer: string;
  sources: RagSource[];
}

export interface AnalysisResult {
  skinType: SkinType | null;
  zones: ZoneAnalysis[];
  overallSummary: string;
  recommendations: string[];
  isUncertain: boolean;
  uncertaintyReason?: string;
  confidenceScore: number; // 0-100
  expertInfo?: ExpertInfo;
}

export interface AnalyzeSkinRequest {
  image: string;
  includeExpertInfo?: boolean;
}

export interface AnalyzeSkinResponse {
  analysisId: string;
  result: AnalysisResult;
}

export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  service: string;
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  result: AnalysisResult;
  imageUrl?: string;
  savedAt: string;
  createdAt: string;
}

export interface AnalysisHistoryResponse {
  analyses: SavedAnalysis[];
  total: number;
}

export interface SaveAnalysisResponse {
  id: string;
  savedAt: string;
  message?: string;
}

// ============================================================================
// CHATBOT TYPES
// ============================================================================

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  imageUrl?: string;
  image?: {
    base64: string;
    mimeType: string;
  };
  sources?: RagSource[];
}

export interface ChatQuestionRequest {
  question: string;
}

export interface ChatQuestionResponse {
  questionId: string;
  question: string;
  answer: string;
  sources: RagSource[];
}

export interface ExpertInfoRequest {
  condition: string;
}

export interface ExpertInfoResponse {
  infoId: string;
  condition: string;
  answer: string;
  sources: RagSource[];
}

export interface ChatConversationRequest {
  history: ChatMessage[];
  text: string;
  image?: {
    base64: string;
    mimeType: string;
  };
}

export interface ChatConversationResponse {
  chatId: string;
  response: {
    role: "model";
    text: string;
    sources?: RagSource[];
  };
}
