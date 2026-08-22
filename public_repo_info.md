# SmartEd

SmartEd is a role-based practice and classroom platform for students, faculty, and institute heads. Students work through problems, build mastery, and engage in peer review while faculty manage classes, requests, homework, and announcements. Institute heads oversee adoption, faculty, and public visibility.

## Core features
- Students: practice, mastery tracking, contests, projects, homework, profile analytics.
- Faculty: class management, requests, roster oversight, problem publishing, homework grading.
- Institutes: dashboards, faculty approvals, student performance insights, and subscription-based listing.
- **Socratic Engine**: AI-powered enrichment challenges (Defender) and voluntary self-assessment (Test Yourself) with adaptive questioning, gap analysis, video recommendations, and mastery updates.

## Tech stack
- Vite + React 18 + TypeScript + Tailwind CSS 3 + lucide-react

## Local setup
1. Install dependencies with `npm install`
2. Start the dev server with `npm run dev`
3. Build the production bundle with `npm run build`

## Project structure
- src/: React pages, routes, and UI shell
- database/: mock JSON data for users, institutes, problems, submissions, and subscriptions
- ml-engine/: swappable scoring logic for mastery and toughness
- api/: Vercel serverless functions (StudyBuddy + Socratic Engine)
- docs/: Architecture, development, deployment, and API documentation