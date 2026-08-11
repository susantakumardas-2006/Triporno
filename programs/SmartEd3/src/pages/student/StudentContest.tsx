import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import { LayoutGrid, Flame, BookOpen, ClipboardList, MessageCircle, Trophy } from 'lucide-react';
import contests from '../../../database/contests.json';

function StudentContest() {
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
      title="Contest arena"
      subtitle="Register for upcoming challenges."
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
                <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-3">Contests</p>
                <h1 className="text-4xl font-semibold section-heading">Live contest arena</h1>
                <p className="text-white/70 mt-3 section-subtitle">Register for upcoming contests, track their status, and compare your performance with the cohort.</p>
              </div>
              <button className="link-button">View leaderboard</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contests.map((contest: { id: string; title: string; starts: string; duration: string; participants: number; reward: string }) => (
              <div key={contest.id} className="liquid-glass rounded-3xl p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{contest.title}</h2>
                    <p className="text-white/60 text-sm">Starts {contest.starts} • {contest.duration} • {contest.participants} participants</p>
                  </div>
                  <Link to="/app/student/contest" className="bg-white text-black rounded-full px-5 py-2 whitespace-nowrap">Register</Link>
                </div>
                <p className="text-white/70 mt-4">{contest.reward}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default StudentContest;
