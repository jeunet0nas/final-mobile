import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Linking,
} from "react-native";
import { useChatbot } from "@/hooks/useChatbot";
import { RagSource } from "@/types/api.types";

interface ExpertInfoModalProps {
  visible: boolean;
  condition: string;
  onClose: () => void;
}

export const ExpertInfoModal: React.FC<ExpertInfoModalProps> = ({
  visible,
  condition,
  onClose,
}) => {
  const { getConditionInfo, isLoading } = useChatbot();
  const [info, setInfo] = useState<{
    answer: string;
    sources: RagSource[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible && condition) {
      fetchInfo();
    }
  }, [visible, condition]);

  const fetchInfo = async () => {
    setError(null);
    const result = await getConditionInfo(condition);
    if (result) {
      setInfo(result);
    } else {
      setError("Không thể tải thông tin");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                Thông tin chuyên sâu
              </Text>
              <Text className="text-sm text-gray-600 mt-1">{condition}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
            >
              <Text className="text-gray-600 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="px-5 py-4">
            {isLoading && (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 mt-3">
                  Đang tải thông tin...
                </Text>
              </View>
            )}

            {error && (
              <View className="bg-red-100 border border-red-300 rounded-lg p-4">
                <Text className="text-red-700">{error}</Text>
                <TouchableOpacity
                  onPress={fetchInfo}
                  className="bg-red-500 px-4 py-2 rounded-lg mt-3 self-start"
                >
                  <Text className="text-white font-semibold">Thử lại</Text>
                </TouchableOpacity>
              </View>
            )}

            {info && (
              <View>
                {/* Answer */}
                <Text className="text-gray-800 text-base leading-6">
                  {info.answer}
                </Text>

                {/* Sources */}
                {info.sources.length > 0 && (
                  <View className="mt-6 bg-blue-50 rounded-lg p-4">
                    <Text className="text-sm font-bold text-blue-900 mb-2">
                      📚 Nguồn tham khảo:
                    </Text>
                    {info.sources.map((source, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => Linking.openURL(source.url)}
                        className="mb-2"
                      >
                        <Text className="text-sm text-blue-600 underline">
                          {idx + 1}. {source.sourceName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface ExpertInfoButtonProps {
  condition: string;
  variant?: "primary" | "secondary";
}

export const ExpertInfoButton: React.FC<ExpertInfoButtonProps> = ({
  condition,
  variant = "secondary",
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const isPrimary = variant === "primary";

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className={`flex-row items-center px-3 py-2 rounded-lg ${
          isPrimary ? "bg-blue-500" : "bg-gray-200"
        }`}
      >
        <Text className="text-lg mr-1">ℹ️</Text>
        <Text
          className={`text-sm font-semibold ${
            isPrimary ? "text-white" : "text-gray-700"
          }`}
        >
          Tìm hiểu thêm
        </Text>
      </TouchableOpacity>

      <ExpertInfoModal
        visible={modalVisible}
        condition={condition}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};
