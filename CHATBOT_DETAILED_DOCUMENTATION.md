# 🤖 DermaScan Chatbot - Tài Liệu Chi Tiết

## 📋 Mục Lục

1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [Kiến Trúc & Đặc Điểm](#kiến-trúc--đặc-điểm)
3. [Thuật Toán RAG Chi Tiết](#thuật-toán-rag-chi-tiết)
4. [Flow Hoạt Động](#flow-hoạt-động)
5. [Personalization & Learning](#personalization--learning)
6. [API Endpoints Chi Tiết](#api-endpoints-chi-tiết)
7. [Prompt Engineering](#prompt-engineering)
8. [Xử Lý Lỗi & Retry Logic](#xử-lý-lỗi--retry-logic)

---

## 1. Tổng Quan Hệ Thống

### 🎯 Mục Đích

DermaScan Chatbot là một **chuyên gia da liễu AI** sử dụng công nghệ **RAG (Retrieval-Augmented Generation)** để cung cấp thông tin y khoa chính xác, đáng tin cậy về các vấn đề da liễu.

### 🔑 Tính Năng Chính

- ✅ **RAG-powered Q&A**: Trả lời câu hỏi dựa trên knowledge base y khoa
- ✅ **Conversational Chat**: Hỗ trợ hội thoại đa lượt với context history
- ✅ **Image Analysis**: Phân tích hình ảnh da trong chat
- ✅ **Expert Info**: Cung cấp thông tin chuyên sâu về từng tình trạng da
- ✅ **Source Citations**: Trích dẫn nguồn từ tổ chức y khoa uy tín
- ✅ **User Personalization**: Học từ lịch sử hội thoại để cá nhân hóa

### 🏗️ Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **AI Model**: Google Gemini 2.5 Flash
- **Knowledge Base**: In-memory với keyword matching
- **Database**: Firebase Firestore (chat history, user profile)
- **Mobile**: React Native + Expo (client)

---

## 2. Kiến Trúc & Đặc Điểm

### 📐 Kiến Trúc Tổng Thể

```
┌─────────────────┐
│  Mobile Client  │ (React Native)
│  - useChatbot() │
│  - ChatContext  │
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────────────────────────────────┐
│         Backend API Layer                   │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Controllers (chatbot.controller.ts) │  │
│  │  - answerQuestion()                  │  │
│  │  - getExpertInfo()                   │  │
│  │  - chat()                            │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│                 ↓                           │
│  ┌──────────────────────────────────────┐  │
│  │  Services (rag.service.ts)           │  │
│  │  - getGroundedAnswer()               │  │
│  │  - getChatbotResponse()              │  │
│  │  - getExpertInfoForCondition()       │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│                 ↓                           │
│  ┌──────────────────────────────────────┐  │
│  │  Knowledge Base                      │  │
│  │  (knowledgeBase.ts)                  │  │
│  │  - findRelevantChunks()              │  │
│  │  - Keyword Matching Algorithm        │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
└─────────────────┼───────────────────────────┘
                  │
                  ↓
         ┌────────────────┐
         │  Gemini 2.5    │
         │  Flash API     │
         └────────────────┘
```

### 🎨 Đặc Điểm Nổi Bật

#### 1. **RAG (Retrieval-Augmented Generation)**

- **Mục đích**: Giảm hallucination, đảm bảo thông tin y khoa chính xác
- **Cơ chế**: Tìm kiếm knowledge base → Cung cấp context cho Gemini → Generate answer
- **Lợi ích**:
  - ✅ Câu trả lời dựa trên nguồn đáng tin cậy (Mayo Clinic, WHO, AAD)
  - ✅ Trích dẫn nguồn cụ thể (source citations)
  - ✅ Giảm thiểu thông tin sai lệch

#### 2. **Context-Aware Conversation**

- Hỗ trợ multi-turn conversation (tối đa 50 tin nhắn)
- Duy trì context history để hiểu câu hỏi follow-up
- Tự động detect topic và keywords cho personalization

#### 3. **Image Support**

- Phân tích hình ảnh da trong chat
- Combine image analysis với RAG knowledge
- Format: Base64 encoded (JPEG/PNG/WEBP)

#### 4. **Structured Output (JSON Schema)**

- Gemini 2.5 Flash trả về JSON có cấu trúc cố định
- Schema validation bằng Zod
- Đảm bảo format nhất quán

#### 5. **Safety & Medical Compliance**

- **KHÔNG bao giờ** đưa ra chẩn đoán y khoa trực tiếp
- Luôn khuyến nghị tham khảo bác sĩ da liễu
- Sử dụng ngôn ngữ chuyên nghiệp, nghiêm túc
- Chỉ dựa vào thông tin từ knowledge base

---

## 3. Thuật Toán RAG Chi Tiết

### 🔍 **Bước 1: Keyword Matching Algorithm**

#### Code Implementation

```typescript
// File: backend/src/constants/knowledgeBase.ts

export const findRelevantChunks = (
  query: string,
  topK = 3
): KnowledgeChunk[] => {
  // 1. Tokenize query thành các từ
  const queryWords = query.toLowerCase().split(/\s+/);

  // 2. Tính điểm (score) cho mỗi chunk
  const scores: { chunk: KnowledgeChunk; score: number }[] = KNOWLEDGE_BASE.map(
    (chunk) => {
      let score = 0;
      const contentWords = new Set(chunk.content.toLowerCase().split(/\s+/));
      const keywordWords = new Set(chunk.keywords);

      // 3. Matching algorithm
      for (const word of queryWords) {
        if (contentWords.has(word)) score += 1; // Content match: +1 điểm
        if (keywordWords.has(word)) score += 3; // Keyword match: +3 điểm (ưu tiên cao)
      }
      return { chunk, score };
    }
  );

  // 4. Filter, sort và lấy top K
  return scores
    .filter((item) => item.score > 0) // Chỉ lấy chunks có điểm > 0
    .sort((a, b) => b.score - a.score) // Sắp xếp giảm dần theo điểm
    .slice(0, topK) // Lấy top K chunks
    .map((item) => item.chunk);
};
```

#### Scoring System

| Match Type        | Điểm   | Lý Do                                           |
| ----------------- | ------ | ----------------------------------------------- |
| **Keyword match** | **+3** | Keywords được curator chọn kỹ, độ chính xác cao |
| **Content match** | **+1** | Content rộng hơn, có nhiều từ không liên quan   |

#### Ví Dụ Cụ Thể

**Query**: "Làm sao chữa mụn đầu đen?"

**Tokenize**: `["làm", "sao", "chữa", "mụn", "đầu", "đen"]`

**Scoring**:

```
Chunk 1 (Mayo Clinic - Acne):
  - Content: "mụn" (+1), "đầu" (+1), "đen" (+1) = 3 điểm
  - Keywords: "mụn" (+3), "mụn đầu đen" (+3) = 6 điểm
  → Total: 9 điểm ⭐️⭐️⭐️

Chunk 2 (AAD - Skin Care):
  - Content: "mụn" (+1), "chăm sóc" (+0) = 1 điểm
  - Keywords: "chăm sóc da mụn" (+3) = 3 điểm
  → Total: 4 điểm ⭐️⭐️

Chunk 3 (WHO - Sun Protection):
  - Content: "da" (+1) = 1 điểm
  - Keywords: (no match) = 0 điểm
  → Total: 1 điểm ⭐️
```

**Result**: Top 3 chunks = [Chunk 1, Chunk 2, Chunk 3]

### 📚 **Bước 2: Knowledge Base Structure**

#### Data Model

```typescript
interface KnowledgeChunk {
  source: string; // Tên tổ chức (Mayo Clinic, WHO, AAD)
  url: string; // Link nguồn gốc
  content: string; // Nội dung y khoa (100-300 từ)
  keywords: string[]; // Keywords được curator chọn
}
```

#### Current Knowledge Base (5 chunks)

1. **Mayo Clinic - Acne**: Mụn trứng cá, nguyên nhân, triệu chứng
2. **AAD - Acne Care**: Chăm sóc da mụn, quy trình rửa mặt
3. **Mayo Clinic - Eczema**: Viêm da dị ứng, chàm
4. **MedlinePlus - Rashes**: Phát ban, viêm da tiếp xúc
5. **WHO - Sun Protection**: Kem chống nắng, tia UV

#### Expansion Strategy (Future)

- 🎯 **Mục tiêu**: 50-100 chunks covering common skin conditions
- 📖 **Nguồn**: Mayo Clinic, AAD, WHO, WebMD, DermNet NZ
- 🏷️ **Categories**: Acne, Eczema, Rashes, Sun Protection, Aging, Hyperpigmentation, etc.

### 🤖 **Bước 3: Prompt Engineering cho Gemini**

#### Prompt Structure

```
[SYSTEM INSTRUCTION] → Định nghĩa persona, rules, safety
         ↓
[BỐI CẢNH] → Relevant chunks từ knowledge base
         ↓
[CÂU HỎI] → User question
         ↓
[ĐỊNH DẠNG ĐẦU RA] → JSON schema specification
```

#### RAG Answer Prompt (Chi Tiết)

```typescript
// File: backend/src/services/gemini/prompts/rag.prompts.ts

export const RAG_ANSWER_PROMPT = (
  question: string,
  relevantChunks: KnowledgeChunk[]
) => {
  // Format context từ relevant chunks
  const context = relevantChunks
    .map(
      (chunk, index) =>
        `Nguồn [${index}]:\n` +
        `Nguồn gốc: ${chunk.source}\n` +
        `URL: ${chunk.url}\n` +
        `Nội dung: ${chunk.content}`
    )
    .join("\n\n---\n\n");

  return `
Bạn là một chuyên gia da liễu AI của DermaCheck. 
Dựa **DUY NHẤT** vào [BỐI CẢNH] dưới đây để trả lời [CÂU HỎI].

---
### ⚠️ **QUY TẮC BẮT BUỘC**
1. KHÔNG ĐƯỢC ĐƯA RA CHẨN ĐOÁN Y KHOA TRỰC TIẾP
2. Sử dụng thuật ngữ chuyên môn phù hợp
3. Tổng hợp thông tin từ nhiều nguồn
4. Liệt kê TẤT CẢ nguồn sử dụng trong 'sources'
5. Nếu thông tin không đủ, nói rõ giới hạn
6. Kết thúc bằng lời khuyên tham khảo bác sĩ
7. KHÔNG sử dụng kiến thức bên ngoài [BỐI CẢNH]
8. Giọng điệu: Chuyên nghiệp, nghiêm túc, có trách nhiệm

---
[BỐI CẢNH]:
${context}
---

[CÂU HỎI]:
"${question}"

---
### 💬 **ĐỊNH DẠNG ĐẦU RA**
Trả về JSON tuân thủ schema đã cung cấp.
`;
};
```

#### JSON Schema (Structured Output)

```typescript
// File: backend/src/services/gemini/schemas/rag.schemas.ts

export const ragResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    answer: {
      type: SchemaType.STRING,
      description: "Câu trả lời tổng hợp bằng tiếng Việt, định dạng Markdown.",
    },
    sources: {
      type: SchemaType.ARRAY,
      description: "Danh sách các nguồn đã sử dụng.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          sourceName: { type: SchemaType.STRING },
          url: { type: SchemaType.STRING },
        },
        required: ["sourceName", "url"],
      },
    },
  },
  required: ["answer", "sources"],
};
```

**Lợi ích Structured Output**:

- ✅ Format nhất quán (không cần parse manual)
- ✅ Validation tự động
- ✅ Giảm lỗi parsing
- ✅ Type-safe response

### 🔄 **Bước 4: Generation với Gemini API**

#### Code Flow

```typescript
// File: backend/src/services/gemini/rag.service.ts

export const getGroundedAnswer = async (
  question: string
): Promise<RagResult> => {
  // 1. Tìm kiếm knowledge base
  const relevantChunks = findRelevantChunks(question, 3); // Top 3 chunks

  if (relevantChunks.length === 0) {
    return {
      answer: "Rất tiếc, tôi không tìm thấy thông tin liên quan.",
      sources: [],
    };
  }

  // 2. Khởi tạo Gemini model
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // 3. Build prompt từ chunks
  const prompt = RAG_ANSWER_PROMPT(question, relevantChunks);

  // 4. Call Gemini API với structured output
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json", // Force JSON output
      responseSchema: ragResponseSchema, // Validate theo schema
    },
  });

  // 5. Parse JSON response
  const response = result.response;
  return JSON.parse(response.text()) as RagResult;
};
```

### 📊 **Performance Metrics**

| Metric                  | Value       | Notes                       |
| ----------------------- | ----------- | --------------------------- |
| **Chunks per query**    | 3           | Top 3 most relevant         |
| **Knowledge base size** | 5 chunks    | Will expand to 50-100       |
| **Avg response time**   | 2-4 seconds | Including API call          |
| **Token usage**         | ~1000-2000  | Prompt + completion         |
| **Accuracy**            | High        | Grounded in medical sources |

---

## 4. Flow Hoạt Động

### 📱 **Flow 1: RAG Q&A (Simple Question)**

```
User: "BHA là gì?"
         ↓
┌────────────────────────────────────────────────┐
│ 1. Mobile Client (useChatbot.askQuestion)     │
└────────────────┬───────────────────────────────┘
                 │ POST /api/v1/chatbot/question
                 │ { question: "BHA là gì?" }
                 ↓
┌────────────────────────────────────────────────┐
│ 2. Backend Controller (answerQuestion)        │
│    - Validate request (Zod schema)            │
│    - Rate limiting (20 req/min)               │
│    - Optional auth (track user)               │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│ 3. RAG Service (getGroundedAnswer)            │
│    ┌──────────────────────────────────────┐   │
│    │ Step 1: findRelevantChunks("BHA")   │   │
│    │   Query words: ["bha", "là", "gì"]  │   │
│    │   → Search knowledge base            │   │
│    │   → Found: 0 chunks (no BHA info)    │   │
│    └──────────────────────────────────────┘   │
│                                                │
│    ┌──────────────────────────────────────┐   │
│    │ Step 2: Handle No Chunks Found       │   │
│    │   Return fallback message            │   │
│    └──────────────────────────────────────┘   │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│ 4. Response to Client                         │
│    {                                          │
│      success: true,                           │
│      data: {                                  │
│        answer: "Không tìm thấy thông tin",   │
│        sources: []                            │
│      }                                         │
│    }                                          │
└────────────────────────────────────────────────┘
```

### 💬 **Flow 2: Conversational Chat (Multi-turn)**

```
User: "Làm sao chữa mụn?" → Bot answers → User: "Còn kem chống nắng thì sao?"
                                                    ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. Mobile Client (useChatbot.sendMessage)                    │
│    - Build history từ conversations state                    │
│    - Extract keywords: ["kem", "chống", "nắng"]              │
│    - Detect topic: "sun_protection"                          │
└────────────────┬─────────────────────────────────────────────┘
                 │ POST /api/v1/chatbot/chat
                 │ {
                 │   history: [
                 │     { role: "user", text: "Làm sao chữa mụn?" },
                 │     { role: "model", text: "..." }
                 │   ],
                 │   text: "Còn kem chống nắng thì sao?",
                 │   image: null
                 │ }
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Backend Controller (chat)                                 │
│    - Validate history length (max 50 messages)               │
│    - Extract base64 image (if provided)                      │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. RAG Service (getChatbotResponse)                          │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 1: findRelevantChunks("kem chống nắng")     │     │
│    │   → Found: WHO Sun Protection chunk              │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 2: Build Context from Chunks                │     │
│    │   context = "Nguồn [0]: WHO - UV protection..."  │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 3: Build Prompt với System Instruction      │     │
│    │   - CHATBOT_SYSTEM_INSTRUCTION (persona)         │     │
│    │   - CHATBOT_PROMPT(text, context)                │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 4: Call Gemini API                          │     │
│    │   model.generateContent({                        │     │
│    │     systemInstruction: CHATBOT_SYSTEM_INSTRUCTION│     │
│    │     contents: [{ role: 'user', parts: [prompt] }]│     │
│    │     generationConfig: { JSON schema }            │     │
│    │   })                                             │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 5: Parse Response                           │     │
│    │   {                                              │     │
│    │     answer: "Kem chống nắng rất quan trọng...",  │     │
│    │     sources: [{ sourceName: "WHO", url: "..." }] │     │
│    │   }                                              │     │
│    └──────────────────────────────────────────────────┘     │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. Client Receives Response                                  │
│    - Add bot message to conversations state                  │
│    - Save to Firestore (chat history)                        │
│    - Track topic (personalization)                           │
└──────────────────────────────────────────────────────────────┘
```

### 🖼️ **Flow 3: Chat với Image**

```
User: [Uploads skin photo] + "Đây là gì?"
         ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. Mobile Client                                              │
│    - useImagePicker() → Select image                         │
│    - Convert to base64                                       │
│    - sendMessage(text, imageBase64)                          │
└────────────────┬─────────────────────────────────────────────┘
                 │ POST /api/v1/chatbot/chat
                 │ {
                 │   history: [...],
                 │   text: "Đây là gì?",
                 │   image: {
                 │     base64: "iVBORw0KGgo...",
                 │     mimeType: "image/jpeg"
                 │   }
                 │ }
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Backend Controller (chat)                                 │
│    - Clean base64 (remove data URI prefix if exists)         │
│    - Validate image format (JPEG/PNG/WEBP)                   │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. RAG Service (getChatbotResponse)                          │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 1: findRelevantChunks("đây là gì")          │     │
│    │   → May find general skin info chunks            │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 2: Build Multimodal Prompt                  │     │
│    │   parts = [                                      │     │
│    │     { text: prompt },                            │     │
│    │     { inlineData: {                              │     │
│    │         mimeType: "image/jpeg",                  │     │
│    │         data: base64                             │     │
│    │       }                                          │     │
│    │     }                                            │     │
│    │   ]                                              │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 3: Gemini Analyzes Image + Text             │     │
│    │   - Visual recognition (đốm đỏ, mụn, vết...)    │     │
│    │   - Combine với context từ knowledge base        │     │
│    │   - Generate comprehensive answer                │     │
│    └──────────────────────────────────────────────────┘     │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. Response                                                   │
│    {                                                         │
│      answer: "Dựa vào hình ảnh, tôi thấy các đốm đỏ...",   │
│      sources: [...]                                          │
│    }                                                         │
└──────────────────────────────────────────────────────────────┘
```

### 🏥 **Flow 4: Expert Info (Post-Analysis)**

```
User completes skin analysis → Tap "Learn More" về "Mụn đầu đen"
         ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. Mobile Client                                              │
│    - Trigger from AnalysisResult screen                      │
│    - getExpertInfo(condition: "Mụn đầu đen")                 │
└────────────────┬─────────────────────────────────────────────┘
                 │ POST /api/v1/chatbot/expert-info
                 │ { condition: "Mụn đầu đen" }
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Backend Controller (getExpertInfo)                        │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. RAG Service (getExpertInfoForCondition)                   │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 1: Build Query                              │     │
│    │   question = "Cung cấp thông tin tổng quan       │     │
│    │               ngắn gọn về 'Mụn đầu đen'..."      │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │ Step 2: Call getGroundedAnswer(question)         │     │
│    │   → findRelevantChunks("mụn đầu đen")            │     │
│    │   → Found: Mayo Clinic Acne, AAD Skin Care       │     │
│    │   → Generate comprehensive explanation           │     │
│    └──────────────────────────────────────────────────┘     │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. Response với Expert Info                                  │
│    {                                                         │
│      condition: "Mụn đầu đen",                              │
│      answer: "## Mụn Đầu Đen (Blackheads)\n\n              │
│                **Định nghĩa:**...\n\n                       │
│                **Nguyên nhân:**...\n\n                      │
│                **Cách điều trị:**...",                       │
│      sources: [Mayo Clinic, AAD]                            │
│    }                                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Personalization & Learning

### 🧠 **User Learning System**

#### Mục Đích

- Học từ lịch sử hội thoại của user
- Cá nhân hóa response dựa trên preferences và patterns
- Cải thiện relevance của câu trả lời theo thời gian

#### Data Structure

```typescript
interface UserProfile {
  userId: string;

  // User preferences (explicit)
  preferences: {
    skinConcerns: string[]; // ["acne", "dark_spots"]
    priorityConcerns: string[]; // ["acne"]
    preferredIngredients: string[]; // ["salicylic_acid", "niacinamide"]
    avoidIngredients: string[]; // ["alcohol", "fragrance"]
    preferredBrands: string[];
    preferredLanguage: "vi" | "en";
    responseDetailLevel: "brief" | "moderate" | "detailed";
  };

  // Conversation patterns (implicit learning)
  conversationPattern: {
    topicFrequency: Record<string, number>; // { "acne": 15, "sun_protection": 8 }
    recentTopics: string[]; // Last 10 topics
    commonKeywords: string[]; // Most frequently used words
    questionTypes: string[]; // ["how_to", "what_is", "product_recommendation"]
    averageSessionLength: number; // Avg messages per session
    totalConversations: number;
    lastInteraction: number; // Timestamp
  };

  // Learning data
  learningData: {
    corrections: Array<{
      // User corrections
      original: string;
      corrected: string;
      timestamp: number;
    }>;
    feedbackHistory: MessageFeedback[]; // Helpful/Not helpful feedback
    successfulContexts: string[]; // Contexts that worked well
    saveForLater: string[]; // Bookmarked messages
  };
}
```

#### Tracking & Learning Flow

```
1. User sends message
        ↓
   Extract keywords & detect topic
        ↓
2. Save to Firestore
   - Chat history với metadata (topic, keywords)
   - Update conversation patterns
        ↓
3. Track topic frequency
   - topicFrequency["acne"] += 1
   - recentTopics.unshift("acne")
        ↓
4. User provides feedback
   - Thumbs up/down
   - Save to feedbackHistory
        ↓
5. Build personalization context (future)
   - Top 3 concerns
   - Preferred response style
   - Avoid ingredients/topics
```

#### Personalization Context Builder

```typescript
// File: mobile/services/userPersonalization.service.ts

export const buildPersonalizationContext =
  async (): Promise<PersonalizationContext> => {
    const profile = await getUserProfile();
    if (!profile) return { hasPreviousContext: false };

    return {
      hasPreviousContext: true,

      // Top 3 most discussed topics
      topConcerns: Object.entries(profile.conversationPattern.topicFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([topic]) => topic),

      // Preferred response style
      preferredDetailLevel: profile.preferences.responseDetailLevel,

      // Ingredients to avoid
      avoidIngredients: profile.preferences.avoidIngredients,

      // Recent interaction context
      recentTopics: profile.conversationPattern.recentTopics.slice(0, 5),

      // Success metrics
      successRate: calculateSuccessRate(profile.learningData.feedbackHistory),
    };
  };
```

#### Future Enhancement: Personalized Responses

**Kế hoạch** (chưa implement):

1. Backend nhận `personalizationContext` trong request
2. Adjust prompt dựa trên context:

   ```typescript
   if (context.topConcerns.includes("acne")) {
     prompt += "\nLưu ý: User quan tâm đặc biệt đến vấn đề mụn.";
   }

   if (context.avoidIngredients.length > 0) {
     prompt += `\nTránh đề xuất các thành phần: ${context.avoidIngredients.join(
       ", "
     )}`;
   }
   ```

3. Gemini generate response phù hợp hơn với user profile

---

## 6. API Endpoints Chi Tiết

### 📡 **Endpoint 1: POST /api/v1/chatbot/question**

#### Mô Tả

Get grounded answer using RAG - Trả lời câu hỏi dựa trên knowledge base.

#### Request

```http
POST /api/v1/chatbot/question
Content-Type: application/json
Authorization: Bearer <OPTIONAL_FIREBASE_TOKEN>

{
  "question": "BHA là gì và cách sử dụng như thế nào?"
}
```

#### Validation (Zod Schema)

```typescript
{
  question: z.string()
    .min(3, "Câu hỏi phải có ít nhất 3 ký tự")
    .max(500, "Câu hỏi quá dài");
}
```

#### Response Success (200)

```json
{
  "success": true,
  "data": {
    "questionId": "req_abc123",
    "question": "BHA là gì và cách sử dụng như thế nào?",
    "answer": "BHA (Beta Hydroxy Acid) là một loại acid...\n\n**Cách sử dụng:**\n- Bắt đầu từ 1-2 lần/tuần...",
    "sources": [
      {
        "sourceName": "AAD",
        "url": "https://www.aad.org/..."
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-21T10:30:00Z",
    "requestId": "req_abc123",
    "processingTime": 2341
  }
}
```

#### Response No Sources Found

```json
{
  "success": true,
  "data": {
    "questionId": "req_abc123",
    "question": "BHA là gì?",
    "answer": "Rất tiếc, tôi không tìm thấy thông tin liên quan trong cơ sở kiến thức.",
    "sources": []
  }
}
```

#### Middleware Stack

```typescript
router.post(
  "/question",
  optionalAuth, // Try to authenticate
  chatbotRateLimit, // 20 req/min
  validateBody(ChatQuestionRequestSchema), // Zod validation
  answerQuestion // Controller
);
```

---

### 📡 **Endpoint 2: POST /api/v1/chatbot/expert-info**

#### Mô Tả

Get expert information about a specific skin condition.

#### Request

```http
POST /api/v1/chatbot/expert-info
Content-Type: application/json
Authorization: Bearer <OPTIONAL_FIREBASE_TOKEN>

{
  "condition": "Mụn đầu đen"
}
```

#### Validation

```typescript
{
  condition: z.string()
    .min(2, "Tên tình trạng da phải có ít nhất 2 ký tự")
    .max(100);
}
```

#### Response Success (200)

```json
{
  "success": true,
  "data": {
    "infoId": "req_def456",
    "condition": "Mụn đầu đen",
    "answer": "## Mụn Đầu Đen (Blackheads)\n\n**Định nghĩa:**\nMụn đầu đen là...\n\n**Nguyên nhân:**\n- Bã nhờn bị oxy hóa...\n- Nang lông bị tắc...\n\n**Cách điều trị:**\n- Sử dụng BHA (Salicylic Acid)...\n- Tẩy tế bào chết...\n\n**Phòng ngừa:**\n- Làm sạch da đều đặn...\n- Tránh lạm dụng mỹ phẩm gây bít tắc...\n\n**Khi nào cần gặp bác sĩ:**\n- Mụn lan rộng...\n- Viêm nhiễm...",
    "sources": [
      {
        "sourceName": "Mayo Clinic",
        "url": "https://www.mayoclinic.org/..."
      },
      {
        "sourceName": "AAD",
        "url": "https://www.aad.org/..."
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-21T10:35:00Z",
    "requestId": "req_def456",
    "processingTime": 3120
  }
}
```

---

### 📡 **Endpoint 3: POST /api/v1/chatbot/chat**

#### Mô Tả

Conversational chatbot with context history and image support.

#### Request

```http
POST /api/v1/chatbot/chat
Content-Type: application/json
Authorization: Bearer <OPTIONAL_FIREBASE_TOKEN>

{
  "history": [
    {
      "role": "user",
      "text": "Làm sao chữa mụn?"
    },
    {
      "role": "model",
      "text": "Để điều trị mụn hiệu quả...",
      "sources": [...]
    }
  ],
  "text": "Còn kem chống nắng thì sao?",
  "image": {
    "base64": "data:image/jpeg;base64,iVBORw0KGgo...",
    "mimeType": "image/jpeg"
  }
}
```

#### Validation

```typescript
{
  history: z.array(ChatMessageSchema)
    .max(50, 'Lịch sử hội thoại tối đa 50 tin nhắn')
    .default([]),
  text: z.string()
    .min(1, 'Tin nhắn không được để trống')
    .max(1000, 'Tin nhắn quá dài'),
  image: z.object({
    base64: CommonSchemas.base64Image,
    mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/)
  }).optional()
}
```

#### Response Success (200)

```json
{
  "success": true,
  "data": {
    "chatId": "req_ghi789",
    "response": {
      "role": "model",
      "text": "Kem chống nắng là bước rất quan trọng...\n\nTheo WHO, bạn nên chọn kem chống nắng phổ rộng với SPF từ 30 trở lên...",
      "sources": [
        {
          "sourceName": "WHO",
          "url": "https://www.who.int/..."
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2025-12-21T10:40:00Z",
    "requestId": "req_ghi789",
    "processingTime": 4280
  }
}
```

#### Middleware Stack

```typescript
router.post(
  "/chat",
  optionalAuth,
  chatbotRateLimit,
  validateBody(ChatConversationRequestSchema),
  chat
);
```

---

## 7. Prompt Engineering

### 🎯 **Chatbot System Instruction**

#### Persona Definition

```
👤 Bạn là một chuyên gia da liễu AI của DermaCheck
📚 Có kiến thức chuyên môn sâu rộng về da liễu học
🎓 Cung cấp thông tin y khoa đáng tin cậy, chính xác
```

#### Core Mission

1. **Tư vấn chuyên nghiệp**: Thông tin y khoa chính xác
2. **Phân tích toàn diện**: Kết hợp image + text + context
3. **Giáo dục người dùng**: Giải thích rõ ràng, dễ hiểu
4. **An toàn và trách nhiệm**: Khuyến nghị gặp bác sĩ

#### Tone & Language Style

```
✅ Chuyên nghiệp, nghiêm túc
✅ Thuật ngữ y khoa chính xác + giải thích
✅ Cấu trúc logic, có hệ thống
✅ Độ tin cậy cao (dựa trên [BỐI CẢNH])
✅ Tôn trọng, cẩn thận
✅ Độ dài: 5-8 câu hoặc nhiều hơn

❌ KHÔNG cảm tính
❌ KHÔNG suy đoán
❌ KHÔNG chẩn đoán trực tiếp
```

#### Answer Structure

```
1. Phân tích triệu chứng/câu hỏi
   → Tóm tắt vấn đề

2. Thông tin y khoa
   → Kiến thức chuyên môn từ [BỐI CẢNH]

3. Các yếu tố liên quan
   → Môi trường, lối sống, di truyền

4. Khuyến nghị chăm sóc
   → Biện pháp phù hợp (nếu có)

5. Lời khuyên y khoa
   → "Vui lòng tham khảo ý kiến bác sĩ da liễu"
```

#### Safety Rules (BẮT BUỘC)

```
🚨 KHÔNG BAO GIỜ đưa ra chẩn đoán y khoa trực tiếp
✅ Sử dụng: "các triệu chứng tương tự với", "có thể liên quan đến"

🚨 Nếu vấn đề nghiêm trọng → Khuyến nghị gặp bác sĩ ngay
✅ "Tôi khuyên bạn nên đến gặp bác sĩ da liễu để được khám và điều trị kịp thời"

🚨 Luôn kết thúc với lời nhắc nhở
✅ "Lưu ý: Thông tin trên chỉ mang tính chất tham khảo. Để có chẩn đoán chính xác..."

🚨 CHỈ sử dụng thông tin từ [BỐI CẢNH]
✅ Nếu không đủ thông tin → Nói rõ giới hạn
```

### 📝 **Prompt Template Examples**

#### Template 1: RAG Answer (Simple)

```
Bạn là một chuyên gia da liễu AI của DermaCheck.
Dựa **DUY NHẤT** vào [BỐI CẢNH] dưới đây để trả lời [CÂU HỎI].

[BỐI CẢNH]:
Nguồn [0]:
Nguồn gốc: Mayo Clinic
URL: https://www.mayoclinic.org/...
Nội dung: Mụn trứng cá là một tình trạng da xảy ra khi...

---

Nguồn [1]:
Nguồn gốc: AAD
URL: https://www.aad.org/...
Nội dung: Để chăm sóc da bị mụn, hãy rửa mặt hai lần...

---

[CÂU HỎI]:
"Làm sao chữa mụn?"

---
Trả về JSON tuân thủ schema.
```

#### Template 2: Chatbot với Context History

```
[SYSTEM INSTRUCTION]
Bạn là một chuyên gia da liễu AI...
(Full system instruction từ CHATBOT_SYSTEM_INSTRUCTION)

---

[BỐI CẢNH TRI THỨC Y KHOA]:
Nguồn [0]: WHO - Kem chống nắng phổ rộng với SPF từ 30...

---

[CÂU HỎI CỦA BẠN THÂN]:
"Còn kem chống nắng thì sao?"

---
Trả về JSON với answer và sources.
```

#### Template 3: Chat với Image

```
[SYSTEM INSTRUCTION]
...

[BỐI CẢNH]:
(Context từ knowledge base)

[CÂU HỎI]:
"Đây là gì trên da tôi?"

[HÌNH ẢNH]:
(Inline image data)

---
Phân tích hình ảnh kết hợp với bối cảnh y khoa.
Trả về JSON.
```

---

## 8. Xử Lý Lỗi & Retry Logic

### ❌ **Error Handling Strategy**

#### Error Types

```typescript
1. ValidationError (400)
   - Invalid request data
   - Zod validation failed

2. AuthenticationError (401)
   - Invalid Firebase token
   - Token expired

3. RateLimitError (429)
   - Too many requests (20/min exceeded)

4. GeminiError (503)
   - Gemini API failure
   - RESOURCE_EXHAUSTED
   - Network timeout

5. InternalError (500)
   - Unexpected errors
```

#### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "GEMINI_API_ERROR",
    "message": "Không thể tạo câu trả lời. Vui lòng thử lại sau.",
    "details": "Error details for debugging"
  },
  "requestId": "req_abc123",
  "meta": {
    "timestamp": "2025-12-21T10:30:00Z"
  }
}
```

### 🔄 **Retry Logic (Future Enhancement)**

**Kế hoạch** cho exponential backoff retry (chưa implement):

```typescript
// Gemini service với retry
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export const getGroundedAnswerWithRetry = async (question: string) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await getGroundedAnswer(question);
    } catch (error: any) {
      // Chỉ retry nếu là lỗi tạm thời
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(
          `Gemini API failed, retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`
        );
        await sleep(delay);
        continue;
      }

      // Max retries exceeded hoặc non-retryable error
      throw new GeminiError("Phân tích thất bại sau nhiều lần thử", error);
    }
  }
};

const isRetryableError = (error: any): boolean => {
  return (
    error.code === 503 || // Service unavailable
    error.code === "RESOURCE_EXHAUSTED" || // Rate limit
    error.message?.includes("timeout")
  ); // Network timeout
};
```

**Retry Schedule**:

- Attempt 1: Immediate
- Attempt 2: 1 second
- Attempt 3: 2 seconds
- Attempt 4: 4 seconds
- Attempt 5: 8 seconds

---

## 📊 Summary: Key Metrics & Stats

### System Performance

| Metric                | Value                                     |
| --------------------- | ----------------------------------------- |
| **Endpoints**         | 3 (question, expert-info, chat)           |
| **Knowledge Base**    | 5 chunks (expandable to 50-100)           |
| **RAG Algorithm**     | Keyword matching (content +1, keyword +3) |
| **Top K Chunks**      | 3                                         |
| **Rate Limit**        | 20 requests/minute                        |
| **Max History**       | 50 messages                               |
| **Avg Response Time** | 2-4 seconds                               |
| **AI Model**          | Gemini 2.5 Flash                          |
| **Output Format**     | JSON (structured)                         |

### Features Checklist

- ✅ RAG Q&A với source citations
- ✅ Conversational chat với context
- ✅ Image analysis support
- ✅ Expert info retrieval
- ✅ Personalization tracking (client-side)
- ✅ Chat history persistence (Firestore)
- ⏳ Personalization context (planned)
- ⏳ Retry logic với exponential backoff (planned)
- ⏳ Knowledge base expansion (planned)

### Safety & Compliance

- ✅ KHÔNG chẩn đoán y khoa trực tiếp
- ✅ Trích dẫn nguồn y khoa uy tín
- ✅ Khuyến nghị gặp bác sĩ
- ✅ Chỉ dựa vào knowledge base
- ✅ Giọng điệu chuyên nghiệp
- ✅ Rate limiting protection
- ✅ Input validation (Zod)
- ✅ Error handling standardized

---

## 🔮 Future Enhancements

### Short-term (1-3 months)

1. **Knowledge Base Expansion**

   - 50-100 chunks covering common skin conditions
   - Categories: Acne, Eczema, Rashes, Aging, Hyperpigmentation
   - Sources: Mayo Clinic, AAD, WHO, WebMD, DermNet NZ

2. **Improved Retrieval Algorithm**

   - Semantic search (embeddings)
   - Better ranking algorithm
   - Ngram matching cho tiếng Việt

3. **Personalization Context API**
   - Backend accepts personalizationContext
   - Adjust prompts based on user preferences
   - Avoid ingredients/topics

### Mid-term (3-6 months)

4. **Advanced RAG Techniques**

   - Vector database (Pinecone, Weaviate)
   - Semantic similarity search
   - Re-ranking model

5. **Multi-language Support**

   - English medical knowledge base
   - Bilingual responses

6. **Feedback Loop**
   - User corrections → Update knowledge base
   - A/B testing prompts
   - Quality metrics tracking

### Long-term (6-12 months)

7. **Fine-tuned Model**

   - Custom Gemini model fine-tuned on dermatology data
   - Better medical accuracy

8. **Real-time Updates**

   - Integrate with medical journals APIs
   - Auto-update knowledge base

9. **Multi-modal Analysis**
   - Video analysis (skin over time)
   - 3D skin mapping

---

## 📚 References & Resources

### Code Files

- **Controllers**: `backend/src/controllers/chatbot.controller.ts`
- **Services**: `backend/src/services/gemini/rag.service.ts`
- **Prompts**: `backend/src/services/gemini/prompts/rag.prompts.ts`
- **Knowledge Base**: `backend/src/constants/knowledgeBase.ts`
- **Schemas**: `backend/src/schemas/chatbot.schemas.ts`
- **Routes**: `backend/src/routes/chatbot.routes.ts`
- **Mobile Hook**: `mobile/hooks/useChatbot.ts`
- **Personalization**: `mobile/services/userPersonalization.service.ts`

### External Documentation

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [RAG Pattern Guide](https://python.langchain.com/docs/use_cases/question_answering/)
- [Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)

### Medical Sources

- [Mayo Clinic](https://www.mayoclinic.org/)
- [AAD (American Academy of Dermatology)](https://www.aad.org/)
- [WHO Health Topics](https://www.who.int/)
- [MedlinePlus](https://medlineplus.gov/)

---

**Document Version**: 1.0  
**Last Updated**: December 21, 2025  
**Author**: DermaScan Development Team
