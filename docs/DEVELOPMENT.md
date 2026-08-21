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

## Common Issues

| Issue | Fix |
|-------|-----|
| "Failed to fetch" in chat | Start API proxy (Terminal 1) |
| "API key not configured" | Set `STUDY_BUDDY_KEY` in Terminal 1 |
| Port 5174 in use | Change port in `start-api.cjs` and `chatService.ts` |
| TypeScript errors | Run `npm run build` to see full output |
| Stale data | Restart both terminals after JSON changes |

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

## Modifying Data

Edit JSON files in `src/database/` - changes reflect on next build/dev restart.

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