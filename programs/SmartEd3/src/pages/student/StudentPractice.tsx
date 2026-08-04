import { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import problems from '../../../database/problems.json';

function StudentPractice() {
  const { problemId } = useParams();
  const [premium] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('smarted-premium') === 'true';
  });
  const problem = useMemo(() => problems.find((entry: { id: string }) => entry.id === problemId), [problemId]);

  const hasSolutionAccess = premium && problem?.authorType !== 'institute';
  const solutionLabel = problem?.authorType === 'institute' ? 'Solution released by your teacher' : 'Unlock with Premium';

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[80vh]">
        <div className="lg:col-span-4 liquid-glass rounded-3xl p-6">
          <p className="text-white/60 text-sm">Practice arena</p>
          <h1 className="text-3xl font-semibold mt-2">{problem?.title ?? 'Problem'}</h1>
          <p className="text-white/70 mt-4">{problem?.statement ?? 'Pick a problem from the dashboard to start.'}</p>
          <div className="mt-6 space-y-3 text-sm text-white/70">
            <div className="rounded-2xl bg-white/[0.03] p-3">Difficulty: {problem?.seedTier ?? 'Medium'}</div>
            <div className="rounded-2xl bg-white/[0.03] p-3">Tags: {problem?.conceptTags?.join(' • ') ?? 'Math'}</div>
            <div className="rounded-2xl bg-white/[0.03] p-3">Live toughness: {problem?.liveToughnessRating ?? 1400}</div>
          </div>
        </div>
        <div className="lg:col-span-8 liquid-glass rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Response workspace</h2>
            <span className="text-sm text-white/60">Auto-save enabled</span>
          </div>
          <textarea className="w-full h-64 rounded-2xl bg-white/10 p-4 outline-none" placeholder="Write your answer or reasoning here" />
          <div className="mt-4 flex gap-3">
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
  );
}

export default StudentPractice;
