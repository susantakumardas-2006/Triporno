import { useMemo } from 'react';
import { BookOpen, ClipboardList, Sparkles, LayoutGrid, Building2, Flame, MessageCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import institutes from '../../../database/institutes.json';
import students from '../../../database/students.json';
import homework from '../../../database/homework.json';
import mastery from '../../../database/masteryRecords.json';

const selectedInstituteClass = typeof window !== 'undefined' ? window.localStorage.getItem('smarted-selected-institute-class') ?? 'Grade 10' : 'Grade 10';
const selectedInstituteSection = typeof window !== 'undefined' ? window.localStorage.getItem('smarted-selected-institute-section') ?? 'A' : 'A';

function StudentInstituteHomework() {
  const institute = institutes.find((institute) => {
    if (typeof window === 'undefined') return false;
    return institute.id === window.localStorage.getItem('smarted-selected-institute-id');
  }) ?? institutes[0];
  const instituteStudents = students.filter((student: { instituteId: string }) => student.instituteId === institute.id);
  const masteryMap = mastery as Record<string, Record<string, number>>;
  const averageMastery = useMemo(() => {
    const scores = instituteStudents.map((student) => masteryMap[student.id]?.Math ?? 60);
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1));
  }, [instituteStudents, masteryMap]);

  return (
    <AppShell
      title="Institute homework"
      subtitle="Assigned homework tasks from your institute."
      actions={
        <Link to="/app/student/institute" className="rounded-full border border-white/20 px-4 py-2 text-sm">
          Back to institute dashboard
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-4">Institute homework</p>
              <h1 className="text-4xl font-semibold">{institute.name} tasks</h1>
              <p className="mt-2 text-white/60">Class {selectedInstituteClass} • Section {selectedInstituteSection}</p>
              <p className="mt-4 text-white/70 leading-8 section-subtitle">Complete these homework items published by your institute instructors.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
              <div className="feature-pill">
                <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Students</p>
                <p className="mt-3 text-2xl font-semibold">{instituteStudents.length}</p>
              </div>
              <div className="feature-pill">
                <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Mastery</p>
                <p className="mt-3 text-2xl font-semibold">{averageMastery}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {homework.slice(0, 6).map((item: { id: string; title: string; topic: string; due: string; status: string }) => (
            <div key={item.id} className="liquid-glass rounded-3xl p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-white/60 text-sm">{item.topic}</p>
                </div>
                <span className="accent-tag">{item.status}</span>
              </div>
              <p className="text-white/70 text-sm mb-4">Assigned by your institute teacher, due {item.due}.</p>
              <Link to="/app/student/homework" className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">Open homework</Link>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default StudentInstituteHomework;
