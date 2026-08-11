const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

async function callGemini(messages, apiKey) {
  // Build a simple text input from the messages array. Include role markers so the model has context.
  const inputText = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

  // Use the generateContent endpoint which accepts a `contents` array
  const body = {
    // model can be adjusted; use a flash/latest alias for lower-latency
    // client code can change this if desired
    // The endpoint path specifies the model directly.
    input: inputText,
    // We'll send as `contents` below for generateContent
  };

  const headers = { 'Content-Type': 'application/json' };
  // Prefer sending the key as an API key header which matches the curl example.
  if (apiKey) headers['x-goog-api-key'] = apiKey;
  // If the key looks like a Google OAuth access token (common prefix `ya29.`), also send as Bearer
  if (apiKey && apiKey.startsWith('ya29.')) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Build the generateContent request body expected by the REST API
  const generateBody = {
    contents: [
      {
        parts: [
          {
            text: inputText,
          },
        ],
      },
    ],
  };

  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
    method: 'POST',
    headers,
    body: JSON.stringify(generateBody),
  });

  if (!res.ok) {
    const text = await res.text();
    // Throw a JSON-serializable error message so callers can detect status and auth used
    const err = { status: res.status, statusText: res.statusText, body: text, usedAuth: apiKey ? (apiKey.startsWith('ya29.') ? 'Bearer' : 'x-goog-api-key') : 'none' };
    throw new Error(JSON.stringify(err));
  }

  const data = await res.json();
  // Try multiple known response fields
  let content = '';
  if (data.output_text) content = data.output_text;
  else if (data.candidates && data.candidates[0]) {
    // new GenAI responses sometimes put text under candidates[0].output[0].content
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

    // Try to parse a JSON object from the model's content (accepts bare JSON or JSON block)
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

    // If parsing failed, try one re-prompt asking for JSON only
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
    // Try to parse structured error thrown by callGemini
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

// Health endpoint to check server and key configuration
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

const port = process.env.PORT || 5174;
app.listen(port, () => console.log(`StudyBuddy proxy running on port ${port}`));
