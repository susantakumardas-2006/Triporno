# SmartEd agent context

## Current product context
SmartEd is a role-based learning platform implemented with React, TypeScript, Tailwind CSS, and mock JSON data. It supports three primary personas:
- Student
- Faculty
- Institute Head

The application is a single-page app with UI routing and local demo authentication.

## Routes and pages
- `/` — public landing page with role-based login and demo credentials
- `/auth/register` — registration placeholder
- `/app/student/dashboard` — student dashboard
- `/app/student/profile` — student profile and contribution graph
- `/app/student/practice/arena/:problemId` — student practice arena
- `/app/student/projects` — student project/peer review screen
- `/app/student/homework` — student homework summary
- `/app/student/discuss` — discussion feed
- `/app/student/contest` — contest overview
- `/app/faculty/dashboard` — faculty workspace and class oversight
- `/app/institute/overview` — institute analytics and roster overview

## Login flow
- The landing page is intentionally login-first with a role toggle.
- Demo credentials are displayed per role.
- `src/lib/auth.ts` normalizes input for case- and whitespace-insensitive auth matching.
- Student login routes to `/app/student/dashboard`; faculty login routes to `/app/faculty/dashboard`; institute login routes to `/app/institute/overview`.

## Data sources
The product uses local seeded JSON data files for demo content:
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

## Student experience
- Practice queue with problem recommendations
- Topic focus cards and mastery hints
- Homework pulse and progress summaries
- Rank, accuracy, and streak metrics
- Profile contribution graph and mastery breakdown
- Practice arena with premium/solution gating
- Premium modal to unlock mentor and solution access

## Faculty experience
- Faculty dashboard with class metrics
- Institute selection and student count insights
- Average mastery and risk/advanced student lists
- Class insight cards for student performance

## Institute experience
- Institute overview with adoption metrics
- Faculty roster display
- Student performance snapshot
- Engagement and listing insights

## Scoring logic
### Mastery engine
- Concept mastery values are stored in `database/masteryRecords.json`.
- Views use these values to compute focus topics, progress, and performance metrics.

### Toughness engine
- Problems include `seedTier` and `liveToughnessRating` values.
- Difficulty labels are derived from live toughness values (Easy / Medium / Hard).

## Design principles
- Black background palette with glassy UI panels
- Monochrome styling with white primary actions
- Red reserved for errors and emerald used for mastery/graph accents
- Landing page uses a minimal hero with login focus and clear demo hints

## Current implementation status
- The login page and role-based auth flow are implemented.
- The student portal is data-driven and contains dashboard, profile, and practice pages.
- Faculty and institute dashboards are implemented with overview metrics.
- Production build passes successfully with `npm run build`.
