# Agent Instructions

This file provides guidance for AI agents working on the SmartEd-us repository.

## Repository Overview

**SmartEd** - AI-powered education platform for students, faculty, and institutes.
- Stack: React 18 + TypeScript + Vite + Tailwind CSS + React Router
- Deployment: Vercel (static + serverless functions)
- AI: Google Gemini API via serverless proxy

## Key Files for Context

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick start |
| `ARCHITECTURE.md` | System design, data flow, security |
| `DEVELOPMENT.md` | Local setup, testing, common issues |
| `DEPLOYMENT.md` | Vercel deployment, env vars, key rotation |
| `ROUTES.md` | All application routes by role |
| `CHATBOT.md` | StudyBuddy integration, proxy fallback |
| `DATA_MODELS.md` | JSON schemas in `/database` |
| `ENVIRONMENT.md` | Complete environment variable reference |

---

## Development Workflow

### Before Making Changes
1. Read relevant `.md` files for context
2. Run `npm run build` to verify current state compiles
3. Understand the fallback chain for chatbot (direct → proxy → mock)
4. Understand Socratic Engine flow (trigger → session → questions → evaluation → report)

### Local Testing
```bash
# Terminal 1: API proxy (required for chatbot + socratic)
cd SmartEd-us
STUDY_BUDDY_KEY=$VITE_STUDY_BUDDY_KEY node start-api.cjs

# Terminal 2: Frontend
npm run dev

# Verify build
npm run build
```

### Code Conventions

#### TypeScript
- Strict mode enabled (`tsconfig.json`)
- Use `import.meta.env.VITE_*` for client env vars
- Types inferred from JSON imports in `database/`

#### React
- Functional components with hooks
- `lucide-react` for icons
- `react-router-dom` for routing

#### Styling (Tailwind + Custom)
- Design system in `src/index.css`:
  - `.liquid-glass` - primary container
  - `.glass` / `.glass-tight` - variants
  - `.section-heading` / `.section-subtitle` - typography
  - `.feature-pill` / `.accent-tag` - UI elements
- Animations: `.fade-slide-up`, `.pop-in`, `.tooltip-in`
- Dark theme only (`color-scheme: dark`)

#### API (Vercel Serverless)
- `api/index.js` - CommonJS (`.cjs` entry point)
- Export Express app: `module.exports = app`
- CORS enabled via `cors()` middleware
- Env vars: `process.env.STUDY_BUDDY_KEY` (shared by StudyBuddy + Socratic)

---

## Common Tasks

