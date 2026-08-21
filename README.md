# SmartEd

An AI-powered education platform for students, faculty, and institutes. Built with React, TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + custom "liquid glass" design system
- **Routing**: React Router v6
- **Charts**: Recharts
- **AI Chat**: Google Gemini API (via serverless proxy)
- **Deployment**: Vercel (static + serverless functions)

## Project Structure

```
src/
├── components/          # Shared UI components (AppShell, Sidebar)
├── pages/               # Route-level pages
│   ├── LandingPage.tsx  # Public landing + login
│   ├── RegisterPage.tsx # Role-based signup
│   ├── student/         # Student workspace routes
│   ├── faculty/         # Faculty workspace routes
│   └── institute/       # Institute admin routes
├── Chatbot/             # StudyBuddy AI assistant
│   ├── ChatButton.tsx   # Floating trigger button
│   ├── ChatWidget.tsx   # Chat UI (portal-rendered)
│   └── chatService.ts   # Gemini API client (with proxy fallback)
├── lib/                 # Utilities (auth, etc.)
└── database/            # Static JSON data (students, faculty, institutes, problems, mastery)
api/
└── index.js             # Vercel serverless function: /api/studybuddy proxy
```

## Key Features

- **Role-based workspaces**: Student, Faculty, Institute dashboards
- **Practice arena**: Adaptive problems with mastery tracking
- **Homework & Projects**: Institute-assigned work
- **Contests & Discuss**: Peer features
- **StudyBuddy**: AI chat assistant (Gemini 3.7 Flash via proxy)
- **Liquid glass UI**: Dark theme, glassmorphism, smooth animations

## Quick Start

```bash
# Install dependencies
npm install
cd api && npm install

# Development (two terminals)
# Terminal 1 - API proxy
STUDY_BUDDY_KEY=your_gemini_key node start-api.cjs

# Terminal 2 - Frontend
npm run dev

# Production build
npm run build
```

## Environment Variables

| Variable | Required | Where Used |
|----------|----------|------------|
| `VITE_STUDY_BUDDY_KEY` | Yes (prod) | Frontend (Vite) |
| `STUDY_BUDDY_KEY` | Yes (prod) | API proxy (Vercel serverless) |

## Deployment

1. Push to GitHub
2. Import in Vercel
3. Add env vars in Vercel Dashboard → Settings → Environment Variables
4. Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for details.