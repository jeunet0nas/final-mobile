/**
 * User Personalization Service
 * Manages user learning, preferences, and personalization
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db, auth } from "@/config/firebase.config";
import {
  UserProfile,
  UserPreferences,
  ConversationPattern,
  LearningData,
  MessageFeedback,
  PersonalizationContext,
  PersonalizationMetrics,
} from "@/types/personalization.types";

const DEFAULT_PREFERENCES: UserPreferences = {
  skinConcerns: [],
  priorityConcerns: [],
  preferredIngredients: [],
  avoidIngredients: [],
  preferredBrands: [],
  preferredLanguage: "vi",
  responseDetailLevel: "moderate",
  lastUpdated: Date.now(),
};

const DEFAULT_PATTERN: ConversationPattern = {
  topicFrequency: {},
  recentTopics: [],
  commonKeywords: [],
  questionTypes: [],
  averageSessionLength: 0,
  totalConversations: 0,
  lastInteraction: Date.now(),
};

const DEFAULT_LEARNING: LearningData = {
  corrections: [],
  feedbackHistory: [],
  successfulContexts: [],
  saveForLater: [],
};

/**
 * Get or create user profile
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const profileRef = doc(db, "users", user.uid, "profile", "personalization");
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        userId: user.uid,
        preferences: data.preferences || DEFAULT_PREFERENCES,
        conversationPattern: data.conversationPattern || DEFAULT_PATTERN,
        learningData: data.learningData || DEFAULT_LEARNING,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      };
    }

    // Create new profile
    const newProfile: UserProfile = {
      userId: user.uid,
      preferences: DEFAULT_PREFERENCES,
      conversationPattern: DEFAULT_PATTERN,
      learningData: DEFAULT_LEARNING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(profileRef, {
      ...newProfile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return newProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  updates: Partial<UserPreferences>
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in");

  try {
    const profileRef = doc(db, "users", user.uid, "profile", "personalization");
    await updateDoc(profileRef, {
      preferences: updates,
      "preferences.lastUpdated": Date.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw new Error("Không thể cập nhật preferences");
  }
};

/**
 * Track conversation topic để học patterns
 */
