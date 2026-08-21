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

### Local Testing
```bash
# Terminal 1: API proxy (required for chatbot)
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
- Types inferred from JSON imports in `/database`

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
- Env vars: `process.env.STUDY_BUDDY_KEY`

---

## Common Tasks

### Adding a New Page
1. Create `src/pages/<role>/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add to role's dashboard `navItems` in `AppShell`
4. Import icon from `lucide-react`

### Modifying Data
Edit JSON in `src/database/` - no migrations needed.

### Chatbot Changes
- Frontend logic: `src/Chatbot/chatService.ts`
- Proxy logic: `api/index.js`
- System prompt: `src/Chatbot/systemprompt.txt`
- Test both local (2 terminals) and production (Vercel)

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
| Data | `src/database/*.json` |
| Config | `vite.config.ts`, `tailwind.config.js`, `tsconfig*.json`, `vercel.json` |

---

## When Uncertain

1. Check existing implementation in similar files
2. Read the relevant `.md` documentation
3. Run `npm run build` to verify
4. Test locally with both terminals for chatbot changes
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
```