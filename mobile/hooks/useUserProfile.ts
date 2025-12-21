/**
 * Hook for managing user profile and personalization
 */

import { useState, useEffect } from "react";
import {
  getUserProfile,
  updateUserPreferences,
  getPersonalizationMetrics,
  saveTopicForLater,
} from "@/services/userPersonalization.service";
import {
  UserProfile,
  UserPreferences,
  PersonalizationMetrics,
} from "@/types/personalization.types";

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<PersonalizationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user profile on mount
   */
  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * Load user profile and metrics
   */
  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [userProfile, userMetrics] = await Promise.all([
        getUserProfile(),
        getPersonalizationMetrics(),
      ]);

      setProfile(userProfile);
      setMetrics(userMetrics);
    } catch (err: any) {
      setError(err.message || "Không thể tải profile");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user preferences
   */
  const updatePreferences = async (
    updates: Partial<UserPreferences>
  ): Promise<void> => {
    if (!profile) return;

    try {
      await updateUserPreferences(updates);
      
      // Update local state
      setProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          ...updates,
          lastUpdated: Date.now(),
        },
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật preferences");
      throw err;
    }
  };

  /**
   * Add skin concern
   */
  const addSkinConcern = async (concern: string): Promise<void> => {
    if (!profile) return;

    const updatedConcerns = Array.from(
      new Set([...profile.preferences.skinConcerns, concern])
    );

    await updatePreferences({ skinConcerns: updatedConcerns });
  };

  /**
   * Remove skin concern
   */
  const removeSkinConcern = async (concern: string): Promise<void> => {
    if (!profile) return;

    const updatedConcerns = profile.preferences.skinConcerns.filter(
      (c) => c !== concern
    );

    await updatePreferences({ skinConcerns: updatedConcerns });
  };

  /**
   * Add ingredient to avoid
   */
  const addAvoidIngredient = async (ingredient: string): Promise<void> => {
    if (!profile) return;

    const updatedIngredients = Array.from(
      new Set([...profile.preferences.avoidIngredients, ingredient])
    );

    await updatePreferences({ avoidIngredients: updatedIngredients });
  };

  /**
   * Remove ingredient from avoid list
   */
  const removeAvoidIngredient = async (ingredient: string): Promise<void> => {
    if (!profile) return;

    const updatedIngredients = profile.preferences.avoidIngredients.filter(
      (i) => i !== ingredient
    );

    await updatePreferences({ avoidIngredients: updatedIngredients });
  };

  /**
   * Set response detail level
   */
  const setResponseDetailLevel = async (
    level: "brief" | "moderate" | "detailed"
  ): Promise<void> => {
    await updatePreferences({ responseDetailLevel: level });
  };

  /**
   * Save topic for later learning
   */
  const saveForLater = async (topic: string, source: string): Promise<void> => {
    try {
      await saveTopicForLater(topic, source);
      await loadProfile(); // Refresh profile
    } catch (err: any) {
      setError(err.message || "Không thể lưu topic");
      throw err;
    }
  };

  /**
   * Get personalization progress (0-100)
   */
  const getPersonalizationProgress = (): number => {
    if (!profile || !metrics) return 0;

    const weights = {
      skinConcerns: 20,
      ingredients: 15,
      feedback: 30,
      interactions: 20,
      clarifications: 15,
    };

    let score = 0;

    // Skin concerns (max 3)
    score += Math.min(profile.preferences.skinConcerns.length / 3, 1) * weights.skinConcerns;

    // Ingredients (max 5)
    const totalIngredients =
      profile.preferences.preferredIngredients.length +
      profile.preferences.avoidIngredients.length;
    score += Math.min(totalIngredients / 5, 1) * weights.ingredients;

    // Feedback (max 10)
    score += Math.min(metrics.learningProgress.feedbackGiven / 10, 1) * weights.feedback;

    // Interactions (max 20)
    score += Math.min(metrics.totalInteractions / 20, 1) * weights.interactions;

    // Clarifications (max 5)
    score += Math.min(metrics.learningProgress.clarificationsProvided / 5, 1) * weights.clarifications;

    return Math.round(score);
  };

  return {
    profile,
    metrics,
    isLoading,
    error,
    loadProfile,
    updatePreferences,
    addSkinConcern,
    removeSkinConcern,
    addAvoidIngredient,
    removeAvoidIngredient,
    setResponseDetailLevel,
    saveForLater,
    getPersonalizationProgress,
  };
};
