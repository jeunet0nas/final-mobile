import React from "react";
import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SocialLoginProps {
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
}

export default function SocialLogin({ onGoogleLogin, onFacebookLogin }: SocialLoginProps) {
  return (
    <View>
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="px-4 text-sm text-gray-500">Hoặc</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* Google Login */}
      <Pressable
        className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-3.5 mb-3 active:bg-gray-50"
        onPress={onGoogleLogin}
      >
        <Ionicons name="logo-google" size={20} color="#DB4437" />
        <Text className="ml-2 text-slate-900 font-medium">
          Tiếp tục với Google
        </Text>
      </Pressable>

      {/* Facebook Login */}
      <Pressable
        className="flex-row items-center justify-center bg-[#1877F2] rounded-xl py-3.5 active:opacity-90"
        onPress={onFacebookLogin}
      >
        <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
        <Text className="ml-2 text-white font-medium">
          Tiếp tục với Facebook
        </Text>
      </Pressable>
    </View>
  );
}
