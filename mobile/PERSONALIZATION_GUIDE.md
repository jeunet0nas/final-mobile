# Hệ Thống Cá Nhân Hóa Chatbot - Tài Liệu Hướng Dẫn

## 📚 Tổng Quan

Hệ thống personalization này cho phép chatbot **học hỏi từ người dùng** và cung cấp câu trả lời được **cá nhân hóa** dựa trên:

1. **Lịch sử hội thoại** - Topics, keywords người dùng quan tâm
2. **Preferences** - Skin concerns, ingredients, response style
3. **Feedback** - Đánh giá helpful/not helpful
4. **Learning data** - Corrections, clarifications, successful contexts

---

## 🏗️ Kiến Trúc

### 1. Types (`types/personalization.types.ts`)

```typescript
UserProfile {
  preferences: UserPreferences
  conversationPattern: ConversationPattern
  learningData: LearningData
}
```

### 2. Services

#### `userPersonalization.service.ts`

- `getUserProfile()` - Load profile từ Firestore
- `trackConversationTopic()` - Track topics người dùng hỏi
- `saveMessageFeedback()` - Lưu feedback
- `buildPersonalizationContext()` - Tạo context gửi kèm request

#### `chatHistory.service.ts` (đã cập nhật)

- `saveChatMessage()` - Lưu message kèm topic, keywords, feedback
- `updateMessageFeedback()` - Cập nhật feedback cho message
- `loadChatHistory()` - Load history với metadata

### 3. Hooks

#### `useChatbot.ts` (đã cập nhật)

```typescript
const {
  sendMessage, // Tự động track topic & keywords
  addMessageFeedback, // Thêm feedback cho message
  conversations, // Có feedback & topic metadata
} = useChatbot();
```

#### `useUserProfile.ts` (mới)

```typescript
const {
  profile,
  metrics,
  addSkinConcern,
  addAvoidIngredient,
  setResponseDetailLevel,
  getPersonalizationProgress,
} = useUserProfile();
```

---

## 🚀 Cách Sử Dụng

### 1. Basic Chat với Auto-Learning

```tsx
const ChatScreen = () => {
  const { sendMessage, conversations, addMessageFeedback } = useChatbot();

  const handleSend = async (message: string) => {
    // Tự động:
    // - Extract keywords từ message
    // - Detect topic
    // - Track conversation pattern
    // - Save to Firestore
    await sendMessage(message);
  };

  const handleFeedback = async (messageId: string, helpful: boolean) => {
    // Lưu feedback để bot học
    await addMessageFeedback(messageId, helpful ? "helpful" : "not_helpful");
  };

  return (
    <View>
      {conversations.map((msg) => (
        <View key={msg.id}>
          <Text>{msg.message}</Text>
          {msg.sender === "bot" && (
            <View>
              <Button onPress={() => handleFeedback(msg.id, true)}>
                👍 Helpful
              </Button>
              <Button onPress={() => handleFeedback(msg.id, false)}>
                👎 Not Helpful
              </Button>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};
```

### 2. User Profile Management

```tsx
const ProfileScreen = () => {
  const { profile, metrics, addSkinConcern, getPersonalizationProgress } =
    useUserProfile();

  const progress = getPersonalizationProgress(); // 0-100

  return (
    <View>
      <Text>Learning Progress: {progress}%</Text>

      {/* Skin Concerns */}
      <Text>Your Concerns:</Text>
      {profile?.preferences.skinConcerns.map((concern) => (
        <Chip key={concern}>{concern}</Chip>
      ))}

      <Button onPress={() => addSkinConcern("Mụn trứng cá")}>
        Add Concern
      </Button>

      {/* Metrics */}
      <Text>Total Chats: {metrics?.totalInteractions}</Text>
      <Text>Feedback Score: {(metrics?.feedbackScore * 100).toFixed(0)}%</Text>

      {/* Top Topics */}
      <Text>Topics You Care About:</Text>
      {metrics?.topTopics.map(({ topic, count }) => (
        <Text key={topic}>
          {topic}: {count} lần
        </Text>
      ))}
    </View>
  );
};
```

### 3. Response Detail Level

```tsx
const SettingsScreen = () => {
  const { setResponseDetailLevel } = useUserProfile();

  return (
    <Picker
      selectedValue={profile?.preferences.responseDetailLevel}
      onValueChange={setResponseDetailLevel}
    >
      <Picker.Item label="Brief (Ngắn gọn)" value="brief" />
      <Picker.Item label="Moderate (Vừa phải)" value="moderate" />
      <Picker.Item label="Detailed (Chi tiết)" value="detailed" />
    </Picker>
  );
};
```

---

## 📊 Firestore Structure

```
users/
  {uid}/
    chatHistory/                    # Chat messages
      {messageId}/
        sender: "user" | "bot"
        text: string
        timestamp: Timestamp
        sources?: RagSource[]
        imageUrl?: string
        feedback?: "helpful" | "not_helpful"
        topic?: string               # NEW
        keywords?: string[]          # NEW

    profile/                        # User profile
      personalization/
        preferences: {
          skinConcerns: string[]
          avoidIngredients: string[]
          responseDetailLevel: string
        }
        conversationPattern: {
          topicFrequency: Record<string, number>
          recentTopics: string[]
          commonKeywords: string[]
          totalConversations: number
        }
        learningData: {
          feedbackHistory: MessageFeedback[]
          corrections: Correction[]
          successfulContexts: Context[]
        }
```

---

## 🎯 Learning Flow

