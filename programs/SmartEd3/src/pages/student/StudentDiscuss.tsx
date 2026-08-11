import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import { LayoutGrid, Flame, BookOpen, ClipboardList, MessageCircle, Trophy } from 'lucide-react';
import discussions from '../../../database/discussions.json';

function StudentDiscuss() {
  const [selectedThread, setSelectedThread] = useState(discussions[0]?.id ?? 'thread-1');
  const selectedDiscussion = discussions.find((entry: { id: string }) => entry.id === selectedThread);

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
      title="Discussion lounge"
      subtitle="Stay connected to your cohort."
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
                <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-3">Discuss</p>
                <h1 className="text-4xl font-semibold section-heading">Cohort conversations</h1>
                <p className="text-white/70 mt-3 section-subtitle">Stay connected to your learning community with thread previews and quick replies.</p>
              </div>
              <button className="link-button">New discussion</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <div className="liquid-glass rounded-[28px] p-6">
              <h2 className="text-2xl font-semibold mb-4">Discussion threads</h2>
              <div className="space-y-3">
                {discussions.map((thread: { id: string; title: string; topic: string; replies: number }) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread.id)}
                    className={`w-full text-left rounded-[22px] p-4 transition ${selectedThread === thread.id ? 'bg-white/10 border border-white/10' : 'bg-white/[0.02]'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{thread.title}</p>
                        <p className="text-white/60 text-sm">{thread.topic}</p>
                      </div>
                      <span className="accent-tag">{thread.replies} replies</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="liquid-glass rounded-[28px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{selectedDiscussion?.title ?? 'Discussion'}</h2>
                <span className="accent-tag">{selectedDiscussion?.topic ?? 'General'}</span>
              </div>
              <p className="text-white/70 leading-7">{selectedDiscussion?.preview ?? 'This thread is seeded for the SmartEd discussion experience.'}</p>
              <div className="mt-6 rounded-2xl bg-white/[0.03] p-4 text-sm text-white/70">Replies: {selectedDiscussion?.replies ?? 0}</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default StudentDiscuss;
