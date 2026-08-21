# Data Models

All data is stored as static JSON files in `src/database/` and loaded at build time via Vite imports.

## File Overview

| File | Description | Used By |
|------|-------------|---------|
| `students.json` | Student accounts + profiles | LandingPage, StudentDashboard, FacultyDashboard, InstituteOverview |
| `faculty.json` | Faculty accounts + institute associations | LandingPage, FacultyDashboard, InstituteOverview |
| `institutes.json` | Institute info (name, city, board) | LandingPage, StudentDashboard, InstituteOverview |
| `problems.json` | Practice problems with metadata | StudentDashboard, StudentPractice |
| `concepts.json` | Subject/topic taxonomy | StudentDashboard |
| `masteryRecords.json` | Student mastery scores by topic | StudentDashboard, FacultyDashboard |
| `submissions.json` | Student problem submissions | StudentDashboard |
| `homework.json` | Homework assignments | StudentHomework, StudentInstituteHomework |

---

## students.json

```json
[
  {
    "id": "student-1",
    "email": "student@smarted.demo",
    "password": "demo1234",
    "name": "Alex Chen",
    "className": "Grade 10",
    "section": "A",
    "instituteId": "oakwood",
    "board": "CBSE",
    "avatar": "https://...",
    "streak": 7,
    "rank": 12,
    "accuracy": 87
  }
]
```

**Fields:**
- `id` - Unique identifier (used in masteryRecords, submissions)
- `email` / `password` - Demo credentials (plaintext for demo)
- `name` - Display name
- `className` - Grade level (Grade 9-12)
- `section` - Class section (A, B, C)
- `instituteId` - References `institutes.json` id
- `board` - Education board
- `avatar` - Profile image URL
- `streak` - Current daily streak (days)
- `rank` - Global rank
- `accuracy` - Overall accuracy percentage

---

## faculty.json

```json
[
  {
    "id": "faculty-1",
    "email": "faculty@smarted.demo",
    "password": "demo1234",
    "name": "Dr. Sarah Mitchell",
    "instituteIds": ["oakwood"],
    "subjects": ["Mathematics", "Physics"],
    "avatar": "https://..."
  }
]
```

**Fields:**
- `id` - Unique identifier
- `email` / `password` - Demo credentials
- `name` - Display name
- `instituteIds` - Array of institute IDs (faculty can belong to multiple)
- `subjects` - Taught subjects
- `avatar` - Profile image URL

---

## institutes.json

```json
[
  {
    "id": "oakwood",
    "name": "Oakwood High School",
    "city": "Bangalore",
    "state": "Karnataka",
    "board": "CBSE",
    "logo": "https://...",
    "studentCount": 1247,
    "facultyCount": 89
  }
]
```

**Fields:**
- `id` - Unique identifier (referenced by students/faculty)
- `name` - Institute name
- `city` / `state` - Location
- `board` - Education board (CBSE, ICSE/ISC, IB, IGCSE, WBCHSE, Other State Board)
- `logo` - Logo URL
- `studentCount` / `facultyCount` - Stats for display

---

## problems.json

```json
[
  {
    "id": "prob-1",
    "title": "Quadratic Equations - Root Analysis",
    "statement": "Given the quadratic equation...",
    "conceptTags": ["Algebra", "Quadratic Equations"],
    "liveToughnessRating": 1350,
    "seedTier": "Medium",
    "authorType": "system",
    "isPublic": true,
    "solvedCount": 1240,
    "attemptedCount": 2100,
    "solution": "The discriminant determines..."
  }
]
```

**Fields:**
- `id` - Unique identifier (used in route `/app/student/practice/arena/:problemId`)
- `title` - Problem title
- `statement` - Full problem description (markdown supported)
- `conceptTags` - Array of topic strings (matches `concepts.json` topics)
- `liveToughnessRating` - Elo-style rating (1000-2000+)
- `seedTier` - Difficulty label: "Easy" / "Medium" / "Hard"
- `authorType` - "system" | "institute" | "premium" (controls solution access)
- `isPublic` - Visible in practice arena
- `solvedCount` / `attemptedCount` - Stats for solve rate
- `solution` - Full solution (gated by premium/institute)

