import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, Alert, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAnalysisHistory } from "@/api/services/analysis.service";
import { handleApiError } from "@/api/client";
import type { SavedAnalysis } from "@/types/api.types";
import ScreenHeader from "@/components/common/ScreenHeader";
import ResultCard from "@/components/analysis/result/ResultCard";

export default function AnalysisDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysisDetail();
  }, [id]);

  const loadAnalysisDetail = async () => {
    try {
      setLoading(true);
      const data = await getAnalysisHistory(100);
      const found = data.analyses.find((item) => item.id === id);

      if (found) {
        setAnalysis(found);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy kết quả phân tích", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      const errorMsg = handleApiError(error);
      Alert.alert("Lỗi", errorMsg, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      <ScreenHeader title="Chi tiết phân tích" showBackButton />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-slate-600 mt-4">Đang tải...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {analysis && (
            <>
              {/* Saved timestamp badge */}
              <View className="mx-4 mt-2 mb-3 bg-primary/10 border border-primary/20 rounded-xl p-3">
                <View className="flex-row items-center justify-center">
                  <Text className="text-sm text-primary font-medium">
                    Đã lưu vào{" "}
                    {new Date(analysis.savedAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>

              {/* Result Card in read-only mode */}
              <ResultCard
                result={analysis.result}
                isLoading={false}
                onAnalyzeAgain={() => {}}
                savedAnalysisId={analysis.id}
                readOnly={true}
              />
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
