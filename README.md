# DermaScan AI - Complete Documentation

## 📚 Quick Navigation

- **[Project Overview](#project-overview)** - Architecture & tech stack
- **[Quick Start](#quick-start)** - Getting started in 5 minutes
- **[Authentication](#authentication)** - User auth flows & states
- **[Development](#development)** - Backend & mobile development
- **[API Reference](#api-reference)** - Backend endpoints
- **[Troubleshooting](#troubleshooting)** - Common issues & solutions
- **[Additional Resources](#additional-resources)** - Detailed guides

---

## 🎯 Project Overview

**DermaScan AI** là một ứng dụng di động phân tích da toàn diện, kết hợp frontend React Native với backend Node.js/Express, được vận hành bởi trí tuệ nhân tạo Google Gemini 2.5 AI.

### Core Features

- 🤖 **AI-Powered Analysis**: Gemini 2.5 Flash phân tích hình ảnh da và đưa ra các đề xuất cá nhân hóa.
- 💬 **Intelligent Chatbot**: Hệ thống hỏi đáp dựa trên RAG cho các lời khuyên chăm sóc da.
- 🔐 **Secure Authentication**: Xác thực qua Email/Password và Facebook OAuth với Firebase.
- 📊 **Analysis History**: Lưu trữ và theo dõi lịch sử phân tích da theo thời gian.
- ☁️ **Cloud-Based**: Đồng bộ dữ liệu thời gian thực qua Firestore.

### Tech Stack

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Backend** | Node.js 18+, TypeScript 5.3, Express 4.x |
| **AI Model** | Google Gemini 2.5 Flash |
| **Mobile** | React Native (Expo ~54), TypeScript |
| **Styling** | NativeWind (Tailwind CSS cho React Native) |
| **Database** | Firebase Firestore + Authentication |
| **API** | RESTful với Axios + tự động làm mới token |
| **Validation** | Zod schemas cho yêu cầu và phản hồi |
| **Logging** | Winston (backend), console (mobile) |

### Project Structure

```text
dermascan/
├── .github/
│   ├── AUTHENTICATION.md      # Luồng xác thực, trạng thái, xác minh email
│   ├── DEVELOPMENT.md         # Quy trình phát triển & gỡ lỗi
│   └── copilot-instructions.md # Quy ước kiến trúc & mẫu thiết kế
├── backend/
│   ├── src/
│   │   ├── config/            # Cấu hình Firebase, ENV, logging
│   │   ├── controllers/       # Xử lý route với asyncHandler wrapper
│   │   ├── services/gemini/   # Dịch vụ AI (phân tích, chatbot, RAG)
│   │   ├── middlewares/       # Auth, validation, error handling, rate limiting
│   │   ├── routes/            # Định nghĩa các API endpoints
│   │   ├── schemas/           # Zod schemas để validation
│   │   ├── types/             # Giao diện TypeScript
│   │   └── utils/             # Helpers (error classes, response formatting)
│   └── logs/                  # Winston logs (combined.log, error.log)
├── mobile/
│   ├── app/
│   │   ├── (auth)/            # Màn hình Login, Register, Verify Email
│   │   ├── (tabs)/            # App chính (Home, Chatbot, Analysis, Account)
│   │   └── global.css         # TailwindCSS global styles
│   ├── api/
│   │   ├── client.ts          # Axios với Firebase token interceptor
│   │   └── services/          # API wrappers (auth, phân tích, chatbot)
│   ├── components/            # UI dùng lại (auth, chatbot, analysis, common)
│   ├── contexts/              # React Context (Auth, Analysis)
│   ├── hooks/                 # Custom hooks (useAuth, useAnalysis, v.v.)
│   ├── services/              # Dịch vụ Firebase (chat history, personalization)
│   ├── types/                 # TypeScript types (api, firebase)
│   └── config/                # Cấu hình Firebase
└── README.md
