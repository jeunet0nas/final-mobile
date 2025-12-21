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

interface NotificationSetting {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  icon: any;
}

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "analysis",
      title: "Kết quả phân tích",
      subtitle: "Thông báo khi phân tích hoàn tất",
      enabled: true,
      icon: "analytics",
    },
    {
      id: "tips",
      title: "Mẹo chăm sóc da",
      subtitle: "Nhận mẹo hàng ngày về chăm sóc da",
      enabled: true,
      icon: "bulb",
    },
    {
      id: "reminders",
      title: "Nhắc nhở skincare",
      subtitle: "Nhắc nhở thực hiện routine skincare",
      enabled: false,
      icon: "alarm",
    },
    {
      id: "promotions",
      title: "Ưu đãi & Khuyến mãi",
      subtitle: "Thông báo về các ưu đãi đặc biệt",
      enabled: false,
      icon: "pricetag",
    },
    {
      id: "updates",
      title: "Cập nhật ứng dụng",
      subtitle: "Thông báo về tính năng mới",
      enabled: true,
      icon: "rocket",
    },
  ]);

  const [notificationHistory] = useState([
    {
      id: "1",
      title: "Phân tích da hoàn tất",
      message: "Kết quả phân tích da của bạn đã sẵn sàng",
      time: "2 giờ trước",
      icon: "checkmark-circle",
      color: "#10b981",
      read: false,
    },
    {
      id: "2",
      title: "Mẹo chăm sóc da",
      message: "Uống đủ nước giúp da bạn khỏe mạnh hơn",
      time: "1 ngày trước",
      icon: "water",
      color: "#3b82f6",
      read: true,
    },
    {
      id: "3",
      title: "Cập nhật ứng dụng",
      message: "Phiên bản mới với nhiều tính năng thú vị",
      time: "3 ngày trước",
      icon: "rocket",
      color: "#f59e0b",
      read: true,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Xóa tất cả thông báo",
      "Bạn có chắc muốn xóa tất cả thông báo?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => Alert.alert("Đã xóa tất cả thông báo"),
        },
      ]
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
          <Text className="text-xl font-bold text-slate-900">Thông báo</Text>
          <Pressable onPress={handleClearAll}>
            <Text className="text-[#0a7ea4] font-semibold text-sm">
              Xóa tất cả
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Notification Settings */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Cài đặt thông báo
          </Text>
          <View className="bg-white rounded-3xl p-2 shadow-sm">
            {notifications.map((notif, index) => (
              <View
                key={notif.id}
                className={`flex-row items-center p-4 ${
                  index < notifications.length - 1 ? "mb-1" : ""
                }`}
              >
                <View className="w-11 h-11 rounded-full bg-slate-100 items-center justify-center">
                  <Ionicons name={notif.icon} size={20} color="#0a7ea4" />
                </View>
                <View className="flex-1 ml-3.5">
                  <Text className="text-base font-semibold text-slate-900 mb-0.5">
                    {notif.title}
                  </Text>
                  <Text className="text-sm text-slate-500">{notif.subtitle}</Text>
                </View>
                <Switch
                  value={notif.enabled}
                  onValueChange={() => toggleNotification(notif.id)}
                  trackColor={{ false: "#cbd5e1", true: "#0a7ea4" }}
                  thumbColor="white"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recent Notifications */}
        <View>
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Thông báo gần đây
          </Text>
          {notificationHistory.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#cbd5e1"
              />
              <Text className="text-base font-semibold text-slate-900 mt-3 mb-2">
                Chưa có thông báo
              </Text>
              <Text className="text-sm text-slate-500 text-center">
                Bạn sẽ nhận được thông báo ở đây
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {notificationHistory.map((item) => (
                <Pressable
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm active:bg-slate-50 ${
                    !item.read ? "border-2 border-[#0a7ea4]" : ""
                  }`}
                >
                  <View className="flex-row items-start">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-base font-semibold text-slate-900">
                          {item.title}
                        </Text>
                        {!item.read && (
                          <View className="w-2 h-2 rounded-full bg-[#0a7ea4]" />
                        )}
                      </View>
                      <Text className="text-sm text-slate-600 mb-2 leading-5">
                        {item.message}
                      </Text>
                      <Text className="text-xs text-slate-400">{item.time}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 rounded-2xl p-4 mt-5 border border-blue-100">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <View className="flex-1 ml-2">
              <Text className="text-sm font-semibold text-slate-900 mb-1">
                Quản lý thông báo
              </Text>
              <Text className="text-sm text-slate-600 leading-5">
                Bật thông báo để không bỏ lỡ các mẹo chăm sóc da hữu ích và cập
                nhật mới nhất từ ứng dụng.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
