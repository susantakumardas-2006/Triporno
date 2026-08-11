import { useMemo, useState } from 'react';
import { BookOpen, ClipboardList, Users, GraduationCap, LayoutGrid, Trophy, Building2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import faculty from '../../../database/faculty.json';
import students from '../../../database/students.json';
import problems from '../../../database/problems.json';
import mastery from '../../../database/masteryRecords.json';

function FacultyDashboard() {
  const currentFaculty = faculty[0];
  const institutes = currentFaculty?.instituteIds ?? ['oakwood'];
  const [activeInstitute, setActiveInstitute] = useState(institutes[0]);
  const masteryMap = mastery as Record<string, Record<string, number>>;
  const navItems = [
    { to: '/app/faculty/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/faculty/institutes', label: 'Institute', icon: Building2 },
    { to: '/app/faculty/students', label: 'Student', icon: Trophy },
  ];

  const instituteStudents = useMemo(() => students.filter((student: { instituteId: string }) => student.instituteId === activeInstitute), [activeInstitute]);
  const averageMastery = useMemo(() => {
    const scores = instituteStudents.map((student: { id: string }) => masteryMap[student.id]?.Math ?? 60);
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1));
  }, [instituteStudents, masteryMap]);

  const riskStudents = instituteStudents.filter((student: { id: string }) => (masteryMap[student.id]?.Math ?? 60) < 55).slice(0, 3);
  const advancedStudents = instituteStudents.filter((student: { id: string }) => (masteryMap[student.id]?.Math ?? 60) > 80).slice(0, 3);

  return (
    <AppShell
      title="Faculty workspace"
      subtitle="Approve requests and coach progress."
      actions={
        <>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">View insights</button>
          <Link to="/app/faculty/institutes" className="rounded-full border border-white/20 px-4 py-2 text-sm">Institutes</Link>
          <Link to="/app/faculty/students" className="rounded-full border border-white/20 px-4 py-2 text-sm">Students</Link>
        </>
      }
      navItems={navItems}
    >
      <div className="space-y-6">
        <div className="liquid-glass rounded-[32px] p-8 border border-white/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-3">Faculty workspace</p>
              <h1 className="text-4xl font-semibold section-heading">{currentFaculty?.name ?? 'Faculty'}</h1>
              <p className="text-white/70 mt-4 leading-8 section-subtitle">Approve requests, manage classes, and monitor the institute’s learning pulse with a clear, glass-backed workspace.</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {institutes.length > 1 ? (
                <label className="relative inline-flex items-center rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm text-white shadow-inner shadow-black/20">
                  <span className="pointer-events-none mr-3 text-sm">{activeInstitute}</span>
                  <select
                    value={activeInstitute}
                    onChange={(event) => setActiveInstitute(event.target.value)}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer rounded-full"
                  >
                    {institutes.map((institute) => (
                      <option key={institute} value={institute}>{institute}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="ml-2 text-white/70" />
                </label>
              ) : null}
              <button className="link-button">View insights</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="liquid-glass rounded-3xl p-6">
            <Users className="mb-3" />
            <p className="text-white/60 text-sm">Students</p>
            <p className="text-3xl font-semibold">{instituteStudents.length}</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <BookOpen className="mb-3" />
            <p className="text-white/60 text-sm">Problems</p>
            <p className="text-3xl font-semibold">{problems.filter((problem: { isPublic?: boolean }) => problem.isPublic).length}</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <ClipboardList className="mb-3" />
            <p className="text-white/60 text-sm">Average mastery</p>
            <p className="text-3xl font-semibold">{averageMastery}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="liquid-glass rounded-[28px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Class insights</h2>
                <p className="text-white/60 text-sm">Student progress and engagement at a glance</p>
              </div>
              <span className="accent-tag">Top cohort</span>
            </div>
            <div className="space-y-3">
              {instituteStudents.slice(0, 5).map((student: { id: string; name: string; className: string; section: string }) => (
                <div key={student.id} className="rounded-2xl bg-white/[0.03] p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-white/60 text-sm">{student.className} • {student.section}</p>
                  </div>
                  <div className="text-emerald-300 text-sm">{(masteryMap[student.id]?.Math ?? 60)}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="liquid-glass rounded-[28px] p-6">
              <div className="flex items-center gap-2 mb-4"><GraduationCap size={18} /> <h2 className="text-xl font-semibold">Advanced students</h2></div>
              <div className="space-y-3">
                {advancedStudents.map((student: { id: string; name: string }) => <div key={student.id} className="rounded-2xl bg-white/[0.03] p-3 text-sm">{student.name}</div>)}
              </div>
            </div>
            <div className="liquid-glass rounded-[28px] p-6">
              <div className="flex items-center gap-2 mb-4"><ClipboardList size={18} /> <h2 className="text-xl font-semibold">Students at risk</h2></div>
              <div className="space-y-3">
                {riskStudents.map((student: { id: string; name: string }) => <div key={student.id} className="rounded-2xl bg-white/[0.03] p-3 text-sm">{student.name}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default FacultyDashboard;
