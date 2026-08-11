import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import { LayoutGrid, Flame, BookOpen, ClipboardList, MessageCircle, Trophy } from 'lucide-react';
import projects from '../../../database/projects.json';

function StudentProjects() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: '/app/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/student/practice', label: 'Practice', icon: Flame },
    { to: '/app/student/homework', label: 'Homework', icon: BookOpen },
    { to: '/app/student/projects', label: 'Projects', icon: ClipboardList },
    { to: '/app/student/discuss', label: 'Discuss', icon: MessageCircle },
    { to: '/app/student/contest', label: 'Contest', icon: Trophy },
  ];

  return (
    <AppShell
      title="Project studio"
      subtitle="Manage teams, milestones, and review loops."
      actions={
        <>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">Premium</button>
          <Link to="/app/student/profile" className="rounded-full border border-white/20 px-4 py-2 text-sm">Profile</Link>
        </>
      }
      navItems={navItems}
    >
      <div className="min-h-screen bg-black text-white px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="liquid-glass rounded-[32px] p-8 border border-white/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-3">Projects</p>
                <h1 className="text-4xl font-semibold section-heading">Project-based learning</h1>
                <p className="text-white/70 mt-3 section-subtitle">Track team progress, milestones, and review feedback in a polished learning workspace.</p>
              </div>
              <button className="link-button">Add new project</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project: { id: string; title: string; team: string; progress: number; nextMilestone: string; feedback: string }) => (
              <div key={project.id} className="liquid-glass rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                  <span className="text-sm text-emerald-300">{project.progress}%</span>
                </div>
                <p className="text-white/60 text-sm mt-2">Team: {project.team}</p>
                <p className="text-white/70 mt-4">Next milestone: {project.nextMilestone}</p>
                <p className="text-white/60 mt-2">Peer feedback: {project.feedback}</p>
              </div>
            ))}
          </div>

          <div className="liquid-glass rounded-3xl p-6">
            <button onClick={() => setOpen((value) => !value)} className="bg-white text-black rounded-full px-5 py-2">Open peer review</button>
            {open ? <div className="mt-4 rounded-2xl bg-white/[0.03] p-4">Anonymous peer-review modal seeded for the experience.</div> : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default StudentProjects;
