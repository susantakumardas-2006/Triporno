# Development Guide

## Prerequisites

- Node.js 18+
- npm 9+
- Google AI Studio account (for Gemini API key)

## Setup

```bash
# Clone and install
git clone <repo-url>
cd SmartEd-us
npm install
cd api && npm install
cd ..

# Create local env file (not committed)
cat > .env.local << 'EOF'
VITE_STUDY_BUDDY_KEY=your_gemini_api_key_here
EOF
```

## Running Locally

### Two-Terminal Development

**Terminal 1 - API Proxy (port 5174)**
```bash
cd SmartEd-us
STUDY_BUDDY_KEY=your_gemini_key node start-api.cjs
# Output: "StudyBuddy running on http://localhost:5174"
```

**Terminal 2 - Frontend (port 5173)**
```bash
cd SmartEd-us
npm run dev
# Output: "Local: http://localhost:5173"
```

### Why Two Terminals?

The frontend tries to call Gemini directly from the browser → **blocked by CORS**. It falls back to `/api/studybuddy` which requires a local server. In production, Vercel handles this automatically via serverless functions.

The same proxy now serves both StudyBuddy (`/api/studybuddy`) and Socratic Engine (`/api/socratic/*`) endpoints.

### Single Terminal Alternative

Use `concurrently` (install: `npm i -D concurrently`):

```json
// package.json scripts
"dev": "concurrently \"npm run dev:api\" \"npm run dev:frontend\"",
"dev:api": "STUDY_BUDDY_KEY=$VITE_STUDY_BUDDY_KEY node start-api.cjs",
"dev:frontend": "vite"
```

## Environment Variables

### Local (`.env.local`)
```env
VITE_STUDY_BUDDY_KEY=your_gemini_key
```

### API Proxy (Terminal 1)
```bash
export STUDY_BUDDY_KEY=your_gemini_key
# or inline:
STUDY_BUDDY_KEY=your_gemini_key node start-api.cjs
```

## Testing the Chatbot

1. Open `http://localhost:5173`
2. Login as any role (demo creds shown on landing page)
3. Click the floating **StudyBuddy** button (bottom-left)
4. Send a message
5. Check browser console for:
   - `Direct Gemini API failed, falling back to proxy:` (expected)
   - `StudyBuddy proxy fetch failed for /api/studybuddy` (if proxy not running)
   - Response from proxy

## Testing Socratic Engine

### Defender Trigger (Auto)
1. Login as student
2. Go to Practice Arena
3. Solve problems in a topic until mastery > 75 (check StudentDashboard)
4. Submit an answer → Defender modal should appear
6. Complete the challenge sequence
7. Verify mastery updates in StudentDashboard

### Test Yourself (Manual)
1. Navigate to `/app/student/test-yourself`
2. Select one or more topics
3. Click "Start Assessment"
4. Complete adaptive questions
5. View report with gaps, videos, recommended problems

### Session Resume
1. Start a Defender session
2. Refresh browser mid-session
3. Should prompt "Resume previous session?"
4. Continue from last question

### API Testing
```bash
# Check trigger
curl -X POST http://localhost:5174/api/socratic/check-trigger \
  -H "Content-Type: application/json" \
  -d '{"studentId":"student-1","topic":"Algebra"}'

# Start session
curl -X POST http://localhost:5174/api/socratic/start-session \
  -H "Content-Type: application/json" \
  -d '{"studentId":"student-1","topic":"Algebra","triggerType":"auto"}'

# Health check
curl http://localhost:5174/api/health
```

## Common Issues

| Issue | Fix |
|-------|-----|
| "Failed to fetch" in chat | Start API proxy (Terminal 1) |
| "API key not configured" | Set `STUDY_BUDDY_KEY` in Terminal 1 |
| Port 5174 in use | Change port in `start-api.cjs` and `chatService.ts` |
| TypeScript errors | Run `npm run build` to see full output |
| Stale data | Restart both terminals after JSON changes |
| Defender not triggering | Check `topicProgress.json` masteryScore > 75 |
| Video lessons not loading | Verify `videoLessons.json` format; check `/api/video-lessons` |

