import { KnowledgeChunk } from '../types/types';

/**
 * Medical knowledge base for RAG (Retrieval-Augmented Generation)
 * Contains verified information from trusted medical sources
 */
export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    source: 'Mayo Clinic',
    url: 'https://www.mayoclinic.org/diseases-conditions/acne/symptoms-causes/syc-20368047',
    content:
      'Mụn trứng cá là một tình trạng da xảy ra khi các nang lông của bạn bị bít tắc bởi dầu và tế bào da chết. Nó gây ra mụn đầu trắng, mụn đầu đen hoặc mụn nhọt. Mụn trứng cá phổ biến nhất ở thanh thiếu niên, mặc dù nó ảnh hưởng đến mọi người ở mọi lứa tuổi. Các yếu tố gây ra mụn bao gồm sản xuất dầu thừa, nang lông bị tắc, vi khuẩn và hormone.',
    keywords: [
      'mụn',
      'mụn trứng cá',
      'mụn đầu đen',
      'mụn đầu trắng',
      'nang lông',
      'dầu',
      'vi khuẩn',
      'hormone',
    ],
  },
  {
    source: 'AAD',
    url: 'https://www.aad.org/public/diseases/acne/skin-care/tips',
    content:
      'Để chăm sóc da bị mụn, hãy rửa mặt hai lần một ngày và sau khi đổ mồ hôi. Sử dụng đầu ngón tay để thoa sữa rửa mặt dịu nhẹ, không gây mài mòn. Tránh chà xát da. Sử dụng các sản phẩm chăm sóc da không chứa dầu và không gây mụn (non-comedogenic).',
    keywords: ['chăm sóc da mụn', 'rửa mặt', 'sữa rửa mặt', 'không gây mụn', 'non-comedogenic'],
  },
  {
    source: 'Mayo Clinic',
    url: 'https://www.mayoclinic.org/diseases-conditions/atopic-dermatitis-eczema/symptoms-causes/syc-20353273',
    content:
      'Viêm da dị ứng (chàm) là một tình trạng làm cho da bạn bị đỏ và ngứa. Nó phổ biến ở trẻ em nhưng có thể xảy ra ở mọi lứa tuổi. Viêm da dị ứng là bệnh mãn tính và có xu hướng bùng phát định kỳ. Nó có thể đi kèm với bệnh hen suyễn hoặc sốt cỏ khô. Các triệu chứng chính bao gồm da khô, ngứa, có thể dữ dội, đặc biệt là vào ban đêm, và các mảng đỏ đến nâu xám.',
    keywords: ['chàm', 'viêm da dị ứng', 'eczema', 'đỏ', 'ngứa', 'da khô', 'mãn tính'],
  },
  {
    source: 'MedlinePlus',
    url: 'https://medlineplus.gov/rashes.html',
    content:
      'Phát ban là một vùng da bị kích ứng hoặc sưng. Nhiều nốt phát ban gây ngứa, đỏ, đau và kích ứng. Phát ban có thể là triệu chứng của nhiều tình trạng y tế khác nhau. Các nguyên nhân phổ biến bao gồm viêm da tiếp xúc, nhiễm trùng do vi khuẩn hoặc nấm, và các bệnh tự miễn.',
    keywords: ['phát ban', 'kích ứng', 'sưng', 'ngứa', 'đỏ', 'viêm da tiếp xúc', 'nhiễm trùng'],
  },
  {
    source: 'WHO',
    url: 'https://www.who.int/news-room/fact-sheets/detail/sun-protection',
    content:
      'Tiếp xúc quá nhiều với tia cực tím (UV) là nguyên nhân chính gây ra các tác động có hại cho da, mắt và hệ miễn dịch. Sử dụng kem chống nắng phổ rộng với chỉ số SPF từ 30 trở lên là rất quan trọng để bảo vệ da khỏi tác hại của ánh nắng mặt trời, bao gồm cháy nắng, lão hóa sớm và ung thư da.',
    keywords: [
      'kem chống nắng',
      'tia UV',
      'SPF',
      'bảo vệ da',
      'cháy nắng',
      'lão hóa',
      'ung thư da',
    ],
  },
];

/**
 * Find relevant knowledge chunks based on query
 * Uses simple keyword matching algorithm
 */
export const findRelevantChunks = (query: string, topK = 3): KnowledgeChunk[] => {
  const queryWords = query.toLowerCase().split(/\s+/);
  const scores: { chunk: KnowledgeChunk; score: number }[] = KNOWLEDGE_BASE.map((chunk) => {
    let score = 0;
    const contentWords = new Set(chunk.content.toLowerCase().split(/\s+/));
    const keywordWords = new Set(chunk.keywords);

    for (const word of queryWords) {
      if (contentWords.has(word)) score += 1;
      if (keywordWords.has(word)) score += 3; // Give more weight to keywords
    }
    return { chunk, score };
  });

  return scores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.chunk);
};
