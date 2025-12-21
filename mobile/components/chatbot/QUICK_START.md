# ⚡ Quick Start - Chatbot Upgrade

## 1️⃣ Activate New Chatbot (30 seconds)

```bash
cd mobile/app/(tabs)

# Backup old version
mv chatbot.tsx chatbot-backup.tsx

# Activate new version
mv chatbot-new.tsx chatbot.tsx

# Done! Restart app
```

## 2️⃣ Verify Installation

Open chatbot tab, you should see:

- ✅ Header with menu icon (☰) and settings (⚙️)
- ✅ "Cuộc trò chuyện mới" button in sidebar
- ✅ Settings panel to toggle skin analysis
- ✅ Suggested questions on empty state

## 3️⃣ Test Features

### Create & Manage Conversations

1. Tap **☰ menu** → Opens sidebar
2. Tap **"Tạo cuộc trò chuyện mới"**
3. Send a message → Saves to Firestore
4. **Long-press** on conversation → Rename/Delete

### Enable Skin Analysis Integration

1. Analyze skin at least once (to get data)
2. Open chatbot → Tap **⚙️ settings**
3. Toggle **"Sử dụng dữ liệu phân tích da"** → ON
4. Send message → Bot knows your skin condition! 🎯

## 4️⃣ Troubleshooting

### "Không có phiên trò chuyện"

- Auto-fixed by ChatContext
- Should create default session on mount

### Skin analysis toggle disabled

- Need to analyze skin first
- Check AnalysisContext has data

### Messages not saving

- Check Firebase rules allow writes to `users/{uid}/chatSessions`

## 📱 UI Preview

```
┌─────────────────────────────────┐
│ ☰  DermaScan AI         ⚙️       │ ← Header
│    Sẵn sàng trợ giúp            │
│                                 │
│  ┌─ Settings (collapsible)     │
│  │ ☑ Sử dụng dữ liệu da        │
│  │ ✓ Loại da: Dầu              │
│  └─────────────────────────    │
├─────────────────────────────────┤
│                                 │
│     💬 Welcome message          │
│     Suggested questions         │
│                                 │
│  [User message]           11:23 │
│                                 │
│  [Bot reply]              11:23 │
│  📚 Nguồn tham khảo:            │
│                                 │
├─────────────────────────────────┤
│ [Type message...]         [➤]  │ ← Input
└─────────────────────────────────┘
```

## 🎯 Key Shortcuts

- **☰** → Open sidebar
- **⚙️** → Toggle settings
- **Long-press conversation** → More options
- **Tap conversation** → Switch to it

---

**🚀 You're all set! Enjoy the new chatbot experience.**
