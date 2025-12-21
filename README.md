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

**DermaScan AI** is a comprehensive skin analysis mobile application combining React Native frontend with Node.js/Express backend powered by Google Gemini 2.5 AI.

### Core Features

- 🤖 **AI-Powered Analysis** - Gemini 2.5 Flash analyzes skin images with personalized recommendations
- 💬 **Intelligent Chatbot** - RAG-based Q&A system for skincare advice
- 🔐 **Secure Authentication** - Email/password + Facebook OAuth with Firebase
- 📊 **Analysis History** - Save and track skin analysis over time
- ☁️ **Cloud-Based** - Real-time data sync via Firestore

### Tech Stack

| Component      | Technology                                   |
| -------------- | -------------------------------------------- |
| **Backend**    | Node.js 18+, TypeScript 5.3, Express 4.x     |
| **AI Model**   | Google Gemini 2.5 Flash                      |
| **Mobile**     | React Native (Expo ~54), TypeScript          |
| **Styling**    | NativeWind (Tailwind CSS for React Native)   |
| **Database**   | Firebase Firestore + Authentication          |
| **API**        | RESTful with Axios + automatic token refresh |
| **Validation** | Zod schemas for request/response validation  |
| **Logging**    | Winston (backend), console (mobile)          |

### Project Structure

```
dermascan/
├── .github/
│   ├── AUTHENTICATION.md      # Auth flows, states, email verification
│   ├── DEVELOPMENT.md         # Development workflows & debugging
│   └── copilot-instructions.md # Architectural patterns & conventions
│
├── backend/
│   ├── src/
│   │   ├── config/            # Firebase, ENV, logging setup
│   │   ├── controllers/       # Route handlers with asyncHandler wrapper
│   │   ├── services/gemini/   # AI services (analysis, chatbot, RAG)
│   │   ├── middlewares/       # Auth, validation, error handling, rate limiting
│   │   ├── routes/            # API endpoint definitions
│   │   ├── schemas/           # Zod schemas for validation
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # Helpers (error classes, response formatting)
│   └── logs/                  # Winston logs (combined.log, error.log)
│
├── mobile/
│   ├── app/
│   │   ├── (auth)/            # Login, Register, Email Verification screens
│   │   ├── (tabs)/            # Main app (Home, Chatbot, Analysis, Account)
│   │   └── global.css         # TailwindCSS global styles
│   ├── api/
│   │   ├── client.ts          # Axios with Firebase token interceptor
│   │   └── services/          # API wrappers (auth, analysis, chatbot)
│   ├── components/            # Reusable UI (auth, chatbot, analysis, common)
│   ├── contexts/              # React Context (Auth, Analysis)
│   ├── hooks/                 # Custom hooks (useAuth, useAnalysis, useChatbot, etc)
│   ├── services/              # Firebase services (chat history, personalization)
│   ├── types/                 # TypeScript types (api.types, firebase.types)
│   └── config/                # Firebase configuration
│
└── README.md (this file)
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Git**
- **Firebase account** (free tier works)
- **Google Gemini API key** (free tier available)
- **(Optional) Android Studio or Xcode** for emulators

### 1️⃣ Backend Setup (5 min)

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials:
# GEMINI_API_KEY=sk-xxx (from Google AI Studio)
# FIREBASE_PROJECT_ID=your-project
# FIREBASE_PRIVATE_KEY=xxx
# FIREBASE_CLIENT_EMAIL=xxx@iam.gserviceaccount.com
# CORS_ORIGIN=http://localhost:5000

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### 2️⃣ Mobile Setup (5 min)

```bash
cd mobile
npm install

# Create .env file
echo 'EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_ENABLE_DEBUG_LOGS=true' > .env

# Start development
npx expo start

# Then press:
# 'a' for Android emulator
# 'i' for iOS simulator
# 'w' for web preview
```

### ✅ Verify Installation

- Backend API responds: `curl http://localhost:5000/api/v1/health` (if health endpoint exists)
- Mobile loads and shows login screen
- Try guest mode → see home page and chatbot

---

## 🔐 Authentication

### User States & Routes

| State          | User   | Email Verified | Access Level     | Default Route          |
| -------------- | ------ | -------------- | ---------------- | ---------------------- |
| **Guest**      | `null` | -              | Browse (limited) | `/` (any screen)       |
| **Registered** | ✓      | ❌             | Very limited     | `/(auth)/verify-email` |
| **Verified**   | ✓      | ✓              | Full access      | `/(tabs)/index`        |
| **Facebook**   | ✓      | ✓ (auto)       | Full access      | `/(tabs)/index`        |

### Registration Flow (Email/Password)

```
1. User fills registration form
   ↓ Email, Password (min 6 chars), Display Name

2. Firebase creates account (emailVerified=false)
   ↓ Verification email sent automatically

3. User redirected to verify-email screen with options:
   ├─ Click email verification link → Account verified
   ├─ Click "Gửi lại Email" → Resend (60s cooldown)
   └─ Click "Để sau" → Logout to guest mode

4. App polls every 3 seconds for verification status
   ↓ When verified → Auto-redirect to home

5. On next login → App checks emailVerified status
   ├─ If verified → Direct access to app
   └─ If not → Redirect to verify screen
```

