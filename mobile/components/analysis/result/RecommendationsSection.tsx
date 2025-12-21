import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecommendationsSectionProps {
  summary: string;
  recommendations: string[];
}

export default function RecommendationsSection({
  summary,
  recommendations,
}: RecommendationsSectionProps) {
  return (
    <View className="bg-white rounded-3xl border border-slate-200 p-5 mb-4">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Ionicons name="heart-outline" size={20} color="#0a7ea4" />
        <Text className="text-base font-semibold text-slate-900 ml-2">
          Lời khuyên chăm sóc
        </Text>
      </View>

      {/* Summary */}
      <View className="bg-primary/5 p-4 mb-4 border border-primary/15 rounded-2xl">
        <Text className="text-sm text-slate-700 leading-6">{summary}</Text>
      </View>

      {/* Recommendations List */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-slate-900 mb-3">
          Các bước thực hiện:
        </Text>
        <View className="gap-2.5">
          {recommendations.map((rec, index) => (
            <View key={index} className="flex-row items-start">
              {/* Bullet Point */}
              <View className="mt-2">
                <View className="w-1.5 h-1.5 rounded-full bg-primary" />
              </View>

              {/* Text */}
              <Text className="flex-1 ml-3 text-sm text-slate-700 leading-6">
                {rec}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
