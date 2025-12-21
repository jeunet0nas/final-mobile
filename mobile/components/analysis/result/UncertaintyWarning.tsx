import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UncertaintyWarningProps {
  reason: string;
}

export default function UncertaintyWarning({
  reason,
}: UncertaintyWarningProps) {
  return (
    <View className="bg-primary/5 p-4 mb-4 border border-primary/15 rounded-2xl">
      <View className="flex-row items-start">
        <Ionicons name="information-circle" size={22} color="#0a7ea4" />
        <View className="flex-1 ml-3">
          <Text className="text-sm font-semibold text-slate-900 mb-1">
            Lưu ý về độ tin cậy
          </Text>
          <Text className="text-sm text-slate-700 leading-6">{reason}</Text>
        </View>
      </View>
    </View>
  );
}