### Facebook OAuth Flow

```
1. User clicks "Login with Facebook"
   ↓ Firebase Facebook OAuth dialog

2. User approves permissions
   ↓ Firebase exchanges token

3. User profile created/updated in Firestore
   ↓ emailVerified automatically set to true

4. Direct access to main app (no verify step needed)
```

### What Can Guests Do?

✅ View home page  
✅ Use chatbot  
✅ Try skin analysis (results not saved)  
✅ View about screens  
❌ Cannot save analysis history  
❌ Cannot access profile  
❌ Cannot persist preferences

See [.github/AUTHENTICATION.md](.github/AUTHENTICATION.md) for detailed auth implementation.

---

## 👨‍💻 Development

### Backend Development

```bash
cd backend

# Scripts
npm run dev          # Hot reload with tsx watch
npm run build        # TypeScript → JavaScript
npm start            # Production mode
npm run lint:fix     # ESLint auto-fix

# Logs
tail -f logs/combined.log     # Watch all logs
cat logs/error.log            # View errors only
```

**Key Patterns:**

```typescript
// ✅ Controllers - Always use asyncHandler
import { asyncHandler } from "@/utils/asyncHandler";

export const analyzeImage = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body; // Already validated by schema
    const result = await analysisService.analyze(body);
    return successResponse(res, result, "Analysis complete");
  }
);

// ✅ Services - Use Zod for validation
import { AnalysisResultSchema } from "../schemas";

const gemini = getGeminiClient().getGenerativeModel({
  model: "gemini-2.5-flash",
});

const response = await gemini.generateContent(prompt);
const parsed = AnalysisResultSchema.parse(JSON.parse(response.text()));
```

**Directory Guide:**

- `src/config/` - Firebase, environment, logging configuration
- `src/controllers/` - Request handlers (wrap with `asyncHandler`)
- `src/services/gemini/` - AI logic, prompts, schemas, RAG implementation
- `src/middlewares/` - Auth verification, request validation, error handling
- `src/routes/` - API endpoint definitions
- `src/schemas/` - Zod request/response validation
- `src/utils/` - Error classes, response formatting, helpers

### Mobile Development

```bash
cd mobile

# Start development server
npx expo start

# Run on emulators
npm run android       # Launch Android Studio first
npm run ios          # macOS only
npm run web          # Web preview in browser

# Build for production
eas build --platform android
eas build --platform ios
```

**Key Patterns:**

```typescript
// ✅ Auth Context - Always use useAuth hook
import { useAuth } from "@/contexts/AuthContext";

export const MyComponent = () => {
  const { user, login, logout } = useAuth();

  if (!user) return <GuestUI />;
  return <AuthenticatedUI />;
};

// ✅ API Calls - Use service layer
import { analyzeSkin } from "@/api/services/analysis.service";

const { data } = await analyzeSkin(base64Image, options);
// Token automatically attached & refreshed

// ✅ Custom Hooks - Encapsulate workflows
export const useAnalysis = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async (imageUri: string) => {
    const base64 = await convertToBase64(imageUri);
    const data = await analyzeSkin(base64);
    setResult(data);
  };

  return { result, loading, analyze };
};
```

**Directory Guide:**

- `app/` - Expo Router file-based routing structure
- `api/services/` - API wrappers for backend calls
- `components/` - Reusable UI components (auth, chatbot, analysis)
- `contexts/` - React Context (Auth, Analysis state)
- `hooks/` - Custom hooks for complex logic
- `services/` - Firebase services (chat history, personalization)
- `types/` - TypeScript types (sync with backend)

See [.github/DEVELOPMENT.md](.github/DEVELOPMENT.md) for detailed workflows.

---

## 📡 API Reference

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

All endpoints (except `/auth/register`, `/auth/login`) require Firebase ID token:

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

Mobile app automatically:

- ✅ Attaches token to all requests
- ✅ Refreshes token on 401 response
- ✅ Retries failed requests with fresh token

### Core Endpoints

**Analysis:**

- `POST /analysis/skin` - Analyze skin image, get AI recommendations
- `GET /analysis/history` - Get user's past analyses

**Chatbot:**

- `POST /chatbot/message` - Send message, get RAG-based response
- `GET /chatbot/history` - Get conversation history

**User:**

- `POST /auth/register` - Create account with email/password
- `POST /auth/login` - Login (returns user + verification status)
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

### Response Format

**Success (200, 201):**

```json
{
  "success": true,
  "data": { "id": "...", "result": "..." },
  "message": "Operation completed successfully"
}
```

**Error (400, 401, 403, 500):**

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

---

## 📱 Mobile Features

### Core Screens

**Authentication (`app/(auth)/`):**

- `login.tsx` - Email/password + Facebook login
- `register.tsx` - Create new account form
- `verify-email.tsx` - Email verification with polling + resend

**Main App (`app/(tabs)/`):**

