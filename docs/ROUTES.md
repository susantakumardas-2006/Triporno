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

### Faculty Workspace (`/app/faculty/*`)

| Route | Component | Sidebar Nav | Description |
|-------|-----------|-------------|-------------|
| `/app/faculty/dashboard` | `FacultyDashboard` | Dashboard | Class insights, student progress, risk/advanced cohorts |
| `/app/faculty/institutes` | `FacultyInstitutes` | Institute | Institute management |
| `/app/faculty/students` | `FacultyStudents` | Student | Student roster & details |

### Institute Workspace (`/app/institute/*`)

| Route | Component | Sidebar Nav | Description |
|-------|-----------|-------------|-------------|
| `/app/institute/overview` | `InstituteOverview` | Overview | Institute metrics, student/faculty rosters |
| `/app/institute/faculty` | `InstituteFaculty` | Faculty | Faculty management |
| `/app/institute/students` | `InstituteStudents` | Student | Student management |

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

## Adding New Routes

1. Create page component in `src/pages/<role>/NewPage.tsx`
2. Import in `src/App.tsx`
3. Add `<Route path="/app/<role>/new-path" element={<NewPage />} />`
4. Add to appropriate dashboard's `navItems` in that page's `AppShell` usage
5. Import icon from `lucide-react`