import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
}

export default function LoadingState({
  title = "Đang phân tích ...",
  subtitle = "Chúng tôi sẽ sớm cung cấp kết quả cho bạn",
}: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View
        className="bg-white p-6 items-center rounded-3xl border border-slate-200"
        style={{ width: "90%" }}
      >
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text className="text-lg font-semibold text-slate-900 mt-4">
          {title}
        </Text>
        <Text className="text-sm text-slate-600 mt-2 text-center leading-5">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
