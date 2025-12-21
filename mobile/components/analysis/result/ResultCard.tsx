import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveAnalysis } from "@/hooks/useSaveAnalysis";
import type { AnalysisResult } from "@/types/api.types";
import ScoreSection from "./ScoreSection";
import ZonesAccordion from "./ZonesAccordion";
import RecommendationsSection from "./RecommendationsSection";
import ExpertInfoSection from "./ExpertInfoSection";
import SaveButton from "./SaveButton";
import UncertaintyWarning from "./UncertaintyWarning";
import LoadingState from "../LoadingState";

interface ResultCardProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  onAnalyzeAgain: () => void;
  imageBase64?: string;
  savedAnalysisId?: string;
  readOnly?: boolean;
}

export default function ResultCard({
  result,
  isLoading,
  onAnalyzeAgain,
  imageBase64,
  savedAnalysisId,
  readOnly = false,
}: ResultCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isSaving, currentSavedId, handleSave } =
    useSaveAnalysis(savedAnalysisId);

  // Loading State
  if (isLoading || !result) {
    return <LoadingState />;
  }

  // Loaded State with Data
  return (
    <View>
      {/* Header */}
      <View className="bg-primary/5 rounded-3xl border border-primary/15 p-5 mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 items-center justify-center mr-3">
            <Ionicons name="checkmark-circle" size={22} color="#0a7ea4" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 text-lg font-bold">
              Kết quả phân tích
            </Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              {new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Score Section */}
      <ScoreSection
        confidenceScore={result.confidenceScore}
        skinType={result.skinType}
        isUncertain={result.isUncertain}
        zones={result.zones}
      />

      {/* Recommendations */}
      <RecommendationsSection
        summary={result.overallSummary}
        recommendations={result.recommendations}
      />

      {/* Zones Details */}
      <ZonesAccordion zones={result.zones} />

      {/* Expert Info */}
      <ExpertInfoSection expertInfo={result.expertInfo} />

      {/* Uncertainty Warning */}
      {result.isUncertain && result.uncertaintyReason && (
        <UncertaintyWarning reason={result.uncertaintyReason} />
      )}

      {/* Action Buttons */}
      <View className="pb-6 gap-3">
        {/* Save Analysis Button */}
        {!readOnly && (
          <SaveButton
            user={user}
            isSaving={isSaving}
            isSaved={!!currentSavedId}
            onSave={() => handleSave(result, imageBase64)}
            onLogin={() => router.push("/(auth)/login")}
          />
        )}

        {/* Analyze Again Button */}
        {!readOnly && (
          <TouchableOpacity
            onPress={onAnalyzeAgain}
            activeOpacity={0.8}
            className="rounded-full py-4 border border-primary/40 bg-primary/5"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="camera" size={20} color="#0a7ea4" />
              <Text className="text-primary font-semibold text-base ml-2">
                Phân tích ảnh khác
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