### Adding a New Page
1. Create `src/pages/<role>/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add to role's dashboard `navItems` in `AppShell`
4. Import icon from `lucide-react`

### Modifying Data
Edit JSON in `database/` - no migrations needed.

### Chatbot Changes
- Frontend logic: `src/Chatbot/chatService.ts`
- Proxy logic: `api/index.js`
- System prompt: `src/Chatbot/systemprompt.txt`
- Test both local (2 terminals) and production (Vercel)

### Socratic Engine Changes
- **Frontend Logic**: `src/lib/socraticService.ts`, `src/hooks/useSocraticSession.ts`
- **Components**: `src/components/socratic/*.tsx`
- **Proxy Logic**: `api/index.js` (socratic handlers)
- **Core Engine**: `src/components/socratic/SocraticEngine.tsx`
- **Types**: `src/types/socratic.ts`
- **Data**: `database/topicProgress.json`, `database/defenderSessions.json`
- **Test Both**: Local (2 terminals) + Vercel production

### Adding Environment Variables
1. Add to `ENVIRONMENT.md` table
2. Prefix with `VITE_` for client exposure
3. Set in Vercel Dashboard
4. Update `.env.local` for local dev

---

## Critical Rules

### Security
- **NEVER commit API keys** - use Vercel env vars
- **Rotate keys** if exposed in git history (old key in commit `66244bc`)
- Use **Auth keys** from Google AI Studio (not Standard)
- Restrict keys to **Generative Language API only**

### Deployment
- Vercel auto-deploys on push to main
- Preview deployments for PRs
- Both `VITE_STUDY_BUDDY_KEY` and `STUDY_BUDDY_KEY` required in Vercel

### Git Hygiene
- Don't commit `node_modules/`, `dist/`, `.env.local`, `.vite/`
- `.gitignore` already configured
- Force-push only with team coordination

---

## Troubleshooting Checklist

| Problem | First Check |
|---------|-------------|
| Build fails | `npm run build` locally; check TypeScript errors |
| Chatbot returns mock | Proxy running? `STUDY_BUDDY_KEY` set? |
| 401 from Gemini | Key valid in Google AI Studio? |
| CORS error | Proxy deployed? Same-origin? |
| Route 404 on refresh | `vercel.json` rewrites configured? |
| Stale data | Restart dev server after JSON changes |
| Defender not triggering | `topicProgress.json` masteryScore > 75? `/api/socratic/check-trigger` working? |
| Video lessons not loading | `videoLessons.json` format? `/api/video-lessons` endpoint? |
| Session not resuming | localStorage `socraticSession`? `/api/socratic/resume/:sessionId`? |

---

## File Ownership Map

| Area | Primary Files |
|------|---------------|
| Landing/Auth | `src/pages/LandingPage.tsx`, `RegisterPage.tsx`, `src/lib/auth.ts` |
| Student Dashboard | `src/pages/student/StudentDashboard.tsx`, `StudentPractice.tsx` |
| Faculty Dashboard | `src/pages/faculty/FacultyDashboard.tsx` |
| Institute Dashboard | `src/pages/institute/InstituteOverview.tsx` |
| Layout/Shell | `src/components/AppShell.tsx`, `Sidebar.tsx` |
| Chatbot | `src/Chatbot/*.tsx`, `api/index.js`, `start-api.cjs` |
| **Socratic Engine** | `src/components/socratic/*.tsx`, `src/lib/socraticService.ts`, `src/hooks/useSocraticSession.ts`, `src/types/socratic.ts`, `api/index.js` (socratic handlers) |
| **Socratic Data** | `database/topicProgress.json`, `database/defenderSessions.json`, `database/videoLessons.json`, `database/topicTaxonomy.json` |
| Data | `database/*.json` |
| Config | `vite.config.ts`, `tailwind.config.js`, `tsconfig*.json`, `vercel.json` |

---

## Socratic Engine Specifics

### Trigger Logic
- **Enrichment Mode** (default): Triggers when topic mastery **exceeds 75**
- **Remediation Mode**: Triggers when topic mastery **drops below threshold** (configurable per institute)
- Checked via `useDefenderTrigger` hook after each answer submission in `StudentPractice.tsx`

### Session Flow
```
1. Trigger detected → POST /api/socratic/start-session
2. Session created → localStorage.setItem('socraticSession', sessionId)
3. DefenderModal opens → ChallengeSequence renders
4. For each question:
   - GET /api/socratic/next-question (or first from start-session)
   - Student writes defense
   - POST /api/socratic/evaluate-response
   - Confidence calculated → continue or complete
5. POST /api/socratic/complete-session
6. Report generated → mastery updated → topicProgress updated
7. DefenderReport shown → "Continue Practice" closes modal
```

### Resume Capability
- `localStorage.setItem('socraticSession', sessionId)` on session start
- On page load: `useSocraticSession` checks localStorage → calls `/api/socratic/resume/:sessionId`
- Restores question index, previous answers, timer state

### Skip / Force Exit
- **Skip**: POST `/api/socratic/skip-question` → applies penalty (-3 default) → next question
- **Force Exit**: POST `/api/socratic/force-exit` → applies penalty (-8 default) → partial report

### Dynamic Question Progression
- Levels: Easy → Medium → Hard → Expert
- Stop criteria: `avgConfidence >= 0.75` AND `questions.length >= minQuestions`
- Hard cap: `maxQuestions` (default 6)
- Institute configurable via `institutes.json.defenderSettings`

### Mastery Delta Calculation
- Per question: `understood=+5`, `partial=0`, `misunderstood=-8` × confidence
- Penalties: skip=-3, forceExit=-8
- Clamped: -20 to +20 per session
- Applied to `masteryRecords.json` and `topicProgress.json` per concept tag

### Report Generation
- Gaps identified from `misunderstood` + low-confidence `partial` questions
- Videos matched by exact tag match against `videoLessons.json`
- Problems pulled from `problems.json` filtered by `remediationPool`/`enrichmentPool` + level
- Badge awarded: "Deep Understanding" if all `understood` with high confidence

---

## When Uncertain

1. Check existing implementation in similar files
2. Read the relevant `.md` documentation
3. Run `npm run build` to verify
4. Test locally with both terminals for chatbot/socratic changes
5. Ask for clarification on architecture decisions

---

## Useful Commands

```bash
# Install all deps
npm install && cd api && npm install

# Full build verification
npm run build

# Type check only
npx tsc --noEmit

# Preview production build
npm run preview

# Check Vercel deployment
vercel logs <deployment-url> --follow

# Test Socratic endpoints locally
curl -X POST http://localhost:5174/api/socratic/check-trigger \
  -H "Content-Type: application/json" \
  -d '{"studentId":"student-1","topic":"Algebra"}'

curl -X POST http://localhost:5174/api/socratic/start-session \
  -H "Content-Type: application/json" \
  -d '{"studentId":"student-1","topic":"Algebra","triggerType":"auto"}'
```

---

## Phase 1 Implementation Checklist (Data Foundation)

When starting implementation, verify these are created/updated:

- [ ] `database/problems.json` - Add `remediationPool`, `remediationLevel`, `enrichmentPool`, `enrichmentLevel`, `socraticPrompt`
- [ ] `database/institutes.json` - Add `defenderSettings` object
- [ ] `database/topicProgress.json` - Create with per-student per-topic structure
- [ ] `database/topicTaxonomy.json` - Create 3-level hierarchy
- [ ] `database/videoLessons.json` - Create with 30-400 YouTube videos
- [ ] `database/defenderSessions.json` - Create empty object `{}`
- [ ] `database/masteryRecords.json` - Verify structure matches expected

Then proceed to Phase 2 (Core Engine).