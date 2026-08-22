# StudyBuddy Chatbot Architecture

## Overview

StudyBuddy is an AI-powered learning assistant integrated as a floating chat widget. It uses **Google Gemini API** via a **serverless proxy** to avoid CORS issues and protect API keys.

## Components

### 1. ChatButton (`src/Chatbot/ChatButton.tsx`)
- Floating action button (bottom-left, fixed position)
- Opens/closes chat widget via React Portal (`#studybuddy-portal`)
- Renders `ChatWidget` when open

### 2. ChatWidget (`src/Chatbot/ChatWidget.tsx`)
- Full chat UI: message history, input, send button
- Typing indicator animation
- Markdown rendering for responses
- Structured response handling (for future features)

### 3. ChatService (`src/Chatbot/chatService.ts`)
- Core API client with **fallback chain**:
  1. **Direct Gemini API** (browser) → blocked by CORS
  2. **Same-origin proxy** (`/api/studybuddy`) → works on Vercel
  3. **Local dev proxy** (`http://localhost:5174/api/studybuddy`) → for development
  4. **Mock fallback** → "I hear you: ..." when all fail

## API Integration

### Gemini generateContent API (Current)

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
**Model**: `gemini-1.5-flash`
**Auth**: `x-goog-api-key` header + `key` query param

**Request**:
```json
{
  "contents": [
    {"role": "user", "parts": [{"text": "User message"}]}
  ],
  "systemInstruction": {"parts": [{"text": "System prompt from systemprompt.txt"}]},
  "generationConfig": {
    "temperature": 0.6,
    "maxOutputTokens": 2048
  }
}
```

**Response**:
```json
{
  "candidates": [{
    "content": {
      "parts": [{"text": "AI response here"}]
    }
  }]
}
```

### Proxy Server (`api/index.js`)

Vercel serverless function at `/api/studybuddy`:

```javascript
// POST /api/studybuddy
// Body: { messages: ChatMessage[] }
// Env: STUDY_BUDDY_KEY (Gemini API key)
// Response: { content: string, structured?: any }
```

**Flow**:
1. Receives messages from frontend
2. Reads `STUDY_BUDDY_KEY` from env (or falls back to deleted `api.txt`)
3. Calls Gemini generateContent API server-side (no CORS)
4. Parses response, extracts text from `candidates[0].content.parts[0].text`
5. Returns JSON to frontend

### Health Endpoint (`/api/health`)
```json
{
  "ok": true,
  "keyPresent": true,
  "keyType": "apiKey"
}
```

## Fallback Chain Detail

```typescript
// In chatService.ts:sendMessage()

if (envKey) {
  try {
    // 1. Direct call (browser)
    return await callGemini(messages, envKey);
  } catch (e) {
    // CORS error → fall through to proxy
    console.warn('Direct Gemini API failed, falling back to proxy');
  }
}

// 2. Try proxy URLs in order:
const tryUrls = [
  VITE_STUDY_BUDDY_URL + '/api/studybuddy',  // Custom proxy (if configured)
  '/api/studybuddy',                          // Same-origin (Vercel)
  'http://localhost:5174/api/studybuddy'      // Local dev (DEV only)
];

for (const url of tryUrls) {
  try {
    const res = await fetch(url, { method: 'POST', body: JSON.stringify({ messages }) });
    if (res.ok) return await res.json();
  } catch (e) { /* try next */ }
}

// 3. Mock fallback
return { text: `I hear you: "${userMessage}". Can you tell me what you've tried so far?` };
```

## Local Development

**Requires two terminals:**

```bash
# Terminal 1: API Proxy (port 5174)
STUDY_BUDDY_KEY=your_key node start-api.cjs

# Terminal 2: Frontend (port 5173)
npm run dev
```

**Why?** Browser blocks direct Gemini calls (CORS). Proxy runs on different port → frontend calls `http://localhost:5174/api/studybuddy` (allowed in DEV mode).

## Production (Vercel)

- Frontend: Static assets at `https://your-app.vercel.app`
- Proxy: Serverless function at `https://your-app.vercel.app/api/studybuddy`
- Same-origin → no CORS issues
- `STUDY_BUDDY_KEY` from Vercel env vars

## Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `VITE_STUDY_BUDDY_KEY` | Frontend (Vite) | Direct API calls (fallback) |
| `STUDY_BUDDY_KEY` | API (Vercel) | Proxy serverless function |
| `VITE_STUDY_BUDDY_URL` | Frontend (optional) | Custom proxy base URL |

## System Prompt

Loaded from `src/Chatbot/systemprompt.txt` at build time via Vite `?raw` import. Defines StudyBuddy's persona as a learning coach.

## Adding Structured Responses

The proxy supports structured JSON responses for rich UI:

```javascript
// In api/index.js - if response matches schema:
{
  "title": "...",
  "subtitle": "...",
  "language": "...",
  "bodyMarkdown": "...",
  "bullets": [...],
  "metadata": {...}
}
```

Frontend receives `{ content: string, structured: object }` and can render rich cards.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Failed to fetch" | Proxy not running locally | Start `node start-api.cjs` |
| Mock response only | All fallbacks failed | Check proxy logs, verify key |
| 401 from Gemini | Invalid/revoked key | Rotate in Google AI Studio |
| CORS error in prod | Should not happen | Verify `api/index.js` deployed |
| Key not found | Env var missing | Set `STUDY_BUDDY_KEY` in Vercel |

## Key Files

| File | Purpose |
|------|---------|
| `src/Chatbot/ChatButton.tsx` | Floating trigger |
| `src/Chatbot/ChatWidget.tsx` | Chat UI |
| `src/Chatbot/chatService.ts` | API client + fallback logic |
| `src/Chatbot/systemprompt.txt` | System prompt |
| `api/index.js` | Vercel serverless proxy (StudyBuddy + Socratic) |
| `api/socratic.js` | Socratic Engine endpoints |
| `start-api.cjs` | Local proxy entry point |

## Socratic Engine Integration

The same `api/index.js` proxy now serves both StudyBuddy and Socratic Engine endpoints. The `STUDY_BUDDY_KEY` is shared.

### Shared Proxy Pattern
```javascript
// api/index.js routes:
app.post('/api/studybuddy', studyBuddyHandler);
app.post('/api/socratic/*', socraticHandler);
app.get('/api/video-lessons', videoLibraryHandler);
app.get('/api/health', healthHandler);
```

### Socratic-Specific Env Vars
| Variable | Location | Purpose |
|----------|----------|---------|
| `STUDY_BUDDY_KEY` | API (Vercel) | Shared key for both StudyBuddy + Socratic |
| `VITE_STUDY_BUDDY_KEY` | Frontend (Vite) | Direct calls fallback for both |