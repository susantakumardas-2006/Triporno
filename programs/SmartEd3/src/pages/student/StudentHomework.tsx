import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import { LayoutGrid, Flame, BookOpen, ClipboardList, MessageCircle, Trophy } from 'lucide-react';
import homework from '../../../database/homework.json';

function StudentHomework() {
  const [selected, setSelected] = useState(homework[0]?.id ?? 'hw-1');
  const selectedHomework = homework.find((entry: { id: string }) => entry.id === selected);

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
      title="Homework hub"
      subtitle="Track assignments, drafts, and feedback."
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
              <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-3">Homework</p>
              <h1 className="text-4xl font-semibold section-heading">Assigned homework</h1>
              <p className="text-white/70 mt-3 section-subtitle">Track upcoming assignments and review the full submission summary in a calm glass workspace.</p>
            </div>
            <button className="link-button">Submit a new draft</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6">
          <div className="liquid-glass rounded-[28px] p-6">
            <div className="grid gap-3">
              {homework.map((item: { id: string; title: string; due: string; status: string }) => (
                <button key={item.id} onClick={() => setSelected(item.id)} className={`w-full text-left rounded-[22px] p-4 transition ${selected === item.id ? 'bg-white/10 border border-white/10' : 'bg-white/[0.02]'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.title}</p>
                    <span className="accent-tag">{item.status}</span>
                  </div>
                  <p className="text-white/60 text-sm mt-2">Due {item.due}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="liquid-glass rounded-[28px] p-6">
            <h2 className="text-2xl font-semibold mb-4">{selectedHomework?.title ?? 'Homework details'}</h2>
            <p className="text-white/70 leading-7">{selectedHomework?.description ?? 'Submission workspace and faculty feedback appear here.'}</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-white/[0.03] p-4 text-sm text-white/70">Topic: {selectedHomework?.topic ?? 'General'}</div>
              <div className="rounded-2xl bg-white/[0.03] p-4 text-sm text-white/70">Progress: {selectedHomework?.progress ?? 0}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  );
}

export default StudentHomework;
