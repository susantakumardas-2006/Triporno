import { useState } from 'react';
import discussions from '../../../database/discussions.json';

function StudentDiscuss() {
  const [selectedThread, setSelectedThread] = useState(discussions[0]?.id ?? 'thread-1');
  const selectedDiscussion = discussions.find((entry: { id: string }) => entry.id === selectedThread);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="liquid-glass rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Discussion threads</h2>
          {discussions.map((thread: { id: string; title: string; topic: string; replies: number }) => (
            <button key={thread.id} onClick={() => setSelectedThread(thread.id)} className={`w-full text-left rounded-2xl p-4 mb-3 ${selectedThread === thread.id ? 'bg-white/10' : 'bg-white/[0.02]'}`}>
              <p className="font-medium">{thread.title}</p>
              <p className="text-white/60 text-sm">{thread.topic} • {thread.replies} replies</p>
            </button>
          ))}
        </div>
        <div className="liquid-glass rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-4">{selectedDiscussion?.title ?? 'Discussion'}</h2>
          <p className="text-white/70">{selectedDiscussion?.preview ?? 'This thread is seeded for the SmartEd discussion experience.'}</p>
          <div className="mt-4 rounded-2xl bg-white/[0.03] p-4 text-sm text-white/70">Topic: {selectedDiscussion?.topic ?? 'General'} • {selectedDiscussion?.replies ?? 0} replies</div>
        </div>
      </div>
    </div>
  );
}

export default StudentDiscuss;
