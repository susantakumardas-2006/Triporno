import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/student/StudentDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import InstituteOverview from './pages/institute/InstituteOverview';
import RegisterPage from './pages/RegisterPage';
import StudentProfile from './pages/student/StudentProfile';
import StudentPractice from './pages/student/StudentPractice';
import StudentDiscuss from './pages/student/StudentDiscuss';
import StudentContest from './pages/student/StudentContest';
import StudentProjects from './pages/student/StudentProjects';
import StudentHomework from './pages/student/StudentHomework';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/app/student/dashboard" element={<StudentDashboard />} />
      <Route path="/app/student/profile" element={<StudentProfile />} />
      <Route path="/app/student/practice/arena/:problemId" element={<StudentPractice />} />
      <Route path="/app/student/discuss" element={<StudentDiscuss />} />
      <Route path="/app/student/contest" element={<StudentContest />} />
      <Route path="/app/student/projects" element={<StudentProjects />} />
      <Route path="/app/student/homework" element={<StudentHomework />} />
      <Route path="/app/faculty/dashboard" element={<FacultyDashboard />} />
      <Route path="/app/institute/overview" element={<InstituteOverview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
