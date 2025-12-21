import { getGeminiClient } from './core.service';
import { ragResponseSchema } from './schemas/rag.schemas';
import {
  RAG_ANSWER_PROMPT,
  CHATBOT_SYSTEM_INSTRUCTION,
  CHATBOT_PROMPT,
} from './prompts/rag.prompts';
import { findRelevantChunks } from '../../constants/knowledgeBase';
import { logger } from '../../config/logger.config';

export interface RagResult {
  answer: string;
  sources: Array<{
    sourceName: string;
    url: string;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: {
    base64: string;
    mimeType: string;
  };
  sources?: Array<{
    sourceName: string;
    url: string;
  }>;
}

export const getGroundedAnswer = async (question: string): Promise<RagResult> => {
  try {
    const genAI = getGeminiClient();
    const relevantChunks = findRelevantChunks(question);

    if (relevantChunks.length === 0) {
      return {
        answer: 'Rất tiếc, tôi không tìm thấy thông tin liên quan trong cơ sở kiến thức.',
        sources: [],
      };
    }

    // Khởi tạo model chuẩn
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = RAG_ANSWER_PROMPT(question, relevantChunks);

    // Gọi API theo cấu trúc content-based
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: ragResponseSchema,
      },
    });

    const response = result.response;
    return JSON.parse(response.text()) as RagResult;
  } catch (error) {
    logger.error('Error in getGroundedAnswer:', error);
    throw new Error('Không thể tạo câu trả lời.');
  }
};

export const getChatbotResponse = async (
  _history: ChatMessage[],
  text: string,
  image?: { base64: string; mimeType: string }
): Promise<ChatMessage> => {
  try {
    const genAI = getGeminiClient();
    const relevantChunks = findRelevantChunks(text);

    const context =
      relevantChunks.length > 0
        ? relevantChunks.map((c, i) => `Nguồn [${i}]: ${c.content}`).join('\n')
        : 'Không có thông tin bổ trợ.';

    const prompt = CHATBOT_PROMPT(text, context);

    // Cấu hình model với System Instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: CHATBOT_SYSTEM_INSTRUCTION,
    });

    const parts: any[] = [{ text: prompt }];
    if (image) {
      parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: ragResponseSchema,
      },
    });

    const parsedResult = JSON.parse(result.response.text()) as RagResult;

    return {
      role: 'model',
      text: parsedResult.answer,
      sources: parsedResult.sources,
    };
  } catch (error) {
    logger.error('Error in getChatbotResponse:', error);
    return {
      role: 'model',
      text: 'Xin lỗi, hiện tại hệ thống đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút.',
    };
  }
};

/**
 * Get expert information for a specific skin condition
 * Used after skin analysis to provide detailed expert insights
 *
 * @param condition - The skin condition name (e.g., "Mụn", "Da khô", "Viêm da", etc.)
 * @returns RagResult with expert information and sources
 */
export const getExpertInfoForCondition = async (condition: string): Promise<RagResult> => {
  try {
    const question = `Cung cấp thông tin tổng quan ngắn gọn về "${condition}" cho người dùng phổ thông.`;
    const expertInfo = await getGroundedAnswer(question);

    logger.info('Expert info fetched', {
      condition,
      sourcesCount: expertInfo.sources.length,
    });

    return expertInfo;
  } catch (error) {
    logger.error('Error getting expert info for condition:', error);
    // Return fallback response instead of throwing
    return {
      answer: `Không thể tải thông tin chi tiết về ${condition}. Vui lòng liên hệ với bác sĩ da liễu để được tư vấn.`,
      sources: [],
    };
  }
};
