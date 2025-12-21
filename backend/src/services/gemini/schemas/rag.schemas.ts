import { SchemaType, Schema } from '@google/generative-ai';

/**
 * Schema for RAG (Retrieval-Augmented Generation) response
 */
export const ragResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    answer: {
      type: SchemaType.STRING,
      description: 'Câu trả lời tổng hợp bằng tiếng Việt, định dạng Markdown.',
    },
    sources: {
      type: SchemaType.ARRAY,
      description: 'Danh sách các nguồn đã được sử dụng để tạo ra câu trả lời.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          sourceName: {
            type: SchemaType.STRING,
            description: "Tên của nguồn, ví dụ 'Mayo Clinic'.",
          },
          url: { type: SchemaType.STRING, description: 'URL đầy đủ của nguồn.' },
        },
        required: ['sourceName', 'url'],
      },
    },
  },
  required: ['answer', 'sources'],
};
