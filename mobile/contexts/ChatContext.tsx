import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useAnalysisContext } from "./AnalysisContext";
import { handleApiError } from "@/api/client";
import { chat } from "@/api/services/chatbot.service";
import { getAnalysisHistory } from "@/api/services/analysis.service";
import { RagSource } from "@/types/api.types";
import type { SavedAnalysis } from "@/types/api.types";
import {
  saveChatMessage,
  loadChatSessions,
  loadSessionMessages,
  createChatSession,
  deleteChatSession,
  updateSessionTitle,
  ChatSession,
  ChatHistoryMessage,
} from "@/services/chatHistory.service";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  message: string;
  sources?: RagSource[];
  timestamp: Date;
  imageUrl?: string;
}

export interface ChatSettings {
  includeSkinAnalysis: boolean;
}

interface ChatContextType {
  // Current session
  currentSessionId: string | null;
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  
  // All sessions
  sessions: ChatSession[];
  
  // Loading states
  isLoading: boolean;
  isTyping: boolean; // Alias for isLoading
  isLoadingSessions: boolean;
  error: string | null;
  
  // Settings
  settings: ChatSettings;
  setSettings: (settings: ChatSettings) => void;
  
  // Actions
  sendMessage: (message: string, imageBase64?: string) => Promise<void>;
  createNewSession: () => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, newTitle: string) => Promise<void>;
  clearError: () => void;
  
  // Legacy - kept for backward compatibility
  includeSkinAnalysisContext: boolean;
  setIncludeSkinAnalysisContext: (include: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { analysisResult } = useAnalysisContext();
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<SavedAnalysis | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<ChatSettings>({
    includeSkinAnalysis: true,
  });
  
  // Legacy state - sync with settings
  const includeSkinAnalysisContext = settings.includeSkinAnalysis;
  const setIncludeSkinAnalysisContext = (include: boolean) => {
    setSettings({ ...settings, includeSkinAnalysis: include });
  };

  // Computed values
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  /**
   * Load all chat sessions when user logs in
   */
  useEffect(() => {
    if (user) {
      loadSessions();
      loadLatestAnalysis();
    } else {
      // Guest mode - create temporary in-memory session
      setSessions([]);
      setCurrentSessionId('guest-session');
      setMessages([]);
      setLatestAnalysis(null);
    }
  }, [user?.uid]);

  const loadSessions = async () => {
    if (!user) return;
    
    setIsLoadingSessions(true);
    try {
      const loadedSessions = await loadChatSessions();
      setSessions(loadedSessions);
      
      // Auto-select most recent session or create new one
      if (loadedSessions.length > 0 && !currentSessionId) {
        await switchSession(loadedSessions[0].id);
      } else if (loadedSessions.length === 0) {
        await createNewSession();
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  /**
   * Load latest skin analysis from Firebase
   */
  const loadLatestAnalysis = async () => {
    if (!user) return;

    try {
      const history = await getAnalysisHistory(1); // Get only the latest one
      if (history.analyses && history.analyses.length > 0) {
        setLatestAnalysis(history.analyses[0]);
        console.log("[ChatContext] Loaded latest analysis:", history.analyses[0].id);
      }
    } catch (err) {
      console.error("Failed to load latest analysis:", err);
      // Don't set error - this is optional functionality
    }
  };

  const loadMessagesForSession = async (sessionId: string) => {
    try {
      const historyMessages = await loadSessionMessages(sessionId);
      const chatMessages: ChatMessage[] = historyMessages.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        message: msg.text,
        sources: msg.sources,
        timestamp: new Date(msg.timestamp),
        imageUrl: msg.imageUrl,
      }));
      setMessages(chatMessages);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    }
  };

  const createNewSession = async () => {
    if (!user) {
      // Guest mode - clear messages for new conversation
      setMessages([]);
      return;
    }

    try {
      const newSessionId = await createChatSession("Cuộc trò chuyện mới");
      
      // Update sessions list
      await loadSessions();
      
      // Switch to new session
      setCurrentSessionId(newSessionId);
      setMessages([]);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const switchSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    await loadMessagesForSession(sessionId);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      
      // Remove from local state
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      
      // If deleting current session, switch to another or create new
      if (sessionId === currentSessionId) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          await switchSession(remainingSessions[0].id);
        } else {
          await createNewSession();
        }
      }
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const renameSession = async (sessionId: string, newTitle: string) => {
    try {
      await updateSessionTitle(sessionId, newTitle);
      
      // Update local state
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
      );
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const buildSkinAnalysisContext = (): string | undefined => {
    if (!includeSkinAnalysisContext) return undefined;

    // Prioritize: latest analysis from Firebase > current analysis from context
    // Extract result data properly from SavedAnalysis or AnalysisResult
    let analysisData;
    
    if (latestAnalysis) {
      analysisData = latestAnalysis.result; // SavedAnalysis has .result property
    } else if (analysisResult) {
      analysisData = analysisResult; // AnalysisResult is direct
    }
    
    if (!analysisData) {
      console.log("[ChatContext] No analysis data available for chatbot");
      return undefined;
    }

    const { skinType, zones, overallSummary } = analysisData;
    
    const zonesText = zones
      ?.map((z: any) => `- ${z.zone}: ${z.condition} (${z.riskLevel} risk)`)
      .join("\n") || "Không có dữ liệu vùng da";

    const analysisDate = latestAnalysis 
      ? new Date(latestAnalysis.savedAt || latestAnalysis.createdAt).toLocaleDateString('vi-VN')
      : "hôm nay";

    return `[Thông tin phân tích da của người dùng - Phân tích ngày ${analysisDate}]
Loại da: ${skinType || "Chưa xác định"}
Các vùng đã phân tích:
${zonesText}
Tổng quan: ${overallSummary || "Không có tổng quan"}

Hãy sử dụng thông tin này để đưa ra tư vấn phù hợp với tình trạng da của người dùng.`;
  };

  const sendMessage = async (
    message: string,
    imageBase64?: string
  ): Promise<void> => {
    if (!currentSessionId) {
      setError("Không có phiên trò chuyện nào được chọn");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      message,
      timestamp: new Date(),
      imageUrl: imageBase64,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Build chat history
      const history = messages.slice(-10).map((msg) => ({
        role: msg.sender === "user" ? ("user" as const) : ("model" as const),
        text: msg.message,
      }));

      // Add skin analysis context if enabled
      const skinContext = buildSkinAnalysisContext();
      let enhancedMessage = message;
      if (skinContext && history.length === 0) {
        // Only add context on first message
        enhancedMessage = `${skinContext}\n\nCâu hỏi: ${message}`;
      }

      // Call chatbot API
      const response = await chat(enhancedMessage, history, imageBase64);

      // Add bot response
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        message: response.response.text,
        sources: response.response.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      // Save messages to Firestore only if user is logged in
      if (user && currentSessionId !== 'guest-session') {
        await saveChatMessage(
          {
            sender: "user",
            text: message,
            timestamp: userMessage.timestamp.getTime(),
            imageUrl: imageBase64,
          },
          currentSessionId
        );

        await saveChatMessage(
          {
            sender: "bot",
            text: response.response.text,
            timestamp: botMessage.timestamp.getTime(),
            sources: response.response.sources,
          },
          currentSessionId
        );

        // Update session's last message
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, lastMessage: message, updatedAt: Date.now() }
              : s
          )
        );
      }
    } catch (err) {
      setError(handleApiError(err));
      
      // Remove user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <ChatContext.Provider
      value={{
        currentSessionId,
        currentSession,
        messages,
        sessions,
        isLoading,
        isTyping: isLoading, // Alias
        isLoadingSessions,
        error,
        settings,
        setSettings,
        sendMessage,
        createNewSession,
        switchSession,
        deleteSession,
        renameSession,
        clearError,
        includeSkinAnalysisContext,
        setIncludeSkinAnalysisContext,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

// Alias for consistency
export const useChatContext = useChat;
