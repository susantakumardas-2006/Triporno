# Deployment Guide

## Vercel Deployment

### 1. Connect Repository

1. Push to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New...** → **Project**
4. Import your GitHub repo
5. Framework Preset: **Vite** (auto-detected)
6. Build Command: `npm run build` (from `package.json`)
7. Output Directory: `dist` (auto-detected)
8. Install Command: `npm install`

### 2. Environment Variables

Go to **Settings** → **Environment Variables** and add:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_STUDY_BUDDY_KEY` | Your Gemini API key (from Google AI Studio) | Production, Preview, Development |
| `STUDY_BUDDY_KEY` | Same Gemini API key | Production, Preview, Development |

**Important**: Both keys are required.
- `VITE_STUDY_BUDDY_KEY` → embedded in frontend bundle (Vite exposes `VITE_*` vars)
- `STUDY_BUDDY_KEY` → used by serverless functions at `/api/studybuddy` and `/api/socratic/*`

### 3. Deploy

Click **Deploy**. Vercel will:
1. Run `npm install`
2. Run `npm run build` (TypeScript + Vite)
3. Deploy `dist/` as static assets
4. Deploy `api/index.js` as serverless function at `/api/studybuddy`, `/api/health`, `/api/socratic/*`, `/api/video-lessons`

### 4. Verify

After deployment:
1. Visit your Vercel URL
2. Login with demo credentials
3. Open StudyBuddy chat (bottom-left)
4. Send a message → should get AI response
5. Check `/api/health` → should return `{ "ok": true, "keyPresent": true, "keyType": "apiKey" }`
6. Test Socratic: Complete 5+ problems in a topic with mastery > 75 → Defender should trigger

## Vercel Configuration

`vercel.json` in root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

The rewrite handles SPA routing (React Router).

## Environment Variable Reference

### Required for Production

| Variable | Used By | Description |
|----------|---------|-------------|
| `VITE_STUDY_BUDDY_KEY` | Frontend (`chatService.ts`, `socraticService.ts`) | Gemini API key for direct calls (falls back to proxy) |
| `STUDY_BUDDY_KEY` | API (`api/index.js`) | Gemini API key for serverless proxy (StudyBuddy + Socratic) |

### Optional

| Variable | Used By | Description |
|----------|---------|-------------|
| `VITE_STUDY_BUDDY_URL` | Frontend | Custom proxy URL (if not using Vercel's `/api`) |

## Key Rotation (Critical)

**The previous API key is in git history (commit `66244bc`). You MUST rotate it:**

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Revoke the old key (`AQ.Ab8RN6Ls5Qedx...`)
3. Create new **Auth key** (recommended) or restricted Standard key
4. Update both Vercel env vars with new key
5. Update local `.env.local` with new key
6. Redeploy (Vercel auto-redeploys on env var change)

## Preview Deployments

Every push to a branch creates a **Preview Deployment** with its own URL. Env vars apply to Preview too.

## Production Checklist

- [ ] Both env vars set in Vercel (Production + Preview)
- [ ] Old API key revoked in Google AI Studio
- [ ] New key tested locally with proxy
- [ ] `npm run build` passes locally
- [ ] Chatbot works on production URL
- [ ] `/api/health` returns `keyPresent: true`
- [ ] Socratic Defender triggers at mastery > 75
- [ ] Test Yourself page loads and functions
- [ ] `/api/video-lessons?topic=Math` returns videos
- [ ] Session resume works after browser refresh

## Socratic Engine Deployment Notes

### New Serverless Endpoints
The `api/index.js` now handles multiple endpoints:
- `/api/studybuddy` - StudyBuddy chat
- `/api/socratic/check-trigger` - Defender trigger check
- `/api/socratic/start-session` - Initialize session
- `/api/socratic/next-question` - Get next question
- `/api/socratic/evaluate-response` - Evaluate defense
- `/api/socratic/complete-session` - Complete & generate report
- `/api/socratic/skip-question` - Skip with penalty
- `/api/socratic/force-exit` - Force exit with penalty
- `/api/socratic/resume/:sessionId` - Resume session
- `/api/video-lessons` - Video library queries
- `/api/health` - Health check

All share the same `STUDY_BUDDY_KEY`.

### Data Files
The following JSON files are read at runtime (not build time):
- `database/topicProgress.json` - Updated per session
- `database/defenderSessions.json` - Append-only log
- `database/videoLessons.json` - Read-only (can be large)
- `database/topicTaxonomy.json` - Read-only

**Note**: For production scale, consider moving these to a database (Vercel KV, PostgreSQL, etc.)

### Function Timeout
Socratic endpoints may need longer timeout (default 10s, max 60s on Pro). Add to `vercel.json` if needed:
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Vercel build logs; ensure `npm run build` works locally |
| Chatbot returns mock response | Check `STUDY_BUDDY_KEY` is set in Vercel; check function logs |
| 401 from Gemini | Key invalid/revoked; rotate in Google AI Studio |
| CORS errors | Should not happen - proxy is same-origin; check `api/index.js` deployed |
| SPA routes 404 | Verify `vercel.json` rewrites; check `outputDirectory: dist` |
| Defender not triggering | Check `topicProgress.json` updates; verify mastery > 75 logic |
| Video lessons not loading | Check `videoLessons.json` format; verify `/api/video-lessons` endpoint |

## Manual Redeploy

In Vercel Dashboard → Deployments → click **Redeploy** on latest production deployment.

## Rollback

Vercel Dashboard → Deployments → click **Promote to Production** on any previous deployment.