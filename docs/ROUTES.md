# Application Routes

## Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Marketing page + role-based login |
| `/auth/register` | `RegisterPage` | Multi-step signup (Student/Faculty/Institute) |

## Protected Routes (require login via landing page)

All protected routes are under `/app/` prefix and defined in `src/App.tsx`.

### Student Workspace (`/app/student/*`)

| Route | Component | Sidebar Nav | Description |
|-------|-----------|-------------|-------------|
| `/app/student/dashboard` | `StudentDashboard` | Dashboard | Main dashboard: mastery stats, practice queue, focus topics, streak, institute picker |
| `/app/student/profile` | `StudentProfile` | Profile | User profile settings |
| `/app/student/practice` | `StudentPractice` | Practice | Problem list with difficulty filters |
| `/app/student/practice/arena/:problemId` | `StudentPractice` | (hidden) | Problem detail + response workspace |
| `/app/student/homework` | `StudentHomework` | Homework | Assigned homework |
| `/app/student/projects` | `StudentProjects` | Projects | Student projects |
| `/app/student/discuss` | `StudentDiscuss` | Discuss | Discussion forum |
| `/app/student/contest` | `StudentContest` | Contest | Coding contests |
| `/app/student/institute` | `StudentInstituteDashboard` | Institute | Institute hub (homework, projects) |
| `/app/student/institute/homework` | `StudentInstituteHomework` | (hidden) | Institute-assigned homework |
| `/app/student/institute/projects` | `StudentInstituteProjects` | (hidden) | Institute-assigned projects |
| `/app/student/test-yourself` | `TestYourself` | Test Yourself | **NEW**: Voluntary self-assessment with topic selection |

### Faculty Workspace (`/app/faculty/*`)

| Route | Component | Sidebar Nav | Description |
|-------|-----------|-------------|-------------|
| `/app/faculty/dashboard` | `FacultyDashboard` | Dashboard | Class insights, student progress, risk/advanced cohorts |
| `/app/faculty/institutes` | `FacultyInstitutes` | Institute | Institute management |
| `/app/faculty/students` | `FacultyStudents` | Student | Student roster & details |
| `/app/faculty/socratic-insights` | `FacultySocraticInsights` | Socratic Insights | **NEW**: Class misconceptions, defender analytics |

### Institute Workspace (`/app/institute/*`)

| Route | Component | Sidebar Nav | Description |
|-------|-----------|-------------|-------------|
| `/app/institute/overview` | `InstituteOverview` | Overview | Institute metrics, student/faculty rosters |
| `/app/institute/faculty` | `InstituteFaculty` | Faculty | Faculty management |
| `/app/institute/students` | `InstituteStudents` | Student | Student management |

## Special Routes (Not in Sidebar)

### Socratic Defender (Modal, Not Route)
- **Trigger**: Auto-opens from `StudentPractice.tsx` after answer submission when mastery > 75
- **Component**: `DefenderModal.tsx` (full-screen modal via `DefenderCheckpoint.tsx`)
- **Session State**: Persisted in localStorage (`socraticSession`) for resume capability
- **Not a separate route** - blocks practice arena until complete/force-exit

### Test Yourself Page
- **Route**: `/app/student/test-yourself`
- **Component**: `TestYourself.tsx`
- **Sidebar Nav**: "Test Yourself" (added to student navItems)
- **Flow**: Topic selection → Time estimate → Adaptive assessment → Report

## Route Protection

- No server-side auth - all protection is client-side via React Router
- Landing page sets role in localStorage (implicitly via navigation)
- Routes render based on URL only
- Fallback: `<Route path="*" element={<Navigate to="/" replace />} />` redirects unknown routes to landing

## Navigation Components

### AppShell (`src/components/AppShell.tsx`)
- Top header: title, subtitle, nav tabs (desktop), actions
- Collapsible sidebar (xl+)
- Mobile drawer (hamburger menu)
- Props: `title`, `subtitle`, `navItems[]`, `actions`, `sidebarHeaderBadge`, `children`

### Sidebar (`src/components/Sidebar.tsx`)
- Vertical nav with icons
- Collapsed state (icon-only) / expanded
- Mobile variant (full-width in drawer)
- Active route highlighting
- Props: `title`, `subTitle`, `items[]`, `isCollapsed`, `isMobile`, `hideHeader`, `headerBadge`, `onNavigate`

### NavItem Type
```ts
type NavItem = {
  to?: string;           // Route path (optional for click-only items)
  label: string;         // Display label
  icon: LucideIcon;      // Lucide React icon component
  isBold?: boolean;      // Bold label
  onClick?: () => void;  // Click handler (no navigation)
};
```

## New NavItems for Socratic Features

### Student Dashboard (`StudentDashboard.tsx` navItems addition)
```tsx
const navItems = [
  { to: '/app/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/app/student/practice', label: 'Practice', icon: Flame },
  { to: '/app/student/test-yourself', label: 'Test Yourself', icon: ClipboardCheck },  // NEW
  { to: '/app/student/homework', label: 'Homework', icon: BookOpen },
  { to: '/app/student/projects', label: 'Projects', icon: ClipboardList },
  { to: '/app/student/discuss', label: 'Discuss', icon: MessageCircle },
  { to: '/app/student/contest', label: 'Contest', icon: Trophy },
  { to: '/app/student/institute', label: 'Institute', icon: Building2 },
];
```

### Faculty Dashboard (`FacultyDashboard.tsx` navItems addition)
```tsx
const navItems = [
  { to: '/app/faculty/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/app/faculty/institutes', label: 'Institute', icon: Building2 },
  { to: '/app/faculty/students', label: 'Student', icon: Trophy },
  { to: '/app/faculty/socratic-insights', label: 'Socratic Insights', icon: Brain },  // NEW
];
```

## API Routes (Vercel Serverless)

### StudyBuddy
| Route | Method | Description |
|-------|--------|-------------|
| `/api/studybuddy` | POST | Proxy to Gemini generateContent API |
| `/api/health` | GET | Health check + key status |

### Socratic Engine
| Route | Method | Description |
|-------|--------|-------------|
| `/api/socratic/check-trigger` | POST | Check if defender should fire for student+topic |
| `/api/socratic/start-session` | POST | Initialize defender/test session |
| `/api/socratic/next-question` | POST | Get next adaptive question |
| `/api/socratic/evaluate-response` | POST | Evaluate student defense |
| `/api/socratic/complete-session` | POST | Generate report + update mastery |
| `/api/socratic/skip-question` | POST | Skip question with penalty |
| `/api/socratic/force-exit` | POST | Force exit with penalty |
| `/api/socratic/resume/:sessionId` | GET | Resume interrupted session |
| `/api/socratic/report/:sessionId` | GET | Fetch session report for review |
| `/api/video-lessons` | GET | Query video library by topic/concept/difficulty |

## Adding New Routes

1. Create page component in `src/pages/<role>/NewPage.tsx`
2. Import in `src/App.tsx`
3. Add `<Route path="/app/<role>/new-path" element={<NewPage />} />`
4. Add to appropriate dashboard's `navItems` in that page's `AppShell` usage
5. Import icon from `lucide-react`

### Socratic Engine Route Registration (in `src/App.tsx`)
```tsx
import TestYourself from './pages/student/TestYourself';
import FacultySocraticInsights from './pages/faculty/FacultySocraticInsights';

// Inside Routes:
<Route path="/app/student/test-yourself" element={<TestYourself />} />
<Route path="/app/faculty/socratic-insights" element={<FacultySocraticInsights />} />
```