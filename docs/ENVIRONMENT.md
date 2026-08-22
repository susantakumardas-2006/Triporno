# Environment Variables Reference

## Complete Variable Table

| Variable | Required | Scope | Used By | Description |
|----------|----------|-------|---------|-------------|
| `VITE_STUDY_BUDDY_KEY` | **Yes** | Frontend (Vite) | `chatService.ts`, `socraticService.ts` | Gemini API key for direct browser calls (CORS blocked, falls back to proxy) |
| `STUDY_BUDDY_KEY` | **Yes** | API (Vercel) | `api/index.js` | Gemini API key for serverless proxy (StudyBuddy + Socratic Engine) |
| `VITE_STUDY_BUDDY_URL` | No | Frontend (Vite) | `chatService.ts`, `socraticService.ts` | Custom proxy base URL (e.g., `https://custom-proxy.com`) |

---

## Variable Details

### VITE_STUDY_BUDDY_KEY
- **Prefix**: `VITE_` (required for Vite to expose to client bundle)
- **Value**: Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- **Format**: `AQ.Ab8RN6IuxiXRxXIE1n86FWzMdK7A4Ti_rBI7SPsmv54e0Y6J9g` (Auth key) or restricted Standard key
- **Used in**: `src/Chatbot/chatService.ts` line 32, `src/lib/socraticService.ts`
- **Build-time**: Embedded in JS bundle via `import.meta.env.VITE_STUDY_BUDDY_KEY`
- **Security**: Visible in client bundle - **must be restricted key**

### STUDY_BUDDY_KEY
- **No prefix** (server-only)
- **Value**: Same Gemini API key as above
- **Used in**: `api/index.js` (`process.env.STUDY_BUDDY_KEY`)
- **Runtime**: Injected by Vercel into serverless function environment
- **Security**: Never exposed to client - can use less restricted key (but recommend same restricted key)
- **Shared by**: StudyBuddy (`/api/studybuddy`) + Socratic Engine (`/api/socratic/*`)

### VITE_STUDY_BUDDY_URL (Optional)
- **Prefix**: `VITE_` (client-exposed)
- **Value**: Full URL to custom proxy (without trailing slash)
- **Example**: `https://my-proxy.example.com`
- **Used in**: `chatService.ts`, `socraticService.ts` - prepended to API paths
- **Purpose**: Override default proxy locations for custom deployments

---

## Environment-Specific Values

### Local Development (`.env.local`)
```env
# .env.local (in .gitignore - never commit)
VITE_STUDY_BUDDY_KEY=AQ.Ab8RN6IuxiXRxXIE1n86FWzMdK7A4Ti_rBI7SPsmv54e0Y6J9g
```

**Terminal 1 (API Proxy):**
```bash
export STUDY_BUDDY_KEY=AQ.Ab8RN6IuxiXRxXIE1n86FWzMdK7A4Ti_rBI7SPsmv54e0Y6J9g
node start-api.cjs
```

### Vercel Production
Set in **Vercel Dashboard → Settings → Environment Variables**:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_STUDY_BUDDY_KEY` | `AQ.Ab8RN6IuxiXRxXIE1n86FWzMdK7A4Ti_rBI7SPsmv54e0Y6J9g` | Production, Preview, Development |
| `STUDY_BUDDY_KEY` | `AQ.Ab8RN6IuxiXRxXIE1n86FWzMdK7A4Ti_rBI7SPsmv54e0Y6J9g` | Production, Preview, Development |

### Vercel Preview Deployments
- Automatically inherit Production env vars
- Can override per-preview in Vercel Dashboard

---

## Key Security Notes

### 1. **Never commit keys to git**
- `.env.local` is in `.gitignore`
- Old key `AQ.Ab8RN6Ls5Qedx...` is in git history (commit `66244bc`) - **MUST ROTATE**

### 2. **Use Auth Keys (Recommended)**
From [Google AI Studio](https://aistudio.google.com/apikey):
- Click **Create API key** → creates **Auth key** (bound to service account)
- Format: `AQ.Ab8RN...` (same as Standard but more secure)
- Auth keys: granular permissions, fast leak detection, no expiration

### 3. **If using Standard Keys - Restrict Them**
In Google AI Studio → API Keys:
- Hover "Unrestricted" label → **Add restrictions** → **Restrict to Gemini API only**
- Or in Google Cloud Console: API restrictions → Select only "Generative Language API"

### 4. **Key Rotation Procedure**
1. Create new key in Google AI Studio
2. Update Vercel env vars (both `VITE_STUDY_BUDDY_KEY` and `STUDY_BUDDY_KEY`)
3. Update local `.env.local`
4. Update Terminal 1 export
5. Verify: `/api/health` returns `keyPresent: true`
6. Revoke old key in Google AI Studio

---

## Verification Commands

### Local
```bash
# Check frontend env loaded
npm run dev
# Open browser console: import.meta.env.VITE_STUDY_BUDDY_KEY

