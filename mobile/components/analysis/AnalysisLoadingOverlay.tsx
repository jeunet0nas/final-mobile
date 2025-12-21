import React, { useEffect, useRef } from "react";
import { View, Text, Modal, Animated, Easing } from "react-native";

type LoadingStage = "processing" | "analyzing" | "finalizing";

interface AnalysisLoadingOverlayProps {
  visible: boolean;
  stage: LoadingStage;
  progress?: number;
}

const STAGE_CONFIG = {
  processing: {
    emoji: "📸",
    text: "Đang xử lý ảnh...",
    color: "#3b82f6",
  },
  analyzing: {
    emoji: "🔍",
    text: "Đang phân tích da...",
    color: "#8b5cf6",
  },
  finalizing: {
    emoji: "✨",
    text: "Hoàn tất...",
    color: "#10b981",
  },
};

export default function AnalysisLoadingOverlay({
  visible,
  stage,
  progress,
}: AnalysisLoadingOverlayProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Continuous rotation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Fade out
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      spinValue.setValue(0);
      pulseValue.setValue(1);
    }
  }, [visible, spinValue, pulseValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const config = STAGE_CONFIG[stage];

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={{ opacity: fadeValue }}
        className="flex-1 bg-black/50 items-center justify-center"
      >
        {/* Main Card */}
        <View className="bg-white rounded-3xl p-8 mx-8 items-center shadow-2xl">
          {/* Animated Circle */}
          <Animated.View
            style={{
              transform: [{ rotate: spin }, { scale: pulseValue }],
            }}
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
          >
            <View
              className="w-full h-full rounded-full items-center justify-center"
              style={{ backgroundColor: config.color + "20" }}
            >
              <Text className="text-5xl">{config.emoji}</Text>
            </View>
          </Animated.View>

          {/* Stage Text */}
          <Text
            className="text-xl font-bold mb-2"
            style={{ color: config.color }}
          >
            {config.text}
          </Text>

          {/* Progress Bar */}
          {progress !== undefined && (
            <View className="w-full mt-4">
              <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: config.color,
                  }}
                />
              </View>
              <Text className="text-center text-sm text-gray-600 mt-2">
                {Math.round(progress)}%
              </Text>
            </View>
          )}

          {/* Subtitle */}
          <Text className="text-sm text-gray-500 mt-4 text-center">
            Vui lòng đợi trong giây lát...
          </Text>
        </View>

        {/* Animated Dots */}
        <View className="flex-row mt-6 gap-2">
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={{
                opacity: pulseValue.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    translateY: pulseValue.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              }}
              className="w-3 h-3 rounded-full bg-white"
            />
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}
