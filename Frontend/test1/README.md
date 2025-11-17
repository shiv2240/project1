# Multi-AI Orchestration Frontend (React)

This is a front-end reference implementation for a multi-AI orchestration pattern:
Manager-AI mediates user requests and dispatches subtasks to two hidden sub-agents (Frontend-AI and Backend-AI). Only Manager responses are shown.

## Features
- Model selection screen (choose provider for each role)
- Editable system prompts (for Manager/Frontend/Backend)
- Chat workspace where all messages go through Manager
- Client-side orchestration pipeline (mocked provider adapters)
- Clear extension points to replace mocks with real provider SDK calls

## How to run
1. `npm install`
2. `npm run start` (uses Vite)

## Integration notes
- `src/api/providerAdapters.js` contains `callProviderMock`. Replace with real API calls to:
  - ChatGPT (OpenAI)
  - Gemini (Google)
  - Perplexity
- Security: Do **not** call provider keys directly from client production code. Route calls through a secure backend.

## Where to customize
- Manager decomposition: adjust `buildManagerPrompt` in `src/utils/schema.js` to control the Manager's output format.
- Provider adapter: implement provider-specific code in `src/api/providerAdapters.js`.
- Persist conversation: integrate a backend to store user messages and Manager-only transcripts.

