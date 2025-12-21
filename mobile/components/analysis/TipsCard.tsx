import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TipsCard() {
  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-200">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 items-center justify-center">
          <Ionicons name="bulb-outline" size={20} color="#0a7ea4" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-slate-900">
            Hướng dẫn chụp ảnh (2 bước)
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            Giúp AI nhận diện rõ hơn để kết quả ổn định
          </Text>
        </View>
      </View>

      <View className="gap-3">
        <View className="flex-row items-start">
          <View className="w-7 h-7 rounded-full bg-[#0a7ea4] items-center justify-center mt-0.5">
            <Text className="text-white text-xs font-bold">1</Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-sm font-semibold text-slate-900">
              Ánh sáng tự nhiên, mặt rõ
            </Text>
            <Text className="text-sm text-slate-600 leading-5 mt-0.5">
              Tránh ngược sáng; giữ mặt ở trung tâm khung hình.
            </Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <View className="w-7 h-7 rounded-full bg-[#0a7ea4] items-center justify-center mt-0.5">
            <Text className="text-white text-xs font-bold">2</Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-sm font-semibold text-slate-900">
              Mặt mộc, chụp thẳng
            </Text>
            <Text className="text-sm text-slate-600 leading-5 mt-0.5">
              Không trang điểm; hạn chế góc nghiêng và vật che.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
