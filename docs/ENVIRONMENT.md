# Environment Variables Reference

## Complete Variable Table

| Variable | Required | Scope | Used By | Description |
|----------|----------|-------|---------|-------------|
| `VITE_STUDY_BUDDY_KEY` | **Yes** | Frontend (Vite) | `chatService.ts` | Gemini API key for direct browser calls (CORS blocked, falls back to proxy) |
| `STUDY_BUDDY_KEY` | **Yes** | API (Vercel) | `api/index.js` | Gemini API key for serverless proxy `/api/studybuddy` |
| `VITE_STUDY_BUDDY_URL` | No | Frontend (Vite) | `chatService.ts` | Custom proxy base URL (e.g., `https://custom-proxy.com`) |

---

## Variable Details

### VITE_STUDY_BUDDY_KEY
- **Prefix**: `VITE_` (required for Vite to expose to client bundle)
- **Value**: Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- **Format**: `AQ.Ab8RN6IuxiXRxXIE1n86FWzMdK7A4Ti_rBI7SPsmv54e0Y6J9g` (Auth key) or restricted Standard key
- **Used in**: `src/Chatbot/chatService.ts` line 32
- **Build-time**: Embedded in JS bundle via `import.meta.env.VITE_STUDY_BUDDY_KEY`
- **Security**: Visible in client bundle - **must be restricted key**

### STUDY_BUDDY_KEY
- **No prefix** (server-only)
- **Value**: Same Gemini API key as above
- **Used in**: `api/index.js` line 66 (`process.env.STUDY_BUDDY_KEY`)
- **Runtime**: Injected by Vercel into serverless function environment
- **Security**: Never exposed to client - can use less restricted key (but recommend same restricted key)

### VITE_STUDY_BUDDY_URL (Optional)
- **Prefix**: `VITE_` (client-exposed)
- **Value**: Full URL to custom proxy (without trailing slash)
- **Example**: `https://my-proxy.example.com`
- **Used in**: `chatService.ts` line 51 - prepended to `/api/studybuddy`
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
└─────────────────────────┘
```