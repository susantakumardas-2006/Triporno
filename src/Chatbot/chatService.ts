import systemPrompt from './systemprompt.txt?raw';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string; structured?: any };

async function callOpenAI(messages: ChatMessage[], apiKey: string) {
  const body = {
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.6,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  return content;
}

export async function sendMessage(userMessage: string, history: ChatMessage[] = []) {
  const envKey = (import.meta as any).env?.VITE_STUDY_BUDDY_KEY;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  if (envKey) {
    try {
      const reply = await callOpenAI(messages, envKey);
      return { text: reply };
    } catch (e) {
      return { text: `Sorry, I couldn't reach the assistant: ${String(e)}` };
    }
  }

  // Try server proxy or local backend first
  try {
    const configured = (import.meta as any).env?.VITE_STUDY_BUDDY_URL;
    const tryUrls = [];
    if (configured) tryUrls.push(configured.replace(/\/$/, '') + '/api/studybuddy');
    // First try same-origin path (works if proxy is mounted behind the frontend server)
    tryUrls.push('/api/studybuddy');
    // In dev, also try the backend directly in case proxy is not active
    if ((import.meta as any).env?.DEV) {
      tryUrls.push('http://localhost:5174/api/studybuddy');
    }

    for (const url of tryUrls) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        });
        if (res.ok) {
          const data = await res.json();
          return { text: data.content ?? data.reply ?? 'No response', structured: data.structured } as any;
        } else {
          const text = await res.text();
          console.warn('StudyBuddy proxy non-ok response from', url, res.status, text.substring(0, 400));
        }
      } catch (e) {
        console.warn('StudyBuddy proxy fetch failed for', url, String(e));
      }
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback/mock behaviour: echo and ask a guiding question
  const short = `I hear you: "${userMessage}". Can you tell me what you've tried so far?`;
  return { text: short };
}

export type { ChatMessage };
