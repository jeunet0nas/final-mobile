import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenHeader from "../common/ScreenHeader";

export default function GuestAccountView() {
  const router = useRouter();

  const features = [
    {
      icon: "checkmark-circle" as const,
      text: "Lưu lịch sử phân tích da không giới hạn",
    },
    {
      icon: "checkmark-circle" as const,
      text: "Theo dõi tiến độ cải thiện làn da",
    },
    {
      icon: "checkmark-circle" as const,
      text: "Nhận tư vấn cá nhân hóa từ AI",
    },
    {
      icon: "checkmark-circle" as const,
      text: "Đồng bộ dữ liệu trên nhiều thiết bị",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={[]}>
      <ScreenHeader title="Tài khoản" variant="solid" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mt-4 mb-6">
          <View className="w-24 h-24 rounded-full bg-slate-50 border border-slate-200 items-center justify-center">
            <Ionicons name="person" size={44} color="#0a7ea4" />
          </View>
          <Text className="text-2xl font-bold text-slate-900 mt-4">
            DermaScan AI
          </Text>
          <Text className="text-sm text-slate-500 mt-2 text-center leading-5">
            Đăng nhập để lưu lịch sử và nhận tư vấn cá nhân hóa.
          </Text>
        </View>

        {/* CTAs */}
        <View className="gap-3 mb-6">
          <Pressable
            className="bg-[#0a7ea4] rounded-full py-4 active:opacity-90"
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-white text-center font-semibold text-base">
              Đăng nhập
            </Text>
          </Pressable>

          <Pressable
            className="bg-white border border-[#0a7ea4] rounded-full py-4 active:bg-slate-50"
            onPress={() => router.push("/(auth)/register")}
          >
            <Text className="text-[#0a7ea4] text-center font-semibold text-base">
              Tạo tài khoản mới
            </Text>
          </Pressable>
        </View>

        {/* Features */}
        <View className="bg-white rounded-3xl border border-slate-200 p-5 mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#0a7ea4"
            />
            <Text className="text-base font-semibold text-slate-900 ml-2">
              Lợi ích khi đăng ký
            </Text>
          </View>

          <View className="gap-3">
            {features.map((feature, index) => (
              <View key={index} className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 items-center justify-center mt-0.5">
                  <Ionicons name={feature.icon} size={16} color="#0a7ea4" />
                </View>
                <Text className="flex-1 ml-3 text-sm text-slate-700 leading-6">
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Guest Info */}
        <View className="p-5 bg-slate-50 rounded-3xl border border-slate-200">
          <View className="flex-row items-start">
            <View className="mt-0.5">
              <Ionicons name="information-circle" size={20} color="#0a7ea4" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-slate-900 mb-1.5">
                Sử dụng chế độ khách
              </Text>
              <Text className="text-sm text-slate-600 leading-6">
                Bạn vẫn có thể sử dụng app để phân tích da và chat với AI mà
                không cần đăng nhập. Tuy nhiên, dữ liệu sẽ không được lưu.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
