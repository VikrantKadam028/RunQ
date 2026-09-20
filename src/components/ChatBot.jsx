import { useEffect, useRef, useState } from 'react';
import { chatWithTutor, getStoredApiKey, setStoredApiKey } from '../lib/groq';
import { getChatContext } from '../lib/chatContext';

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm the RunQ tutor. Ask me anything about CPU scheduling — or about the run you're looking at right now.",
};

const SUGGESTIONS = [
  'What is the convoy effect?',
  'SJF vs SRTF?',
  'How do I pick a good quantum?',
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    const stored = getStoredApiKey();
    setApiKey(stored);
    setShowSettings(!stored);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, open]);

  const saveKey = (value) => {
    setApiKey(value);
    setStoredApiKey(value);
  };

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    if (!apiKey) { setShowSettings(true); return; }

    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setError('');
    setLoading(true);
    try {
      // drop the local welcome message from the API history
      const history = next.filter((m) => m !== WELCOME);
      const reply = await chatWithTutor(apiKey, history, getChatContext());
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => { setMessages([WELCOME]); setError(''); };

  return (
    <>
      {open && (
        <div className="chat-window" role="dialog" aria-label="RunQ tutor chat">
          <div className="chat-head">
            <div>
              <div className="chat-title">RunQ Tutor</div>
              <div className="chat-sub">{apiKey ? 'online' : 'add API key to start'}</div>
            </div>
            <div className="chat-head-actions">
              <button type="button" className="chat-icon-btn" title="Settings" onClick={() => setShowSettings((v) => !v)}>⚙</button>
              <button type="button" className="chat-icon-btn" title="Clear chat" onClick={clearChat}>↺</button>
              <button type="button" className="chat-icon-btn" title="Close" onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          {showSettings && (
            <div className="chat-settings">
              <label htmlFor="chat-key" className="label-stamp">Groq API key</label>
              <input
                id="chat-key"
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => saveKey(e.target.value)}
              />
              <p className="ai-key-hint">
                Stored only in this browser. Free key at{' '}
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com/keys</a>.
              </p>
            </div>
          )}

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>{m.content}</div>
            ))}
            {messages.length === 1 && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="chat-chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
            {loading && <div className="chat-msg assistant"><span className="cursor-blink" /> thinking…</div>}
            {error && <div className="chat-error">{error}</div>}
            <div ref={endRef} />
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Ask about scheduling…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            />
            <button type="button" className="btn primary" disabled={loading || !input.trim()} onClick={() => send()}>
              Send
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`chat-fab${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  );
}
