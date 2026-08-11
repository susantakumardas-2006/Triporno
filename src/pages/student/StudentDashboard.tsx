import { useMemo, useState } from 'react';
import { ArrowRight, Bell, BookOpen, Flame, Globe, Lock, Search, Sparkles, Crown, CheckCircle2, LayoutGrid, MessageCircle, Trophy, ClipboardList, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import ChatButton from '../../Chatbot/ChatButton';
import problems from '../../../database/problems.json';
import concepts from '../../../database/concepts.json';
import mastery from '../../../database/masteryRecords.json';
import submissions from '../../../database/submissions.json';
import homework from '../../../database/homework.json';
import students from '../../../database/students.json';
import institutes from '../../../database/institutes.json';

const boards = ['CBSE', 'ICSE/ISC', 'IB', 'IGCSE', 'WBCHSE', 'Other State Board'];

function StudentDashboard() {
  const navigate = useNavigate();
  const [showPremium, setShowPremium] = useState(false);
  const [showInstitutePicker, setShowInstitutePicker] = useState(false);
  const [selectedInstituteId, setSelectedInstituteId] = useState(() => {
    if (typeof window === 'undefined') return institutes[0]?.id ?? '';
    return window.localStorage.getItem('smarted-selected-institute-id') ?? institutes[0]?.id ?? '';
  });
  const [instituteClass, setInstituteClass] = useState(() => {
    if (typeof window === 'undefined') return 'Grade 10';
    return window.localStorage.getItem('smarted-selected-institute-class') ?? 'Grade 10';
  });
  const [instituteSection, setInstituteSection] = useState(() => {
    if (typeof window === 'undefined') return 'A';
    return window.localStorage.getItem('smarted-selected-institute-section') ?? 'A';
  });
  const [instituteQuery, setInstituteQuery] = useState('');
  const [scope, setScope] = useState('Global');
  const [board, setBoard] = useState('CBSE');
  const [topicFilter, setTopicFilter] = useState('All Topics');

  const updateSelectedInstituteId = (id: string) => {
    setSelectedInstituteId(id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('smarted-selected-institute-id', id);
    }
  };

  const updateInstituteClass = (value: string) => {
    setInstituteClass(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('smarted-selected-institute-class', value);
    }
  };

  const updateInstituteSection = (value: string) => {
    setInstituteSection(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('smarted-selected-institute-section', value);
    }
  };
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
  const filteredInstitutes = institutes.filter((institute) => institute.name.toLowerCase().includes(instituteQuery.toLowerCase()) || institute.city.toLowerCase().includes(instituteQuery.toLowerCase()));
  const selectedInstitute = institutes.find((institute) => institute.id === selectedInstituteId) ?? institutes[0];

  return (
    <AppShell
      title="Student workspace"
      subtitle="Your learning pulse, sharpened."
      sidebarHeaderBadge={
        <Link to="/app/student/institute" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10">
          <p className="text-white/60 text-xs uppercase tracking-[0.22em] mb-2">Selected institute</p>
          <p className="font-semibold text-white">{selectedInstitute.name}</p>
          <p className="text-white/60 text-sm">Class {instituteClass} • Section {instituteSection}</p>
        </Link>
      }
      actions={
        <>
          <button type="button" onClick={() => setShowPremium(true)} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
            Premium
          </button>
          <Link to="/app/student/profile" className="rounded-full border border-white/20 px-4 py-2 text-sm">
            Profile
          </Link>
        </>
      }
      navItems={[
        { to: '/app/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { label: 'Institute', icon: Building2, isBold: true, onClick: () => setShowInstitutePicker(true) },
        { to: '/app/student/practice', label: 'Practice', icon: Flame },
        { to: '/app/student/homework', label: 'Homework', icon: BookOpen },
        { to: '/app/student/projects', label: 'Projects', icon: ClipboardList },
        { to: '/app/student/discuss', label: 'Discuss', icon: MessageCircle },
        { to: '/app/student/contest', label: 'Contest', icon: Trophy },
      ]}
    >
      <div className="space-y-8">
        <div className="liquid-glass rounded-[32px] border border-white/10 p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-4">Student workspace</p>
              <h1 className="text-4xl md:text-5xl font-semibold section-heading">Your learning pulse, sharpened.</h1>
              <p className="mt-4 text-white/70 leading-8 section-subtitle">Live mastery insights, focused practice, and peer collaboration all within a glass-backed app experience.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="feature-pill">
                <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Rank</p>
                <p className="mt-3 text-2xl font-semibold">#{scope === 'Board' ? 18 : 12}</p>
              </div>
              <div className="feature-pill">
                <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Accuracy</p>
                <p className="mt-3 text-2xl font-semibold">{accuracy}%</p>
              </div>
              <div className="feature-pill">
                <p className="text-white/60 text-xs uppercase tracking-[0.22em]">Streak</p>
                <p className="mt-3 text-2xl font-semibold">{studentSubmissions.filter((entry: { correct: boolean }) => entry.correct).length > 0 ? '7d' : '0d'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-[28px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-white/60 text-sm">Scope</p>
              <h2 className="text-xl font-semibold">{rankingScope} view</h2>
            </div>
            <div className="flex flex-wrap gap-3">
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
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[24px] bg-white/[0.03] p-5">
              <p className="text-white/60 text-sm">Practice queue</p>
              <p className="mt-3 text-2xl font-semibold">{filteredProblems.length} problems</p>
            </div>
            <div className="rounded-[24px] bg-white/[0.03] p-5">
              <p className="text-white/60 text-sm">Focus topics</p>
              <p className="mt-3 text-2xl font-semibold">{focusTopics.length} areas</p>
            </div>
            <div className="rounded-[24px] bg-white/[0.03] p-5">
              <p className="text-white/60 text-sm">Live rank</p>
              <p className="mt-3 text-2xl font-semibold">#{rankingScope === 'Board' ? 18 : 12}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 py-0 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <section className="space-y-6">
          <div className="liquid-glass rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
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
                      Open <ArrowRight size={15} />
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
            <p className="text-white/60 text-sm">Selected institute</p>
            <h3 className="text-xl font-semibold mt-3">{selectedInstitute.name}</h3>
            <p className="mt-2 text-white/60">{selectedInstitute.city} • {selectedInstitute.board}</p>
            <p className="mt-3 text-white/60">Class {instituteClass} • Section {instituteSection}</p>
            <Link to="/app/student/institute" className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5">
              Open institute hub
            </Link>
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
      </div>

      <ChatButton />

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
      {showInstitutePicker ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="liquid-glass rounded-3xl p-6 max-w-2xl w-full">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-2">Choose your institute</p>
                <h3 className="text-2xl font-semibold">Institute selection</h3>
              </div>
              <button onClick={() => setShowInstitutePicker(false)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">Close</button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.85fr_0.45fr]">
              <div className="space-y-4">
                <div className="rounded-3xl bg-white/[0.03] p-4">
                  <label className="text-sm text-white/60">Search institutes</label>
                  <input
                    type="text"
                    value={instituteQuery}
                    onChange={(event) => setInstituteQuery(event.target.value)}
                    placeholder="Search by institute name or city"
                    className="mt-3 w-full rounded-full bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40"
                  />
                </div>
                <div className="rounded-3xl bg-white/[0.03] p-4">
                  <label className="text-sm text-white/60">Class</label>
                  <select
                    value={instituteClass}
                    onChange={(event) => updateInstituteClass(event.target.value)}
                    className="mt-3 w-full rounded-full bg-white/10 px-4 py-3 text-white outline-none"
                  >
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </div>
                <div className="rounded-3xl bg-white/[0.03] p-4">
                  <label className="text-sm text-white/60">Section</label>
                  <select
                    value={instituteSection}
                    onChange={(event) => updateInstituteSection(event.target.value)}
                    className="mt-3 w-full rounded-full bg-white/10 px-4 py-3 text-white outline-none"
                  >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {filteredInstitutes.slice(0, 6).map((institute) => (
                  <button
                    key={institute.id}
                    onClick={() => {
                      updateSelectedInstituteId(institute.id);
                      setShowInstitutePicker(false);
                      navigate('/app/student/institute');
                    }}
                    className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/20"
                  >
                    <p className="font-semibold">{institute.name}</p>
                    <p className="text-sm text-white/60">{institute.city} • {institute.board}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white/[0.03] p-6">
              <h4 className="text-lg font-semibold">Selected</h4>
              <p className="mt-3 text-white/70">{selectedInstitute?.name}</p>
              <p className="text-white/60">{selectedInstitute?.city} • {selectedInstitute?.board}</p>
              <p className="text-white/60 mt-3">Class {instituteClass}, Section {instituteSection}</p>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

export default StudentDashboard;
