import React from "react";
import { Text, View, TouchableOpacity, Linking } from "react-native";

export type ChatSender = "user" | "bot";

export interface MessageBubbleProps {
  sender: ChatSender;
  text: string;
  timestamp?: number;
  sources?: Array<{ sourceName: string; url: string }>;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  text,
  timestamp,
  sources,
}) => {
  const isUser = sender === "user";

  const formatTime = (ts?: number) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      className={`w-full px-4 mb-3 ${isUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
          isUser ? "bg-[#0a7ea4] rounded-br-sm" : "bg-gray-100 rounded-bl-sm"
        }`}
      >
        <Text
          className={`text-[15px] leading-5 ${isUser ? "text-white" : "text-gray-900"}`}
        >
          {text}
        </Text>

        {/* Sources */}
        {!isUser && sources && sources.length > 0 && (
          <View className="mt-3 pt-3 border-t border-gray-300">
            <Text className="text-xs font-semibold text-gray-700 mb-1">
              📚 Nguồn tham khảo:
            </Text>
            {sources.map((source, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => Linking.openURL(source.url)}
                className="mb-1"
              >
                <Text className="text-xs text-blue-600 underline">
                  {idx + 1}. {source.sourceName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Timestamp */}
      {timestamp && (
        <Text className="text-xs text-gray-500 mt-1 px-1">
          {formatTime(timestamp)}
        </Text>
      )}
    </View>
  );
};

export default MessageBubble;
