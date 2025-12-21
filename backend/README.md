# DermaScan Backend API

Backend API for DermaScan AI - Skin Analysis Mobile Application

## 🚀 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4.19
- **Language:** TypeScript 5.3
- **Database:** Firebase (Firestore + Auth + Storage)
- **AI:** Google Gemini 2.5
- **Cache:** Node-Cache (in-memory)

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with actual values
```

## 🔧 Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── types/            # TypeScript types & interfaces
│   ├── services/         # Business logic services
│   │   └── gemini/       # Gemini AI services
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── middlewares/      # Express middlewares
│   ├── utils/            # Utility functions
│   ├── constants/        # Constants & enums
│   └── app.ts            # Express app entry point
├── dist/                 # Compiled JavaScript
├── logs/                 # Application logs
├── tests/                # Unit & integration tests
└── package.json
```

## 🔐 Environment Variables

See `.env.example` for required environment variables.

## 📡 API Endpoints

### Base URL: `/api/v1`

#### Analysis
- `POST /analysis/scan` - Analyze skin image
- `POST /analysis/compare` - Compare two skin images

#### Skincare
- `POST /skincare/direction` - Get skincare direction
- `POST /skincare/routine` - Get personalized routine
- `POST /skincare/coaching` - Get AI coaching advice

#### Ingredient
- `POST /ingredient/analyze` - Analyze product ingredients

#### Knowledge Base
- `POST /knowledge/ask` - Ask RAG-based questions
- `GET /knowledge/condition/:name` - Get expert info

#### Chat
- `POST /chat/message` - Chat with AI assistant

## 🛡️ Security

- Helmet.js for security headers
- CORS configured for mobile app
- Rate limiting on all endpoints
- Firebase Authentication
- Input validation with Zod

## 📝 License

MIT
