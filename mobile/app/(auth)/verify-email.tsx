import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  resendVerificationEmail,
  isEmailVerified,
  logoutUser,
} from "@/api/services/auth.service";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  // If user logged out (user becomes null), redirect to guest mode
  useEffect(() => {
    if (user === null) {
      router.replace("/(tabs)");
    }
  }, [user]);

  // Check if email is verified every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const verified = await isEmailVerified();
        if (verified) {
          Alert.alert("Thành công", "Email đã được xác nhận!", [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ]);
        }
      } catch (error) {
        console.error("Check verification error:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCountdown, canResend]);

  const handleResendEmail = async () => {
    if (!user) return;

    setResendLoading(true);
    try {
      await resendVerificationEmail(user);
      Alert.alert(
        "Email sent",
        "Email xác nhận đã được gửi lại. Vui lòng check email của bạn."
      );
      setCanResend(false);
      setResendCountdown(60); // 60 second cooldown
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.message || "Không thể gửi lại email. Vui lòng thử lại."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow user to continue as guest
    // Account will be saved, but session will be cleared
    Alert.alert(
      "Để sau",
      "Tài khoản của bạn sẽ được lưu. Bạn có thể đăng nhập sau để xác thực email.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Tiếp tục như khách",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutUser();
              // After logout, app will redirect to guest/login screen
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Không thể đăng xuất");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-8 pb-8 flex-grow justify-center"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Ionicons name="mail-outline" size={50} color="#0a7ea4" />
            </View>

            {/* Title */}
            <Text className="text-3xl font-bold text-slate-900 mb-2 text-center">
              Xác nhận Email
            </Text>

            {/* Subtitle */}
            <Text className="text-base text-slate-600 text-center">
              Chúng tôi đã gửi một liên kết xác nhận đến
            </Text>
            <Text className="text-base font-semibold text-slate-900 mt-1">
              {user?.email}
            </Text>
          </View>

          {/* Instructions */}
          <View className="bg-blue-50 rounded-xl px-4 py-3 mb-8 border border-blue-200">
            <Text className="text-sm text-slate-700 leading-5">
              Hãy kiểm tra email của bạn và click vào liên kết xác nhận. Nếu
              không tìm thấy, hãy kiểm tra thư mục spam.
            </Text>
          </View>

          {/* Loading indicator */}
          <View className="items-center mb-8">
            <Text className="text-sm text-slate-600 mb-3">
              Đang kiểm tra xác nhận...
            </Text>
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>

          {/* Resend button */}
          <Pressable
            className={`rounded-xl py-4 mb-4 ${
              canResend && !resendLoading ? "bg-[#0a7ea4]" : "bg-gray-300"
            }`}
            onPress={handleResendEmail}
            disabled={!canResend || resendLoading}
          >
            {resendLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white text-center font-bold text-base ml-2">
                  Đang gửi...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-base">
                {resendCountdown > 0
                  ? `Gửi lại sau ${resendCountdown}s`
                  : "Gửi lại Email"}
              </Text>
            )}
          </Pressable>

          {/* Continue as guest button */}
          <Pressable
            className="rounded-xl py-3 mb-6 border-2 border-slate-300 bg-white"
            onPress={handleSkip}
          >
            <Text className="text-slate-700 text-center font-semibold text-base">
              Để sau
            </Text>
          </Pressable>

          {/* Info message */}
          <View className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-200">
            <Text className="text-xs text-slate-600 text-center leading-4">
              💡 Bạn có thể xác thực email sau. Tài khoản của bạn sẽ được lưu
              trên hệ thống.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
