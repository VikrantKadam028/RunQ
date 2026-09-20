// Thin client for Groq's OpenAI-compatible chat completions endpoint.
// The API key is supplied by the user at runtime (stored in localStorage) or,
// for local/dev deployments, via VITE_GROQ_API_KEY in a .env file. It is never
// hardcoded, and requests are made directly from the browser to Groq — no
// backend required for this demo. For a production deployment where you don't
// want the key exposed client-side, proxy this call through your own server.

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export const LOCAL_STORAGE_KEY = 'runq_groq_api_key';

export function getStoredApiKey() {
  return localStorage.getItem(LOCAL_STORAGE_KEY) || import.meta.env.VITE_GROQ_API_KEY || '';
}

export function setStoredApiKey(key) {
  if (key) localStorage.setItem(LOCAL_STORAGE_KEY, key);
  else localStorage.removeItem(LOCAL_STORAGE_KEY);
}

/**
 * Ask Groq to explain a single scheduling step / decision in plain English.
 * @param {string} apiKey
 * @param {object} context - { algo, algoFull, quantum, tick, processes, segments, currentSegment, stats, question }
 * @returns {Promise<string>}
 */
export async function explainStep(apiKey, context) {
  if (!apiKey) {
    throw new Error('No Groq API key set. Add one in the panel below to enable AI explanations.');
  }

  const {
    algo, algoFull, quantum, tick, processes, currentSegment, stats, question,
  } = context;

  const systemPrompt = `You are RunQ's scheduling tutor. You explain CPU scheduling algorithm decisions
clearly and concisely for someone learning operating systems. Be specific to the numbers given.
Keep responses to 2-4 short sentences unless asked for more. Do not use markdown headers or bullet lists
for short answers — write in plain, direct prose. Never invent data not given to you.`;

  const userPrompt = question
    ? `Algorithm: ${algoFull} (${algo}${algo === 'rr' ? `, quantum=${quantum}` : ''})
Processes: ${JSON.stringify(processes)}
Current simulation time: t=${tick}
Currently running: ${currentSegment ? currentSegment.pid : 'idle'}
Stats so far: ${JSON.stringify(stats)}

User question: ${question}`
    : `Algorithm: ${algoFull} (${algo}${algo === 'rr' ? `, quantum=${quantum}` : ''})
Processes (id, arrival, burst): ${JSON.stringify(processes.map((p) => ({ id: p.id, arrival: p.arrival, burst: p.burst })))}
Simulation just advanced to time t=${tick}.
${currentSegment && currentSegment.pid !== '__idle__'
        ? `The scheduler just chose to run ${currentSegment.pid} (segment ${currentSegment.start}-${currentSegment.end}).`
        : 'The CPU is currently idle at this tick.'}

Explain in plain English why the scheduler made this specific choice at this tick, given the algorithm's rule and the other processes waiting.`;

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.4,
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error?.message || '';
    } catch {
      // ignore parse failure
    }
    throw new Error(`Groq request failed (${res.status})${detail ? `: ${detail}` : ''}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || 'No explanation returned.';
}

/**
 * Multi-turn chat with the RunQ tutor.
 * @param {string} apiKey
 * @param {Array<{role: 'user'|'assistant', content: string}>} history - prior + latest user message
 * @param {object|null} simContext - optional live simulator state from the current page
 * @returns {Promise<string>}
 */
export async function chatWithTutor(apiKey, history, simContext) {
  if (!apiKey) {
    throw new Error('No API key set. Tap the ⚙ icon in the chat header to add your Groq key.');
  }

  const simBlock = simContext
    ? `\n\nThe user is currently on the ${simContext.algoFull} page of the simulator.\nAlgorithm: ${simContext.algo}${simContext.algo === 'rr' ? ` (quantum=${simContext.quantum})` : ''}\nProcesses: ${JSON.stringify(simContext.processes)}\nCurrent simulation time: t=${simContext.tick}\nCurrently running: ${simContext.currentSegment ? simContext.currentSegment.pid : 'idle'}\nCompleted so far: ${JSON.stringify(simContext.stats)}\nUse this data when the question is about their current run.`
    : '';

  const systemPrompt = `You are RunQ's friendly tutor chatbot for CPU scheduling and operating systems (FCFS, SJF, SRTF, Round Robin, Gantt charts, waiting/turnaround/response time, convoy effect, starvation, context switches, etc.).
Answer clearly and concisely (2-5 short sentences unless asked for more). Prefer plain prose; use a short list only when it truly helps. Never invent data that wasn't given to you. If asked something unrelated to OS/scheduling, gently steer back.${simBlock}`;

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.5,
      max_tokens: 500,
      messages: [{ role: 'system', content: systemPrompt }, ...history.slice(-12)],
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error?.message || '';
    } catch {
      // ignore
    }
    throw new Error(`Request failed (${res.status})${detail ? `: ${detail}` : ''}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || 'No response returned.';
}
