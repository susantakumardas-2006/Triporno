import { useMemo } from 'react';
import { Trophy, Users2, LayoutGrid, Building2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import institutes from '../../../database/institutes.json';
import faculty from '../../../database/faculty.json';
import students from '../../../database/students.json';
import mastery from '../../../database/masteryRecords.json';

function InstituteFaculty() {
  const institute = institutes[0];
  const instituteFaculty = faculty.filter((member: { instituteIds: string[] }) => member.instituteIds.includes(institute.id));
  const instituteStudents = students.filter((student: { instituteId: string }) => student.instituteId === institute.id);
  const masteryMap = mastery as Record<string, Record<string, number>>;

  const averageMastery = useMemo(() => {
    const scores = instituteStudents.map((student) => masteryMap[student.id]?.Math ?? 60);
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1));
  }, [instituteStudents, masteryMap]);

  const memberRows = useMemo(
    () => instituteFaculty.map((member) => ({
      ...member,
      averageMastery,
      instituteCount: member.instituteIds.length,
    })),
    [instituteFaculty, averageMastery]
  );

  const navItems = [
    { to: '/app/institute/overview', label: 'Overview', icon: Building2 },
    { to: '/app/institute/faculty', label: 'Faculty', icon: Trophy },
    { to: '/app/institute/students', label: 'Student', icon: LayoutGrid },
  ];

  return (
    <AppShell
      title="Institute faculty"
      subtitle="Review active faculty members and teaching support."
      actions={
        <>
          <Link to="/app/institute/students" className="rounded-full border border-white/20 px-4 py-2 text-sm">
            Student analytics
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
            <Trophy className="mb-3" />
            <p className="text-white/60 text-sm">Faculty members</p>
            <p className="text-3xl font-semibold">{instituteFaculty.length}</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Users2 className="mb-3" />
            <p className="text-white/60 text-sm">Institute students</p>
            <p className="text-3xl font-semibold">{instituteStudents.length}</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Sparkles className="mb-3" />
            <p className="text-white/60 text-sm">Average mastery</p>
            <p className="text-3xl font-semibold">{averageMastery}%</p>
          </div>
        </div>

        <div className="grid gap-4">
          {memberRows.map((member) => (
            <div key={member.id} className="liquid-glass rounded-[28px] p-6 border border-white/10">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{member.name}</h2>
                  <p className="text-white/60 text-sm">{member.status === 'approved' ? 'Approved faculty' : 'Pending approval'}</p>
                </div>
                <span className="accent-tag">{member.subscription ? 'Premium' : 'Standard'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-[0.32em]">Institutes</p>
                  <p className="mt-2 font-medium">{member.instituteCount}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-[0.32em]">Average mastery</p>
                  <p className="mt-2 font-medium">{member.averageMastery}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default InstituteFaculty;
