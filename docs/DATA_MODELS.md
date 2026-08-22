# Data Models

All data is stored as static JSON files in `database/` (root level) and loaded at build time via Vite imports.

## File Overview

| File | Description | Used By |
|------|-------------|---------|
| `students.json` | Student accounts + profiles | LandingPage, StudentDashboard, FacultyDashboard, InstituteOverview |
| `faculty.json` | Faculty accounts + institute associations | LandingPage, FacultyDashboard, InstituteOverview |
| `institutes.json` | Institute info (name, city, board) | LandingPage, StudentDashboard, InstituteOverview |
| `problems.json` | Practice problems with metadata | StudentDashboard, StudentPractice, SocraticEngine |
| `concepts.json` | Subject/topic taxonomy | StudentDashboard, SocraticEngine |
| `masteryRecords.json` | Student mastery scores by topic | StudentDashboard, FacultyDashboard, SocraticEngine |
| `submissions.json` | Student problem submissions | StudentDashboard, SocraticEngine (topicProgress) |
| `homework.json` | Homework assignments | StudentHomework, StudentInstituteHomework |
| `contests.json` | Contest definitions | StudentContest |
| `discussions.json` | Discussion forum data | StudentDiscuss |
| `projects.json` | Project definitions | StudentProjects, StudentInstituteProjects |
| `announcements.json` | Institute announcements | - |
| `attendance.json` | Attendance records | - |
| `events.json` | Calendar events | - |
| `groups.json` | Study groups | - |
| `joinRequests.json` | Join requests | - |
| `studentRatings.json` | Student ratings | - |
| `subscriptions.json` | Subscription data | - |
| **`topicProgress.json`** | **Per-student per-topic solved counts & mastery** | **SocraticEngine, StudentDashboard** |
| **`topicTaxonomy.json`** | **3-level topic hierarchy (Subject→Domain→Concept)** | **SocraticEngine, TestYourself** |
| **`videoLessons.json`** | **YouTube video library mapped to concepts** | **SocraticEngine (recommendations)** |
| **`defenderSessions.json`** | **Socratic session history & reports** | **StudentDashboard, FacultyInsights** |

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
    "facultyCount": 89,
    "defenderSettings": {
      "masteryThreshold": 75,
      "confidenceThreshold": 0.75,
      "maxQuestions": 6,
      "minQuestions": 3,
      "skipPenalty": -3,
      "forceExitPenalty": -8,
      "timerEnabled": true,
      "timerBase": 180,
      "enrichmentMode": true
    }
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
- **`defenderSettings`** - Socratic Defender configuration per institute

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
    "solution": "The discriminant determines...",
    "remediationPool": true,
    "remediationLevel": "basic",
    "enrichmentPool": true,
    "enrichmentLevel": "advanced",
    "socraticPrompt": "Optional custom challenge prompt"
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
- **`remediationPool`** - Available for gap remediation
- **`remediationLevel`** - "basic" | "intermediate" | "advanced"
- **`enrichmentPool`** - Available for enrichment challenges
- **`enrichmentLevel`** - "basic" | "intermediate" | "advanced"
- **`socraticPrompt`** - Optional custom prompt for this problem

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
- **SocraticEngine: Trigger threshold (mastery > 75), mastery delta updates**

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

**Usage:** StudentDashboard calculates accuracy, streak, solved count. **SocraticEngine uses for topicProgress tracking.**

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

## New Socratic Engine Data Models

### topicProgress.json

```json
{
  "student-1": {
    "Algebra": {
      "totalSolved": 47,
      "masteryScore": 78,
      "lastDefenderSession": "2026-08-20T14:30:00Z",
      "defenderPassCount": 3,
      "defenderFailCount": 1,
      "skipCount": 0,
      "forceExitCount": 0
    },
    "Physics": {
      "totalSolved": 23,
      "masteryScore": 58,
      "lastDefenderSession": null,
      "defenderPassCount": 0,
      "defenderFailCount": 0,
      "skipCount": 0,
      "forceExitCount": 0
    }
  }
}
```

**Fields per topic:**
- `totalSolved` - Cumulative problems solved in this topic
- `masteryScore` - Current mastery (0-100), from masteryRecords
- `lastDefenderSession` - ISO timestamp of last defender completion
- `defenderPassCount` - Times student demonstrated deep understanding
- `defenderFailCount` - Times gaps were found
- `skipCount` - Total skips across sessions
- `forceExitCount` - Total force exits

---

### topicTaxonomy.json (Industry Standard 3-Level Hierarchy)

```json
{
  "Math": {
    "Algebra": ["Linear Equations", "Quadratic Equations", "Polynomials", "Inequalities", "Functions"],
    "Calculus": ["Limits", "Derivatives", "Integrals", "Differential Equations", "Series"],
    "Geometry": ["Coordinate Geometry", "Trigonometry", "Vectors", "3D Geometry"],
    "Statistics": ["Probability", "Distributions", "Hypothesis Testing", "Regression"]
  },
  "Physics": {
    "Mechanics": ["Kinematics", "Newton's Laws", "Work Energy Power", "Momentum", "Rotational Motion"],
    "Thermodynamics": ["Laws", "Heat Engines", "Entropy", "Statistical Mechanics"],
    "Electromagnetism": ["Electrostatics", "Current Electricity", "Magnetism", "EM Waves"],
    "Modern Physics": ["Quantum", "Relativity", "Nuclear", "Particle"]
  },
  "Chemistry": {
    "Physical": ["Atomic Structure", "Chemical Bonding", "Thermodynamics", "Equilibrium", "Kinetics"],
    "Organic": ["Hydrocarbons", "Functional Groups", "Reaction Mechanisms", "Stereochemistry", "Biomolecules"],
    "Inorganic": ["Periodic Properties", "Coordination Compounds", "Metallurgy", "Qualitative Analysis"]
  },
  "Biology": {
    "Cell Biology": ["Cell Structure", "Cell Division", "Transport", "Signaling"],
    "Genetics": ["Mendelian", "Molecular", "Population", "Biotechnology"],
    "Ecology": ["Ecosystems", "Biodiversity", "Conservation", "Climate Change"],
    "Physiology": ["Systems", "Homeostasis", "Neural", "Endocrine"]
  }
}
```