### 1. **Conversation Tracking**

```typescript
User: "Tôi bị mụn trứng cá nhiều"
↓
// Auto-extract:
keywords: ["mụn", "trứng cá", "acne"]
topic: "acne_treatment"
↓
// Save to profile:
topicFrequency["acne_treatment"]++
recentTopics.push("acne_treatment")
commonKeywords.push(...keywords)
```

### 2. **Feedback Learning**

```typescript
User clicks 👍 on bot response
↓
// Save feedback
feedbackHistory.push({
  messageId,
  rating: "helpful",
  timestamp
})
↓
// Mark as successful context
successfulContexts.push({
  query: "Tôi bị mụn trứng cá",
  context: "acne_treatment",
  response: "Bot's helpful response..."
})
```

### 3. **Personalization Context**

```typescript
// Khi user chat, build context:
const context = {
  userId: "abc123",
  recentTopics: ["acne_treatment", "sunscreen"],
  skinConcerns: ["Mụn trứng cá", "Da nhạy cảm"],
  avoidIngredients: ["Alcohol", "Fragrance"],
  responseDetailLevel: "detailed",
};

// Send to backend (TODO: backend cần nhận context này)
await chat(message, history, imageBase64, context);
```

---

## 🔮 Future Enhancements

### Phase 1 (Current)

- ✅ Track conversation patterns
- ✅ Save feedback
- ✅ Build user profile
- ✅ Auto-extract keywords & topics

### Phase 2 (Next)

- [ ] Backend integration - Send personalization context
- [ ] AI-powered topic detection (more accurate)
- [ ] Smart suggestions based on history
- [ ] Ingredient database integration

### Phase 3 (Future)

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Export/import profile
- [ ] Personalized product recommendations

---

## 💡 Tips for Best Results

1. **Encourage Feedback**
   - Add "Was this helpful?" after each bot response
   - Explain how feedback improves responses

2. **Onboarding**
   - Ask users to set skin concerns during first chat
   - Show personalization progress

3. **Privacy**
   - All data is user-specific (Firestore security rules)
   - Only logged-in users have personalization

4. **Performance**
   - Profile loaded once on mount
   - Use debouncing for tracking updates

---

## 🔧 Configuration

### Adjust Learning Sensitivity

In `userPersonalization.service.ts`:

```typescript
// Track only after N keywords found
if (keywords.length >= 3) {
  await trackConversationTopic(topic, keywords);
}

// Limit recent topics
const recentTopics = [...].slice(0, 10); // Keep last 10

// Adjust keyword extraction
const skincareKeywords = [
  // Add more keywords for better detection
];
```

### Backend Integration (TODO)

```typescript
// In chatbot.service.ts
export const chat = async (
  text: string,
  history: ChatMessage[] = [],
  imageBase64?: string,
  personalizationContext?: PersonalizationContext // ADD THIS
) => {
  const payload = {
    text,
    history,
    image,
    context: personalizationContext, // Send to backend
  };

  // Backend can use context to:
  // - Filter RAG sources based on user concerns
  // - Adjust response tone (brief/detailed)
  // - Prioritize relevant topics
};
```

---

## 📖 Example Use Cases

### Use Case 1: Personalized Skincare Advice

```typescript
// User profile:
skinConcerns: ["Mụn trứng cá", "Da dầu"];
avoidIngredients: ["Alcohol"];

// User asks: "Gợi ý sản phẩm cho tôi"
// Bot response considers:
// ✅ Focus on acne + oily skin products
// ✅ Exclude products with alcohol
// ✅ Reference previous successful recommendations
```

### Use Case 2: Learning from Corrections

```typescript
User: "BHA là gì?";
Bot: "BHA là Beta Hydroxy Acid...";

User: "Tôi muốn biết thêm về cách dùng";
// Save as clarification
await saveUserCorrection("BHA là gì?", "Muốn biết cách sử dụng BHA cụ thể");

// Next time: Bot will provide usage info upfront
```

### Use Case 3: Progressive Learning

```
Week 1: User asks about acne (5 times)
  → topicFrequency["acne_treatment"] = 5

Week 2: Bot prioritizes acne-related sources in RAG
  → Higher relevance for acne topics

Week 3: User gives positive feedback
  → Bot learns which response style works best
```

---

## 🎓 Testing

```typescript
// Test profile creation
const profile = await getUserProfile();
console.log(profile?.preferences);

// Test tracking
await trackConversationTopic("acne_treatment", ["mụn", "acne"]);

// Test feedback
await saveMessageFeedback({
  messageId: "msg-123",
  rating: "helpful",
  timestamp: Date.now(),
});

// Test metrics
const metrics = await getPersonalizationMetrics();
console.log(metrics.topTopics);
```

---

## 🙋 FAQ

**Q: Có cần login để dùng personalization không?**
A: Không bắt buộc. Guest users vẫn chat được, nhưng không có personalization. Logged-in users mới có learning & persistence.

**Q: Data được lưu ở đâu?**
A: Firestore, structure: `users/{uid}/profile/personalization`

**Q: Backend có cần thay đổi không?**
A: Hiện tại chưa bắt buộc. Personalization hoạt động ở client-side. Để optimize hơn, backend nên nhận `PersonalizationContext`.

**Q: Performance ảnh hưởng không?**
A: Minimal. Profile load once, tracking là async background tasks.

---

🎉 **Hệ thống đã sẵn sàng! Chatbot giờ có thể học và cá nhân hóa cho từng user!**
