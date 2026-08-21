import systemPrompt from './systemprompt.txt?raw';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string; structured?: any };

async function callGemini(messages: ChatMessage[], apiKey: string) {
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find((m) => m.role === 'system')?.content;

  const body = {
    contents,
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Api-Revision': '2026-05-20'
      },
      body: JSON.stringify({
        model: 'gemini-3.7-flash',
        input: messages.filter(m => m.role !== 'system').map(m => m.content).join('\n'),
        systemInstruction: messages.find(m => m.role === 'system')?.content
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = data.steps?.[0]?.modelOutput?.content?.[0]?.text?.text ?? '';
  return content;
}

export async function sendMessage(userMessage: string, history: ChatMessage[] = []) {
  const envKey = (import.meta as any).env?.VITE_STUDY_BUDDY_KEY;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  // Try direct API call first (if key exists)
  if (envKey) {
    try {
      const reply = await callGemini(messages, envKey);
      return { text: reply };
    } catch (e) {
      console.warn('Direct Gemini API failed, falling back to proxy:', String(e));
      // Fall through to proxy
    }
  }

  // Try server proxy or local backend
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
