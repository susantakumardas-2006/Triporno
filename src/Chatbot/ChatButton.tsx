import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ChatWidget from './ChatWidget';
import icon from './study-buddy-icon.svg?url';

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('id', 'studybuddy-portal');
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (!portalEl) return null;

  return ReactDOM.createPortal(
    <>
      <button
        aria-label="Open StudyBuddy"
        onClick={() => setOpen((v) => !v)}
        className="fixed z-[9999] bottom-6 left-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 pointer-events-auto"
        style={{ touchAction: 'manipulation' }}
      >
        <img src={icon} alt="StudyBuddy" className="w-8 h-8" />
      </button>
      {open ? <ChatWidget onClose={() => setOpen(false)} /> : null}
    </>,
    portalEl,
  );
}
