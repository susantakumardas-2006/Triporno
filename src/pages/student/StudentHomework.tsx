import { useState } from 'react';
import homework from '../../../database/homework.json';

function StudentHomework() {
  const [selected, setSelected] = useState(homework[0]?.id ?? 'hw-1');
  const selectedHomework = homework.find((entry: { id: string }) => entry.id === selected);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="liquid-glass rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Assigned homework</h2>
          {homework.map((item: { id: string; title: string; due: string; status: string }) => (
            <button key={item.id} onClick={() => setSelected(item.id)} className={`w-full text-left rounded-2xl p-4 mb-3 ${selected === item.id ? 'bg-white/10' : 'bg-white/[0.02]'}`}>
              <p className="font-medium">{item.title}</p>
              <p className="text-white/60 text-sm">Due {item.due} • {item.status}</p>
            </button>
          ))}
        </div>
        <div className="liquid-glass rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-4">{selectedHomework?.title ?? 'Homework'}</h2>
          <p className="text-white/70">{selectedHomework?.description ?? 'Submission workspace and faculty feedback appear here.'}</p>
          <div className="mt-4 rounded-2xl bg-white/[0.03] p-4 text-sm text-white/70">
            Topic: {selectedHomework?.topic ?? 'General'} • Progress: {selectedHomework?.progress ?? 0}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHomework;
