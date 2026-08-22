# System Architecture

## Overview

SmartEd is a single-page application with serverless API functions for AI features. The frontend is deployed as static assets; the API runs as Vercel serverless functions.

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
                                   ┌──────────────────┐
                                   │  /api/socratic   │
                                   │  (Serverless)    │
                                   │  Socratic Engine │
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
            └─► Calls Gemini generateContent API
                    │
                    ▼
            Returns { content, structured? }
            │
            ▼
    Frontend renders response
```

### Socratic Engine (Defender + Test Yourself)
```
Student Answer Submitted
    │
    ▼
topicProgressTracker: Check mastery > 75 for topic
    │
    ▼ (if triggered)
POST /api/socratic/start-session
    │
    ▼
SocraticEngine: Generate adaptive question (easy→hard)
    │
    ▼
Student Defense → POST /api/socratic/evaluate-response
    │
    ▼
Confidence Check → Continue or Complete
    │
    ▼ (complete)
POST /api/socratic/complete-session
    │
    ▼
Generate Report: Gaps + Videos + Problems + Mastery Delta
    │
    ▼
Update: topicProgress.json + masteryRecords.json + defenderSessions.json
```

### Data Layer
- **Static JSON** in `/database` (no database server)
- Files: `students.json`, `faculty.json`, `institutes.json`, `problems.json`, `concepts.json`, `masteryRecords.json`, `submissions.json`, `homework.json`, `contests.json`, `discussions.json`, `projects.json`, `announcements.json`, `attendance.json`, `events.json`, `groups.json`, `joinRequests.json`, `studentRatings.json`, `subscriptions.json`
- **New Files**: `topicProgress.json`, `topicTaxonomy.json`, `videoLessons.json`, `defenderSessions.json`
- Loaded at build time via Vite `import` (or runtime for new files)
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
/app/student/*       → Student workspace (7 routes + Defender + Test Yourself)
/app/faculty/*       → Faculty workspace (3 routes + Socratic Insights)
/app/institute/*     → Institute workspace (3 routes)
*                    → Redirect to /
```

### New Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/app/student/test-yourself` | `TestYourself.tsx` | Voluntary self-assessment |
| `/app/faculty/socratic-insights` | `FacultySocraticInsights.tsx` | Class misconceptions dashboard |

### Defender Integration
- Triggered via modal from `StudentPractice.tsx` (not a separate route)
- Session state persisted in localStorage for resume capability

## API Routes (Vercel Serverless)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/studybuddy` | POST | Proxy to Gemini generateContent API |
| `/api/health` | GET | Health check + key status |
| `/api/socratic/check-trigger` | POST | Check if defender should fire |
| `/api/socratic/start-session` | POST | Initialize defender/test session |
| `/api/socratic/next-question` | POST | Get next adaptive question |
| `/api/socratic/evaluate-response` | POST | Evaluate student defense |
| `/api/socratic/complete-session` | POST | Generate report + update mastery |
| `/api/socratic/skip-question` | POST | Skip with penalty |
| `/api/socratic/force-exit` | POST | Exit with penalty |
| `/api/socratic/resume/:sessionId` | GET | Resume interrupted session |
| `/api/video-lessons` | GET | Query video library by tags |
| `/api/socratic/report/:sessionId` | GET | Fetch session report |

## Security

- **API keys**: Never in repo. Stored in Vercel env vars.
- **CORS**: Proxy avoids browser CORS restrictions.
- **Key rotation**: Old key in git history (commit `66244bc`) - must rotate.
- **Client-side**: No secrets in bundle (Vite only exposes `VITE_*` vars).
- **Session validation**: Server-side session ownership verification.