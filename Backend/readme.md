# Multi-AI Orchestrator Backend

Node.js + Express backend for a multi-agent AI orchestration playground.  
It supports:

- **Three AI providers**: OpenAI (ChatGPT), Google Gemini, Perplexity
- **User authentication** (JWT)
- **Multi-chat system** per user (like ChatGPT / Gemini):  
  - Create multiple conversations  
  - Rename and delete chats  
  - Persist all messages in MongoDB  
- **Rate limiting** to protect your API keys
- **MongoDB** as the main datastore for users and conversations

This backend is designed to be consumed by your React frontend “Multi-AI Orchestration” UI.

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (access token)
- **Security / Ops:**
  - `express-rate-limit`
  - `cors`
  - Environment configuration via `dotenv`
- **AI Providers:**
  - OpenAI Chat Completions API (`gpt-4o-mini`)
  - Google Gemini (`gemini-2.5-*` family)
  - Perplexity (`sonar` model)

MongoDB is a good fit here because:

- chat messages are naturally document-ish,
- conversations can be stored as embedded arrays,
- schema is flexible for future metadata (provider, cost, tokens, etc.).

---

## Project Structure

```text
backend/
├─ server.js
└─ src
   ├─ app.js
   ├─ config
   │  └─ db.js
   ├─ controllers
   │  ├─ aiController.js
   │  ├─ authController.js
   │  └─ chatController.js
   ├─ middleware
   │  ├─ auth.js
   │  └─ rateLimiter.js
   ├─ models
   │  ├─ Conversation.js
   │  └─ User.js
   └─ routes
      ├─ aiRoutes.js
      ├─ authRoutes.js
      └─ chatRoutes.js
