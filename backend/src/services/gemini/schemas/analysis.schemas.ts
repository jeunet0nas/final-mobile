import { SchemaType, Schema } from '@google/generative-ai';

/**
 * Schema for individual zone analysis (part of XAI - Explainable AI)
 */
export const zoneAnalysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    zone: {
      type: SchemaType.STRING,
      description: 'Tên vùng da được phân tích (ví dụ: Trán, Má trái, Má phải, Mũi, Cằm).',
    },
    condition: {
      type: SchemaType.STRING,
      description:
        'Tên tình trạng chính của vùng da này (ví dụ: Mụn viêm, Mụn đầu đen, Tăng sắc tố).',
    },
    riskLevel: {
      type: SchemaType.STRING,
      description: "Đánh giá mức độ rủi ro của vùng này: 'Low', 'Medium', 'High'.",
    },
    explanation: {
      type: SchemaType.STRING,
      description: 'Giải thích ngắn gọn về tình trạng của vùng da này.',
    },
    visualEvidence: {
      type: SchemaType.OBJECT,
      description: 'Chi tiết bằng chứng hình ảnh mà AI quan sát được.',
      properties: {
        visualClues: {
          type: SchemaType.STRING,
          description:
            'Mô tả bằng chứng hình ảnh cụ thể (ví dụ: "quan sát thấy các nốt mụn đỏ, sưng viêm, có nhân trắng").',
        },
        reasoning: {
          type: SchemaType.STRING,
          description: 'Lý do tại sao AI đưa ra kết luận này dựa trên bằng chứng hình ảnh.',
        },
        certainty: {
          type: SchemaType.NUMBER,
          description: 'Độ chắc chắn về phân tích vùng này, từ 0.0 đến 1.0 (0% đến 100%).',
        },
      },
      required: ['visualClues', 'reasoning', 'certainty'],
    },
  },
  required: ['zone', 'condition', 'riskLevel', 'explanation', 'visualEvidence'],
};

/**
 * Main analysis response schema with multi-zone analysis
 */
export const analysisResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    skinType: {
      type: SchemaType.STRING,
      description:
        'Xác định loại da tổng thể của người dùng (dầu, khô, nhạy cảm, hỗn hợp). Nếu không thể xác định, trả về null.',
    },
    overallSummary: {
      type: SchemaType.STRING,
      description:
        'Tóm tắt tổng quan về tình trạng da trên toàn bộ khuôn mặt, kết hợp các phân tích từ từng vùng.',
    },
    zones: {
      type: SchemaType.ARRAY,
      description:
        'Một danh sách các phân tích chi tiết cho từng vùng da riêng biệt có thể thấy trên khuôn mặt.',
      items: zoneAnalysisSchema,
    },
    recommendations: {
      type: SchemaType.ARRAY,
      description:
        "Danh sách các bước chăm sóc ban đầu an toàn, chung cho toàn bộ khuôn mặt. Nếu có vùng nào rủi ro cao hoặc không chắc chắn, khuyến nghị chính phải là 'Gặp bác sĩ da liễu ngay lập tức'.",
      items: { type: SchemaType.STRING },
    },
    aiReasoning: {
      type: SchemaType.STRING,
      description:
        'Giải thích chi tiết bằng ngôn ngữ tự nhiên, kết hợp cả hình ảnh và triệu chứng văn bản do người dùng cung cấp để đưa ra logic suy luận.',
    },
    isUncertain: {
      type: SchemaType.BOOLEAN,
      description:
        'Đặt thành true nếu AI không chắc chắn về kết quả (ví dụ: ảnh mờ, triệu chứng mâu thuẫn, tình trạng phức tạp). Ngược lại là false.',
    },
    uncertaintyMessage: {
      type: SchemaType.STRING,
      description:
        'Nếu isUncertain là true, cung cấp một thông báo cảnh báo rõ ràng, khuyên người dùng nên gặp bác sĩ. Nếu false, để trống chuỗi này.',
    },
    confidenceScore: {
      type: SchemaType.NUMBER,
      description:
        'Đánh giá độ tin cậy tổng thể của AI cho toàn bộ phân tích, từ 0 đến 100. 100 là cực kỳ chắc chắn.',
    },
  },
  required: [
    'skinType',
    'overallSummary',
    'zones',
    'recommendations',
    'aiReasoning',
    'isUncertain',
    'uncertaintyMessage',
    'confidenceScore',
  ],
};
