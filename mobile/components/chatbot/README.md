# Chatbot Feature - DermaScan AI

## 📚 Tổng Quan

Chức năng chatbot cung cấp 3 modes khác nhau:

1. **RAG Q&A**: Hỏi câu hỏi đơn giản với câu trả lời có nguồn gốc
2. **Expert Info**: Xem thông tin chuyên sâu về tình trạng da
3. **Conversation**: Trò chuyện liên tục với context và hỗ trợ ảnh

---

## 🎯 Use Cases

### 1. Full Chatbot Screen (Conversation Mode)

```tsx
import { ChatbotScreen } from "@/components/chatbot";

export default function ChatTab() {
  return <ChatbotScreen />;
}
```

**Features:**

- ✅ Multi-turn conversation với context
- ✅ Gửi ảnh để AI phân tích
- ✅ Auto scroll to bottom
- ✅ Retry on error
- ✅ Clear history
- ✅ Sources với links

---

### 2. Expert Info Button (In Analysis Screen)

```tsx
import { ExpertInfoButton } from "@/components/chatbot";

// Trong kết quả phân tích
{
  zones.map((zone) => (
    <View key={zone.zone}>
      <Text>{zone.condition}</Text>
      <ExpertInfoButton condition={zone.condition} variant="primary" />
    </View>
  ));
}
```

**Features:**

- ✅ Modal popup với thông tin chi tiết
- ✅ One-click để hiểu sâu hơn về condition
- ✅ Sources có link

---

### 3. Quick Question Card (Home/FAQ)

```tsx
import { QuickQuestionCard, SuggestedQuestions } from "@/components/chatbot";

export default function HomeScreen() {
  const [selectedQuestion, setSelectedQuestion] = useState("");

  return (
    <View>
      <SuggestedQuestions onQuestionSelect={setSelectedQuestion} />

      <QuickQuestionCard
        onAnswerReceived={(answer, sources) => {
          console.log("Got answer:", answer);
        }}
      />
    </View>
  );
}
```

**Features:**

- ✅ Standalone Q&A không cần conversation
- ✅ Pre-defined suggested questions
- ✅ Callback khi có answer

---

## 🔧 Custom Hook: `useChatbot`

```tsx
import { useChatbot } from "@/hooks/useChatbot";

const MyComponent = () => {
  const {
    conversations,       // ChatConversation[]
    isLoading,           // boolean
    error,               // string | null
    sendMessage,         // (msg, img?) => Promise<void>
    askRAGQuestion,      // (q) => Promise<{answer, sources}>
    getConditionInfo,    // (condition) => Promise<{answer, sources}>
    clearConversations,  // () => void
    retryLastMessage,    // () => Promise<void>
  } = useChatbot();

  return (
    // Your UI
  );
};
```

---

## 📡 API Services

### `askQuestion(question: string)`

RAG mode - Single question với grounded answer

```tsx
import { askQuestion } from "@/api/services/chatbot.service";

const result = await askQuestion("BHA là gì?");
console.log(result.answer);
console.log(result.sources);
```

### `getExpertInfo(condition: string)`

Lấy thông tin chuyên sâu về một condition

```tsx
import { getExpertInfo } from "@/api/services/chatbot.service";

const info = await getExpertInfo("Mụn đầu đen");
console.log(info.answer); // Markdown formatted
console.log(info.sources);
```

### `chat(text, history?, imageBase64?)`

Conversation mode với context

```tsx
import { chat, buildChatHistory } from "@/api/services/chatbot.service";

const history = buildChatHistory([
  { sender: "user", message: "Da tôi bị khô" },
  { sender: "bot", message: "Bạn nên dùng kem dưỡng ẩm" },
]);

const response = await chat(
  "Còn cách nào khác không?",
  history,
  imageBase64 // optional
);

console.log(response.message.text);
console.log(response.sources);
```

---

## 🎨 Components API

### ChatbotScreen

Full-featured chatbot với conversation

```tsx
<ChatbotScreen />
```

### ExpertInfoModal

Modal hiển thị expert info

```tsx
<ExpertInfoModal
  visible={isVisible}
  condition="Mụn đầu đen"
  onClose={() => setIsVisible(false)}
/>
```

### ExpertInfoButton

Button + Modal combo

```tsx
<ExpertInfoButton
  condition="Mụn đầu đen"
  variant="primary" // or "secondary"
/>
```

### QuickQuestionCard

Standalone Q&A card

```tsx
<QuickQuestionCard
  onAnswerReceived={(answer, sources) => {
    console.log(answer);
  }}
/>
```

### SuggestedQuestions

Pre-defined question list

```tsx
<SuggestedQuestions
  onQuestionSelect={(question) => {
    console.log("Selected:", question);
  }}
/>
```

---

## 🔐 Authentication

- **RAG Q&A**: `optionalAuth` - không cần đăng nhập
- **Expert Info**: `optionalAuth` - không cần đăng nhập
- **Chat**: `optionalAuth` - không cần đăng nhập

Nếu đăng nhập, backend sẽ track usage và có thể personalize responses.

---

## ⚡ Performance Notes

1. **Rate Limiting**: 20 requests/minute per IP
2. **Timeout**: 150 seconds cho AI processing
3. **History Limit**: Tối đa 50 messages trong conversation
4. **Question Length**: Max 500 characters
5. **Image Size**: Recommend < 2MB (base64 encoded)

---

## 🐛 Error Handling

Tất cả errors đã được handle gracefully:

- Network errors: Hiển thị message rõ ràng
- 401 errors: Auto retry with refreshed token
- Validation errors: Show specific field errors
- Gemini errors: Show user-friendly message

```tsx
const { error } = useChatbot();

{
  error && (
    <View className="bg-red-100 p-3 rounded">
      <Text className="text-red-700">{error}</Text>
    </View>
  );
}
```

---

## 🎯 Best Practices

1. **Clear History**: Cho phép user clear conversation khi quá dài
2. **Show Sources**: Luôn hiển thị sources để build trust
3. **Loading States**: Show loading indicator khi waiting
4. **Error Recovery**: Provide retry button
5. **Character Limits**: Show character count (x/500)
6. **Auto Scroll**: Scroll to bottom khi có message mới

---

## 📱 Example: Integration trong Analysis Screen

```tsx
import { ExpertInfoButton } from "@/components/chatbot";

export default function AnalysisResultScreen({ result }) {
  return (
    <ScrollView>
      {result.zones.map((zone) => (
        <View key={zone.zone} className="mb-4 p-4 bg-white rounded-xl">
          <Text className="font-bold">{zone.zone}</Text>
          <Text className="text-red-600">{zone.condition}</Text>
          <Text className="text-gray-600 mt-2">{zone.explanation}</Text>

          {/* Click để xem thông tin chuyên sâu */}
          <ExpertInfoButton condition={zone.condition} variant="secondary" />
        </View>
      ))}
    </ScrollView>
  );
}
```

---

## 🔮 Future Enhancements

- [ ] Voice input/output
- [ ] Save conversations to history
- [ ] Share conversation
- [ ] Multi-language support
- [ ] Personalized recommendations based on user profile
- [ ] Integration with analysis history for context-aware responses

---

## 📞 Support

Nếu có vấn đề, check:

1. Backend có chạy không? (http://localhost:5000/health)
2. GEMINI_API_KEY đã config chưa?
3. Firebase Auth đã setup đúng chưa?
4. Network connection OK?

Log errors:

```tsx
import { handleApiError } from "@/api/client";

try {
  await askQuestion("...");
} catch (err) {
  console.error(handleApiError(err));
}
```
