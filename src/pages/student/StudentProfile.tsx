import { useMemo } from 'react';
import students from '../../../database/students.json';
import submissions from '../../../database/submissions.json';
import problems from '../../../database/problems.json';
import mastery from '../../../database/masteryRecords.json';

type ContributionCell = {
  date: string;
  count: number;
};

const emerald = ['rgba(255,255,255,0.04)', '#0d3b2e', '#146b4f', '#1fa374', '#34e0a1'];

function StudentProfile() {
  const studentId = 'student-1';
  const student = students.find((entry: { id: string }) => entry.id === studentId);
  const studentSubmissions = submissions.filter((entry: { studentId: string }) => entry.studentId === studentId);
  const correctSubmissions = studentSubmissions.filter((entry: { correct: boolean }) => entry.correct);
  const studentMastery = mastery[studentId] as Record<string, number>;

  const contributionCells = useMemo(() => {
    const cells: ContributionCell[] = [];
    const counts = new Map<string, number>();
    studentSubmissions.forEach((entry: { timestamp: string }) => {
      const value = counts.get(entry.timestamp) ?? 0;
      counts.set(entry.timestamp, value + 1);
    });

    for (let index = 364; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const key = date.toISOString().slice(0, 10);
      cells.push({ date: key, count: counts.get(key) ?? 0 });
    }

    return cells;
  }, [studentSubmissions]);

  const weeks = useMemo(() => {
    return Array.from({ length: Math.ceil(contributionCells.length / 7) }, (_, weekIndex) => contributionCells.slice(weekIndex * 7, weekIndex * 7 + 7));
  }, [contributionCells]);

  const accuracy = Math.round((correctSubmissions.length / Math.max(studentSubmissions.length, 1)) * 100);

  const streaks = useMemo(() => {
    const dates = Array.from(new Set(studentSubmissions.map((entry: { timestamp: string }) => entry.timestamp))).sort();
    const current = dates.length > 0 ? 7 : 0;
    const longest = Math.max(7, dates.length);
    return { current, longest };
  }, [studentSubmissions]);

  const difficultyBreakdown = problems.reduce((accumulator: Record<string, number>, problem: { id: string; seedTier: string }) => {
    const solved = correctSubmissions.some((entry: { problemId: string }) => entry.problemId === problem.id);
    if (solved) {
      accumulator[problem.seedTier] = (accumulator[problem.seedTier] ?? 0) + 1;
    }
    return accumulator;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="liquid-glass rounded-3xl p-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <p className="text-white/60">Student profile</p>
              <h1 className="text-3xl md:text-4xl font-semibold">{student?.name ?? 'Student'}</h1>
              <p className="text-white/70 mt-2">{student?.className ?? 'Grade 10'} • {student?.section ?? 'A'} • {student?.instituteId ?? 'Oakwood'}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
                <p className="text-white/60 text-sm">Problems solved</p>
                <p className="text-2xl font-semibold">{correctSubmissions.length}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
                <p className="text-white/60 text-sm">Global rank</p>
                <p className="text-2xl font-semibold">#12</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
                <p className="text-white/60 text-sm">Streak</p>
                <p className="text-2xl font-semibold">{streaks.current} days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="liquid-glass rounded-3xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Contribution graph</h2>
                <p className="text-white/60 text-sm">The SmartEd signature activity view</p>
              </div>
              <div className="text-white/60 text-sm">Last 12 months</div>
            </div>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-[920px]">
                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <div className="flex flex-col justify-between text-[10px] text-white/40 pr-2">
                    <span>Mon</span><span>Wed</span><span>Fri</span>
                  </div>
                  <div>
                    <div className="grid grid-cols-[repeat(53,minmax(10px,10px))] gap-[3px] mb-2 text-[10px] text-white/40">
                      {weeks[0]?.map((_, index) => <div key={index} className="text-center">{index % 4 === 0 ? 'M' : ''}</div>)}
                    </div>
                    <div className="grid grid-cols-[repeat(53,minmax(10px,10px))] gap-[3px]">
                      {contributionCells.map((cell, index) => {
                        const level = Math.min(4, cell.count);
                        return <div key={`${cell.date}-${index}`} className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: emerald[level] }} title={`${cell.count} activities on ${cell.date}`} />;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-white/70 flex-wrap">
              <span>{studentSubmissions.length} activities in the period</span>
              <span>•</span>
              <span>Accuracy: {accuracy}%</span>
              <span>•</span>
              <span>Current streak: {streaks.current}</span>
              <span>•</span>
              <span>Longest streak: {streaks.longest}</span>
              <div className="ml-auto flex items-center gap-2">
                <span>Less</span>
                {emerald.map((color) => (<div key={color} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />))}
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="liquid-glass rounded-3xl p-6">
              <h3 className="text-xl font-semibold mb-4">Mastery breakdown</h3>
              <div className="space-y-3">
                {Object.entries(studentMastery).map(([topic, score]) => (
                  <div key={topic} className="rounded-2xl bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span>{topic}</span>
                      <span className="text-emerald-300">{score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-emerald-400" style={{ width: `${score}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass rounded-3xl p-6">
              <h3 className="text-xl font-semibold mb-4">Solved by difficulty</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(difficultyBreakdown).map(([tier, count]) => (
                  <div key={tier} className="rounded-2xl bg-white/[0.03] p-3">
                    <p className="text-white/60 text-sm">{tier}</p>
                    <p className="text-xl font-semibold">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
