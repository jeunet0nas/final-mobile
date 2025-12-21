import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  variant?: "solid" | "minimal";
}

export default function ScreenHeader({
  title,
  showBackButton = false,
  variant = "solid",
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isMinimal = variant === "minimal";

  return (
    <View
      className={
        isMinimal ? "bg-white border-b border-slate-200" : "bg-[#0a7ea4]"
      }
      style={{ paddingTop: insets.top + 12 }} // Dynamic padding for notch
    >
      <StatusBar
        style={isMinimal ? "dark" : "light"}
        backgroundColor={isMinimal ? "#ffffff" : "#0a7ea4"}
      />
      <View className="px-5 pb-4">
        <View className="flex-row items-center">
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 w-8 h-8 items-center justify-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={isMinimal ? "#0a7ea4" : "white"}
              />
            </TouchableOpacity>
          )}
          <Text
            className={
              isMinimal
                ? "text-xl font-bold text-slate-900 flex-1"
                : "text-2xl font-bold text-white flex-1"
            }
          >
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
}