**Usage:** Normalizes conceptTags from problems, powers TestYourself topic picker, enables hierarchical reporting.

---

### videoLessons.json (YouTube Library - 30-400 videos)

```json
{
  "videos": [
    {
      "id": "vid-math-alg-001",
      "topic": "Math",
      "domain": "Algebra",
      "concept": "Quadratic Formula",
      "title": "Deriving the Quadratic Formula",
      "youtubeUrl": "https://youtube.com/watch?v=...",
      "duration": 420,
      "difficulty": "basic",
      "tags": ["quadratics", "formula-derivation", "discriminant"],
      "source": "Khan Academy"
    }
  ]
}
```

**Fields:**
- `id` - Unique identifier
- `topic` - Subject (Math, Physics, Chemistry, Biology)
- `domain` - Domain within subject (Algebra, Mechanics, etc.)
- `concept` - Specific concept (Quadratic Formula, Discriminant)
- `title` - Video title
- `youtubeUrl` - Full YouTube URL
- `duration` - Seconds
- `difficulty` - "basic" | "intermediate" | "advanced"
- `tags` - Searchable tags for matching
- `source` - Source attribution (Khan Academy, etc.)

**Matching Logic (Prototype):** Exact tag match against identified gaps.

---

### defenderSessions.json

```json
{
  "def-001": {
    "id": "def-001",
    "studentId": "student-1",
    "topic": "Algebra",
    "domain": "Math",
    "triggerType": "auto",
    "mode": "enrichment",
    "triggerReason": "mastery_threshold_exceeded",
    "startedAt": "2026-08-22T10:00:00Z",
    "completedAt": "2026-08-22T10:12:00Z",
    "duration": 720,
    "questions": [
      {
        "id": "q1",
        "level": "easy",
        "question": "What does the discriminant tell you about roots?",
        "expectedConcepts": ["discriminant", "real roots", "complex roots"],
        "studentResponse": "If positive, two real roots...",
        "evaluation": "understood",
        "confidence": 0.92,
        "timeSpent": 45,
        "conceptTags": ["Algebra", "Quadratic Equations", "Discriminant"]
      },
      {
        "id": "q2",
        "level": "medium",
        "question": "How does vertex form relate to discriminant?",
        "expectedConcepts": ["vertex form", "discriminant", "axis of symmetry"],
        "studentResponse": "Not sure...",
        "evaluation": "partial",
        "confidence": 0.45,
        "timeSpent": 120,
        "conceptTags": ["Algebra", "Quadratic Equations", "Vertex Form"]
      },
      {
        "id": "q3",
        "level": "hard",
        "question": "Design a quadratic with no real roots and vertex at (2,3)",
        "expectedConcepts": ["vertex form", "discriminant negative", "completing the square"],
        "studentResponse": "f(x) = (x-2)² + 3...",
        "evaluation": "misunderstood",
        "confidence": 0.15,
        "timeSpent": 180,
        "conceptTags": ["Algebra", "Quadratic Equations", "Vertex Form", "Discriminant"]
      }
    ],
    "skipped": [],
    "forceExited": false,
    "report": {
      "outcome": "gaps-found",
      "gaps": ["Vertex form connection", "Discriminant interpretation"],
      "strengths": ["Basic discriminant understanding"],
      "recommendedVideos": ["vid-math-alg-001", "vid-math-alg-002"],
      "recommendedProblems": ["p3", "p12"],
      "masteryDelta": { "Algebra": -8, "Quadratic Equations": -12 },
      "nextSteps": ["Watch vertex form video", "Practice basic quadratics"],
      "badge": null
    }
  }
}
```

**Fields:**
- `id` - Session ID (UUID)
- `studentId` - References students.json
- `topic` - Concept tag (e.g., "Algebra")
- `domain` - Subject (e.g., "Math")
- `triggerType` - "auto" | "manual"
- `mode` - "enrichment" | "remediation" (determined by mastery vs threshold)
- `triggerReason` - Why session started
- `startedAt` / `completedAt` - ISO timestamps
- `duration` - Total seconds
- `questions` - Array of question results
- `skipped` - Array of skipped question IDs
- `forceExited` - Boolean
- `report` - Generated report with gaps, recommendations, mastery delta

---

## Access Patterns

### In Components (Vite Import)
```typescript
import students from '../../database/students.json';
import mastery from '../../../database/masteryRecords.json';
import topicProgress from '../../../database/topicProgress.json';

// TypeScript infers types from JSON structure
const student = students.find(s => s.id === 'student-1');
const masteryScore = mastery['student-1']?.Algebra ?? 0;
const topicProg = topicProgress['student-1']?.Algebra;
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

// Topic progress for defender trigger
const algebraProgress = topicProgress['student-1']?.Algebra;
if (algebraProgress && algebraProgress.masteryScore > 75) {
  // Trigger enrichment defender
}
```

---

## Extending Data

To add new data:
1. Create/edit JSON file in `database/`
2. Import in components as needed
3. Run `npm run build` to verify TypeScript inference
4. No database migration needed (static files)

**Note:** For production, consider migrating to a real database (PostgreSQL, Firebase, etc.) and adding an API layer.