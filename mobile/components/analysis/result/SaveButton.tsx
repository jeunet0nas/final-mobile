import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { User } from "firebase/auth";

interface SaveButtonProps {
  user: User | null;
  isSaving: boolean;
  isSaved: boolean;
  onSave: () => void;
  onLogin: () => void;
}

export default function SaveButton({
  user,
  isSaving,
  isSaved,
  onSave,
  onLogin,
}: SaveButtonProps) {
  // Not logged in - show login prompt
  if (!user) {
    return (
      <TouchableOpacity
        onPress={onLogin}
        activeOpacity={0.8}
        className="rounded-full py-4 border border-primary/40 bg-primary/5"
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="lock-closed" size={20} color="#0a7ea4" />
          <Text className="text-primary font-semibold text-base ml-2">
            Đăng nhập để lưu kết quả
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Logged in - show save button
  return (
    <TouchableOpacity
      onPress={onSave}
      disabled={isSaving || isSaved}
      activeOpacity={0.8}
      className={`rounded-full py-4 ${
        isSaving || isSaved ? "bg-slate-300" : "bg-primary"
      }`}
    >
      <View className="flex-row items-center justify-center">
        {isSaving ? (
          <>
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Đang lưu...
            </Text>
          </>
        ) : isSaved ? (
          <>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Đã lưu
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="save" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Lưu phân tích
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
