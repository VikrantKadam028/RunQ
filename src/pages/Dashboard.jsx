import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ALGORITHMS, computeSchedule, averages, assignColors } from '../lib/scheduler';
import { PRESETS, clonePreset } from '../data/presets';
import { getStoredApiKey, setStoredApiKey } from '../lib/groq';
import ProcessTable from '../components/ProcessTable';

const ALGO_META = {
  fcfs: { to: '/algorithms/fcfs', desc: 'Arrival-order, no preemption.' },
  sjf: { to: '/algorithms/sjf', desc: 'Shortest burst wins, non-preemptive.' },
  srtf: { to: '/algorithms/srtf', desc: 'Shortest remaining time, preemptive.' },
  rr: { to: '/algorithms/round-robin', desc: 'Fixed quantum, cyclic fairness.' },
};

export default function Dashboard() {
  const [processes, setProcesses] = useState(clonePreset(PRESETS[0]));
  const [quantum, setQuantum] = useState(2);
  const [apiKey, setApiKey] = useState(getStoredApiKey());

  const colorOf = useMemo(() => assignColors(processes), [processes]);

  const results = useMemo(
    () => ALGORITHMS.map((a) => {
      const schedule = computeSchedule(a.key, processes, quantum);
      const avg = averages(schedule.stats);
      return { ...a, schedule, avg };
    }),
    [processes, quantum],
  );

  const bestWait = Math.min(...results.map((r) => r.avg.waiting));

  const addProcess = () => {
    const n = processes.length + 1;
    setProcesses((prev) => [...prev, { id: `P${n}`, arrival: prev.length, burst: 4 }]);
  };
  const removeProcess = (idx) => setProcesses((prev) => prev.filter((_, i) => i !== idx));

  const saveKey = (value) => {
    setApiKey(value);
    setStoredApiKey(value);
  };

  return (
    <section className="page-section" style={{ borderTop: 'none' }}>
      <div className="wrap">
        <p className="label-stamp" style={{ marginBottom: 10 }}>dashboard</p>
        <h2 className="section-title">Battle Mode</h2>
        <p className="section-desc">
          Same process set, all four algorithms, computed instantly. The panel with the lowest
          average waiting time gets the lime border.
        </p>

        <div className="sim-grid" style={{ gridTemplateColumns: '280px 1fr' }}>
          <ProcessTable
            processes={processes}
            colorOf={colorOf}
            onChange={setProcesses}
            onAdd={addProcess}
            onRemove={removeProcess}
            quantum={quantum}
            onQuantumChange={setQuantum}
            showQuantum
          />

          <div>
            <div className="algo-nav-grid">
              {results.map((r) => {
                const isBest = r.avg.waiting === bestWait;
                const scale = 100 / (r.schedule.makespan || 1);
                return (
                  <div
                    key={r.key}
                    className="algo-nav-card"
                    style={isBest ? { borderColor: 'var(--color-olive-depth)', boxShadow: 'var(--shadow-sm)' } : undefined}
                  >
                    <div className="tag">{isBest ? 'lowest avg wait' : r.label.toUpperCase()}</div>
                    <h4>{r.label}</h4>
                    <p style={{ marginBottom: 10 }}>{ALGO_META[r.key].desc}</p>
                    <div className="gantt-track" style={{ height: 26, marginBottom: 10 }}>
                      {r.schedule.segments.map((s, i) => (
                        <div
                          key={`${r.key}-${s.pid}-${i}`}
                          style={{
                            width: `${(s.end - s.start) * scale}%`,
                            background: s.pid === '__idle__' ? '#151515' : colorOf[s.pid],
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--color-ash)', display: 'flex', gap: 14 }}>
                      <span>avg wait <b style={{ color: 'var(--color-bone)' }}>{r.avg.waiting.toFixed(1)}</b></span>
                      <span>makespan <b style={{ color: 'var(--color-bone)' }}>{r.schedule.makespan}</b></span>
                    </div>
                    <Link to={ALGO_META[r.key].to} className="btn" style={{ marginTop: 12, display: 'inline-block', fontSize: 11 }}>
                      Open workbench →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ marginTop: 48 }}>
        <div className="panel" style={{ maxWidth: 480 }}>
          <p className="label-stamp" style={{ marginBottom: 12 }}>ai settings</p>
          <div className="field-row">
            <label htmlFor="dash-groq-key">Groq API key</label>
            <input
              id="dash-groq-key"
              type="password"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              style={{ maxWidth: 220 }}
            />
          </div>
          <p className="ai-key-hint">
            Saved once here, used on every algorithm page. Stored only in this browser&apos;s
            localStorage — never sent anywhere except directly to Groq. Get a free key at{' '}
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com/keys</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
