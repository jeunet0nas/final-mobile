import React, { useEffect } from "react";
import { ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { handleApiError } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useAnalysis } from "@/hooks/useAnalysis";
import ImagePreview from "../../components/analysis/ImagePreview";
import ImagePlaceholder from "../../components/analysis/ImagePlaceholder";
import ActionButtons from "../../components/analysis/ActionButtons";
import TipsCard from "../../components/analysis/TipsCard";
import ScreenHeader from "../../components/common/ScreenHeader";
import ResultCard from "../../components/analysis/result/ResultCard";

export default function AnalysisScreen() {
  const { user } = useAuth();
  const { selectedImage, pickImage, takePhoto, clearImage } = useImagePicker();
  const { analysisResult, isAnalyzing, imageBase64, analyze, reset } =
    useAnalysis();

  // Reset analysis results AND clear image only when user actually logs out
  useEffect(() => {
    if (!user) {
      reset();
      clearImage();
    }
    // Only depend on user UID change, not function references
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleAnalyze = async () => {
    try {
      await analyze(selectedImage!);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      Alert.alert("Lỗi phân tích", errorMessage);
    }
  };

  const handleAnalyzeAgain = () => {
    reset();
    clearImage();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={[]}>
      <ScreenHeader title="Phân tích da" variant="solid" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Show result screen when analyzing or has result */}
        {isAnalyzing || analysisResult ? (
          <ResultCard
            result={analysisResult}
            isLoading={isAnalyzing}
            onAnalyzeAgain={handleAnalyzeAgain}
            imageBase64={imageBase64 || undefined}
          />
        ) : (
          <>
            {/* Image Selection */}
            {selectedImage ? (
              <ImagePreview
                imageUri={selectedImage}
                onRemove={clearImage}
                onAnalyze={handleAnalyze}
                isLoading={isAnalyzing}
              />
            ) : (
              <ImagePlaceholder />
            )}

            {/* Action Buttons */}
            <ActionButtons onTakePhoto={takePhoto} onPickImage={pickImage} />

            {/* Tips Card */}
            <TipsCard />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
