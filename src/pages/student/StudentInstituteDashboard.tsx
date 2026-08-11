import { useMemo } from 'react';
import { ArrowRight, BookOpen, ClipboardList, Flame, LayoutGrid, MessageCircle, Trophy, Users2, Sparkles, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import institutes from '../../../database/institutes.json';
import students from '../../../database/students.json';
import mastery from '../../../database/masteryRecords.json';

const selectedInstituteClass = typeof window !== 'undefined' ? window.localStorage.getItem('smarted-selected-institute-class') ?? 'Grade 10' : 'Grade 10';
const selectedInstituteSection = typeof window !== 'undefined' ? window.localStorage.getItem('smarted-selected-institute-section') ?? 'A' : 'A';

const mockQuestions = [
  'How does your current unit prepare you for the next assessment?',
  'Which topic did you find most challenging this week?',
  'Describe one strategy your teacher suggested for math practice.',
  'How often do you review feedback from your homework?',
  'What area do you want help with next?',
  'Which subject do you feel most confident about?',
  'How do you manage your time between project work and practice?',
  'What resource helped you understand the latest lesson?',
  'How would you rate your institute’s support this month?',
  'Which topic should receive more instructor attention?',
  'What personal goal did you set for this semester?',
  'How do you track your mastery progress over time?',
  'Which question type do you prefer in your assessments?',
  'Which classroom activity helped you learn best?',
  'What would improve your project-based learning experience?'
];

function StudentInstituteDashboard() {
  const activeInstitute = institutes.find((institute) => {
    if (typeof window === 'undefined') return false;
    return institute.id === window.localStorage.getItem('smarted-selected-institute-id');
  }) ?? institutes[0];
  const studentsInInstitute = students.filter((student: { instituteId: string }) => student.instituteId === activeInstitute.id);
  const masteryMap = mastery as Record<string, Record<string, number>>;
  const instituteStudents = useMemo(() => studentsInInstitute.slice(0, 6), [studentsInInstitute]);
  const averageMastery = useMemo(() => {
    const scores = studentsInInstitute.map((student) => masteryMap[student.id]?.Math ?? 60);
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1));
  }, [studentsInInstitute, masteryMap]);

  return (
    <AppShell
      title="Institute dashboard"
      subtitle="Institute-published learning flow and assigned problems."
      actions={
        <Link to="/app/student/dashboard" className="rounded-full border border-white/20 px-4 py-2 text-sm">
          Back to student dashboard
        </Link>
      }
      navItems={[
        { to: '/app/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { to: '/app/student/institute', label: 'Institute', icon: Building2, isBold: true },
        { to: '/app/student/practice', label: 'Practice', icon: Flame },
        { to: '/app/student/homework', label: 'Homework', icon: BookOpen },
        { to: '/app/student/projects', label: 'Projects', icon: ClipboardList },
        { to: '/app/student/discuss', label: 'Discuss', icon: MessageCircle },
        { to: '/app/student/contest', label: 'Contest', icon: Trophy },
      ]}
    >
      <div className="space-y-8">
        <div className="liquid-glass rounded-[32px] p-8 border border-white/10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-4">Institute portal</p>
              <h1 className="text-4xl md:text-5xl font-semibold section-heading">{activeInstitute.name}</h1>
              <p className="mt-2 text-white/60">Class {selectedInstituteClass} • Section {selectedInstituteSection}</p>
              <p className="mt-4 text-white/70 leading-8 section-subtitle">A compact institute dashboard with teacher details, assigned questions, and recommended projects.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
              <div className="feature-pill">
                <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Students</p>
                <p className="mt-3 text-2xl font-semibold">{studentsInInstitute.length}</p>
              </div>
              <div className="feature-pill">
                <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Mastery</p>
                <p className="mt-3 text-2xl font-semibold">{averageMastery}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="liquid-glass rounded-[28px] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Institute questions</h2>
                <p className="text-white/60 text-sm">Fifteen institute-published questions for your next practice session.</p>
              </div>
              <span className="accent-tag">Published by institute</span>
            </div>
            <div className="space-y-3">
              {mockQuestions.map((question, index) => (
                <div key={index} className="rounded-3xl bg-white/[0.03] p-5">
                  <p className="text-sm text-white/60">Question {index + 1}</p>
                  <p className="mt-2 text-base font-medium">{question}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="space-y-4">
            <div className="liquid-glass rounded-[28px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Teachers</h3>
                <Users2 size={18} className="text-white/60" />
              </div>
              <div className="space-y-3">
                {['Ms. Nair', 'Dr. Sharma', 'Mr. Rao'].map((name) => (
                  <div key={name} className="rounded-2xl bg-white/[0.03] p-4">
                    <p className="font-medium">{name}</p>
                    <p className="text-white/60 text-sm">Math teacher • +91 98765 43210</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="liquid-glass rounded-[28px] p-6">
              <h3 className="text-xl font-semibold mb-4">Institute details</h3>
              <div className="space-y-3 text-white/70 text-sm">
                <p><strong>Board:</strong> {activeInstitute.board}</p>
                <p><strong>City:</strong> {activeInstitute.city}</p>
                <p><strong>Listed:</strong> {activeInstitute.listed ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

export default StudentInstituteDashboard;
