# Test Chatbot Connection

## ✅ Checklist

### 1. Backend Setup

```bash
cd backend
npm run dev
```

Backend phải chạy trên: `http://localhost:5000`

Kiểm tra health:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "dermascan-backend"
  }
}
```

### 2. Test Chatbot Endpoint

Test chatbot/chat:

```bash
curl -X POST http://localhost:5000/api/v1/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "BHA là gì?",
    "history": []
  }'
```

Expected response:

```json
{
  "success": true,
  "data": {
    "chatId": "req_xxx",
    "response": {
      "role": "model",
      "text": "BHA (Beta Hydroxy Acid) là...",
      "sources": [...]
    }
  }
}
```

### 3. Mobile Environment Setup

Check `.env` file in `mobile/`:

```env
# iOS Simulator
EXPO_PUBLIC_API_URL=http://localhost:5000

# Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000

# Physical Device (thay YOUR_IP bằng IP máy tính)
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:5000

# Debug logs
EXPO_PUBLIC_ENABLE_DEBUG_LOGS=true
```

Tìm IP máy tính (Windows):

```bash
ipconfig
# Tìm IPv4 Address của WiFi/Ethernet adapter
```

### 4. Run Mobile App

```bash
cd mobile
npx expo start
```

Options:

- `i` - iOS Simulator
- `a` - Android Emulator
- `Scan QR` - Physical device

### 5. Debug Logs

Trong mobile app, khi gửi message, check console:

**Success logs:**

```
[API Request] 🔐 Token attached (cached)
[API Request] POST /api/v1/chatbot/chat
[API Response] 200 OK
```

**Error logs:**

```
[Network Error] Failed to connect
[API Error] 401 Unauthorized
[API Error] 500 Internal Server Error
```

### 6. Common Issues

#### Issue: "Network Error - Không thể kết nối"

- ✅ Backend có chạy không? (`npm run dev` trong `backend/`)
- ✅ URL đúng chưa? (localhost cho simulator, 10.0.2.2 cho Android emulator)
- ✅ Firewall có block port 5000 không?

#### Issue: "401 Unauthorized"

- ✅ Firebase Auth có setup đúng không?
- ✅ Token có hết hạn không? (Auto refresh should handle this)

#### Issue: "GEMINI_API_ERROR"

- ✅ Check backend logs: `backend/logs/`
- ✅ GEMINI_API_KEY có trong `.env` không?
- ✅ API key còn quota không?

#### Issue: Response không có sources

- ✅ Backend có RAG knowledge base không?
- ✅ Gemini có return sources không? (check backend logs)

### 7. Manual Test Flow

1. Open Chatbot tab
2. Send "BHA là gì?"
3. Wait for response (should take 2-5 seconds)
4. Check if:
   - ✅ Response appears
   - ✅ Sources are clickable
   - ✅ Timestamp shows
   - ✅ Can send follow-up question

### 8. Test với History

Send multiple messages:

```
User: "Da tôi bị khô"
Bot: [Response về da khô]
User: "Tôi nên dùng sản phẩm gì?"
Bot: [Response dựa trên context về da khô]
```

History được gửi lên backend để maintain context.

### 9. Test Error Handling

1. Stop backend
2. Send message in mobile
3. Should see error: "❌ Xin lỗi, đã có lỗi xảy ra"
4. Click "🔄 Thử lại" button
5. Start backend, should work now

### 10. Performance Check

- First message: ~2-5s (cold start Gemini)
- Follow-up: ~1-3s
- With history: ~2-4s (more context to process)

Nếu > 10s → Check network/backend performance

---

## 📞 Troubleshooting

### Enable Debug Mode

In `mobile/.env`:

```env
EXPO_PUBLIC_ENABLE_DEBUG_LOGS=true
```

Restart Expo: `r` in terminal

### Backend Logs

Check: `backend/logs/combined.log`

Grep for errors:

```bash
cd backend
tail -f logs/combined.log | grep ERROR
```

### Network Inspector

Use React Native Debugger or Flipper to inspect API calls.

---

## ✨ Expected Behavior

✅ Bot responds in Vietnamese
✅ Medical/skincare questions get sources
✅ Follow-up questions maintain context
✅ Errors show retry button
✅ Clear chat button works
✅ Auto scroll to bottom
✅ Typing indicator while waiting
✅ Sources are clickable links
