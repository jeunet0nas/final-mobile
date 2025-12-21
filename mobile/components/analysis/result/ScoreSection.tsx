import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SkinType, ZoneAnalysis } from "@/types/api.types";

interface ScoreSectionProps {
  confidenceScore: number;
  skinType: SkinType | null;
  isUncertain: boolean;
  zones: ZoneAnalysis[];
}

const SKIN_TYPE_CONFIG: Record<string, { emoji: string }> = {
  dầu: { emoji: "💧" },
  khô: { emoji: "🌵" },
  "nhạy cảm": { emoji: "🌸" },
  "hỗn hợp": { emoji: "🔄" },
};

export default function ScoreSection({
  confidenceScore,
  skinType,
  isUncertain,
  zones,
}: ScoreSectionProps) {
  const getOverallStatus = () => {
    const hasHigh = zones.some((z) => z.riskLevel === "High");
    if (hasHigh) {
      return {
        title: "Cần chú ý",
        subtitle: "Có vùng da đang ở mức rủi ro cao",
        icon: "alert-circle" as const,
      };
    }

    const hasMedium = zones.some((z) => z.riskLevel === "Medium");
    if (hasMedium) {
      return {
        title: "Da ổn",
        subtitle: "Một vài vùng cần theo dõi thêm",
        icon: "information-circle" as const,
      };
    }

    return {
      title: "Da khỏe",
      subtitle: "Các vùng phân tích đều ở mức rủi ro thấp",
      icon: "checkmark-circle" as const,
    };
  };

  const skinTypeConfig =
    skinType && SKIN_TYPE_CONFIG[skinType]
      ? SKIN_TYPE_CONFIG[skinType]
      : { emoji: "❓" };

  if (skinType && !SKIN_TYPE_CONFIG[skinType]) {
    console.warn("Unknown skinType:", skinType);
  }

  const overall = getOverallStatus();

  return (
    <View className="bg-white rounded-3xl border border-slate-200 p-5 mb-4">
      <View className="flex-row items-start">
        <View className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 items-center justify-center">
          <Ionicons name={overall.icon} size={22} color="#0a7ea4" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-xs font-semibold text-slate-500">
            Đánh giá tổng quan
          </Text>
          <Text className="text-2xl font-bold text-slate-900 mt-1">
            {overall.title}
          </Text>
          <Text className="text-sm text-slate-600 leading-6 mt-1">
            {overall.subtitle}
          </Text>
        </View>
      </View>

      <View className="h-px bg-slate-200 my-4" />

      <View className="flex-row flex-wrap gap-2">
        <View className="px-3 py-2 rounded-full bg-primary/5 border border-primary/15">
          <Text className="text-xs font-semibold text-slate-700">
            {skinTypeConfig.emoji} Loại da: {skinType || "Chưa xác định"}
          </Text>
        </View>

        <View className="px-3 py-2 rounded-full bg-primary/5 border border-primary/15">
          <View className="flex-row items-center">
            <Ionicons
              name={isUncertain ? "alert-circle" : "checkmark-circle"}
              size={16}
              color="#0a7ea4"
            />
            <Text className="ml-1.5 text-xs font-semibold text-slate-700">
              Độ tin cậy: {Math.min(100, Math.max(0, confidenceScore))}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
