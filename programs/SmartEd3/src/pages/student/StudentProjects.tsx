import { useState } from 'react';
import projects from '../../../database/projects.json';

function StudentProjects() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="liquid-glass rounded-3xl p-6">
          <h1 className="text-3xl font-semibold">Project-based learning</h1>
          <p className="text-white/70 mt-2">Track commits, peer feedback, and team progress.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project: { id: string; title: string; team: string; progress: number; nextMilestone: string; feedback: string }) => (
            <div key={project.id} className="liquid-glass rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{project.title}</h2>
                <span className="text-sm text-emerald-300">{project.progress}%</span>
              </div>
              <p className="text-white/60 text-sm mt-2">Team: {project.team}</p>
              <p className="text-white/70 mt-4">Next milestone: {project.nextMilestone}</p>
              <p className="text-white/60 mt-2">Peer feedback: {project.feedback}</p>
            </div>
          ))}
        </div>
        <div className="liquid-glass rounded-3xl p-6">
          <button onClick={() => setOpen((value) => !value)} className="bg-white text-black rounded-full px-5 py-2">Open peer review</button>
          {open ? <div className="mt-4 rounded-2xl bg-white/[0.03] p-4">Anonymous peer-review modal seeded for the experience.</div> : null}
        </div>
      </div>
    </div>
  );
}

export default StudentProjects;
