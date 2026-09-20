import { useEffect, useState } from 'react';
import { explainStep, getStoredApiKey, setStoredApiKey } from '../lib/groq';

export default function AIExplain({ buildContext }) {
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');

  useEffect(() => {
    const stored = getStoredApiKey();
    setApiKey(stored);
    setShowKeyInput(!stored);
  }, []);

  const saveKey = (value) => {
    setApiKey(value);
    setStoredApiKey(value);
  };

  const runExplain = async (q) => {
    if (!apiKey) { setShowKeyInput(true); return; }
    setLoading(true);
    setError('');
    try {
      const context = buildContext();
      const result = await explainStep(apiKey, { ...context, question: q || undefined });
      setText(result);
    } catch (err) {
      setError(err.message || 'Something went wrong calling Groq.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-head">
        <span className="label-stamp">ai explain · groq</span>
        <span className={`badge ${apiKey ? 'ok' : ''}`}>{apiKey ? 'key set' : 'no key'}</span>
      </div>

      {showKeyInput && (
        <div style={{ marginBottom: 12 }}>
          <div className="field-row">
            <label htmlFor="groq-key">Groq API key</label>
            <input
              id="groq-key"
              type="password"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
            />
          </div>
          <p className="ai-key-hint">
            Stored only in your browser&apos;s localStorage. Get a free key at{' '}
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com/keys</a>.
          </p>
        </div>
      )}

      <div className="controls-row" style={{ marginBottom: 10 }}>
        <button className="btn primary" type="button" onClick={() => runExplain()} disabled={loading}>
          {loading ? 'Thinking…' : 'Explain this step'}
        </button>
        <button className="btn ghost" type="button" onClick={() => setShowKeyInput((v) => !v)}>
          {apiKey ? 'Change key' : 'Add key'}
        </button>
      </div>

      <div className="field-row" style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Ask a question about this run…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ maxWidth: 'none', flex: 1 }}
          onKeyDown={(e) => { if (e.key === 'Enter' && question.trim()) runExplain(question.trim()); }}
        />
        <button
          className="btn"
          type="button"
          disabled={loading || !question.trim()}
          onClick={() => runExplain(question.trim())}
        >
          Ask
        </button>
      </div>

      {error && <p style={{ color: '#e07a7a', fontSize: 12 }}>{error}</p>}

      {!error && (
        <div className="ai-text">
          {text || 'Click "Explain this step" to get a plain-English reason for what the scheduler just did.'}
          {loading && <span className="cursor-blink" />}
        </div>
      )}
    </div>
  );
}
