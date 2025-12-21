import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { SavedAnalysis } from "@/types/api.types";

interface HistoryItemProps {
  item: SavedAnalysis;
  onDelete?: (id: string) => void;
}

export default function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="bg-white mb-3 rounded-3xl border border-slate-200"
      onPress={() => router.push(`/analysis/${item.id}` as any)}
    >
      <View className="p-4 flex-row items-center justify-between">
        {/* Left: Date & Confidence */}
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-slate-900 mb-1">
            {formatDate(item.savedAt)} • {formatTime(item.savedAt)}
          </Text>
          <View className="flex-row items-center">
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="#0a7ea4"
            />
            <Text className="text-sm text-slate-600 ml-1">
              {item.result.confidenceScore}% độ tin cậy
            </Text>
          </View>
        </View>

        {onDelete && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="w-10 h-10 items-center justify-center rounded-full bg-white border border-slate-200"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#0a7ea4" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