# Check proxy env loaded
STUDY_BUDDY_KEY=xxx node start-api.cjs
# Visit http://localhost:5174/api/health
```

### Production (Vercel)
```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health
# Expected: {"ok":true,"keyPresent":true,"keyType":"apiKey"}

# Test chat proxy
curl -X POST https://your-app.vercel.app/api/studybuddy \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
# Expected: {"content":"AI response...","structured":null}

# Test Socratic trigger check
curl -X POST https://your-app.vercel.app/api/socratic/check-trigger \
  -H "Content-Type: application/json" \
  -d '{"studentId":"student-1","topic":"Algebra"}'
# Expected: {"shouldTrigger":true,"reason":"mastery_threshold_exceeded","sessionId":"..."}

# Test video lessons
curl "https://your-app.vercel.app/api/video-lessons?topic=Math&concept=Quadratic%20Equations"
# Expected: {"videos":[...]}
```

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| `import.meta.env.VITE_STUDY_BUDDY_KEY` undefined | Restart dev server after `.env.local` change; verify `VITE_` prefix |
| `process.env.STUDY_BUDDY_KEY` undefined in Vercel | Set in Vercel Dashboard → Environment Variables → Redeploy |
| "API key not configured on server" | `STUDY_BUDDY_KEY` missing in Vercel; `api.txt` deleted locally |
| 401 from Gemini | Key revoked/expired; rotate in Google AI Studio |
| Chat works locally but not prod | `STUDY_BUDDY_KEY` missing in Vercel Production env |
| CORS error in prod | Should not happen - proxy is same-origin; check `api/index.js` deployed |
| Defender not triggering | Check `topicProgress.json` masteryScore > 75; verify `/api/socratic/check-trigger` |
| Video lessons not loading | Check `videoLessons.json` format; verify `/api/video-lessons` endpoint |
| Session not resuming | Check localStorage `socraticSession`; verify `/api/socratic/resume/:sessionId` |

---

## Quick Reference: Where Each Key Goes

```
┌─────────────────────────────────────────────────────────────────┐
│                      GOOGLE AI STUDIO                           │
│                  Create/Revoke API Keys                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   VERCEL DASHBOARD      │     │     LOCAL .env.local    │
│   Settings → Env Vars   │     │     (gitignored)        │
├─────────────────────────┤     ├─────────────────────────┤
│ VITE_STUDY_BUDDY_KEY    │     │ VITE_STUDY_BUDDY_KEY    │
│ STUDY_BUDDY_KEY         │     │                         │
│ (same value)            │     │ Terminal 1:             │
│                         │     │ STUDY_BUDDY_KEY=xxx     │
│ Environments: All       │     │ node start-api.cjs      │
└───────────┬─────────────┘     └─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│      DEPLOYMENT         │
├─────────────────────────┤
│ Frontend bundle gets    │
│ VITE_STUDY_BUDDY_KEY    │
│                         │
│ Serverless function     │
│ gets STUDY_BUDDY_KEY    │
│                         │
│ Shared by:              │
│ - /api/studybuddy       │
│ - /api/socratic/*       │
│ - /api/video-lessons    │
└─────────────────────────┘
```

## Socratic Engine Endpoints Using STUDY_BUDDY_KEY

All endpoints in `api/index.js` use the same `STUDY_BUDDY_KEY`:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/studybuddy` | StudyBuddy chat |
| `POST /api/socratic/check-trigger` | Check if defender should fire |
| `POST /api/socratic/start-session` | Initialize defender/test session |
| `POST /api/socratic/next-question` | Get next adaptive question |
| `POST /api/socratic/evaluate-response` | Evaluate student defense |
| `POST /api/socratic/complete-session` | Complete session + generate report |
| `POST /api/socratic/skip-question` | Skip question with penalty |
| `POST /api/socratic/force-exit` | Force exit with penalty |
| `GET /api/socratic/resume/:sessionId` | Resume interrupted session |
| `GET /api/video-lessons` | Query video library by tags |
| `GET /api/health` | Health check + key status |