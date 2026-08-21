const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

async function callGemini(messages, apiKey) {
  const inputText = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const systemInstruction = messages.find(m => m.role === 'system')?.content;

  const headers = { 
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey,
    'Api-Revision': '2026-05-20'
  };

  const body = {
    model: 'gemini-3.7-flash',
    input: inputText,
    systemInstruction: systemInstruction
  };

  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = { status: res.status, statusText: res.statusText, body: text, usedAuth: apiKey ? (apiKey.startsWith('ya29.') ? 'Bearer' : 'x-goog-api-key') : 'none' };
    throw new Error(JSON.stringify(err));
  }

  const data = await res.json();
  let content = '';
  if (data.steps && data.steps[0] && data.steps[0].modelOutput && data.steps[0].modelOutput.content && data.steps[0].modelOutput.content[0] && data.steps[0].modelOutput.content[0].text && data.steps[0].modelOutput.content[0].text.text) {
    content = data.steps[0].modelOutput.content[0].text.text;
  } else if (data.output_text) {
    content = data.output_text;
  } else if (data.candidates && data.candidates[0]) {
    const cand = data.candidates[0];
    if (cand.output_text) content = cand.output_text;
    else if (typeof cand.content === 'string') content = cand.content;
    else if (cand.content && cand.content.parts && Array.isArray(cand.content.parts) && cand.content.parts[0] && cand.content.parts[0].text) {
      content = cand.content.parts.map((p) => p.text || '').join('\n');
    } else if (cand.output && Array.isArray(cand.output) && cand.output[0] && cand.output[0].content) {
      const first = cand.output[0].content;
      if (typeof first === 'string') content = first;
      else if (Array.isArray(first) && first[0] && first[0].text) content = first[0].text;
    }
  }

  return content || JSON.stringify(data);
}

app.post('/api/studybuddy', async (req, res) => {
  const messages = req.body?.messages;
  if (!messages) return res.status(400).json({ error: 'messages required' });

  let key = process.env.STUDY_BUDDY_KEY;
  if (!key) {
    try {
      const file = path.join(__dirname, '..', 'src', 'Chatbot', 'api.txt');
      if (fs.existsSync(file)) {
        key = fs.readFileSync(file, 'utf8').trim();
      }
    } catch (e) {
      // ignore
    }
  }

  if (!key) return res.status(500).json({ error: 'API key not configured on server' });

  try {
    let content = await callGemini(messages, key);

    function tryParseJSON(text) {
      if (!text || typeof text !== 'string') return null;
      try {
        return JSON.parse(text);
      } catch (e) {
        const m = text.match(/\{[\s\S]*\}/);
        if (m) {
          try { return JSON.parse(m[0]); } catch (e2) { return null; }
        }
        return null;
      }
    }

    let structured = tryParseJSON(content);

    if (!structured) {
      const reprompt = [...messages, { role: 'system', content: 'Please respond with ONLY a single JSON object matching this schema: {"title":"...","subtitle":"...","language":"...","bodyMarkdown":"...","bullets":[...],"metadata":{...}}. Return no additional text.' }];
      try {
        const retry = await callGemini(reprompt, key);
        structured = tryParseJSON(retry);
        if (structured) content = retry;
      } catch (e) {
        // ignore retry errors
      }
    }

    if (structured) {
      return res.json({ content: structured.bodyMarkdown || structured.title || '', structured });
    }

    res.json({ content });
  } catch (e) {
    let parsed;
    try {
      parsed = JSON.parse(e.message.replace(/^Error:\s*/i, ''));
    } catch (parseErr) {
      // not JSON
    }

    if (parsed && parsed.status) {
      const statusCode = parsed.status === 401 ? 401 : 502;
      return res.status(statusCode).json({ error: parsed.body || parsed.statusText || 'Provider error', providerStatus: parsed.status, authAttempted: parsed.usedAuth });
    }

    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/health', (req, res) => {
  let key = process.env.STUDY_BUDDY_KEY;
  if (!key) {
    try {
      const file = path.join(__dirname, '..', 'src', 'Chatbot', 'api.txt');
      if (fs.existsSync(file)) {
        key = fs.readFileSync(file, 'utf8').trim();
      }
    } catch (e) {
      // ignore
    }
  }

  const keyPresent = !!key;
  let keyType = 'none';
  if (keyPresent) {
    if (key.startsWith('ya29.')) keyType = 'oauth';
    else keyType = 'apiKey';
  }

  res.json({ ok: true, keyPresent, keyType });
});

// Export the Express app for Vercel Serverless Function usage
module.exports = app;
