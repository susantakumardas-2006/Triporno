import { Building2, Users2, Sparkles } from 'lucide-react';
import institutes from '../../../database/institutes.json';
import faculty from '../../../database/faculty.json';
import students from '../../../database/students.json';

function InstituteOverview() {
  const institute = institutes[0];
  const instituteFaculty = faculty.filter((member: { instituteIds: string[] }) => member.instituteIds.includes(institute.id));
  const instituteStudents = students.filter((student: { instituteId: string }) => student.instituteId === institute.id);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="liquid-glass rounded-3xl p-6">
          <h1 className="text-3xl font-semibold">{institute.name}</h1>
          <p className="text-white/70 mt-2">Institute-wide adoption, engagement, and public listing insights.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="liquid-glass rounded-3xl p-6">
            <Building2 className="mb-3" />
            <p className="text-white/60 text-sm">Average mastery</p>
            <p className="text-3xl font-semibold">84%</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Users2 className="mb-3" />
            <p className="text-white/60 text-sm">Faculty adoption</p>
            <p className="text-3xl font-semibold">{instituteFaculty.length}</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <Sparkles className="mb-3" />
            <p className="text-white/60 text-sm">Engagement</p>
            <p className="text-3xl font-semibold">95%</p>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="liquid-glass rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Student performance snapshot</h2>
            <div className="space-y-3">
              {instituteStudents.slice(0, 6).map((student: { id: string; name: string; className: string; section: string }) => (
                <div key={student.id} className="rounded-2xl bg-white/[0.03] p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-white/60 text-sm">{student.className} • {student.section}</p>
                  </div>
                  <span className="text-emerald-300 text-sm">On track</span>
                </div>
              ))}
            </div>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Faculty roster</h2>
            <div className="space-y-3">
              {instituteFaculty.map((member: { id: string; name: string }) => <div key={member.id} className="rounded-2xl bg-white/[0.03] p-3 text-sm">{member.name}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstituteOverview;
