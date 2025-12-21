import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { changePassword } from "@/api/services/auth.service";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận không khớp");
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới phải khác mật khẩu cũ");
      return;
    }

    setLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert(
        "Thành công",
        "Đổi mật khẩu thành công",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
      // Clear inputs
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-200">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#334155" />
          </Pressable>
          <Text className="text-xl font-bold text-slate-900">
            Đổi mật khẩu
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 py-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Old Password */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-700 mb-2">
              Mật khẩu cũ
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-4 min-h-[52px]">
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900"
                placeholder="Nhập mật khẩu cũ"
                placeholderTextColor="#94a3b8"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOldPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowOldPassword(!showOldPassword)}
                className="ml-2"
              >
                <Ionicons
                  name={showOldPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#94a3b8"
                />
              </Pressable>
            </View>
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-700 mb-2">
              Mật khẩu mới
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-4 min-h-[52px]">
              <Ionicons name="key-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                placeholderTextColor="#94a3b8"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="ml-2"
              >
                <Ionicons
                  name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#94a3b8"
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-slate-700 mb-2">
              Xác nhận mật khẩu mới
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-4 min-h-[52px]">
              <Ionicons name="key-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900"
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2"
              >
                <Ionicons
                  name={
                    showConfirmPassword ? "eye-outline" : "eye-off-outline"
                  }
                  size={20}
                  color="#94a3b8"
                />
              </Pressable>
            </View>
          </View>

          {/* Info Box */}
          <View className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#0a7ea4"
              />
              <View className="flex-1 ml-2">
                <Text className="text-sm font-semibold text-slate-900 mb-1">
                  Lưu ý
                </Text>
                <Text className="text-sm text-slate-600 leading-5">
                  • Mật khẩu mới phải có ít nhất 6 ký tự{"\n"}
                  • Mật khẩu mới phải khác mật khẩu cũ{"\n"}
                  • Bạn cần nhập đúng mật khẩu cũ để xác thực
                </Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            className={`rounded-xl py-4 shadow-md ${
              loading
                ? "bg-gray-400"
                : "bg-[#0a7ea4] active:opacity-90"
            }`}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-base">
                Đổi mật khẩu
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
