import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs: FAQItem[] = [
    {
      question: "Ứng dụng phân tích da như thế nào?",
      answer:
        "Ứng dụng sử dụng AI để phân tích ảnh da của bạn và đưa ra đánh giá về tình trạng da, các vấn đề có thể gặp phải và gợi ý sản phẩm phù hợp.",
    },
    {
      question: "Kết quả phân tích có chính xác không?",
      answer:
        "Kết quả phân tích được cung cấp bởi AI với độ chính xác cao, tuy nhiên nên tham khảo ý kiến bác sĩ da liễu để có chẩn đoán chính xác nhất.",
    },
    {
      question: "Làm sao để chụp ảnh da tốt nhất?",
      answer:
        "Nên chụp ảnh trong môi trường ánh sáng tự nhiên, không trang điểm, da sạch và quay thẳng vào camera. Tránh chụp ảnh khi ánh sáng quá tối hoặc quá sáng.",
    },
    {
      question: "Tôi có thể lưu lịch sử phân tích không?",
      answer:
        "Có, bạn cần đăng nhập tài khoản để lưu lịch sử phân tích. Mọi kết quả sẽ được lưu tự động và có thể xem lại bất cứ lúc nào.",
    },
    {
      question: "Ứng dụng có miễn phí không?",
      answer:
        "Ứng dụng hoàn toàn miễn phí với các tính năng cơ bản. Các tính năng nâng cao có thể yêu cầu đăng ký gói premium.",
    },
    {
      question: "Dữ liệu của tôi có được bảo mật không?",
      answer:
        "Chúng tôi cam kết bảo mật tuyệt đối dữ liệu người dùng. Mọi thông tin đều được mã hóa và lưu trữ an toàn trên Firebase.",
    },
  ];

  const contactOptions = [
    {
      icon: "mail",
      title: "Email",
      subtitle: "support@dermascan.com",
      color: "#3b82f6",
      onPress: () => Linking.openURL("mailto:support@dermascan.com"),
    },
    {
      icon: "logo-facebook",
      title: "Facebook",
      subtitle: "facebook.com/dermascan",
      color: "#1877f2",
      onPress: () => Alert.alert("Facebook", "Tính năng sắp ra mắt"),
    },
    {
      icon: "chatbubble-ellipses",
      title: "Chat trực tiếp",
      subtitle: "Hỗ trợ 24/7",
      color: "#10b981",
      onPress: () => Alert.alert("Chat", "Tính năng sắp ra mắt"),
    },
    {
      icon: "call",
      title: "Hotline",
      subtitle: "1900-xxxx",
      color: "#f59e0b",
      onPress: () => Alert.alert("Hotline", "1900-xxxx"),
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 pt-7" edges={["bottom"]}>
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </Pressable>
          <Text className="text-xl font-bold text-slate-900">
            Trợ giúp & Hỗ trợ
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Search Bar */}
        <View className="bg-white rounded-2xl px-4 py-3 mb-5 shadow-sm flex-row items-center">
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900"
            placeholder="Tìm kiếm câu hỏi..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </Pressable>
          )}
        </View>

        {/* FAQ Section */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Câu hỏi thường gặp
          </Text>
          {filteredFAQs.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="search-outline" size={48} color="#cbd5e1" />
              <Text className="text-base font-semibold text-slate-900 mt-3 mb-2">
                Không tìm thấy kết quả
              </Text>
              <Text className="text-sm text-slate-500 text-center">
                Thử tìm với từ khóa khác
              </Text>
            </View>
          ) : (
            <View className="bg-white rounded-3xl overflow-hidden shadow-sm">
              {filteredFAQs.map((faq, index) => (
                <View key={index}>
                  <Pressable
                    className="p-4 active:bg-slate-50"
                    onPress={() => toggleFAQ(index)}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-base font-semibold text-slate-900 mr-3">
                        {faq.question}
                      </Text>
                      <Ionicons
                        name={
                          expandedIndex === index
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color="#0a7ea4"
                      />
                    </View>
                    {expandedIndex === index && (
                      <Text className="text-sm text-slate-600 mt-3 leading-6">
                        {faq.answer}
                      </Text>
                    )}
                  </Pressable>
                  {index < filteredFAQs.length - 1 && (
                    <View className="h-px bg-slate-100 mx-4" />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Contact Options */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Liên hệ với chúng tôi
          </Text>
          <View className="space-y-3">
            {contactOptions.map((option, index) => (
              <Pressable
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm active:bg-slate-50 flex-row items-center"
                onPress={option.onPress}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${option.color}20` }}
                >
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-base font-semibold text-slate-900 mb-1">
                    {option.title}
                  </Text>
                  <Text className="text-sm text-slate-500">
                    {option.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quick Links */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Liên kết hữu ích
          </Text>
          <View className="bg-white rounded-3xl p-2 shadow-sm">
            <Pressable
              className="flex-row items-center p-4 active:bg-slate-50 rounded-2xl"
              onPress={() => Alert.alert("Video hướng dẫn", "Sắp ra mắt")}
            >
              <View className="w-11 h-11 rounded-full bg-red-100 items-center justify-center">
                <Ionicons name="play-circle" size={20} color="#ef4444" />
              </View>
              <View className="flex-1 ml-3.5">
                <Text className="text-base font-semibold text-slate-900">
                  Video hướng dẫn
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </Pressable>
            <View className="h-px bg-slate-100 mx-4" />
            <Pressable
              className="flex-row items-center p-4 active:bg-slate-50 rounded-2xl"
              onPress={() => Alert.alert("Cộng đồng", "Sắp ra mắt")}
            >
              <View className="w-11 h-11 rounded-full bg-purple-100 items-center justify-center">
                <Ionicons name="people" size={20} color="#a855f7" />
              </View>
              <View className="flex-1 ml-3.5">
                <Text className="text-base font-semibold text-slate-900">
                  Cộng đồng
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </Pressable>
          </View>
        </View>

        {/* Feedback */}
        <Pressable
          className="bg-[#0a7ea4] rounded-2xl p-5 shadow-lg active:bg-[#0a7ea4]/90"
          onPress={() =>
            Alert.alert("Đánh giá", "Cảm ơn bạn đã sử dụng ứng dụng!")
          }
        >
          <View className="flex-row items-center">
            <Ionicons name="star" size={24} color="white" />
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-white mb-1">
                Đánh giá ứng dụng
              </Text>
              <Text className="text-sm text-white/80">
                Chia sẻ trải nghiệm của bạn với chúng tôi
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