- `index.tsx` - Home page (welcome + quick actions)
- `chatbot.tsx` - AI chatbot interface with chat history
- `analysis.tsx` - Skin analysis with camera picker
- `account.tsx` - User profile + settings

### Key Hooks

```typescript
// Authentication
const { user, loading, login, register, logout } = useAuth();

// Skin Analysis
const { analysisResult, isAnalyzing, analyze } = useAnalysis();

// Chatbot
const { messages, loading, sendMessage } = useChatbot();

// Image Selection
const { pickImage, image } = useImagePicker();

// Chat History
const { history, saveMessage, loadHistory } = useAccountHistory();

// Personalization
const { trackTopic, savePreferences } = useUserProfile();
```

### Key Components

**Common:**

- `ScreenHeader` - Reusable screen header
- `Button` - Styled action button
- `Input` - Text input with validation

**Authentication:**

- `LoginForm` - Email/password form
- `RegisterForm` - Registration form
- `VerificationScreen` - Email verification UI

**Chatbot:**

- `ChatComposer` - Message input area
- `MessageBubble` - Message display with sources
- `TypingIndicator` - Animated "bot typing" indicator

**Analysis:**

- `ImagePicker` - Camera/gallery selector
- `ResultCard` - Analysis results display
- `RecommendationsSection` - Skincare suggestions

---

## 🚀 Deployment

### Backend Deployment

**To Render/Railway/Heroku/Vercel:**

1. Set environment variables on platform dashboard:

   ```
   GEMINI_API_KEY=sk-...
   FIREBASE_PROJECT_ID=your-project
   FIREBASE_PRIVATE_KEY=...
   FIREBASE_CLIENT_EMAIL=...
   NODE_ENV=production
   CORS_ORIGIN=https://your-app.com
   ```

2. Platform automatically runs:

   ```bash
   npm install
   npm run build
   npm start
   ```

3. Configure Firestore security rules:
   ```
   match /databases/{database}/documents {
     match /users/{uid} {
       allow read, write: if request.auth.uid == uid;
     }
   }
   ```

### Mobile Deployment

**To App Store (iOS):**

```bash
eas login
eas build --platform ios
eas submit --platform ios
```

**To Play Store (Android):**

```bash
eas login
eas build --platform android
eas submit --platform android
```

See EAS documentation for full build configuration details.

---

## 🐛 Troubleshooting

### Backend Issues

| Issue                            | Solution                                                      |
| -------------------------------- | ------------------------------------------------------------- |
| `Firebase initialization failed` | Check `.env` credentials, ensure JSON private key is valid    |
| `CORS error from mobile`         | Verify `CORS_ORIGIN` in `.env` matches mobile API URL         |
| `AI response parsing failed`     | Check Gemini API key, review response in logs                 |
| `Rate limit exceeded`            | Wait 15 minutes or adjust `RATE_LIMIT_MAX_REQUESTS` in `.env` |
| `Port 5000 already in use`       | Kill process: `lsof -i :5000` or change PORT in `.env`        |

### Mobile Issues

| Issue                              | Solution                                                             |
| ---------------------------------- | -------------------------------------------------------------------- |
| `API 401 Unauthorized`             | Token expired (auto-refresh happens). Check Auth Context in DevTools |
| `Cannot connect to backend`        | Verify `EXPO_PUBLIC_API_URL` in `.env` matches backend URL           |
| `Firebase init error`              | Check `firebase.config.ts` credentials match Firebase Console        |
| `Image upload too large`           | Compress to <10MB or adjust backend limit                            |
| `Email verification not detecting` | Check polling interval, try manual refresh (Ctrl+R)                  |

### Authentication Issues

| Issue                         | Solution                                                       |
| ----------------------------- | -------------------------------------------------------------- |
| `Cannot login after register` | Must verify email first OR click "Để sau" to continue as guest |
| `Password too weak`           | Firebase requires minimum 6 characters                         |
| `Email already in use`        | Use different email or use password reset                      |
| `Facebook login fails`        | Check Facebook App ID in `mobile/config/firebase.config.ts`    |
| `Session lost after reload`   | Check Firebase persistence in `AuthContext.tsx`                |

---

### Project READMEs

- **Backend:** [backend/README.md](backend/README.md)
- **Mobile:** [mobile/README.md](mobile/README.md)
- **Facebook Auth Setup:** [mobile/FACEBOOK_AUTH_SETUP.md](mobile/FACEBOOK_AUTH_SETUP.md)
- **Personalization:** [mobile/PERSONALIZATION_GUIDE.md](mobile/PERSONALIZATION_GUIDE.md)

---

## 🤝 Contributing

1. Read [.github/copilot-instructions.md](.github/copilot-instructions.md) for architectural patterns
2. Follow existing code conventions (asyncHandler, Zod schemas, successResponse)
3. Write tests for backend services
4. Update TypeScript types when API changes
5. Test on both Android and iOS emulators

---

## 📄 License & Contact

**DermaScan AI** - Intelligent Skin Analysis Platform  
Built with ❤️ using TypeScript, React Native, Node.js, Firebase, and Google Gemini

For bug reports, feature requests, or contributions → Open a GitHub issue
#
