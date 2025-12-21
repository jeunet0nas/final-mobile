import React from "react";
import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActionButtonsProps {
  onTakePhoto: () => void;
  onPickImage: () => void;
}

export default function ActionButtons({
  onTakePhoto,
  onPickImage,
}: ActionButtonsProps) {
  return (
    <View className="mb-6">
      <Pressable
        className="bg-white rounded-3xl p-5 mb-3 border border-slate-200 active:bg-slate-50"
        onPress={onTakePhoto}
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 items-center justify-center">
            <Ionicons name="camera" size={22} color="#0a7ea4" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-base font-semibold text-slate-900 mb-1">
              Chụp ảnh
            </Text>
            <Text className="text-sm text-slate-500 leading-5">
              Sử dụng camera để chụp ảnh da mặt
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </View>
      </Pressable>

      <Pressable
        className="bg-white rounded-3xl p-5 border border-slate-200 active:bg-slate-50"
        onPress={onPickImage}
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 items-center justify-center">
            <Ionicons name="images" size={22} color="#0a7ea4" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-base font-semibold text-slate-900 mb-1">
              Chọn từ thư viện
            </Text>
            <Text className="text-sm text-slate-500 leading-5">
              Tải ảnh lên từ thư viện ảnh
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </View>
      </Pressable>
    </View>
  );
}
