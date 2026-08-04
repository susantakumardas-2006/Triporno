import { useMemo, useState } from 'react';
import { ArrowRight, Bell, BookOpen, Flame, Globe, Lock, Search, Sparkles, Crown, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import problems from '../../../database/problems.json';
import concepts from '../../../database/concepts.json';
import mastery from '../../../database/masteryRecords.json';
import submissions from '../../../database/submissions.json';
import homework from '../../../database/homework.json';
import students from '../../../database/students.json';
import institutes from '../../../database/institutes.json';

const boards = ['CBSE', 'ICSE/ISC', 'IB', 'IGCSE', 'WBCHSE', 'Other State Board'];

function StudentDashboard() {
  const [showPremium, setShowPremium] = useState(false);
  const [scope, setScope] = useState('Global');
  const [board, setBoard] = useState('CBSE');
  const [topicFilter, setTopicFilter] = useState('All Topics');
  const [premium, setPremium] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('smarted-premium') === 'true';
  });

  const topics = concepts.subjects.flatMap((subject: { topics: string[] }) => subject.topics);
  const studentId = 'student-1';
  const student = students.find((entry: { id: string }) => entry.id === studentId);
  const studentMastery = mastery[studentId] as Record<string, number>;
  const studentSubmissions = submissions.filter((entry: { studentId: string }) => entry.studentId === studentId);
  const solvedCount = studentSubmissions.filter((entry: { correct: boolean }) => entry.correct).length;
  const accuracy = Math.round((solvedCount / Math.max(studentSubmissions.length, 1)) * 100);

  const filteredProblems = useMemo(() => {
    const list = problems.filter((problem: { conceptTags: string[] }) => {
      if (topicFilter === 'All Topics') return true;
      return problem.conceptTags.includes(topicFilter);
    });

    return list.slice(0, 8).map((problem: { id: string; title: string; conceptTags: string[]; liveToughnessRating: number; solvedCount: number; attemptedCount: number; authorType?: string }) => {
      const ratio = Math.round((problem.solvedCount / Math.max(problem.attemptedCount, 1)) * 100);
      const label = problem.liveToughnessRating < 1200 ? 'Easy' : problem.liveToughnessRating <= 1600 ? 'Medium' : 'Hard';
      return { ...problem, ratio, label };
    });
  }, [topicFilter]);

  const focusTopics = useMemo(() => {
    return Object.entries(studentMastery)
      .sort((a, b) => (a[1] as number) - (b[1] as number))
      .slice(0, 4)
      .map(([topic, score]) => ({ topic, score: score as number }));
  }, [studentMastery]);

  const handleUnlockPremium = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('smarted-premium', 'true');
    }
    setPremium(true);
    setShowPremium(false);
  };

  const rankingScope = scope === 'Board' ? board : scope;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 py-3 border-b border-white/[0.05] sticky top-0 bg-black/80 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-base font-semibold">
            <Globe size={18} /> SmartEd
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            <select value={scope} onChange={(event) => setScope(event.target.value)} className="rounded-full bg-white/10 px-3 py-2 text-white outline-none">
              <option>Global</option>
              <option>National</option>
              <option>Institute</option>
              <option>Board</option>
            </select>
            {scope === 'Board' ? (
              <select value={board} onChange={(event) => setBoard(event.target.value)} className="rounded-full bg-white/10 px-3 py-2 text-white outline-none">
                {boards.map((choice) => <option key={choice}>{choice}</option>)}
              </select>
            ) : null}
            <Link to="/app/student/contest" className="rounded-full px-3 py-2 hover:bg-white/10">Contest</Link>
            <Link to="/app/student/discuss" className="rounded-full px-3 py-2 hover:bg-white/10">Discuss</Link>
            <Link to="/app/student/projects" className="rounded-full px-3 py-2 hover:bg-white/10">Peer Review</Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="liquid-glass rounded-full p-2"><Search size={16} /></button>
            <button className="liquid-glass rounded-full p-2 relative"><Bell size={16} /><span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-white" /></button>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><Flame size={16} /> <span>7</span></div>
            <button onClick={() => setShowPremium(true)} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">Premium</button>
            <Link to="/app/student/profile" className="rounded-full border border-white/20 px-4 py-2 text-sm">Profile</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <section className="space-y-6">
          <div className="liquid-glass rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-white/60 text-sm">Practice queue</p>
                <h2 className="text-2xl font-semibold">Problem set</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setTopicFilter('All Topics')} className={`rounded-full px-3 py-1.5 text-sm ${topicFilter === 'All Topics' ? 'bg-white text-black' : 'bg-white/10'}`}>All Topics</button>
                {topics.slice(0, 4).map((topic) => (
                  <button key={topic} onClick={() => setTopicFilter(topic)} className={`rounded-full px-3 py-1.5 text-sm ${topicFilter === topic ? 'bg-white text-black' : 'bg-white/10'}`}>{topic}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {filteredProblems.map((problem) => (
                <div key={problem.id} className="liquid-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-[220px]">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs uppercase tracking-wide">{problem.label}</span>
                      <span>{problem.conceptTags.join(' • ')}</span>
                    </div>
                    <p className="font-medium mt-2">{problem.title}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{problem.ratio}% solved</span>
                    <Link to={`/app/student/practice/arena/${problem.id}`} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white">
                      {premium ? 'View answer' : 'Open'} <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Focus areas</h3>
                <Sparkles size={16} className="text-white/60" />
              </div>
              <div className="space-y-3">
                {focusTopics.map((item) => (
                  <div key={item.topic} className="rounded-2xl bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.topic}</span>
                      <span className="text-white/70">{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Your interests</h3>
                <BookOpen size={16} className="text-white/60" />
              </div>
              <div className="space-y-3">
                {['Physics', 'Project design', 'Peer review'].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/[0.03] p-3 text-sm text-white/70">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="liquid-glass rounded-3xl p-6">
            <p className="text-white/60 text-sm">Mastery score</p>
            <div className="text-5xl font-semibold my-2">{Math.round((studentMastery.Math ?? 72) + accuracy / 10)}%</div>
            <p className="text-white/60">Adaptive practice, homework, and peer reviews feed this number in real time.</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <p className="text-white/60 text-sm">Rank</p>
            <div className="text-3xl font-semibold my-2">#{scope === 'Board' ? 18 : 12} {rankingScope}</div>
            <p className="text-white/60">Your scope updates the leaderboard and public problem feed.</p>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <p className="text-white/60 text-sm">Streak calendar</p>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[10px] text-white/50">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => <div key={day}>{day}</div>)}
              {Array.from({ length: 21 }).map((_, index) => (
                <div key={index} className={`h-6 rounded-sm ${index % 5 === 0 ? 'bg-white/20' : 'bg-white/10'}`} />
              ))}
            </div>
            <div className="mt-3 rounded-2xl bg-white/[0.03] p-3 text-sm text-white/70">Solved {solvedCount} problems • {accuracy}% accuracy • 7 day streak</div>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <p className="text-white/60 text-sm">Trending institutes</p>
            <div className="space-y-3 mt-3">
              {institutes.slice(0, 3).map((institute: { id: string; name: string; city: string }) => (
                <div key={institute.id} className="rounded-2xl bg-white/[0.02] p-3 text-sm">{institute.name} • {institute.city}</div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {showPremium ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="liquid-glass rounded-3xl p-6 max-w-lg w-full">
            <div className="flex items-center gap-2 text-emerald-300 mb-3"><Crown size={18} /> Premium</div>
            <h3 className="text-2xl font-semibold">Unlock mentor-led mastery paths</h3>
            <p className="text-white/70 mt-2">Get solution access, mentor reviews, and full analytics on every practice session.</p>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2"><span>Practice problems and mastery tracking</span><span>Included</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2"><span>Problem solutions</span><span>Unlocked</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2"><span>Mentor help and monthly review</span><span>Included</span></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPremium(false)} className="flex-1 rounded-full bg-white text-black px-4 py-2">Close</button>
              <button onClick={handleUnlockPremium} className="flex-1 rounded-full border border-white/20 px-4 py-2">Access Premium</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StudentDashboard;
