import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ExpertInfo } from "@/types/api.types";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExpertInfoSectionProps {
  expertInfo?: ExpertInfo;
}

export default function ExpertInfoSection({
  expertInfo,
}: ExpertInfoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!expertInfo) {
    return null;
  }

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const openSource = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <View className="bg-white rounded-3xl border border-slate-200 p-5 mb-4">
      {/* Header */}
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.7}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 items-center justify-center">
            <Ionicons name="school" size={20} color="#0a7ea4" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-slate-900">
              Lời khuyên chuyên gia
            </Text>
            <Text className="text-xs text-slate-600">
              Từ nguồn y khoa uy tín
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={22}
          color="#64748b"
        />
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View className="mt-4">
          {/* Answer */}
          <View className="bg-primary/5 p-4 mb-4 border border-primary/15 rounded-2xl">
            <Text className="text-sm text-slate-700 leading-6">
              {expertInfo.answer}
            </Text>
          </View>

          {/* Sources */}
          {expertInfo.sources && expertInfo.sources.length > 0 && (
            <View>
              <Text className="text-xs font-semibold text-slate-900 mb-3">
                NGUỒN THAM KHẢO:
              </Text>
              <View className="gap-2">
                {expertInfo.sources.map((source, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openSource(source.url)}
                    activeOpacity={0.7}
                    className="flex-row items-start p-4 bg-white border border-slate-200 rounded-2xl"
                  >
                    <Ionicons name="book-outline" size={18} color="#0a7ea4" />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm font-semibold text-slate-900 mb-1">
                        {source.sourceName}
                      </Text>
                      <Text
                        className="text-xs text-slate-500"
                        numberOfLines={1}
                      >
                        {source.url}
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#64748b" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
