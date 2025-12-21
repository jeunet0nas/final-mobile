import { useState } from "react";
import { Alert } from "react-native";
import { analyzeSkin } from "@/api/services/analysis.service";
import { useAnalysisContext } from "@/contexts/AnalysisContext";
import {
  convertImageToBase64,
  validateImage,
  validateImageDimensions,
  checkImageQuality,
} from "@/utils/imageConverter";
import type { AnalysisResult } from "@/types/api.types";

export const useAnalysis = () => {
  const {
    analysisResult,
    imageBase64,
    setAnalysisResult,
    setImageBase64,
    resetAnalysis,
  } = useAnalysisContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = async (imageUri: string) => {
    if (!imageUri) {
      Alert.alert("Lỗi", "Vui lòng chọn ảnh trước");
      return;
    }

    // Show result screen immediately with loading state
    setAnalysisResult(null);
    setIsAnalyzing(true);

    try {
      // Step 1a: Validate dimensions (fast, no decode)
      const dimValidation = await validateImageDimensions(imageUri);
      if (!dimValidation.valid) {
        Alert.alert("Ảnh không hợp lệ", dimValidation.error);
        setIsAnalyzing(false);
        return;
      }

      // Step 1b: Validate file (size, exists)
      const fileValidation = await validateImage(imageUri);
      if (!fileValidation.valid) {
        Alert.alert("Ảnh không hợp lệ", fileValidation.error);
        setIsAnalyzing(false);
        return;
      }

      // Step 1c: Check quality (brightness, blur) - soft gate, may return warning
      const qualityCheck = await checkImageQuality(imageUri);
      if (!qualityCheck.valid) {
        Alert.alert("Ảnh không đạt yêu cầu", qualityCheck.error);
        setIsAnalyzing(false);
        return;
      }

      // Show warning if exists (but don't block)
      if (qualityCheck.warning) {
        console.warn("[Analysis] Quality warning:", qualityCheck.warning);
      }

      // Step 2: Convert to base64
      const base64Image = await convertImageToBase64(imageUri);
      setImageBase64(base64Image);

      // Step 3: Call API
      const result = await analyzeSkin(base64Image, true);

      // Step 4: Display result
      setAnalysisResult(result);
    } catch (error: any) {
      throw error; // Let caller handle error display
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    resetAnalysis();
  };

  return {
    analysisResult,
    isAnalyzing,
    imageBase64,
    analyze,
    reset,
  };
};
