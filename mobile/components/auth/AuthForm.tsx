import React, { useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AuthFormProps {
  isLogin: boolean;
  email: string;
  password: string;
  name: string;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onNameChange: (text: string) => void;
  onSubmit: () => void;
  onForgotPassword?: () => void;
}

export default function AuthForm({
  isLogin,
  email,
  password,
  name,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onSubmit,
  onForgotPassword,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View>
      {!isLogin && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-2">
            Họ và tên
          </Text>
          <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-4 min-h-[52px]">
            <Ionicons name="person-outline" size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-base text-slate-900"
              placeholder="Họ Tên"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={onNameChange}
            />
          </View>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-sm font-medium text-slate-700 mb-2">Email</Text>
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-4 min-h-[52px]">
          <Ionicons name="mail-outline" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900"
            placeholder="example@email.com"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-slate-700 mb-2">
          Mật khẩu
        </Text>
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-4 min-h-[52px]">
          <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900"
            placeholder="Mật khẩu"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} className="ml-2">
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#94a3b8"
            />
          </Pressable>
        </View>
      </View>

      {isLogin && onForgotPassword && (
        <Pressable onPress={onForgotPassword} className="mb-2">
          <Text className="text-sm text-[#0a7ea4] font-medium text-right">
            Quên mật khẩu?
          </Text>
        </Pressable>
      )}

      {isLogin && (
        <Pressable
          className="bg-[#0a7ea4] rounded-xl py-4 mt-4 shadow-md active:opacity-90"
          onPress={onSubmit}
        >
          <Text className="text-white text-center font-bold text-base">
            Đăng nhập
          </Text>
        </Pressable>
      )}
    </View>
  );
}
