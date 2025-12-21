import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ImagePreviewProps {
  imageUri: string;
  onRemove: () => void;
  onAnalyze: () => void;
  isLoading?: boolean;
}

export default function ImagePreview({
  imageUri,
  onRemove,
  onAnalyze,
  isLoading = false, // ← DEFAULT FALSE
}: ImagePreviewProps) {
  return (
    <View className="bg-white rounded-3xl p-4 mb-6 border border-slate-200">
      <Image
        source={{ uri: imageUri }}
        className="w-full h-80 rounded-2xl"
        resizeMode="cover"
      />

      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity
          className="flex-1 py-4 rounded-full border border-slate-200"
          onPress={onRemove}
          disabled={isLoading} // ← DISABLE KHI LOADING
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="refresh" size={18} color="#0a7ea4" />
            <Text className="ml-2 text-center text-slate-900 font-semibold">
              Chọn lại
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-4 rounded-full ${
            isLoading ? "bg-slate-300" : "bg-[#0a7ea4]"
          }`}
          onPress={onAnalyze}
          disabled={isLoading} // ← DISABLE KHI LOADING
        >
          <View className="flex-row items-center justify-center">
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="sparkles" size={18} color="white" />
            )}
            <Text className="ml-2 text-center text-white font-semibold">
              {isLoading ? "Đang phân tích..." : "Phân tích"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
