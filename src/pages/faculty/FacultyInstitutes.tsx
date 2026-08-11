import { useMemo } from 'react';
import { Building2, Users2, Sparkles, Trophy, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import institutes from '../../../database/institutes.json';
import faculty from '../../../database/faculty.json';
import students from '../../../database/students.json';
import mastery from '../../../database/masteryRecords.json';

function FacultyInstitutes() {
  const currentFaculty = faculty[0];
  const facultyInstitutes = institutes.filter((institute: { id: string }) => currentFaculty.instituteIds.includes(institute.id));
  const masteryMap = mastery as Record<string, Record<string, number>>;

  const instituteRows = useMemo(
    () => facultyInstitutes.map((institute) => {
      const instituteStudents = students.filter((student: { instituteId: string }) => student.instituteId === institute.id);
      const averageMastery = Math.round(
        instituteStudents.reduce((sum, student) => sum + (masteryMap[student.id]?.Math ?? 60), 0) / Math.max(instituteStudents.length, 1)
      );
      return {
        ...institute,
        studentCount: instituteStudents.length,
        averageMastery,
      };
    }),
    [facultyInstitutes, masteryMap]
  );

  const totalStudents = instituteRows.reduce((sum, institute) => sum + institute.studentCount, 0);
  const overallAverage = Math.round(
    instituteRows.reduce((sum, institute) => sum + institute.averageMastery, 0) / Math.max(instituteRows.length, 1)
  );

  const navItems = [
    { to: '/app/faculty/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/faculty/institutes', label: 'Institute', icon: Building2 },
    { to: '/app/faculty/students', label: 'Student', icon: Trophy },
  ];

  return (
    <AppShell
      title="Faculty institutes"
      subtitle="View your institutes and how each one is performing."
      actions={
        <>
          <Link to="/app/faculty/students" className="rounded-full border border-white/20 px-4 py-2 text-sm">
            Student roster
          </Link>
          <Link to="/app/faculty/dashboard" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
            Faculty dashboard
          </Link>
        </>
      }
      navItems={navItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="liquid-glass rounded-3xl p-6">
            <Building2 className="mb-3" />
            <p className="text-white/60 text-sm">Institutes</p>
            <p className="text-3xl font-semibold">{instituteRows.length}</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Users2 className="mb-3" />
            <p className="text-white/60 text-sm">Students</p>
            <p className="text-3xl font-semibold">{totalStudents}</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Sparkles className="mb-3" />
            <p className="text-white/60 text-sm">Average mastery</p>
            <p className="text-3xl font-semibold">{overallAverage}%</p>
          </div>
        </div>

        <div className="grid gap-4">
          {instituteRows.map((institute) => (
            <div key={institute.id} className="liquid-glass rounded-[28px] p-6 border border-white/10">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{institute.name}</h2>
                  <p className="text-white/60 text-sm">{institute.city} • {institute.board}</p>
                </div>
                <span className="accent-tag">{institute.subscribed ? 'Subscribed' : 'Pending'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                <div>
                  <p className="text-white/50 uppercase tracking-[0.32em] text-xs">Students</p>
                  <p className="mt-2 font-medium">{institute.studentCount}</p>
                </div>
                <div>
                  <p className="text-white/50 uppercase tracking-[0.32em] text-xs">Average mastery</p>
                  <p className="mt-2 font-medium">{institute.averageMastery}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default FacultyInstitutes;
