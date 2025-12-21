import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChat } from "@/contexts/ChatContext";
import { ChatSession } from "@/services/chatHistory.service";

interface ConversationSidebarProps {
  visible?: boolean; // For backward compatibility
  isOpen?: boolean; // New prop name
  onClose: () => void;
}

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <View className="mb-2">
      <TouchableOpacity
        onPress={onSelect}
        onLongPress={() => setShowActions(!showActions)}
        className={`p-4 rounded-xl ${
          isActive ? "bg-blue-50 border-2 border-blue-500" : "bg-gray-50"
        }`}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text
              className={`font-semibold ${
                isActive ? "text-blue-600" : "text-gray-900"
              }`}
              numberOfLines={1}
            >
              {session.title}
            </Text>
            {session.lastMessage && (
              <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
                {session.lastMessage}
              </Text>
            )}
            <Text className="text-xs text-gray-400 mt-1">
              {formatDate(session.updatedAt)} • {session.messageCount} tin nhắn
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowActions(!showActions)}
            className="p-1"
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {showActions && (
        <View className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <TouchableOpacity
            onPress={() => {
              setShowActions(false);
              onRename();
            }}
            className="flex-row items-center p-3 border-b border-gray-100"
          >
            <Ionicons name="pencil-outline" size={18} color="#3b82f6" />
            <Text className="ml-3 text-blue-600">Đổi tên</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowActions(false);
              onDelete();
            }}
            className="flex-row items-center p-3"
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text className="ml-3 text-red-600">Xóa</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  visible,
  isOpen,
  onClose,
}) => {
  const isVisible = isOpen ?? visible ?? false; // Support both prop names
  
  const {
    sessions,
    currentSessionId,
    switchSession,
    createNewSession,
    deleteSession,
    renameSession,
    isLoadingSessions,
  } = useChat();

  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(
    null
  );
  const [newTitle, setNewTitle] = useState("");

  const handleDelete = (sessionId: string, sessionTitle: string) => {
    Alert.alert(
      "Xóa cuộc trò chuyện",
      `Bạn có chắc muốn xóa "${sessionTitle}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => deleteSession(sessionId),
        },
      ]
    );
  };

  const handleRename = async () => {
    if (renamingSessionId && newTitle.trim()) {
      await renameSession(renamingSessionId, newTitle.trim());
      setRenamingSessionId(null);
      setNewTitle("");
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-white mt-20 rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              Cuộc trò chuyện
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* New Conversation Button */}
          <View className="p-4 border-b border-gray-100">
            <TouchableOpacity
              onPress={async () => {
                await createNewSession();
                onClose();
              }}
              className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center"
            >
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text className="text-white font-semibold ml-2">
                Tạo cuộc trò chuyện mới
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sessions List */}
          <ScrollView className="flex-1 p-4">
            {isLoadingSessions ? (
              <Text className="text-center text-gray-500 py-8">
                Đang tải...
              </Text>
            ) : sessions.length === 0 ? (
              <View className="py-12 items-center">
                <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
                <Text className="text-gray-500 mt-4 text-center">
                  Chưa có cuộc trò chuyện nào
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-2">
                  Tạo cuộc trò chuyện mới để bắt đầu
                </Text>
              </View>
            ) : (
              sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={session.id === currentSessionId}
                  onSelect={() => {
                    switchSession(session.id);
                    onClose();
                  }}
                  onDelete={() => handleDelete(session.id, session.title)}
                  onRename={() => {
                    setRenamingSessionId(session.id);
                    setNewTitle(session.title);
                  }}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>

      {/* Rename Modal */}
      <Modal
        visible={renamingSessionId !== null}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Đổi tên cuộc trò chuyện
            </Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Nhập tên mới..."
              className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setRenamingSessionId(null);
                  setNewTitle("");
                }}
                className="flex-1 bg-gray-200 rounded-xl p-3"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRename}
                className="flex-1 bg-blue-500 rounded-xl p-3"
              >
                <Text className="text-center text-white font-semibold">
                  Lưu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};
