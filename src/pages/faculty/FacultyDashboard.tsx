import { useMemo, useState } from 'react';
import { BookOpen, ClipboardList, Users, GraduationCap } from 'lucide-react';
import faculty from '../../../database/faculty.json';
import students from '../../../database/students.json';
import problems from '../../../database/problems.json';
import mastery from '../../../database/masteryRecords.json';

function FacultyDashboard() {
  const currentFaculty = faculty[0];
  const institutes = currentFaculty?.instituteIds ?? ['oakwood'];
  const [activeInstitute, setActiveInstitute] = useState(institutes[0]);
  const masteryMap = mastery as Record<string, Record<string, number>>;

  const instituteStudents = useMemo(() => students.filter((student: { instituteId: string }) => student.instituteId === activeInstitute), [activeInstitute]);
  const averageMastery = useMemo(() => {
    const scores = instituteStudents.map((student: { id: string }) => masteryMap[student.id]?.Math ?? 60);
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1));
  }, [instituteStudents, masteryMap]);

  const riskStudents = instituteStudents.filter((student: { id: string }) => (masteryMap[student.id]?.Math ?? 60) < 55).slice(0, 3);
  const advancedStudents = instituteStudents.filter((student: { id: string }) => (masteryMap[student.id]?.Math ?? 60) > 80).slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="liquid-glass rounded-3xl p-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-white/60 text-sm">Faculty workspace</p>
            <h1 className="text-3xl font-semibold">{currentFaculty?.name ?? 'Faculty'}</h1>
            <p className="text-white/70 mt-2">Approve requests, manage classes, and monitor the institute’s learning pulse.</p>
          </div>
          {institutes.length > 1 ? (
            <select value={activeInstitute} onChange={(event) => setActiveInstitute(event.target.value)} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white outline-none">
              {institutes.map((institute) => <option key={institute} value={institute}>{institute}</option>)}
            </select>
          ) : null}
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
          <div className="liquid-glass rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Class insights</h2>
            <div className="space-y-3">
              {instituteStudents.slice(0, 5).map((student: { id: string; name: string; className: string; section: string }) => (
                <div key={student.id} className="rounded-2xl bg-white/[0.03] p-3 flex items-center justify-between">
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
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4"><GraduationCap size={16} /> <h2 className="text-xl font-semibold">Advanced students</h2></div>
              <div className="space-y-3">
                {advancedStudents.map((student: { id: string; name: string }) => <div key={student.id} className="rounded-2xl bg-white/[0.03] p-3 text-sm">{student.name}</div>)}
              </div>
            </div>
            <div className="liquid-glass rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4">Students at risk</h2>
              <div className="space-y-3">
                {riskStudents.map((student: { id: string; name: string }) => <div key={student.id} className="rounded-2xl bg-white/[0.03] p-3 text-sm">{student.name}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
