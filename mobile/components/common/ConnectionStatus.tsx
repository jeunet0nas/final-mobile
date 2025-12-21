import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { checkHealth } from "@/api/services/analysis.service";

export const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );
  const [error, setError] = useState<string>("");

  const checkConnection = async () => {
    setStatus("checking");
    setError("");

    try {
      await checkHealth();
      setStatus("connected");
    } catch (err: any) {
      setStatus("error");
      setError(
        err?.error?.message || "Không thể kết nối với server"
      );
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (status === "checking") {
    return (
      <View className="flex-row items-center bg-yellow-100 px-4 py-2">
        <ActivityIndicator size="small" color="#F59E0B" />
        <Text className="text-yellow-800 text-sm ml-2">
          Đang kiểm tra kết nối...
        </Text>
      </View>
    );
  }

  if (status === "connected") {
    return (
      <View className="flex-row items-center bg-green-100 px-4 py-2">
        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
        <Text className="text-green-800 text-sm">Đã kết nối với server</Text>
      </View>
    );
  }

  return (
    <View className="bg-red-100 px-4 py-3">
      <View className="flex-row items-center mb-2">
        <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
        <Text className="text-red-800 text-sm font-semibold flex-1">
          Lỗi kết nối
        </Text>
      </View>
      <Text className="text-red-700 text-xs mb-2">{error}</Text>
      <TouchableOpacity
        onPress={checkConnection}
        className="bg-red-500 px-3 py-2 rounded-lg self-start"
      >
        <Text className="text-white text-xs font-semibold">🔄 Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
};
