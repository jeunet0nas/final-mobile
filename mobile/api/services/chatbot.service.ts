import apiClient from "../client";
import {
  ApiResponse,
  ChatQuestionRequest,
  ChatQuestionResponse,
  ExpertInfoRequest,
  ExpertInfoResponse,
  ChatConversationRequest,
  ChatConversationResponse,
  ChatMessage,
} from "@/types/api.types";

/**
 * Ask Question - Hỏi câu hỏi và nhận câu trả lời có nguồn gốc (RAG)
 *
 * @param question - Câu hỏi về skincare/dermatology
 * @returns Câu trả lời với sources (citations)
 *
 * Example:
 * ```ts
 * const result = await askQuestion("BHA là gì?");
 * console.log(result.answer);
 * console.log(result.sources.length); // Số lượng nguồn trích dẫn
 * ```
 *
 * Use cases:
 * - Hỏi về thành phần skincare
 * - Hỏi về cách điều trị
 * - Hỏi về tình trạng da
 */
export const askQuestion = async (
  question: string
): Promise<ChatQuestionResponse> => {
  const payload: ChatQuestionRequest = {
    question,
  };

  const response = await apiClient.post<ApiResponse<ChatQuestionResponse>>(
    "/api/v1/chatbot/question",
    payload
  );

  return response.data.data;
};

/**
 * Get Expert Info - Lấy thông tin chuyên sâu về một tình trạng da
 *
 * @param condition - Tên tình trạng da (e.g., "Mụn đầu đen", "Da khô")
 * @returns Thông tin chuyên gia với giải thích chi tiết
 *
 * Example:
 * ```ts
 * const info = await getExpertInfo("Mụn đầu đen");
 * console.log(info.answer); // Giải thích chi tiết
 * console.log(info.sources); // Nguồn tham khảo
 * ```
 *
 * Use cases:
 * - Sau khi phân tích da, muốn biết thêm về một zone
 * - Tìm hiểu sâu về một điều kiện cụ thể
 * - Educational content
 */
export const getExpertInfo = async (
  condition: string
): Promise<ExpertInfoResponse> => {
  const payload: ExpertInfoRequest = {
    condition,
  };

  const response = await apiClient.post<ApiResponse<ExpertInfoResponse>>(
    "/api/v1/chatbot/expert-info",
    payload
  );

  return response.data.data;
};

/**
 * Chat - Trò chuyện với AI assistant (hỗ trợ history + ảnh)
 *
 * @param text - Tin nhắn của user
 * @param history - Lịch sử hội thoại (optional)
 * @param imageBase64 - Ảnh đính kèm (optional, format: "data:image/jpeg;base64,...")
 * @returns Phản hồi của AI với text và sources (nếu có)
 *
 * Example:
 * ```ts
 * // Chat đơn giản
 * const response = await chat("Da tôi bị khô, nên làm gì?");
 *
 * // Chat với history
 * const response2 = await chat(
 *   "Còn cách nào khác không?",
 *   [
 *     { role: "user", text: "Da tôi bị khô, nên làm gì?" },
 *     { role: "model", text: "Bạn nên dùng kem dưỡng ẩm..." }
 *   ]
 * );
 *
 * // Chat với ảnh
 * const response3 = await chat(
 *   "Phân tích ảnh này giúp tôi",
 *   [],
 *   "data:image/jpeg;base64,/9j/4AAQ..."
 * );
 * ```
 *
 * Use cases:
 * - Hội thoại liên tục với context
 * - Hỏi follow-up questions
 * - Gửi ảnh để AI phân tích trong cuộc trò chuyện
 */
export const chat = async (
  text: string,
  history: ChatMessage[] = [],
  imageBase64?: string
): Promise<ChatConversationResponse> => {
  const payload: ChatConversationRequest = {
    text,
    history,
  };

  // Parse image nếu có
  if (imageBase64) {
    const matches = imageBase64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (matches) {
      payload.image = {
        base64: matches[2],
        mimeType: matches[1],
      };
    } else {
      // Raw base64, assume jpeg
      payload.image = {
        base64: imageBase64,
        mimeType: "image/jpeg",
      };
    }
  }

  const response = await apiClient.post<ApiResponse<ChatConversationResponse>>(
    "/api/v1/chatbot/chat",
    payload
  );

  // Return response with correct structure matching ChatConversationResponse type
  const result = response.data.data;
  return {
    chatId: result.chatId,
    response: {
      role: result.response.role,
      text: result.response.text,
      sources: result.response.sources,
    },
  };
};

/**
 * Helper: Build chat history từ conversation
 * Dùng để maintain context trong multi-turn conversation
 *
 * NOTE: Converts "bot" to "model" because backend expects Gemini API format
 * where assistant responses use role="model" (not "bot")
 */
export const buildChatHistory = (
  conversations: Array<{ sender: "user" | "bot"; message: string }>
): ChatMessage[] => {
  return conversations.map((conv) => ({
    role: conv.sender === "user" ? "user" : "model",
    text: conv.message,
  }));
};
