import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ImagePlaceholder() {
  return (
    <View className="bg-white rounded-3xl p-6 mb-6 border border-dashed border-slate-200">
      <View className="items-center py-6">
        <View className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 items-center justify-center mb-4">
          <Ionicons name="image-outline" size={36} color="#0a7ea4" />
        </View>
        <Text className="text-lg font-semibold text-slate-900 mb-2">
          Chưa có ảnh nào
        </Text>
        <Text className="text-sm text-slate-500 text-center leading-5">
          Chọn ảnh từ thư viện hoặc chụp ảnh mới
        </Text>
      </View>
    </View>
  );
}
