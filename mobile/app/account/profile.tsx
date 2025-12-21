import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { useAccountHistory } from "@/hooks/useAccountHistory";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { history } = useAccountHistory(!!user);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);

  // Load account creation date
  useEffect(() => {
    const loadAccountInfo = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.createdAt) {
              setAccountCreatedAt(data.createdAt.toDate());
            } else {
              // Fallback to Firebase auth metadata
              setAccountCreatedAt(new Date(user.metadata.creationTime || Date.now()));
            }
          } else {
            setAccountCreatedAt(new Date(user.metadata.creationTime || Date.now()));
          }
        } catch (error) {
          console.error("Failed to load account info:", error);
          setAccountCreatedAt(new Date(user.metadata.creationTime || Date.now()));
        }
      }
    };

    loadAccountInfo();
  }, [user]);

  // Calculate days since account creation
  const getDaysSinceCreation = () => {
    if (!accountCreatedAt) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - accountCreatedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên hiển thị");
      return;
    }

    setLoading(true);
    try {
      // Update Firebase Auth profile
      if (user) {
        await updateProfile(user, { displayName: displayName.trim() });

        // Update Firestore user document
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          displayName: displayName.trim(),
          updatedAt: Timestamp.now(),
        });
      }

      Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân");
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || "");
    setIsEditing(false);
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
          <Text className="text-xl font-bold text-slate-900">
            Thông tin cá nhân
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 rounded-full bg-[#0a7ea4] items-center justify-center mb-4 shadow-lg">
            {user?.photoURL ? (
              <Ionicons name="person" size={64} color="white" />
            ) : (
              <Text className="text-5xl font-bold text-white">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </Text>
            )}
          </View>
          <Pressable
            className="flex-row items-center bg-slate-100 px-4 py-2 rounded-full active:bg-slate-200"
            onPress={() => Alert.alert("Thông báo", "Tính năng sắp ra mắt")}
          >
            <Ionicons name="camera" size={18} color="#0a7ea4" />
            <Text className="ml-2 text-[#0a7ea4] font-semibold text-sm">
              Thay đổi ảnh đại diện
            </Text>
          </Pressable>
        </View>

        {/* Info Section */}
        <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-base font-bold text-slate-900 mb-4">
            Thông tin tài khoản
          </Text>

          {/* Display Name */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Tên hiển thị
            </Text>
            {isEditing ? (
              <TextInput
                className="bg-slate-50 rounded-xl px-4 py-3 text-base text-slate-900"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Nhập tên hiển thị"
                placeholderTextColor="#94a3b8"
                autoFocus
              />
            ) : (
              <View className="bg-slate-50 rounded-xl px-4 py-3">
                <Text className="text-base text-slate-900">
                  {user?.displayName || "Chưa cập nhật"}
                </Text>
              </View>
            )}
          </View>

          {/* Email (Read-only) */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Email
            </Text>
            <View className="bg-slate-50 rounded-xl px-4 py-3">
              <Text className="text-base text-slate-900">{user?.email}</Text>
            </View>
            <Text className="text-xs text-slate-500 mt-1.5">
              Email không thể thay đổi
            </Text>
          </View>

          {/* User ID */}
          <View>
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              User ID
            </Text>
            <View className="bg-slate-50 rounded-xl px-4 py-3">
              <Text className="text-xs text-slate-600 font-mono">
                {user?.uid}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Stats */}
        <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-base font-bold text-slate-900 mb-4">
            Thống kê tài khoản
          </Text>
          <View className="flex-row">
            <View className="flex-1 items-center py-3">
              <Text className="text-2xl font-bold text-[#0a7ea4] mb-1">
                {history.length}
              </Text>
              <Text className="text-sm text-slate-600">Phân tích</Text>
            </View>
            <View className="w-px bg-slate-200" />
            <View className="flex-1 items-center py-3">
              <Text className="text-2xl font-bold text-[#0a7ea4] mb-1">
                {getDaysSinceCreation()}
              </Text>
              <Text className="text-sm text-slate-600">Ngày sử dụng</Text>
            </View>
          </View>
          <View className="mt-4 pt-4 border-t border-slate-100">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text className="text-xs text-slate-600 ml-2">
                Tham gia: {formatDate(accountCreatedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing ? (
          <View className="flex-row space-x-3">
            <Pressable
              className="flex-1 bg-slate-200 rounded-xl py-4 active:bg-slate-300"
              onPress={handleCancel}
              disabled={loading}
            >
              <Text className="text-center text-slate-700 font-semibold text-base">
                Hủy
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-[#0a7ea4] rounded-xl py-4 active:bg-[#0a7ea4]/90"
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-white font-semibold text-base">
                  Lưu
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          <Pressable
            className="bg-[#0a7ea4] rounded-xl py-4 active:bg-[#0a7ea4]/90 mb-3"
            onPress={() => setIsEditing(true)}
          >
            <Text className="text-center text-white font-semibold text-base">
              Chỉnh sửa thông tin
            </Text>
          </Pressable>
        )}

        <Pressable
          className="bg-red-50 border border-red-200 rounded-xl py-4 active:bg-red-100"
          onPress={() =>
            Alert.alert(
              "Xóa tài khoản",
              "Tính năng này sẽ được cập nhật trong phiên bản sau"
            )
          }
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text className="ml-2 text-red-600 font-semibold text-base">
              Xóa tài khoản
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
