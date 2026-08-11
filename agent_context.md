# SmartEd agent context

## Current product context
SmartEd is a role-based learning platform built as a demo app for Students, Faculty, and Institute Heads. It is implemented as a React + TypeScript SPA with Tailwind CSS, using mock JSON data in a local `database/` folder and a small scoring engine in `ml-engine/`.

## Roles and routes
- Public auth landing page: `/`
- Registration placeholder: `/auth/register`
- Student portal: `/app/student/dashboard`, `/app/student/profile`, `/app/student/practice/arena/:problemId`, `/app/student/projects`, `/app/student/homework`, `/app/student/discuss`, `/app/student/contest`
- Faculty portal: `/app/faculty/dashboard`
- Institute portal: `/app/institute/overview`

## Login flow
- The landing page is a login hero with a role toggle for Student, Faculty, and Institute.
- Demo credentials are shown per role and used by `authenticateUser` in `src/lib/auth.ts`.
- Student login navigates to the student dashboard, faculty login to faculty dashboard, and institute login to institute overview.
- Password visibility toggle and inline error messaging are supported.

## Data sources
The project uses local seeded JSON datasets to drive UI content and demo state:
- `database/students.json`
- `database/faculty.json`
- `database/institutes.json`
- `database/problems.json`
- `database/submissions.json`
- `database/masteryRecords.json`
- `database/homework.json`
- `database/projects.json`
- `database/discussions.json`
- `database/contests.json`
- `database/subscriptions.json`

## Key UI and feature coverage
### Landing page
- Pure login-first hero experience
- Role-based demo auth hints
- Register CTA top-right
- Newsletter / subscription prompt and social buttons
- Black, liquid-glass, monochrome styling with white primary CTA and red errors

### Student portal
- Student dashboard with practice queue, mastery focus, homework pulse, rank, streaks, and trending institutes
- Student profile with contribution graph, mastery breakdown, difficulty stats, streak and accuracy metrics
- Practice arena page showing problem details and premium/solution access gating
- Premium upgrade modal for additional functionality

### Faculty portal
- Faculty dashboard showing faculty workspace, institute selection, student counts, problem metrics, and average mastery
- Class insights, advanced student list, and at-risk student list

### Institute portal
- Institute overview page showing institute adoption, engagement, student performance snapshot, and faculty roster

## Scoring logic
### Mastery engine
- Runtime scoring is modeled after a Bayesian Knowledge Tracing-style mastery update.
- Concept mastery values are stored in `database/masteryRecords.json` and used throughout student and faculty views.

### Toughness engine
- Problems carry `liveToughnessRating` and `seedTier` values.
- Problem difficulty labels are derived from live rating ranges (Easy / Medium / Hard).

## Design principles
- Black background with glassy surface cards and translucent panels
- Monochrome palette, white UI accents, emerald for mastery/graph highlights, red for errors
- Minimal text-heavy hero layout for the landing page

## Current implementation status
- Core landing page and login flow are implemented and verified by production build.
- Student portal is wired to seeded data and contains a functioning dashboard, profile, and practice experience.
- Faculty and institute portals are present with rich overview dashboards, but can be expanded further with request workflows and approval detail screens.
- Build status: `npm run build` completes successfully.
