import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  disabled = false,
}) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSend(trimmed);
    setValue("");
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 16, android: 0 })}
    >
      <View className="flex-row items-end px-4 py-3 border-t border-gray-200 bg-white">
        <TextInput
          className="flex-1 min-h-[44px] max-h-[120px] px-3 py-2.5 rounded-2xl border border-gray-200 mr-3 text-[15px] bg-gray-50 text-gray-900"
          placeholder="Viết tin nhắn cho trợ lý da liễu..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={value}
          onChangeText={setValue}
          editable={!disabled}
          maxLength={500}
        />
        <Pressable
          accessibilityLabel="Gửi tin nhắn"
          accessibilityHint="Nhập nội dung câu hỏi"
          className={`flex-row items-center justify-center px-4 py-2.5 rounded-xl ${
            disabled ? "bg-slate-400" : "bg-[#0a7ea4] active:opacity-80"
          }`}
          onPress={handleSend}
          disabled={disabled}
        >
          <Ionicons name="send" size={20} color="#fff" />
          <Text className="text-white font-semibold ml-1.5">Gửi</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatComposer;