export const trackConversationTopic = async (
  topic: string,
  keywords: string[]
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const profileRef = doc(db, "users", user.uid, "profile", "personalization");
    const profile = await getDoc(profileRef);

    if (!profile.exists()) {
      await getUserProfile(); // Create if not exists
    }

    const currentPattern = profile.data()?.conversationPattern || DEFAULT_PATTERN;
    const topicFrequency = currentPattern.topicFrequency || {};
    
    // Update topic frequency
    topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    
    // Update recent topics (keep last 10)
    const recentTopics = [topic, ...(currentPattern.recentTopics || [])].slice(0, 10);
    
    // Update common keywords
    const existingKeywords = currentPattern.commonKeywords || [];
    const updatedKeywords = Array.from(
      new Set([...keywords, ...existingKeywords])
    ).slice(0, 20);

    await updateDoc(profileRef, {
      "conversationPattern.topicFrequency": topicFrequency,
      "conversationPattern.recentTopics": recentTopics,
      "conversationPattern.commonKeywords": updatedKeywords,
      "conversationPattern.totalConversations": increment(1),
      "conversationPattern.lastInteraction": Date.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error tracking topic:", error);
  }
};

/**
 * Save message feedback (helpful/not helpful)
 */
export const saveMessageFeedback = async (
  feedback: MessageFeedback
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in");

  try {
    const profileRef = doc(db, "users", user.uid, "profile", "personalization");
    
    await updateDoc(profileRef, {
      "learningData.feedbackHistory": arrayUnion(feedback),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    throw new Error("Không thể lưu feedback");
  }
};

/**
 * Save user correction/clarification
 */
export const saveUserCorrection = async (
  originalQuery: string,
  userClarification: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const profileRef = doc(db, "users", user.uid, "profile", "personalization");
    
    const correction = {
      originalQuery,
      userClarification,
      timestamp: Date.now(),
    };

    await updateDoc(profileRef, {
      "learningData.corrections": arrayUnion(correction),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error saving correction:", error);
  }
};

/**
 * Save successful context (when user likes a response)
 */
export const saveSuccessfulContext = async (
  query: string,
  context: string,
  response: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const profileRef = doc(db, "users", user.uid, "profile", "personalization");
    
    const successContext = {
      query,
      context,
      response,
      timestamp: Date.now(),
    };

    await updateDoc(profileRef, {
      "learningData.successfulContexts": arrayUnion(successContext),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error saving successful context:", error);
  }
};

/**
 * Save topic for later learning
 */
export const saveTopicForLater = async (
  topic: string,
  source: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in");

  try {
    const profileRef = doc(db, "users", user.uid, "profile", "personalization");
    
    const savedTopic = {
      topic,
      source,
      timestamp: Date.now(),
    };

    await updateDoc(profileRef, {
      "learningData.saveForLater": arrayUnion(savedTopic),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error saving topic:", error);
    throw new Error("Không thể lưu topic");
  }
};

/**
 * Build personalization context to send with chat request
 */
export const buildPersonalizationContext = async (): Promise<PersonalizationContext | null> => {
  const profile = await getUserProfile();
  if (!profile) return null;

  return {
    userId: profile.userId,
    recentTopics: profile.conversationPattern.recentTopics,
    commonKeywords: profile.conversationPattern.commonKeywords,
    skinConcerns: profile.preferences.skinConcerns,
    avoidIngredients: profile.preferences.avoidIngredients,
    responseDetailLevel: profile.preferences.responseDetailLevel,
    language: profile.preferences.preferredLanguage,
  };
};

/**
 * Get personalization metrics
 */
export const getPersonalizationMetrics = async (): Promise<PersonalizationMetrics | null> => {
  const profile = await getUserProfile();
  if (!profile) return null;

  const feedbackScore =
    profile.learningData.feedbackHistory.length > 0
      ? profile.learningData.feedbackHistory.filter((f) => f.rating === "helpful")
          .length / profile.learningData.feedbackHistory.length
      : 0;

  const topTopics = Object.entries(profile.conversationPattern.topicFrequency)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalInteractions: profile.conversationPattern.totalConversations,
    feedbackScore,
    topTopics,
    learningProgress: {
      preferencesCompleted:
        profile.preferences.skinConcerns.length +
        profile.preferences.preferredIngredients.length,
      feedbackGiven: profile.learningData.feedbackHistory.length,
      clarificationsProvided: profile.learningData.corrections.length,
    },
  };
};

/**
 * Extract keywords from message
 */
export const extractKeywords = (message: string): string[] => {
  // Remove punctuation and lowercase
  const cleaned = message.toLowerCase().replace(/[^\w\s]/g, " ");
  
  // Common skincare keywords
  const skincareKeywords = [
    "mụn", "trứng cá", "acne", "nám", "tàn nhang", "melasma",
    "lão hóa", "aging", "nếp nhăn", "wrinkle", "khô", "dry",
    "dầu", "oily", "nhạy cảm", "sensitive", "serum", "moisturizer",
    "cleanser", "toner", "sunscreen", "retinol", "vitamin c", "niacinamide",
    "hyaluronic", "kem chống nắng", "sữa rửa mặt", "kem dưỡng",
  ];

  const words = cleaned.split(/\s+/);
  const foundKeywords = words.filter((word) =>
    skincareKeywords.some((keyword) => keyword.includes(word) || word.includes(keyword))
  );

  return Array.from(new Set(foundKeywords));
};

/**
 * Detect topic from message
 */
export const detectTopic = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("mụn") || lowerMessage.includes("acne")) {
    return "acne_treatment";
  }
  if (lowerMessage.includes("nám") || lowerMessage.includes("melasma")) {
    return "pigmentation";
  }
  if (lowerMessage.includes("lão hóa") || lowerMessage.includes("aging")) {
    return "anti_aging";
  }
  if (lowerMessage.includes("làm sạch") || lowerMessage.includes("cleanser")) {
    return "cleansing";
  }
  if (lowerMessage.includes("chống nắng") || lowerMessage.includes("sunscreen")) {
    return "sun_protection";
  }
  if (lowerMessage.includes("routine")) {
    return "skincare_routine";
  }
  if (lowerMessage.includes("thành phần") || lowerMessage.includes("ingredient")) {
    return "ingredient_info";
  }

  return "general_skincare";
};
