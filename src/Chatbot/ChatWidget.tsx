import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { sendMessage, ChatMessage } from './chatService';

type Props = { onClose: () => void };

export default function ChatWidget({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const elRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
  const dragging = useRef(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('studybuddy-position');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        // clamp saved position to viewport
        const clamped = {
          x: Math.min(Math.max(8, p.x), Math.max(8, window.innerWidth - 360 - 8)),
          y: Math.min(Math.max(8, p.y), Math.max(8, window.innerHeight - 200)),
        };
        setPos(clamped);
      } catch {}
    } else {
      // default bottom-left placement
      const defaultX = 20;
      const defaultHeight = 520;
      const defaultBottom = 80;
      const defaultY = Math.max(40, window.innerHeight - defaultHeight - defaultBottom);
      setPos({ x: defaultX, y: defaultY });
    }
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const nx = dragRef.current.offsetX + e.clientX;
      const ny = dragRef.current.offsetY + e.clientY;
      setPos({ x: nx, y: ny });
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      if (pos) sessionStorage.setItem('studybuddy-position', JSON.stringify(pos));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [pos]);

  const startDrag = (e: React.MouseEvent) => {
    dragging.current = true;
    dragRef.current.offsetX = (pos?.x ?? 0) - e.clientX;
    dragRef.current.offsetY = (pos?.y ?? 0) - e.clientY;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const replyObj = await sendMessage(userMsg.content, messages) as { text: string; structured?: any };
      const assistantMsg: ChatMessage & { structured?: any } = { role: 'assistant', content: replyObj?.text ?? '' };
      if (replyObj?.structured) assistantMsg.structured = replyObj.structured;
      setMessages((m) => [...m, assistantMsg]);
    } catch (e) {
      const assistantMsg: ChatMessage = { role: 'assistant', content: `Error: ${String(e)}` };
      setMessages((m) => [...m, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div
      ref={elRef}
      style={{ left: pos ? `${pos.x}px` : '20px', top: pos ? `${pos.y}px` : '20px', position: 'fixed' }}
      className="z-50 w-[360px] h-[520px] bg-black/80 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div onMouseDown={startDrag} className="bg-white/5 p-3 cursor-move flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-600" />
          <div>
            <div className="text-white font-semibold">StudyBuddy</div>
            <div className="text-white/60 text-xs">Your study companion</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-white/70 px-2 py-1">Close</button>
        </div>
      </div>
      <div className="flex flex-col h-[calc(100%-112px)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
          {messages.map((m, idx) => (
            <div key={idx} className={`${m.role === 'user' ? 'text-white text-right' : 'text-white/90 text-left'}`}>
              <div className={`inline-block rounded-lg px-3 py-2 ${m.role === 'user' ? 'bg-white/10' : 'bg-white/6'}`}>
                {m.structured ? (
                  <div className="prose text-white max-w-none">
                    {m.structured.title && <div className="font-semibold text-white">{m.structured.title}</div>}
                    {m.structured.subtitle && <div className="text-white/70 text-sm">{m.structured.subtitle}</div>}
                    {m.structured.bodyMarkdown ? (
                      <div className="mt-2 text-sm">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{m.structured.bodyMarkdown}</ReactMarkdown>
                      </div>
                    ) : (
                      <div>{m.content}</div>
                    )}
                    {m.structured.bullets && Array.isArray(m.structured.bullets) && (
                      <ul className="mt-2 list-disc list-inside text-sm">
                        {m.structured.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ) : (
                  <>{m.content}</>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-white/90 text-left">
              <div className="inline-block rounded-lg px-3 py-2 bg-white/6">
                <div className="typing-dots flex items-center gap-1 w-8">
                  <span className="dot h-2 w-2 rounded-full bg-white/60" />
                  <span className="dot h-2 w-2 rounded-full bg-white/60" />
                  <span className="dot h-2 w-2 rounded-full bg-white/60" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-white/6 bg-black/70">
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} placeholder="Ask StudyBuddy..." className="flex-1 rounded-full px-4 py-2 bg-white/5 text-white outline-none" />
            <button onClick={handleSend} className="rounded-full bg-emerald-500 px-4 py-2 text-black font-semibold">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
