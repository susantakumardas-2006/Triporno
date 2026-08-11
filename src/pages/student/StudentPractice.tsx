import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import { Lock, LayoutGrid, Flame, BookOpen, ClipboardList, MessageCircle, Trophy } from 'lucide-react';
import problems from '../../../database/problems.json';

type Problem = {
  id: string;
  title: string;
  statement?: string;
  conceptTags: string[];
  liveToughnessRating?: number;
  seedTier?: string;
  authorType?: string;
  solution?: string;
  premium?: boolean;
};

function difficultyOf(toughness: number | undefined) {
  if (toughness === undefined) return 'Medium';
  if (toughness < 1200) return 'Easy';
  if (toughness <= 1600) return 'Medium';
  return 'Hard';
}

function StudentPractice() {
  const { problemId } = useParams();
  const [premium, setPremium] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('smarted-premium') === 'true';
  });
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const navItems = [
    { to: '/app/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/student/practice', label: 'Practice', icon: Flame },
    { to: '/app/student/homework', label: 'Homework', icon: BookOpen },
    { to: '/app/student/projects', label: 'Projects', icon: ClipboardList },
    { to: '/app/student/discuss', label: 'Discuss', icon: MessageCircle },
    { to: '/app/student/contest', label: 'Contest', icon: Trophy },
  ];

  const problemsList = useMemo(() => {
    const list = problems as Problem[];
    if (difficultyFilter === 'All') return list;
    return list.filter((problem) => difficultyOf(problem.liveToughnessRating).toLowerCase() === difficultyFilter.toLowerCase());
  }, [difficultyFilter]);

  const problem = useMemo(() => {
    if (!problemId) return undefined;
    return (problems as Problem[]).find((entry) => entry.id === problemId);
  }, [problemId]);

  const hasSolutionAccess = premium && problem?.authorType !== 'institute';
  const solutionLabel = problem?.authorType === 'institute' ? 'Solution released by your teacher' : 'Unlock with Premium';

  if (!problemId) {
    return (
      <AppShell
        title="Practice arena"
        subtitle="Solve problems, build mastery."
        actions={
          <>
            <button type="button" onClick={() => setPremium(true)} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
              Premium
            </button>
            <Link to="/app/student/profile" className="rounded-full border border-white/20 px-4 py-2 text-sm">
              Profile
            </Link>
          </>
        }
        navItems={navItems}
      >
        <div className="min-h-screen bg-black text-white px-6 py-10">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-white/60 text-sm">Practice arena</p>
                  <h1 className="text-3xl font-semibold mt-2">Problems to solve</h1>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-white/70">
                  {['All', 'Easy', 'Medium', 'Hard'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setDifficultyFilter(filter)}
                      className={`rounded-full px-4 py-2 transition ${difficultyFilter === filter ? 'bg-white text-black' : 'bg-white/10 text-white/70'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {problemsList.map((item) => (
                <Link
                  key={item.id}
                  to={`/app/student/practice/arena/${item.id}`}
                  className="liquid-glass rounded-3xl p-5 flex flex-col gap-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white/60 text-sm">{item.conceptTags.join(' • ')}</p>
                      <h2 className="text-xl font-semibold mt-2">{item.title}</h2>
                    </div>
                    <div className="text-sm text-white/60 text-right">
                      <div>{difficultyOf(item.liveToughnessRating)}</div>
                      <div className="mt-2">{item.liveToughnessRating ?? 1400} toughness</div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] p-4 text-sm text-white/70">
                    {item.statement ?? 'A practice problem from the SmartEd content queue.'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Practice arena"
      subtitle="Problem details and workspace"
      actions={
        <>
          <button type="button" onClick={() => setPremium(true)} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
            Premium
          </button>
          <Link to="/app/student/profile" className="rounded-full border border-white/20 px-4 py-2 text-sm">
            Profile
          </Link>
        </>
      }
      navItems={navItems}
    >
      <div className="min-h-screen bg-black text-white px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-white/60 text-sm">Problem details</p>
              <h1 className="text-3xl font-semibold mt-2">{problem?.title ?? 'Problem'}</h1>
            </div>
            <Link
              to="/app/student/practice"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Back to list
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">{difficultyOf(problem?.liveToughnessRating)}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{problem?.conceptTags.join(' • ')}</span>
              </div>
              <p className="text-white/70 leading-relaxed">{problem?.statement ?? 'Pick a problem from the dashboard to start.'}</p>
              <div className="mt-8 grid gap-3 md:grid-cols-3 text-sm text-white/70">
                <div className="rounded-2xl bg-white/[0.03] p-4">Live toughness<br /><span className="text-white">{problem?.liveToughnessRating ?? 1400}</span></div>
                <div className="rounded-2xl bg-white/[0.03] p-4">Difficulty<br /><span className="text-white">{problem?.seedTier ?? difficultyOf(problem?.liveToughnessRating)}</span></div>
                <div className="rounded-2xl bg-white/[0.03] p-4">Tags<br /><span className="text-white">{problem?.conceptTags.join(' • ')}</span></div>
              </div>
            </div>
            <div className="liquid-glass rounded-3xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Response workspace</h2>
                <span className="text-sm text-white/60">Auto-save enabled</span>
              </div>
              <textarea className="w-full h-64 rounded-2xl bg-white/10 p-4 outline-none text-white placeholder:text-white/40" placeholder="Write your answer or reasoning here" />
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="bg-white text-black rounded-full px-6 py-2.5">Submit</button>
                <button className="rounded-full border border-white/20 px-6 py-2.5">Ask for hint</button>
              </div>
              <div className="mt-6">
                {hasSolutionAccess ? (
                  <div className="rounded-2xl bg-white/[0.03] p-4 text-sm text-white/70">{problem?.solution ?? 'Solution unlocked for this premium problem.'}</div>
                ) : (
                  <div className="liquid-glass rounded-xl p-4 flex items-center gap-2 text-white/50">
                    <Lock size={16} /> {solutionLabel}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default StudentPractice;
