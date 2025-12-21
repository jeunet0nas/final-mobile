import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/config/firebase.config";

export interface ChatHistoryMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: number;
  sources?: Array<{ sourceName: string; url: string }>;
  imageUrl?: string;
  feedback?: "helpful" | "not_helpful" | "neutral";
  feedbackReason?: string;
  topic?: string;
  keywords?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

/**
 * Create a new chat session
 */
export const createChatSession = async (title: string = "Cuộc trò chuyện mới"): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in to create chat session");
  }

  try {
    const sessionsRef = collection(db, "users", user.uid, "chatSessions");
    const now = Timestamp.now();

    const docRef = await addDoc(sessionsRef, {
      title,
      lastMessage: "",
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw new Error("Không thể tạo cuộc trò chuyện mới.");
  }
};

/**
 * Load all chat sessions for current user
 */
export const loadChatSessions = async (): Promise<ChatSession[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const sessionsRef = collection(db, "users", user.uid, "chatSessions");
    const q = query(sessionsRef, orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);

    const sessions: ChatSession[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        title: data.title,
        lastMessage: data.lastMessage || "",
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
        messageCount: data.messageCount || 0,
      });
    });

    return sessions;
  } catch (error) {
    console.error("Error loading chat sessions:", error);
    return [];
  }
};

/**
 * Load messages for a specific session
 */
export const loadSessionMessages = async (sessionId: string): Promise<ChatHistoryMessage[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const messagesRef = collection(
      db,
      "users",
      user.uid,
      "chatSessions",
      sessionId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const snapshot = await getDocs(q);

    const messages: ChatHistoryMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        sender: data.sender,
        text: data.text,
        timestamp: data.timestamp.toMillis(),
        sources: data.sources,
        imageUrl: data.imageUrl,
        feedback: data.feedback,
        feedbackReason: data.feedbackReason,
        topic: data.topic,
        keywords: data.keywords,
      });
    });

    return messages;
  } catch (error) {
    console.error("Error loading session messages:", error);
    return [];
  }
};

/**
 * Delete a chat session and all its messages
 */
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in");
  }

  try {
    // Delete all messages in session
    const messagesRef = collection(
      db,
      "users",
      user.uid,
      "chatSessions",
      sessionId,
      "messages"
    );
    const snapshot = await getDocs(messagesRef);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete session itself
    await deleteDoc(doc(db, "users", user.uid, "chatSessions", sessionId));
  } catch (error) {
    console.error("Error deleting chat session:", error);
    throw new Error("Không thể xóa cuộc trò chuyện.");
  }
};

/**
 * Update session title
 */
export const updateSessionTitle = async (
  sessionId: string,
  newTitle: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in");
  }

  try {
    const sessionRef = doc(db, "users", user.uid, "chatSessions", sessionId);
    await updateDoc(sessionRef, {
      title: newTitle,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating session title:", error);
    throw new Error("Không thể đổi tên cuộc trò chuyện.");
  }
};

/**
 * Save chat message to Firestore
 * Structure: users/{uid}/chatSessions/{sessionId}/messages/{messageId}
 */
export const saveChatMessage = async (
  message: Omit<ChatHistoryMessage, "id">,
  sessionId: string
): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in to save chat history");
  }

  try {
    const messagesRef = collection(
      db,
      "users",
      user.uid,
      "chatSessions",
      sessionId,
      "messages"
    );

    // Build document object, excluding undefined fields
    const docData: any = {
      sender: message.sender,
      text: message.text,
      timestamp: Timestamp.fromMillis(message.timestamp),
      createdAt: Timestamp.now(),
      feedback: message.feedback || null,
      feedbackReason: message.feedbackReason || null,
      topic: message.topic || null,
      keywords: message.keywords || [],
      imageUrl: message.imageUrl || null,
    };

    // Only add sources if it's defined
    if (message.sources !== undefined) {
      docData.sources = message.sources;
    }

    const docRef = await addDoc(messagesRef, docData);

    // Update session metadata
    const sessionRef = doc(db, "users", user.uid, "chatSessions", sessionId);
    await updateDoc(sessionRef, {
      lastMessage: message.text.substring(0, 100),
      updatedAt: Timestamp.now(),
      messageCount: await getSessionMessageCount(sessionId),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw new Error("Không thể lưu tin nhắn. Vui lòng thử lại.");
  }
};

/**
 * Get message count for a session
 */
const getSessionMessageCount = async (sessionId: string): Promise<number> => {
  const user = auth.currentUser;
  if (!user) return 0;

  try {
    const messagesRef = collection(
      db,
      "users",
      user.uid,
      "chatSessions",
      sessionId,
      "messages"
    );
    const snapshot = await getDocs(messagesRef);
    return snapshot.size;
  } catch (error) {
    return 0;
  }
};

/**
 * Load chat history from Firestore
 * Returns recent messages, newest first
 */
export const loadChatHistory = async (
  maxMessages: number = 50
): Promise<ChatHistoryMessage[]> => {
  const user = auth.currentUser;
  if (!user) {
    // Return empty if not logged in (guest mode)
    return [];
  }

  try {
    const chatHistoryRef = collection(db, "users", user.uid, "chatHistory");
    const q = query(
      chatHistoryRef,
      orderBy("timestamp", "desc"),
      limit(maxMessages)
    );

    const snapshot = await getDocs(q);
    const messages: ChatHistoryMessage[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        sender: data.sender,
        text: data.text,
        timestamp: data.timestamp.toMillis(),
        sources: data.sources,
        imageUrl: data.imageUrl,
        feedback: data.feedback,
        feedbackReason: data.feedbackReason,
        topic: data.topic,
        keywords: data.keywords,
      });
    });

    // Reverse to get chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
};

/**
 * Clear all chat history for current user
 */
export const clearChatHistory = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in to clear chat history");
  }

  try {
    const chatHistoryRef = collection(db, "users", user.uid, "chatHistory");
    const snapshot = await getDocs(chatHistoryRef);

    const deletePromises = snapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, "users", user.uid, "chatHistory", docSnapshot.id))
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw new Error("Không thể xóa lịch sử. Vui lòng thử lại.");
  }
};

/**
 * Get chat statistics
 */
export const getChatStatistics = async (): Promise<{
  totalMessages: number;
  userMessages: number;
  botMessages: number;
}> => {
  const user = auth.currentUser;
  if (!user) {
    return { totalMessages: 0, userMessages: 0, botMessages: 0 };
  }

  try {
    const chatHistoryRef = collection(db, "users", user.uid, "chatHistory");
    const snapshot = await getDocs(chatHistoryRef);

    let userMessages = 0;
    let botMessages = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.sender === "user") {
        userMessages++;
      } else {
        botMessages++;
      }
    });

    return {
      totalMessages: snapshot.size,
      userMessages,
      botMessages,
    };
  } catch (error) {
    console.error("Error getting chat statistics:", error);
    return { totalMessages: 0, userMessages: 0, botMessages: 0 };
  }
};

/**
 * Update message feedback
 */
export const updateMessageFeedback = async (
  messageId: string,
  feedback: "helpful" | "not_helpful" | "neutral",
  reason?: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in");
  }

  try {
    const messageRef = doc(db, "users", user.uid, "chatHistory", messageId);
    await updateDoc(messageRef, {
      feedback,
      feedbackReason: reason || null,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating message feedback:", error);
    throw new Error("Không thể cập nhật feedback");
  }
};
