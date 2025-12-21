import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "../../components/auth/AuthForm";
import SocialLogin from "../../components/auth/SocialLogin";

// Required for expo-web-browser
WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loginWithFacebook } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getFirebaseErrorMessage = (error: any) => {
    const errorCode = error?.code;
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Email này đã được sử dụng";
      case "auth/invalid-email":
        return "Email không hợp lệ";
      case "auth/weak-password":
        return "Mật khẩu quá yếu";
      case "auth/network-request-failed":
        return "Lỗi kết nối mạng";
      default:
        return error?.message || "Đã xảy ra lỗi không xác định";
    }
  };

  const handleRegister = async () => {
    // Validate empty fields
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      // After successful register, redirect to email verification screen
      router.push("./verify-email");
    } catch (error: any) {
      Alert.alert("Đăng ký thất bại", getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Thông báo", "Tính năng đăng ký Google sẽ sớm ra mắt");
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);

      // Facebook App ID - Bạn cần thay thế bằng App ID thật của bạn
      const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID";

      Alert.alert(
        "Cấu hình Facebook Login",
        "Vui lòng tạo Facebook App tại developers.facebook.com và cấu hình FACEBOOK_APP_ID trong mã nguồn.\n\nXem hướng dẫn tại: https://docs.expo.dev/guides/authentication/#facebook"
      );
    } catch (error: any) {
      Alert.alert("Đăng ký Facebook thất bại", error.message);
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
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-[#0a7ea4] items-center justify-center mb-4">
              <Ionicons name="person-add" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-slate-900 mb-2">
              Đăng ký
            </Text>
            <Text className="text-base text-slate-600 text-center">
              Tạo tài khoản miễn phí để bắt đầu
            </Text>
          </View>

          <AuthForm
            isLogin={false}
            email={email}
            password={password}
            name={name}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onNameChange={setName}
            onSubmit={handleRegister}
          />

          {/* Confirm Password Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-700 mb-2">
              Xác nhận mật khẩu
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3.5">
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900"
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2"
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#94a3b8"
                />
              </Pressable>
            </View>
          </View>

          {/* Show Password Checkbox */}
          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            className="flex-row items-center mb-4"
          >
            <View
              className={`w-5 h-5 rounded border-2 items-center justify-center mr-2 ${
                showConfirmPassword
                  ? "bg-[#0a7ea4] border-[#0a7ea4]"
                  : "border-gray-300 bg-white"
              }`}
            >
              {showConfirmPassword && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </View>
            <Text className="text-sm text-slate-600">Hiện mật khẩu</Text>
          </Pressable>

          {/* Custom Submit Button with Loading State */}
          <Pressable
            className={`rounded-xl py-4 mt-4 shadow-md ${
              loading ? "bg-gray-400" : "bg-[#0a7ea4] active:opacity-90"
            }`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white text-center font-bold text-base ml-2">
                  Đang đăng ký...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-base">
                Đăng ký
              </Text>
            )}
          </Pressable>

          <SocialLogin
            onGoogleLogin={handleGoogleLogin}
            onFacebookLogin={handleFacebookLogin}
          />

          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-sm text-slate-600">Đã có tài khoản? </Text>
            <Pressable
              onPress={() => router.push("/(auth)/login")}
              disabled={loading}
            >
              <Text className="text-sm font-semibold text-[#0a7ea4]">
                Đăng nhập
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
