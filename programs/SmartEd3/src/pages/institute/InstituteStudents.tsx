import { useMemo } from 'react';
import { Users2, Building2, Trophy, LayoutGrid, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import institutes from '../../../database/institutes.json';
import faculty from '../../../database/faculty.json';
import students from '../../../database/students.json';
import mastery from '../../../database/masteryRecords.json';

function InstituteStudents() {
  const institute = institutes[0];
  const instituteStudents = students.filter((student: { instituteId: string }) => student.instituteId === institute.id);
  const masteryMap = mastery as Record<string, Record<string, number>>;

  const studentRows = useMemo(
    () => instituteStudents.map((student) => {
      const studentMastery = masteryMap[student.id] ?? {};
      const averageMastery = Math.round(
        Object.values(studentMastery).reduce((sum, score) => sum + score, 0) / Math.max(Object.values(studentMastery).length, 1)
      );

      return {
        ...student,
        averageMastery,
      };
    }),
    [instituteStudents, masteryMap]
  );

  const overallAverage = useMemo(() => {
    const scores = studentRows.map((row) => row.averageMastery);
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1));
  }, [studentRows]);

  const navItems = [
    { to: '/app/institute/overview', label: 'Overview', icon: Building2 },
    { to: '/app/institute/faculty', label: 'Faculty', icon: Trophy },
    { to: '/app/institute/students', label: 'Student', icon: LayoutGrid },
  ];

  return (
    <AppShell
      title="Institute students"
      subtitle="Monitor student performance across the institute."
      actions={
        <>
          <Link to="/app/institute/faculty" className="rounded-full border border-white/20 px-4 py-2 text-sm">
            Faculty details
          </Link>
          <Link to="/app/institute/overview" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
            Institute overview
          </Link>
        </>
      }
      navItems={navItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="liquid-glass rounded-3xl p-6">
            <Users2 className="mb-3" />
            <p className="text-white/60 text-sm">Active students</p>
            <p className="text-3xl font-semibold">{studentRows.length}</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Sparkles className="mb-3" />
            <p className="text-white/60 text-sm">Average mastery</p>
            <p className="text-3xl font-semibold">{overallAverage}%</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Trophy className="mb-3" />
            <p className="text-white/60 text-sm">Class groups</p>
            <p className="text-3xl font-semibold">{new Set(studentRows.map((student) => student.className)).size}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {studentRows.map((student) => (
            <div key={student.id} className="liquid-glass rounded-[28px] p-6 border border-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{student.name}</h2>
                  <p className="text-white/60 text-sm">{student.className} • {student.section}</p>
                </div>
                <span className="accent-tag">{student.status === 'approved' ? 'Approved' : 'Pending'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-white/70">
                <div>
                  <p className="text-white/50 uppercase tracking-[0.32em] text-xs">Mastery</p>
                  <p className="mt-2 font-medium">{student.averageMastery}%</p>
                </div>
                <div>
                  <p className="text-white/50 uppercase tracking-[0.32em] text-xs">Institute</p>
                  <p className="mt-2 font-medium">{institute.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default InstituteStudents;
