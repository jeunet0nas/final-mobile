import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { User } from "firebase/auth";
import type { SavedAnalysis } from "@/types/api.types";
import ScreenHeader from "../common/ScreenHeader";
import HistoryItem from "./HistoryItem";

interface LoggedInAccountViewProps {
  user: User;
  onLogout: () => Promise<void>;
  history: SavedAnalysis[];
  loadingHistory: boolean;
  refreshing: boolean;
  showAllHistory: boolean;
  onRefresh: () => Promise<void>;
  onDeleteHistory: (id: string) => void;
  onToggleShowAll: () => void;
  menuItems: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
  }[];
}

export default function LoggedInAccountView({
  user,
  onLogout,
  history,
  loadingHistory,
  refreshing,
  showAllHistory,
  onRefresh,
  onDeleteHistory,
  onToggleShowAll,
  menuItems,
}: LoggedInAccountViewProps) {
  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await onLogout();
          } catch (error: any) {
            Alert.alert("Lỗi", error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={[]}>
      <ScreenHeader title="Tài khoản" variant="solid" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View className="bg-white rounded-3xl p-5 mb-6 border border-slate-200">
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-[#0a7ea4] items-center justify-center">
              <Text className="text-xl font-bold text-white">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-slate-900">
                {user?.displayName || "Người dùng"}
              </Text>
              <Text className="text-sm text-slate-500 mt-1" numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </View>
        </View>

        {/* Analysis History Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-slate-900">
              Lịch sử phân tích
            </Text>
            <Text className="text-xs text-slate-500">
              {history.length} kết quả
            </Text>
          </View>

          {loadingHistory && !refreshing ? (
            <View className="bg-white rounded-3xl border border-slate-200 p-8 items-center">
              <ActivityIndicator size="large" color="#0a7ea4" />
              <Text className="text-sm text-slate-500 mt-3">
                Đang tải lịch sử...
              </Text>
            </View>
          ) : history.length === 0 ? (
            <View className="bg-white rounded-3xl border border-slate-200 p-8 items-center">
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#cbd5e1"
              />
              <Text className="text-base font-semibold text-slate-900 mt-3 mb-2">
                Chưa có lịch sử
              </Text>
              <Text className="text-sm text-slate-500 text-center">
                Bắt đầu phân tích da để lưu kết quả vào đây
              </Text>
            </View>
          ) : (
            <View>
              {history
                .slice(0, showAllHistory ? history.length : 3)
                .map((item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onDelete={onDeleteHistory}
                  />
                ))}
              {history.length > 3 && !showAllHistory && (
                <Pressable
                  className="bg-white border border-slate-200 rounded-full py-3 mt-2 active:bg-slate-50"
                  onPress={onToggleShowAll}
                >
                  <Text className="text-center text-sm font-semibold text-[#0a7ea4]">
                    Xem thêm {history.length - 3} kết quả
                  </Text>
                </Pressable>
              )}
              {showAllHistory && history.length > 3 && (
                <Pressable
                  className="bg-white border border-slate-200 rounded-full py-3 mt-2 active:bg-slate-50"
                  onPress={onToggleShowAll}
                >
                  <Text className="text-center text-sm font-semibold text-[#0a7ea4]">
                    Thu gọn
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-3xl border border-slate-200 p-2 mb-6">
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              className={`flex-row items-center p-4 active:bg-slate-50 rounded-2xl ${
                index < menuItems.length - 1 ? "mb-1" : ""
              }`}
              onPress={item.onPress}
            >
              <View className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 items-center justify-center">
                <Ionicons name={item.icon} size={20} color="#0a7ea4" />
              </View>
              <View className="flex-1 ml-3.5">
                <Text className="text-base font-semibold text-slate-900 mb-0.5">
                  {item.title}
                </Text>
                <Text className="text-sm text-slate-500 leading-5">
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable
          className="bg-white border border-slate-200 rounded-full py-4 active:bg-slate-50"
          onPress={handleLogout}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="#0a7ea4" />
            <Text className="ml-2 text-[#0a7ea4] font-semibold text-base">
              Đăng xuất
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
