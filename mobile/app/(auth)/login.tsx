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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/contexts/AuthContext";
import { resetPassword } from "@/api/services/auth.service";
import AuthForm from "../../components/auth/AuthForm";
import SocialLogin from "../../components/auth/SocialLogin";

// Required for expo-web-browser
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithFacebook } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Navigate back to app after successful login
      router.back();
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Thông báo", "Tính năng đăng nhập Google sẽ sớm ra mắt");
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);

      // Facebook App ID - Bạn cần thay thế bằng App ID thật của bạn
      const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID";

      // Chú ý: Đây là placeholder. Bạn cần:
      // 1. Tạo Facebook App tại https://developers.facebook.com/
      // 2. Thêm Facebook Login vào app
      // 3. Cấu hình OAuth Redirect URI
      // 4. Cài đặt expo-auth-session: npx expo install expo-auth-session expo-crypto
      // 5. Sử dụng code sau:

      /*
      import * as AuthSession from 'expo-auth-session';
      
      const discovery = {
        authorizationEndpoint: 'https://www.facebook.com/v12.0/dialog/oauth',
      };
      
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'your-app-scheme'
      });
      
      const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
          clientId: FACEBOOK_APP_ID,
          scopes: ['public_profile', 'email'],
          redirectUri,
        },
        discovery
      );
      
      const result = await promptAsync();
      if (result.type === 'success') {
        const { access_token } = result.params;
        await loginWithFacebook(access_token);
        router.back();
      }
      */

      Alert.alert(
        "Cấu hình Facebook Login",
        "Vui lòng tạo Facebook App tại developers.facebook.com và cấu hình FACEBOOK_APP_ID trong mã nguồn.\n\nXem hướng dẫn tại: https://docs.expo.dev/guides/authentication/#facebook"
      );
    } catch (error: any) {
      Alert.alert("Đăng nhập Facebook thất bại", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      "Quên mật khẩu",
      "Nhập email đã đăng ký để nhận link đặt lại mật khẩu",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Gửi",
          onPress: async (inputEmail) => {
            if (!inputEmail || !inputEmail.trim()) {
              Alert.alert("Lỗi", "Vui lòng nhập email");
              return;
            }
            
            try {
              await resetPassword(inputEmail.trim());
              Alert.alert(
                "Thành công",
                "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hòm thư."
              );
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi");
            }
          },
        },
      ],
      "plain-text",
      email
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
          contentContainerClassName="px-6 pt-4 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-[#0a7ea4] items-center justify-center mb-4">
              <Ionicons name="person" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-slate-900 mb-2">
              Đăng nhập
            </Text>
            <Text className="text-base text-slate-600 text-center">
              Chào mừng trở lại! Đăng nhập để tiếp tục
            </Text>
          </View>

          {loading ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#0891b2" />
            </View>
          ) : (
            <>
              <AuthForm
                isLogin={true}
                email={email}
                password={password}
                name=""
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onNameChange={() => {}}
                onSubmit={handleLogin}
                onForgotPassword={handleForgotPassword}
              />

              <SocialLogin
                onGoogleLogin={handleGoogleLogin}
                onFacebookLogin={handleFacebookLogin}
              />

              <View className="flex-row items-center justify-center mt-6">
                <Text className="text-sm text-slate-600">
                  Chưa có tài khoản?{" "}
                </Text>
                <Pressable onPress={() => router.push("/(auth)/register")}>
                  <Text className="text-sm font-semibold text-[#0a7ea4]">
                    Đăng ký ngay
                  </Text>
                </Pressable>
              </View>

              <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#0a7ea4"
                  />
                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-semibold text-slate-900 mb-1">
                      Chế độ khách
                    </Text>
                    <Text className="text-sm text-slate-600 leading-5">
                      Bạn có thể sử dụng mà không cần đăng nhập, nhưng lịch sử
                      phân tích sẽ không được lưu.
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
