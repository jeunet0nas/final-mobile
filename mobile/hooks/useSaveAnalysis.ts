import { useState } from "react";
import { Alert } from "react-native";
import { saveAnalysis } from "@/api/services/analysis.service";
import type { AnalysisResult } from "@/types/api.types";

export const useSaveAnalysis = (initialSavedId?: string) => {
  const [isSaving, setIsSaving] = useState(false);
  const [currentSavedId, setCurrentSavedId] = useState(initialSavedId);

  const handleSave = async (
    result: AnalysisResult | null,
    imageBase64?: string
  ) => {
    if (!result) return;

    setIsSaving(true);
    try {
      const response = await saveAnalysis(result, imageBase64);
      setCurrentSavedId(response.id);
      Alert.alert(
        "Đã lưu!",
        "Kết quả phân tích đã được lưu vào lịch sử của bạn",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.error?.message || "Không thể lưu kết quả. Vui lòng thử lại"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    currentSavedId,
    handleSave,
  };
};
