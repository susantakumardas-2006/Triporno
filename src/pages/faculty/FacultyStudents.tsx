import { useMemo } from 'react';
import { Users2, Building2, Trophy, LayoutGrid, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import institutes from '../../../database/institutes.json';
import faculty from '../../../database/faculty.json';
import students from '../../../database/students.json';
import mastery from '../../../database/masteryRecords.json';

function FacultyStudents() {
  const currentFaculty = faculty[0];
  const facultyInstitutes = new Set(currentFaculty.instituteIds);
  const facultyStudents = students.filter((student: { instituteId: string }) => facultyInstitutes.has(student.instituteId));
  const masteryMap = mastery as Record<string, Record<string, number>>;

  const studentRows = useMemo(
    () => facultyStudents.map((student) => {
      const studentMastery = masteryMap[student.id] ?? {};
      const averageMastery = Math.round(
        Object.values(studentMastery).reduce((sum, score) => sum + score, 0) / Math.max(Object.values(studentMastery).length, 1)
      );
      const institute = institutes.find((instituteItem: { id: string }) => instituteItem.id === student.instituteId);
      return {
        ...student,
        averageMastery,
        instituteName: institute?.name ?? student.instituteId,
      };
    }),
    [facultyStudents, masteryMap]
  );

  const overallAverage = useMemo(() => {
    const scores = studentRows.map((row) => row.averageMastery);
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1));
  }, [studentRows]);

  const navItems = [
    { to: '/app/faculty/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/faculty/institutes', label: 'Institute', icon: Building2 },
    { to: '/app/faculty/students', label: 'Student', icon: Trophy },
  ];

  return (
    <AppShell
      title="Faculty students"
      subtitle="Track the students you support across your institutes."
      actions={
        <>
          <Link to="/app/faculty/institutes" className="rounded-full border border-white/20 px-4 py-2 text-sm">
            Institute summary
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
            <Users2 className="mb-3" />
            <p className="text-white/60 text-sm">Students</p>
            <p className="text-3xl font-semibold">{studentRows.length}</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Sparkles className="mb-3" />
            <p className="text-white/60 text-sm">Average mastery</p>
            <p className="text-3xl font-semibold">{overallAverage}%</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Building2 className="mb-3" />
            <p className="text-white/60 text-sm">Institutes supported</p>
            <p className="text-3xl font-semibold">{currentFaculty.instituteIds.length}</p>
          </div>
        </div>

        <div className="space-y-4">
          {studentRows.map((student) => (
            <div key={student.id} className="liquid-glass rounded-[28px] p-6 border border-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{student.name}</h2>
                  <p className="text-white/60 text-sm">{student.className} • {student.section}</p>
                </div>
                <span className="accent-tag">{student.instituteName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-white/70">
                <div>
                  <p className="text-white/50 uppercase tracking-[0.32em] text-xs">Mastery score</p>
                  <p className="mt-2 font-medium">{student.averageMastery}%</p>
                </div>
                <div>
                  <p className="text-white/50 uppercase tracking-[0.32em] text-xs">Status</p>
                  <p className="mt-2 font-medium">{student.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default FacultyStudents;
