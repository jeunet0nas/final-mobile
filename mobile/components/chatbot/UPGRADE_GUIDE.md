# Chatbot System - Hướng Dẫn Sử Dụng

## 🎯 Tính Năng Mới

### 1. **Quản lý nhiều cuộc trò chuyện (Multi-Conversation)**

- ✅ Tạo nhiều cuộc trò chuyện độc lập
- ✅ Chuyển đổi giữa các cuộc trò chuyện
- ✅ Đổi tên cuộc trò chuyện
- ✅ Xóa cuộc trò chuyện không cần thiết
- ✅ Tự động lưu lịch sử vào Firestore

### 2. **Tích hợp dữ liệu phân tích da**

- ✅ Chatbot đọc được kết quả phân tích da
- ✅ Tự động tư vấn dựa trên loại da và vấn đề phát hiện
- ✅ Bật/tắt tính năng này trong Settings
- ✅ Hiển thị thông tin da đang sử dụng

### 3. **UI/UX cải tiến**

- ✅ Sidebar ẩn/hiện để quản lý conversations
- ✅ Header với gradient đẹp mắt
- ✅ Settings panel gọn gàng
- ✅ Message bubbles với shadow và animation
- ✅ Suggested questions khi bắt đầu
- ✅ Loading states và error handling tốt hơn

## 📁 Cấu trúc File Mới

```
mobile/
├── contexts/
│   └── ChatContext.tsx              # ⭐ Context quản lý chat state
│
├── services/
│   └── chatHistory.service.ts        # ⭐ Cập nhật với session management
│
├── components/chatbot/
│   ├── ChatbotScreenNew.tsx          # ⭐ Screen chính mới
│   ├── ConversationSidebar.tsx       # ⭐ Sidebar quản lý conversations
│   ├── MessageBubble.tsx             # Component hiển thị tin nhắn
│   └── index.ts                      # Export tất cả components
│
└── app/
    ├── _layout.tsx                   # ⭐ Thêm ChatProvider
    └── (tabs)/
        ├── chatbot.tsx               # Screen cũ (giữ lại để backup)
        └── chatbot-new.tsx           # ⭐ Screen mới (thay thế)
```

## 🚀 Cách Sử Dụng

### Thay thế màn hình cũ

Đổi tên file trong `app/(tabs)/`:

```bash
# Backup file cũ
mv chatbot.tsx chatbot-old.tsx

# Sử dụng file mới
mv chatbot-new.tsx chatbot.tsx
```

### Hoặc test song song

Giữ nguyên và thêm route trong `_layout.tsx`:

```tsx
<Tabs.Screen
  name="chatbot-new"
  options={{
    title: "Chatbot (New)",
    tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" color={color} />,
  }}
/>
```

## 🎨 Tính Năng Chi Tiết

### 1. Sidebar Conversations

**Mở sidebar:**

- Nhấn vào icon menu (☰) ở header
- Hoặc swipe từ trái sang phải

**Các thao tác:**

- **Tạo mới:** Nhấn "Tạo cuộc trò chuyện mới"
- **Chuyển đổi:** Nhấn vào conversation muốn xem
- **Đổi tên:** Long-press → chọn "Đổi tên"
- **Xóa:** Long-press → chọn "Xóa" → xác nhận

### 2. Tích hợp phân tích da

**Bật/tắt:**

1. Nhấn icon settings (⚙️) ở header
2. Toggle switch "Sử dụng dữ liệu phân tích da"
3. Chỉ hoạt động khi có dữ liệu phân tích

**Cách hoạt động:**

```typescript
// Context tự động build từ AnalysisContext
const skinContext = `
[Thông tin phân tích da của người dùng]
Loại da: Dầu
Các vùng đã phân tích:
- Trán: Mụn đầu đen (Medium risk)
- Má trái: Da bình thường (Low risk)
Tổng quan: Da có xu hướng tiết dầu nhiều...

Hãy sử dụng thông tin này để đưa ra tư vấn phù hợp.
`;
```

Chatbot sẽ:

- ✅ Biết loại da của bạn
- ✅ Biết các vấn đề đang gặp phải
- ✅ Tư vấn sản phẩm phù hợp
- ✅ Đưa ra lời khuyên cá nhân hóa

### 3. Firestore Structure

```
users/
  {userId}/
    chatSessions/                    # ⭐ Collection mới
      {sessionId}/
        - title: string
        - lastMessage: string
        - createdAt: Timestamp
        - updatedAt: Timestamp
        - messageCount: number

        messages/                    # Subcollection
          {messageId}/
            - sender: "user" | "bot"
            - text: string
            - timestamp: Timestamp
            - sources?: RagSource[]
            - imageUrl?: string
```

## 🔧 API Integration

### ChatContext Methods

```typescript
const {
  // Current session
  currentSessionId,
  messages,

  // All sessions
  sessions,

  // Actions
  sendMessage,
  createNewSession,
  switchSession,
  deleteSession,
  renameSession,

  // Skin analysis integration
  includeSkinAnalysisContext,
  setIncludeSkinAnalysisContext,

  // Loading & errors
  isLoading,
  error,
  clearError,
} = useChat();
```

### Gửi tin nhắn

```typescript
// Tin nhắn text
await sendMessage("Da tôi bị khô, nên làm gì?");

// Tin nhắn có ảnh (tương lai)
await sendMessage("Đây là da của tôi", imageBase64);
```

### Quản lý sessions

```typescript
// Tạo mới
await createNewSession();

// Chuyển đổi
await switchSession(sessionId);

// Đổi tên
await renameSession(sessionId, "Tư vấn mụn");

// Xóa
await deleteSession(sessionId);
```

## 🎯 Workflow

```
1. User logs in
   ↓
2. ChatProvider loads all sessions from Firestore
   ↓
3. Auto-select most recent session (or create new)
   ↓
4. User sends message
   ↓
5. ChatContext checks if skin analysis context should be included
   ↓
6. Call chatbot API with history + context
   ↓
7. Save both user & bot messages to Firestore
   ↓
8. Update session metadata (lastMessage, updatedAt)
```

## 🐛 Troubleshooting

### Lỗi: "Không có phiên trò chuyện nào được chọn"

**Nguyên nhân:** `currentSessionId` null  
**Giải pháp:** Tự động được xử lý - tạo session mới

### Tin nhắn không lưu vào Firestore

**Nguyên nhân:** User chưa đăng nhập  
**Giải pháp:** Check `user` trong ChatContext

### Không tìm thấy dữ liệu phân tích da

**Nguyên nhân:** `analysisResult` null trong AnalysisContext  
**Giải pháp:** User cần phân tích da ít nhất 1 lần

## 📊 Performance Notes

- **Sessions loading:** Async, hiển thị loading indicator
- **Message history:** Load on demand khi switch session
- **Firestore writes:** Batch saves cho user + bot messages
- **Context cleanup:** Auto clear on logout

## 🚀 Future Enhancements

- [ ] Search trong conversations
- [ ] Export conversation history
- [ ] Voice input cho tin nhắn
- [ ] Image upload trong chat
- [ ] Reactions cho bot messages
- [ ] Sharing conversations
- [ ] Auto-generate conversation titles từ nội dung

---

**Note:** File `chatbot.tsx` cũ vẫn được giữ lại để backup. Sau khi test kỹ, có thể xóa file cũ.