## Project Commands

```bash
# Development
npm run dev              # Frontend only (needs proxy running)
npm run build            # TypeScript + Vite production build
npm run preview          # Preview production build locally

# API
cd api && npm install    # Install API dependencies
node ../start-api.cjs    # Run proxy server

# Lint/Typecheck (if configured)
npm run lint
npm run typecheck
```

## Adding New Pages

1. Create component in `src/pages/<role>/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add nav item in the role's dashboard (uses `AppShell` + `navItems`)
4. Import icons from `lucide-react`

### New Socratic Pages
| Route | Component | Purpose |
|-------|-----------|---------|
| `/app/student/test-yourself` | `TestYourself.tsx` | Voluntary self-assessment |
| `/app/faculty/socratic-insights` | `FacultySocraticInsights.tsx` | Class misconceptions dashboard |

## Modifying Data

Edit JSON files in `database/` (root level) - changes reflect on next build/dev restart.

### Key Files for Socratic Engine
| File | Purpose |
|------|---------|
| `database/problems.json` | Add `remediationPool`, `enrichmentPool`, `remediationLevel`, `enrichmentLevel` |
| `database/institutes.json` | Add `defenderSettings` |
| `database/topicProgress.json` | Auto-updated, tracks per-student per-topic |
| `database/topicTaxonomy.json` | 3-level hierarchy for topic picker |
| `database/videoLessons.json` | YouTube video library |
| `database/defenderSessions.json` | Session history (append-only) |

## Design System Usage

```tsx
// Glass containers
<div className="liquid-glass rounded-3xl p-6">Content</div>

// Section headings
<h1 className="text-4xl font-semibold section-heading">Title</h1>
<p className="section-subtitle">Subtitle</p>

// Feature pills
<div className="feature-pill">
  <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Label</p>
  <p className="mt-3 text-2xl font-semibold">Value</p>
</div>

// Accent tags
<span className="accent-tag">Tag</span>

// Buttons
<button className="bg-white text-black rounded-full px-6 py-2.5">Primary</button>
<button className="rounded-full border border-white/20 px-6 py-2.5">Secondary</button>
```

## Socratic Engine Components

### New Component Library (`src/components/socratic/`)
| Component | Purpose |
|-----------|---------|
| `SocraticEngine.tsx` | Core evaluation logic (shared) |
| `ChallengeSequence.tsx` | Dynamic question stepper |
| `DefenderModal.tsx` | Forced checkpoint modal |
| `TestYourselfPage.tsx` | Voluntary assessment page |
| `DefenderReport.tsx` | Results: gaps, videos, problems |
| `MasteryDeltaAnimation.tsx` | Real-time mastery update visual |
| `VideoRecommendationCard.tsx` | YouTube video suggestion |
| `ProblemRecommendationCard.tsx` | Adaptive problem suggestion |
| `SkipConfirmDialog.tsx` | Skip with penalty warning |
| `ForceExitDialog.tsx` | Exit confirmation |
| `TimerBar.tsx` | Toughness-based timer |

### New Hooks (`src/hooks/`)
| Hook | Purpose |
|------|---------|
| `useDefenderTrigger.ts` | Check trigger on submission |
| `useSocraticSession.ts` | Session state management |
| `useMasteryDelta.ts` | Real-time mastery updates |

### New Services (`src/lib/`)
| Service | Purpose |
|---------|---------|
| `socraticService.ts` | API client (generate, evaluate, complete) |
| `masteryCalculator.ts` | Mastery delta logic |
| `topicProgressTracker.ts` | Track solved per topic, trigger logic |
| `videoLibrary.ts` | YouTube video matching |
| `problemSelector.ts` | Remediation/enrichment pool filtering |