**Difficulty Calculation** (in `StudentPractice.tsx`):
```typescript
function difficultyOf(toughness) {
  if (toughness < 1200) return 'Easy';
  if (toughness <= 1600) return 'Medium';
  return 'Hard';
}
```

---

## concepts.json

```json
{
  "subjects": [
    {
      "name": "Mathematics",
      "topics": ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry"]
    },
    {
      "name": "Physics",
      "topics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern Physics"]
    }
  ]
}
```

**Usage:** Flattened to topic array for filters in StudentDashboard.

---

## masteryRecords.json

```json
{
  "student-1": {
    "Algebra": 85,
    "Geometry": 72,
    "Calculus": 45,
    "Statistics": 68,
    "Trigonometry": 78,
    "Mechanics": 82,
    "Thermodynamics": 55
  }
}
```

**Structure:** Object keyed by student ID, values are topic→score (0-100).

**Usage:**
- StudentDashboard: Focus topics (lowest 4 scores), mastery score calculation
- FacultyDashboard: Class average, risk students (<55%), advanced students (>80%)

---

## submissions.json

```json
[
  {
    "id": "sub-1",
    "studentId": "student-1",
    "problemId": "prob-1",
    "correct": true,
    "timestamp": "2026-08-15T10:30:00Z",
    "timeSpent": 180
  }
]
```

**Fields:**
- `id` - Submission ID
- `studentId` - References students.json
- `problemId` - References problems.json
- `correct` - Boolean
- `timestamp` - ISO datetime
- `timeSpent` - Seconds

**Usage:** StudentDashboard calculates accuracy, streak, solved count.

---

## homework.json

```json
[
  {
    "id": "hw-1",
    "instituteId": "oakwood",
    "className": "Grade 10",
    "section": "A",
    "title": "Quadratic Equations Practice",
    "description": "Complete problems 1-10",
    "problems": ["prob-1", "prob-2", "prob-3"],
    "assignedBy": "faculty-1",
    "assignedAt": "2026-08-15T09:00:00Z",
    "dueAt": "2026-08-22T23:59:00Z",
    "status": "active"
  }
]
```

**Fields:**
- `id` - Homework ID
- `instituteId` / `className` / `section` - Target group
- `title` / `description` - Assignment details
- `problems` - Array of problem IDs
- `assignedBy` - Faculty ID
- `assignedAt` / `dueAt` - Timestamps
- `status` - "active" | "completed" | "overdue"

---

## Access Patterns

### In Components (Vite Import)
```typescript
import students from '../../database/students.json';
import mastery from '../../../database/masteryRecords.json';

// TypeScript infers types from JSON structure
const student = students.find(s => s.id === 'student-1');
const masteryScore = mastery['student-1']?.Algebra ?? 0;
```

### Filtering Examples
```typescript
// Institute students
const instituteStudents = students.filter(s => s.instituteId === activeInstitute);

// Faculty's institute students
const facultyInstitutes = faculty[0]?.instituteIds ?? [];
const instituteStudents = students.filter(s => facultyInstitutes.includes(s.instituteId));

// Student submissions
const studentSubmissions = submissions.filter(s => s.studentId === studentId);
const solvedCount = studentSubmissions.filter(s => s.correct).length;
const accuracy = Math.round((solvedCount / Math.max(studentSubmissions.length, 1)) * 100);
```

---

## Extending Data

To add new data:
1. Create/edit JSON file in `src/database/`
2. Import in components as needed
3. Run `npm run build` to verify TypeScript inference
4. No database migration needed (static files)

**Note:** For production, consider migrating to a real database (PostgreSQL, Firebase, etc.) and adding an API layer.