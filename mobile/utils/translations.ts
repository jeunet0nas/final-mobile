import type { RiskLevel } from "@/types/api.types";

/**
 * Translation utilities for API responses
 * Maps English values to Vietnamese equivalents
 */

// Risk Level Translations
export const RISK_LEVEL_VI: Record<RiskLevel, string> = {
  High: "Rủi ro cao",
  Medium: "Rủi ro trung bình",
  Low: "Rủi ro thấp",
};

/**
 * Translate risk level from English to Vietnamese
 * @param level - Risk level from API (High, Medium, Low)
 * @returns Vietnamese translation
 */
export const translateRiskLevel = (level: RiskLevel): string => {
  return RISK_LEVEL_VI[level] || level;
};

/**
 * Get risk level with full context (for accessibility)
 * @param level - Risk level from API
 * @returns Full Vietnamese description
 */
export const getRiskLevelDescription = (level: RiskLevel): string => {
  const descriptions: Record<RiskLevel, string> = {
    High: "Vùng này có mức độ rủi ro cao, cần chú ý đặc biệt",
    Medium: "Vùng này có mức độ rủi ro trung bình, nên theo dõi",
    Low: "Vùng này có mức độ rủi ro thấp, tình trạng tốt",
  };
  return descriptions[level] || "";
};
