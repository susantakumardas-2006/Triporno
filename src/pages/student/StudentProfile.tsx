import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import { LayoutGrid, Flame, BookOpen, ClipboardList, MessageCircle, Trophy } from 'lucide-react';
import students from '../../../database/students.json';
import submissions from '../../../database/submissions.json';
import problems from '../../../database/problems.json';
import mastery from '../../../database/masteryRecords.json';

type ContributionCell = {
  date: string;
  count: number;
};

const emerald = ['#111517', '#0f4a31', '#0f8a50', '#20b57e', '#51e5a3'];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

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

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [openTooltips, setOpenTooltips] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      setIsTouchDevice(('ontouchstart' in window) || (navigator.maxTouchPoints ?? 0) > 0);
    } catch (e) {
      setIsTouchDevice(false);
    }
  }, []);

  // close open tooltips when tapping outside the heatmap on touch devices
  useEffect(() => {
    if (!isTouchDevice) return;
    const handler = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest('.contrib-heatmap')) {
        setOpenTooltips({});
      }
    };
    document.addEventListener('touchstart', handler);
    return () => document.removeEventListener('touchstart', handler);
  }, [isTouchDevice]);

  const toggleTooltip = (date: string) => {
    setOpenTooltips(prev => ({ ...prev, [date]: !prev[date] }));
  };

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
  }, {} as Record<string, number>);

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
      title="Student profile"
      subtitle="Your performance, progress, and growth."
      actions={
        <>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">Premium</button>
          <Link to="/app/student/profile" className="rounded-full border border-white/20 px-4 py-2 text-sm">Profile</Link>
        </>
      }
      navItems={navItems}
    >
      <div className="min-h-screen bg-black text-white px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="liquid-glass rounded-[32px] p-8 border border-white/10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-4">Student profile</p>
                <h1 className="text-4xl md:text-5xl font-semibold section-heading">{student?.name ?? 'Student'}</h1>
                <p className="mt-4 max-w-2xl text-white/70 leading-8 section-subtitle">A full view of your mastery, contribution streak, and performance trends in a calm, glass-style navigation experience.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 w-full sm:w-auto">
                <div className="feature-pill text-center">
                  <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Solved</p>
                  <p className="mt-3 text-2xl font-semibold">{correctSubmissions.length}</p>
                </div>
                <div className="feature-pill text-center">
                  <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Accuracy</p>
                  <p className="mt-3 text-2xl font-semibold">{accuracy}%</p>
                </div>
                <div className="feature-pill text-center">
                  <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Streak</p>
                  <p className="mt-3 text-2xl font-semibold">{streaks.current}d</p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-white/70 text-sm">{student?.className ?? 'Grade 10'} • {student?.section ?? 'A'} • {student?.instituteId ?? 'Oakwood'}</div>
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
                <div className="contrib-heatmap inline-block min-w-[940px]">
                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <div className="flex flex-col justify-between text-[10px] text-white/40 pr-2">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                    </div>
                    <div>
                      <div className="grid grid-cols-[repeat(53,minmax(12px,12px))] gap-[4px] mb-2 text-[10px] text-white/40">
                        {Array.from({ length: 53 }).map((_, index) => (
                          <div key={index} className="text-center">{index % 4 === 0 ? 'M' : ''}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-[repeat(53,minmax(12px,12px))] gap-[4px]">
                        {contributionCells.map((cell, index) => {
                          const level = Math.min(4, cell.count);
                          const formattedDate = formatDate(cell.date);
                          const tooltip = cell.count > 0 ? `${cell.count} activit${cell.count === 1 ? 'y' : 'ies'} on ${formattedDate}` : `No activity on ${formattedDate}`;
                          const isOpen = !!openTooltips[cell.date];
                          return (
                            <div
                              key={`${cell.date}-${index}`}
                              className={`relative group ${isTouchDevice && isOpen ? 'tooltip-open' : ''}`}
                              onClick={isTouchDevice ? () => toggleTooltip(cell.date) : undefined}
                            >
                              <div
                                className="w-[12px] h-[12px] rounded-sm border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                                style={{ backgroundColor: emerald[level] }}
                                aria-label={tooltip}
                                role="img"
                              />
                              <div className="pointer-events-none absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-black/80 rounded-md text-white opacity-0 group-hover:opacity-100 tooltip-animate whitespace-nowrap shadow-lg">
                                {tooltip}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-sm text-white/60">
                <div className="flex flex-wrap items-center gap-3">
                  <span>{studentSubmissions.length} activities</span>
                  <span>•</span>
                  <span>Accuracy {accuracy}%</span>
                  <span>•</span>
                  <span>Current streak {streaks.current}d</span>
                  <span>•</span>
                  <span>Longest streak {streaks.longest}d</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span>Less</span>
                  {emerald.map((color) => (
                    <div key={color} className="h-3 w-3 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
                  ))}
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
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${score}%` }} />
                      </div>
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
    </AppShell>
  );
}

export default StudentProfile;
