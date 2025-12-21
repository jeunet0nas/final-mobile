/**
 * User Personalization Types
 * Types for chatbot learning and personalization system
 */

export interface UserPreferences {
  // Skin concerns và priorities
  skinConcerns: string[];
  priorityConcerns: string[];
  
  // Product preferences
  preferredIngredients: string[];
  avoidIngredients: string[];
  preferredBrands: string[];
  
  // Communication style
  preferredLanguage: "vi" | "en";
  responseDetailLevel: "brief" | "moderate" | "detailed";
  
  // Updated timestamp
  lastUpdated: number;
}

export interface ConversationPattern {
  // Topic interests
  topicFrequency: Record<string, number>; // topic -> count
  recentTopics: string[]; // Last 10 topics
  
  // Question patterns
  commonKeywords: string[];
  questionTypes: ("ingredient" | "product" | "routine" | "condition")[];
  
  // Interaction patterns
  averageSessionLength: number;
  preferredTimeOfDay?: "morning" | "afternoon" | "evening" | "night";
  
  // Calculated metrics
  totalConversations: number;
  lastInteraction: number;
}

export interface MessageFeedback {
  messageId: string;
  rating: "helpful" | "not_helpful" | "neutral";
  reason?: string;
  timestamp: number;
}

export interface LearningData {
  // User corrections and clarifications
  corrections: Array<{
    originalQuery: string;
    userClarification: string;
    timestamp: number;
  }>;
  
  // Helpful vs not helpful tracking
  feedbackHistory: MessageFeedback[];
  
  // Context that worked well
  successfulContexts: Array<{
    query: string;
    context: string;
    response: string;
    timestamp: number;
  }>;
  
  // Topics user wants to learn more about
  saveForLater: Array<{
    topic: string;
    source: string;
    timestamp: number;
  }>;
}

export interface UserProfile {
  userId: string;
  preferences: UserPreferences;
  conversationPattern: ConversationPattern;
  learningData: LearningData;
  createdAt: number;
  updatedAt: number;
}

/**
 * Context gửi kèm request để personalize response
 */
export interface PersonalizationContext {
  userId: string;
  
  // Recent conversation context
  recentTopics: string[];
  commonKeywords: string[];
  
  // User preferences
  skinConcerns: string[];
  avoidIngredients: string[];
  
  // Response preferences
  responseDetailLevel: "brief" | "moderate" | "detailed";
  language: "vi" | "en";
}

/**
 * Analytics cho learning system
 */
export interface PersonalizationMetrics {
  totalInteractions: number;
  feedbackScore: number; // Average rating
  topTopics: Array<{ topic: string; count: number }>;
  learningProgress: {
    preferencesCompleted: number;
    feedbackGiven: number;
    clarificationsProvided: number;
  };
}
