# System Architecture

## Overview

SmartEd is a single-page application with a serverless API proxy for AI chat. The frontend is deployed as static assets; the API runs as Vercel serverless functions.

```
┌─────────────────┐     HTTPS      ┌──────────────────┐     HTTPS      ┌─────────────────┐
│   Browser       │ ─────────────► │   Vercel Edge    │ ─────────────► │  Gemini API     │
│   (React SPA)   │ ◄───────────── │   (Static +      │ ◄───────────── │  (Google AI     │
│                 │   Static files │    Serverless)   │   JSON/Stream  │   Studio)       │
└─────────────────┘                └──────────────────┘                └─────────────────┘
        │                                    │
        │ 1. Try direct (CORS fails)         │
        │ 2. Fallback to /api/studybuddy     │
        │                                    ▼
        │                          ┌──────────────────┐
        └─────────────────────────►│  /api/studybuddy │
                                   │  (Serverless)    │
                                   │  No CORS issues  │
                                   └──────────────────┘
```

## Data Flow

### Authentication
- **Landing page**: Role selection (Student/Faculty/Institute) + email/password
- **Demo credentials**: Hardcoded in `LandingPage.tsx` (reads from `/database/*.json`)
- **Session**: No JWT/cookies - role determines route access via `App.tsx` routes
- **Protected routes**: `/app/*` prefixes

### Chatbot (StudyBuddy)
```
User message
    │
    ▼
chatService.ts:sendMessage()
    │
    ├─► Try direct Gemini API (browser) ──► CORS blocked
    │
    └─► Fallback: POST /api/studybuddy
            │
            ▼
    api/index.js (Vercel serverless)
            │
            ├─► Reads STUDY_BUDDY_KEY from env
            │
            └─► Calls Gemini Interactions API
                    │
                    ▼
            Returns { content, structured? }
            │
            ▼
    Frontend renders response
```

### Data Layer
- **Static JSON** in `/database` (no database server)
- Files: `students.json`, `faculty.json`, `institutes.json`, `problems.json`, `concepts.json`, `masteryRecords.json`, `submissions.json`, `homework.json`
- Loaded at build time via Vite `import`
- In-memory filtering/sorting in components

## Design System

### Liquid Glass
CSS utilities in `src/index.css`:
- `.liquid-glass` - backdrop blur, semi-transparent border, gradient overlay
- `.glass` / `.glass-tight` - lighter variants
- Animations: `.fade-slide-up`, `.pop-in`, `.tooltip-in`

### Color Palette
- Background: `#050507` with subtle radial gradients
- Accent: `emerald-400` (`#34d399`)
- Text: `white`, `white/70`, `white/50`
- Borders: `white/10`, `white/20`

### Typography
- Headings: `Instrument Serif` (Google Font)
- Body: `Inter` (system font stack)

## Routing

```
/                    → LandingPage (login)
/auth/register       → RegisterPage
/app/student/*       → Student workspace (7 routes)
/app/faculty/*       → Faculty workspace (3 routes)
/app/institute/*     → Institute workspace (3 routes)
*                    → Redirect to /
```

## API Routes (Vercel Serverless)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/studybuddy` | POST | Proxy to Gemini Interactions API |
| `/api/health` | GET | Health check + key status |

## Security

- **API keys**: Never in repo. Stored in Vercel env vars.
- **CORS**: Proxy avoids browser CORS restrictions.
- **Key rotation**: Old key in git history (commit `66244bc`) - must rotate.
- **Client-side**: No secrets in bundle (Vite only exposes `VITE_*` vars).