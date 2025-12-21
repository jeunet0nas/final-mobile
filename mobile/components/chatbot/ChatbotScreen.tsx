import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { useChatbot } from "@/hooks/useChatbot";
import { RagSource } from "@/types/api.types";

interface ChatBubbleProps {
  message: string;
  sender: "user" | "bot";
  sources?: RagSource[];
  timestamp: Date;
  imageUrl?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  sender,
  sources,
  timestamp,
  imageUrl,
}) => {
  const isUser = sender === "user";

  return (
    <View
      className={`mb-3 ${isUser ? "items-end" : "items-start"}`}
      style={{ maxWidth: "85%" }}
    >
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser ? "bg-blue-500" : "bg-gray-200"
        }`}
      >
        {imageUrl && (
          <View className="mb-2">
            <Text className="text-xs text-gray-500">📷 Ảnh đính kèm</Text>
          </View>
        )}
        <Text className={`${isUser ? "text-white" : "text-gray-900"}`}>
          {message}
        </Text>

        {sources && sources.length > 0 && (
          <View className="mt-3 pt-3 border-t border-gray-300">
            <Text className="text-xs text-gray-600 font-semibold mb-1">
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
      <Text className="text-xs text-gray-500 mt-1">
        {timestamp.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
};

export const ChatbotScreen: React.FC = () => {
  const {
    conversations,
    isLoading,
    error,
    sendMessage,
    clearConversations,
    retryLastMessage,
  } = useChatbot();

  const [inputText, setInputText] = React.useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to bottom when new message
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [conversations]);

  const handleSend = async () => {
    if (inputText.trim() === "" || isLoading) return;

    const message = inputText.trim();
    setInputText("");
    await sendMessage(message);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="bg-blue-500 px-4 py-3 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-lg font-bold">
            DermaScan AI Assistant
          </Text>
          <Text className="text-white text-xs opacity-80">
            {isLoading ? "Đang trả lời..." : "Sẵn sàng trợ giúp"}
          </Text>
        </View>
        {conversations.length > 0 && (
          <TouchableOpacity
            onPress={clearConversations}
            className="bg-white/20 px-3 py-2 rounded-lg"
          >
            <Text className="text-white text-xs">🗑️ Xóa</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {conversations.length === 0 && (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-6xl mb-4">💬</Text>
            <Text className="text-gray-500 text-center text-base">
              Xin chào! Tôi là trợ lý AI của DermaScan.
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              Hỏi tôi về skincare, thành phần, hoặc các vấn đề về da nhé!
            </Text>

            {/* Suggested questions */}
            <View className="mt-6 w-full">
              <Text className="text-gray-600 font-semibold mb-2">
                Gợi ý câu hỏi:
              </Text>
              {[
                "BHA là gì?",
                "Cách trị mụn đầu đen?",
                "Da dầu nên dùng sữa rửa mặt gì?",
              ].map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setInputText(suggestion);
                  }}
                  className="bg-gray-100 px-4 py-3 rounded-lg mb-2"
                >
                  <Text className="text-gray-700">{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {conversations.map((conv) => (
          <ChatBubble
            key={conv.id}
            message={conv.message}
            sender={conv.sender}
            sources={conv.sources}
            timestamp={conv.timestamp}
            imageUrl={conv.imageUrl}
          />
        ))}

        {error && (
          <View className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
            <Text className="text-red-700 text-sm mb-2">{error}</Text>
            <TouchableOpacity
              onPress={retryLastMessage}
              className="bg-red-500 px-3 py-2 rounded-lg self-start"
            >
              <Text className="text-white text-xs">🔄 Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="border-t border-gray-200 px-4 py-3 bg-white">
        <View className="flex-row items-center">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-2"
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || inputText.trim() === ""}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isLoading || inputText.trim() === ""
                ? "bg-gray-300"
                : "bg-blue-500"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-xl">➤</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-gray-400 mt-1 text-center">
          {inputText.length}/500 ký tự
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};
