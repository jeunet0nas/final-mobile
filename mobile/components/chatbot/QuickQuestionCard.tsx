import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
} from "react-native";
import { useChatbot } from "@/hooks/useChatbot";
import { RagSource } from "@/types/api.types";

interface QuickQuestionCardProps {
  onAnswerReceived?: (answer: string, sources: RagSource[]) => void;
}

/**
 * Quick Question Card - Hỏi câu hỏi đơn giản không cần conversation
 * Use case: Trang home, FAQ, hoặc quick help
 */
export const QuickQuestionCard: React.FC<QuickQuestionCardProps> = ({
  onAnswerReceived,
}) => {
  const { askRAGQuestion, isLoading, error } = useChatbot();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{
    text: string;
    sources: RagSource[];
  } | null>(null);

  const handleAsk = async () => {
    if (question.trim() === "" || isLoading) return;

    const result = await askRAGQuestion(question);
    if (result) {
      setAnswer({
        text: result.answer,
        sources: result.sources,
      });
      onAnswerReceived?.(result.answer, result.sources);
    }
  };

  const handleClear = () => {
    setQuestion("");
    setAnswer(null);
  };

  return (
    <View className="bg-white rounded-2xl shadow-md p-4">
      {/* Title */}
      <View className="flex-row items-center mb-3">
        <Text className="text-xl mr-2">💬</Text>
        <Text className="text-lg font-bold text-gray-900">Hỏi AI Assistant</Text>
      </View>

      {/* Input */}
      <View className="mb-3">
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ví dụ: BHA là gì và cách sử dụng?"
          className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <Text className="text-xs text-gray-400 mt-1 text-right">
          {question.length}/500
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={handleAsk}
          disabled={isLoading || question.trim() === ""}
          className={`flex-1 py-3 rounded-xl items-center ${
            isLoading || question.trim() === ""
              ? "bg-gray-300"
              : "bg-blue-500"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Hỏi ngay</Text>
          )}
        </TouchableOpacity>

        {(answer || error) && (
          <TouchableOpacity
            onPress={handleClear}
            className="px-4 py-3 bg-gray-200 rounded-xl"
          >
            <Text className="text-gray-700 font-semibold">Xóa</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {error && (
        <View className="mt-3 bg-red-100 border border-red-300 rounded-xl p-3">
          <Text className="text-red-700 text-sm">{error}</Text>
        </View>
      )}

      {/* Answer */}
      {answer && (
        <View className="mt-4 bg-blue-50 rounded-xl p-4">
          <Text className="text-sm font-semibold text-blue-900 mb-2">
            📝 Câu trả lời:
          </Text>
          <ScrollView className="max-h-60">
            <Text className="text-gray-800 text-base leading-6">
              {answer.text}
            </Text>

            {/* Sources */}
            {answer.sources.length > 0 && (
              <View className="mt-4 pt-4 border-t border-blue-200">
                <Text className="text-xs font-bold text-blue-900 mb-2">
                  📚 Nguồn tham khảo:
                </Text>
                {answer.sources.map((source, idx) => (
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
          </ScrollView>
        </View>
      )}
    </View>
  );
};

/**
 * Suggested Questions List - Pre-defined questions for quick access
 */
interface SuggestedQuestionsProps {
  onQuestionSelect: (question: string) => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onQuestionSelect,
}) => {
  const questions = [
    {
      emoji: "🧴",
      text: "BHA là gì?",
      category: "Thành phần",
    },
    {
      emoji: "💧",
      text: "Cách trị da khô?",
      category: "Điều trị",
    },
    {
      emoji: "🌞",
      text: "Kem chống nắng quan trọng như thế nào?",
      category: "Bảo vệ",
    },
    {
      emoji: "🔴",
      text: "Cách xử lý mụn đầu đen?",
      category: "Điều trị",
    },
  ];

  return (
    <View>
      <Text className="text-base font-bold text-gray-900 mb-3">
        Câu hỏi phổ biến:
      </Text>
      <View className="space-y-2">
        {questions.map((q, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => onQuestionSelect(q.text)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex-row items-center"
          >
            <Text className="text-2xl mr-3">{q.emoji}</Text>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">{q.text}</Text>
              <Text className="text-xs text-gray-500 mt-1">{q.category}</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
