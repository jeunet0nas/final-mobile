import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorSchemeContext } from "@/contexts/ColorSchemeContext";
import { useSettings } from "@/contexts/SettingsContext";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: "toggle" | "navigation" | "action";
  value?: boolean;
  icon: any;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme, isDark } = useColorSchemeContext();
  const { settings, updateSettings } = useSettings();

  const toggleSetting = async (key: keyof typeof settings) => {
    await updateSettings({ [key]: !settings[key] });
  };

  const handleThemeChange = () => {
    // Cycle through: auto -> light -> dark -> auto
    if (colorScheme === "auto") {
      setColorScheme("light");
    } else if (colorScheme === "light") {
      setColorScheme("dark");
    } else {
      setColorScheme("auto");
    }
  };

  const getThemeSubtitle = () => {
    switch (colorScheme) {
      case "auto":
        return "Tự động theo hệ thống";
      case "light":
        return "Chế độ sáng";
      case "dark":
        return "Chế độ tối";
      default:
        return "Tự động";
    }
  };

  const appearanceSettings: SettingItem[] = [
    {
      id: "darkMode",
      title: "Chủ đề giao diện",
      subtitle: getThemeSubtitle(),
      type: "navigation",
      icon: colorScheme === "dark" ? "moon" : colorScheme === "light" ? "sunny" : "contrast",
      onPress: handleThemeChange,
    },
    {
      id: "language",
      title: "Ngôn ngữ",
      subtitle: "Tiếng Việt",
      type: "navigation",
      icon: "language",
      onPress: () => Alert.alert("Ngôn ngữ", "Tính năng sắp ra mắt"),
    },
  ];

  const analysisSettings: SettingItem[] = [
    {
      id: "autoSave",
      title: "Tự động lưu kết quả",
      subtitle: "Lưu kết quả phân tích tự động",
      type: "toggle",
      value: settings.autoSave,
      icon: "save",
      onPress: () => toggleSetting("autoSave"),
    },
    {
      id: "highQuality",
      title: "Phân tích chất lượng cao",
      subtitle: "Tốn nhiều thời gian hơn",
      type: "toggle",
      value: settings.highQuality,
      icon: "sparkles",
      onPress: () => toggleSetting("highQuality"),
    },
  ];

  const privacySettings: SettingItem[] = [
    {
      id: "analytics",
      title: "Thu thập dữ liệu sử dụng",
      subtitle: "Giúp cải thiện ứng dụng",
      type: "toggle",
      value: settings.analytics,
      icon: "bar-chart",
      onPress: () => toggleSetting("analytics"),
    },
    {
      id: "crashReports",
      title: "Báo cáo lỗi tự động",
      subtitle: "Gửi báo cáo khi ứng dụng gặp lỗi",
      type: "toggle",
      value: settings.crashReports,
      icon: "bug",
      onPress: () => toggleSetting("crashReports"),
    },
  ];

  const securitySettings: SettingItem[] = [
    {
      id: "changePassword",
      title: "Đổi mật khẩu",
      subtitle: "Thay đổi mật khẩu đăng nhập",
      type: "navigation",
      icon: "key",
      onPress: () => router.push("/account/change-password"),
    },
  ];

  const aboutSettings: SettingItem[] = [
    {
      id: "version",
      title: "Phiên bản",
      subtitle: "1.0.0",
      type: "navigation",
      icon: "information-circle",
      onPress: () => {},
    },
    {
      id: "terms",
      title: "Điều khoản sử dụng",
      type: "navigation",
      icon: "document-text",
      onPress: () => Alert.alert("Điều khoản", "Tính năng sắp ra mắt"),
    },
    {
      id: "privacy",
      title: "Chính sách bảo mật",
      type: "navigation",
      icon: "shield-checkmark",
      onPress: () => Alert.alert("Bảo mật", "Tính năng sắp ra mắt"),
    },
  ];

  const handleClearCache = () => {
    Alert.alert(
      "Xóa bộ nhớ cache",
      "Bạn có chắc muốn xóa tất cả dữ liệu cache?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => Alert.alert("Thành công", "Đã xóa bộ nhớ cache"),
        },
      ]
    );
  };

  const renderSettingItem = (item: SettingItem) => {
    return (
      <Pressable
        key={item.id}
        className="flex-row items-center p-4 active:bg-slate-50 rounded-2xl"
        onPress={item.onPress}
        disabled={item.type === "navigation" && item.id === "version"}
      >
        <View className="w-11 h-11 rounded-full bg-slate-100 items-center justify-center">
          <Ionicons name={item.icon} size={20} color="#0a7ea4" />
        </View>
        <View className="flex-1 ml-3.5">
          <Text className="text-base font-semibold text-slate-900 mb-0.5">
            {item.title}
          </Text>
          {item.subtitle && (
            <Text className="text-sm text-slate-500">{item.subtitle}</Text>
          )}
        </View>
        {item.type === "toggle" && (
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: "#cbd5e1", true: "#0a7ea4" }}
            thumbColor="white"
          />
        )}
        {item.type === "navigation" && (
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 pt-7" edges={["bottom"]}>
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </Pressable>
          <Text className="text-xl font-bold text-slate-900">Cài đặt</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Appearance */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Giao diện
          </Text>
          <View className="bg-white rounded-3xl p-2 shadow-sm">
            {appearanceSettings.map((item) => renderSettingItem(item))}
          </View>
        </View>

        {/* Analysis */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Phân tích
          </Text>
          <View className="bg-white rounded-3xl p-2 shadow-sm">
            {analysisSettings.map((item) => renderSettingItem(item))}
          </View>
        </View>

        {/* Privacy */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Quyền riêng tư
          </Text>
          <View className="bg-white rounded-3xl p-2 shadow-sm">
            {privacySettings.map((item) => renderSettingItem(item))}
          </View>
        </View>

        {/* Security */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Bảo mật
          </Text>
          <View className="bg-white rounded-3xl p-2 shadow-sm">
            {securitySettings.map((item) => renderSettingItem(item))}
          </View>
        </View>

        {/* Storage */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Dung lượng
          </Text>
          <View className="bg-white rounded-3xl p-2 shadow-sm">
            <Pressable
              className="flex-row items-center p-4 active:bg-slate-50 rounded-2xl"
              onPress={handleClearCache}
            >
              <View className="w-11 h-11 rounded-full bg-slate-100 items-center justify-center">
                <Ionicons name="trash" size={20} color="#0a7ea4" />
              </View>
              <View className="flex-1 ml-3.5">
                <Text className="text-base font-semibold text-slate-900 mb-0.5">
                  Xóa bộ nhớ cache
                </Text>
                <Text className="text-sm text-slate-500">
                  Giải phóng dung lượng thiết bị
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </Pressable>
          </View>
        </View>

        {/* About */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Về ứng dụng
          </Text>
          <View className="bg-white rounded-3xl p-2 shadow-sm">
            {aboutSettings.map((item) => renderSettingItem(item))}
          </View>
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <View className="flex-1 ml-2">
              <Text className="text-sm font-semibold text-slate-900 mb-1">
                Cài đặt tùy chỉnh
              </Text>
              <Text className="text-sm text-slate-600 leading-5">
                Tùy chỉnh ứng dụng theo ý thích của bạn. Một số cài đặt có thể
                ảnh hưởng đến hiệu suất.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
