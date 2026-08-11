import { Building2, Users2, Sparkles, LayoutGrid, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import institutes from '../../../database/institutes.json';
import faculty from '../../../database/faculty.json';
import students from '../../../database/students.json';

function InstituteOverview() {
  const institute = institutes[0];
  const instituteFaculty = faculty.filter((member: { instituteIds: string[] }) => member.instituteIds.includes(institute.id));
  const instituteStudents = students.filter((student: { instituteId: string }) => student.instituteId === institute.id);
  const navItems = [
    { to: '/app/institute/overview', label: 'Overview', icon: Building2 },
    { to: '/app/institute/faculty', label: 'Faculty', icon: Trophy },
    { to: '/app/institute/students', label: 'Student', icon: LayoutGrid },
  ];

  return (
    <AppShell
      title="Institute overview"
      subtitle="View institute performance and adoption."
      actions={
        <>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">Published story</button>
          <Link to="/app/institute/faculty" className="rounded-full border border-white/20 px-4 py-2 text-sm">Faculty</Link>
        </>
      }
      navItems={navItems}
    >
      <div className="space-y-6">
        <div className="liquid-glass rounded-[32px] p-8 border border-white/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-3">Institute overview</p>
              <h1 className="text-4xl font-semibold section-heading">{institute.name}</h1>
              <p className="text-white/70 mt-4 leading-8 section-subtitle">Institute-wide adoption, engagement, and public listing insights in a premium glass-style analytics view.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="accent-tag">{institute.board}</span>
              <button className="link-button">Published success story</button>
            </div>
          </div>
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
          <div className="liquid-glass rounded-[28px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Student performance snapshot</h2>
                <p className="text-white/60 text-sm">A high-level view of student progress in the institute.</p>
              </div>
              <span className="accent-tag">Top performance</span>
            </div>
            <div className="space-y-3">
              {instituteStudents.slice(0, 6).map((student: { id: string; name: string; className: string; section: string }) => (
                <div key={student.id} className="rounded-2xl bg-white/[0.03] p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-white/60 text-sm">{student.className} • {student.section}</p>
                  </div>
                  <span className="text-emerald-300 text-sm">On track</span>
                </div>
              ))}
            </div>
          </div>
          <div className="liquid-glass rounded-[28px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Faculty roster</h2>
                <p className="text-white/60 text-sm">Institute leaders supporting student learning.</p>
              </div>
              <span className="accent-tag">{instituteFaculty.length} members</span>
            </div>
            <div className="space-y-3">
              {instituteFaculty.map((member: { id: string; name: string }) => <div key={member.id} className="rounded-2xl bg-white/[0.03] p-3 text-sm">{member.name}</div>)}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default InstituteOverview;
