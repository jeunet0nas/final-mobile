import React, { useCallback, useState, useRef, useEffect } from "react";
import { FlatList, Text, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ChatComposer from "@/components/chatbot/ChatComposer";
import MessageBubble, { ChatSender } from "@/components/chatbot/MessageBubble";
import { ConversationSidebar } from "@/components/chatbot/ConversationSidebar";
import { handleApiError } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChatContext, ChatMessage } from "@/contexts/ChatContext";
import { updateMessageFeedback } from "@/services/chatHistory.service";

const TypingIndicator = () => (
  <View className="flex-row items-center px-5 py-2">
    <View className="w-2 h-2 rounded-full bg-slate-400 mr-1 animate-pulse" />
    <View
      className="w-2 h-2 rounded-full bg-slate-400 opacity-65 mx-1 animate-pulse"
      style={{ animationDelay: "0.2s" }}
    />
    <View
      className="w-2 h-2 rounded-full bg-slate-400 mr-1 animate-pulse"
      style={{ animationDelay: "0.4s" }}
    />
    <Text className="text-sm text-slate-600 ml-2">
      Trợ lý đang soạn phản hồi...
    </Text>
  </View>
);

const SuggestedQuestions = ({ onPress }: { onPress: (q: string) => void }) => {
  const questions = [
    "Da tôi bị mụn nên làm gì?",
    "Kem chống nắng nào tốt cho da dầu?",
    "Cách chăm sóc da nhạy cảm?",
    "Serum Vitamin C có tác dụng gì?",
  ];

  return (
    <View className="px-4 py-3 mb-2">
      <Text className="text-sm font-semibold text-slate-700 mb-2">
        💡 Gợi ý câu hỏi:
      </Text>
      <View className="flex-row flex-wrap">
        {questions.map((q, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => onPress(q)}
            className="bg-white border border-slate-200 rounded-full px-3 py-2 mr-2 mb-2"
          >
            <Text className="text-xs text-slate-700">{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const ChatbotScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    messages,
    isTyping,
    sendMessage,
    currentSession,
    settings,
    setSettings,
  } = useChatContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load chat history when user logs in
  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        setIsLoadingHistory(true);
        try {
          // ChatContext already handles loading sessions
          setIsLoadingHistory(false);
        } catch (error) {
          console.error("Failed to load chat history:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();
  }, [user]);

  // Auto scroll to bottom when new message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = useCallback(
    async (userText: string) => {
      if (isTyping) return;

      setError(null);

      try {
        await sendMessage(userText);
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
      }
    },
    [isTyping, sendMessage]
  );

  const handleClearChat = useCallback(() => {
    Alert.alert(
      "Xóa cuộc trò chuyện",
      user
        ? "Bạn có chắc muốn xóa cuộc trò chuyện này? Dữ liệu sẽ bị xóa vĩnh viễn khỏi tài khoản của bạn."
        : "Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện trong phiên này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            // ChatContext handles deletion
            if (user && currentSession) {
              // Just close sidebar after deletion
              setIsSidebarOpen(false);
            }
          },
        },
      ]
    );
  }, [user, currentSession]);

  const handleRetry = useCallback(() => {
    // Lấy message cuối cùng của user
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.sender === "user");

    if (lastUserMessage) {
      // Resend
      handleSend(lastUserMessage.message);
    }
  }, [messages, handleSend]);

  const handleFeedback = useCallback(
    async (messageId: string, feedback: "helpful" | "not_helpful") => {
      try {
        await updateMessageFeedback(messageId, feedback);
        // Feedback saved to Firebase - ChatContext will reload messages
      } catch (error) {
        console.error("Failed to save feedback:", error);
      }
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <View>
        <MessageBubble
          sender={item.sender}
          text={item.message}
          timestamp={new Date(item.timestamp).getTime()}
          sources={item.sources}
        />

        {/* Feedback buttons for bot messages */}
        {item.sender === "bot" && !item.message.includes("❌") && (
          <View className="flex-row items-center justify-start px-4 mb-4">
            <Text className="text-xs text-gray-600 mr-2">Tin nhắn này:</Text>
            <TouchableOpacity
              onPress={() => handleFeedback(item.id, "helpful")}
              className="px-3 py-1 rounded-full mr-2 bg-gray-200"
            >
              <Text className="text-xs font-medium text-gray-700">
                👍 Hữu ích
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleFeedback(item.id, "not_helpful")}
              className="px-3 py-1 rounded-full bg-gray-200"
            >
              <Text className="text-xs font-medium text-gray-700">
                👎 Không hữu ích
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [handleFeedback]
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-cyan-600 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setIsSidebarOpen(true)}
            className="w-10 h-10 items-center justify-center bg-white/20 rounded-full mr-3"
          >
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-lg font-bold text-white">
              {currentSession?.title || "Trợ lý AI"}
            </Text>
            <Text className="text-xs text-white/80">
              {isLoadingHistory
                ? "Đang tải lịch sử..."
                : isTyping
                  ? "Đang trả lời..."
                  : user
                    ? "Lịch sử đã được lưu"
                    : "Chế độ khách"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setSettings({ ...settings, includeSkinAnalysis: !settings.includeSkinAnalysis })}
            className={`px-3 py-1.5 rounded-full ${
              settings.includeSkinAnalysis ? "bg-white" : "bg-white/20"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                settings.includeSkinAnalysis ? "text-cyan-600" : "text-white"
              }`}
            >
              {settings.includeSkinAnalysis ? "🩺 Đã bật" : "🩺 Tắt"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversation Sidebar */}
      <ConversationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Suggested Questions (show when chat is empty) */}
      {messages.length <= 1 && !isTyping && <SuggestedQuestions onPress={handleSend} />}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      />

      {isTyping && <TypingIndicator />}

      {error && (
        <View className="bg-red-100 border-t border-red-300 px-4 py-3">
          <Text className="text-red-700 text-sm mb-2">{error}</Text>
          <TouchableOpacity
            onPress={handleRetry}
            className="bg-red-500 px-3 py-2 rounded-lg self-start"
          >
            <Text className="text-white text-xs font-semibold">🔄 Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <ChatComposer onSend={handleSend} disabled={isTyping} />
    </SafeAreaView>
  );
};

export default ChatbotScreen;
