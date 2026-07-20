import { Link } from 'react-router-dom';
import contests from '../../../database/contests.json';

function StudentContest() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="liquid-glass rounded-3xl p-6">
          <h1 className="text-3xl font-semibold">Contests</h1>
          <p className="text-white/70 mt-2">Individual-only contest flow with a live leaderboard.</p>
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
  );
}

export default StudentContest;
