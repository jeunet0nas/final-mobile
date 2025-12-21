import { useState, useEffect } from "react";
import {
  askQuestion,
  getExpertInfo,
  chat,
  buildChatHistory,
} from "@/api/services/chatbot.service";
import { ChatMessage, RagSource } from "@/types/api.types";
import { handleApiError } from "@/api/client";
import {
  saveChatMessage,
  loadChatHistory,
  updateMessageFeedback,
  ChatHistoryMessage,
} from "@/services/chatHistory.service";
import {
  trackConversationTopic,
  saveMessageFeedback,
  saveSuccessfulContext,
  buildPersonalizationContext,
  extractKeywords,
  detectTopic,
} from "@/services/userPersonalization.service";
import { MessageFeedback } from "@/types/personalization.types";

interface ChatConversation {
  id: string;
  sender: "user" | "bot";
  message: string;
  sources?: RagSource[];
  timestamp: Date;
  imageUrl?: string;
  feedback?: "helpful" | "not_helpful" | "neutral";
  topic?: string;
  keywords?: string[];
}

export const useChatbot = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  /**
   * Load chat history from Firestore on mount
   */
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await loadChatHistory(50);
        const mappedHistory: ChatConversation[] = history.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          message: msg.text,
          sources: msg.sources,
          timestamp: new Date(msg.timestamp),
          imageUrl: msg.imageUrl,
          feedback: msg.feedback,
          topic: msg.topic,
          keywords: msg.keywords,
        }));
        setConversations(mappedHistory);
        setIsHistoryLoaded(true);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        setIsHistoryLoaded(true);
      }
    };

    loadHistory();
  }, []);

  /**
   * Send a message trong conversation mode
   * Supports context (history) và image attachment
   * Automatically learns from conversation và saves to Firestore
   */
  const sendMessage = async (
    message: string,
    imageBase64?: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    // Extract keywords và detect topic for learning
    const keywords = extractKeywords(message);
    const topic = detectTopic(message);

    // Add user message to conversation
    const userMessage: ChatConversation = {
      id: `user-${Date.now()}`,
      sender: "user",
      message,
      timestamp: new Date(),
      imageUrl: imageBase64,
      topic,
      keywords,
    };
    setConversations((prev) => [...prev, userMessage]);

    try {
      // Build history từ conversations hiện tại
      const history = buildChatHistory(
        conversations.map((conv) => ({
          sender: conv.sender,
          message: conv.message,
        }))
      );

      // Build personalization context
      const personalizationContext = await buildPersonalizationContext();

      // Call API (TODO: backend cần nhận personalizationContext)
      const response = await chat(message, history, imageBase64);

      // Add bot response to conversation
      const botMessage: ChatConversation = {
        id: response.chatId,
        sender: "bot",
        message: response.message.text,
        sources: response.sources,
        timestamp: new Date(),
        topic,
      };
      setConversations((prev) => [...prev, botMessage]);

      // Save to Firestore for persistence
      await saveChatMessage({
        sender: "user",
        text: message,
        timestamp: userMessage.timestamp.getTime(),
        imageUrl: imageBase64,
        topic,
        keywords,
      });

      await saveChatMessage({
        sender: "bot",
        text: response.message.text,
        timestamp: botMessage.timestamp.getTime(),
        sources: response.sources,
        topic,
      });

      // Track conversation for learning
      await trackConversationTopic(topic, keywords);
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);

      // Add error message as bot response
      const errorBotMessage: ChatConversation = {
        id: `error-${Date.now()}`,
        sender: "bot",
        message: `❌ Lỗi: ${errorMessage}`,
        timestamp: new Date(),
      };
      setConversations((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Ask a standalone question (RAG mode)
   * Returns answer với sources, không lưu vào conversation
   */
  const askRAGQuestion = async (
    question: string
  ): Promise<{ answer: string; sources: RagSource[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await askQuestion(question);
      return {
        answer: response.answer,
        sources: response.sources,
      };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get expert info về một skin condition
   * Use case: Click vào zone analysis để xem chi tiết
   */
  const getConditionInfo = async (
    condition: string
  ): Promise<{ answer: string; sources: RagSource[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getExpertInfo(condition);
      return {
        answer: response.answer,
        sources: response.sources,
      };
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear conversation history
   */
  const clearConversations = () => {
    setConversations([]);
    setError(null);
  };

  /**
   * Retry last message (nếu có lỗi)
   */
  const retryLastMessage = async () => {
    if (conversations.length < 2) return;

    // Lấy message cuối cùng của user
    const lastUserMessage = [...conversations]
      .reverse()
      .find((conv) => conv.sender === "user");

    if (!lastUserMessage) return;

    // Remove last user and bot messages
    setConversations((prev) => prev.slice(0, -2));

    // Resend
    await sendMessage(lastUserMessage.message, lastUserMessage.imageUrl);
  };

  /**
   * Add feedback to a message
   * Helps the bot learn what responses are helpful
   */
  const addMessageFeedback = async (
    messageId: string,
    feedback: "helpful" | "not_helpful" | "neutral",
    reason?: string
  ): Promise<void> => {
    try {
      // Update local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === messageId ? { ...conv, feedback } : conv
        )
      );

      // Update Firestore
      await updateMessageFeedback(messageId, feedback, reason);

      // Track in personalization service
      const feedbackData: MessageFeedback = {
        messageId,
        rating: feedback,
        reason,
        timestamp: Date.now(),
      };
      await saveMessageFeedback(feedbackData);

      // If helpful, save as successful context
      if (feedback === "helpful") {
        const message = conversations.find((c) => c.id === messageId);
        if (message && message.sender === "bot") {
          const previousUserMessage = conversations
            .slice(0, conversations.indexOf(message))
            .reverse()
            .find((c) => c.sender === "user");

          if (previousUserMessage) {
            await saveSuccessfulContext(
              previousUserMessage.message,
              message.topic || "general",
              message.message
            );
          }
        }
      }
    } catch (error) {
      console.error("Error adding feedback:", error);
    }
  };

  return {
    conversations,
    isLoading,
    error,
    isHistoryLoaded,
    sendMessage,
    askRAGQuestion,
    getConditionInfo,
    clearConversations,
    retryLastMessage,
    addMessageFeedback,
  };
};
