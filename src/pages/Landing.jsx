import { Link } from 'react-router-dom';
import AsciiHands from '../components/AsciiHands';

const ALGO_CARDS = [
  { num: '01', to: '/algorithms/fcfs', label: 'FCFS', title: 'First Come First Serve', desc: 'The baseline — simple, fair by the clock, and easy to starve behind a long job.' },
  { num: '02', to: '/algorithms/sjf', label: 'SJF', title: 'Shortest Job First', desc: 'Greedy and near-optimal on paper — until a long process gets starved out.' },
  { num: '03', to: '/algorithms/srtf', label: 'SRTF', title: 'Shortest Remaining Time', desc: 'The preemptive sibling of SJF — aggressive, reactive, and unforgiving.' },
  { num: '04', to: '/algorithms/round-robin', label: 'RR', title: 'Round Robin', desc: 'Fairness over speed — every process gets its turn, capped by a quantum.' },
];

export default function Landing() {
  return (
    <>
      <section className="hero page-section" style={{ borderTop: 'none', position: 'relative', overflow: 'hidden' }}>
        {/* animated ASCII hands background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <AsciiHands style={{ opacity: 0.6 }} />
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(6,6,6,0.85) 0%, rgba(6,6,6,0.3) 45%, transparent 70%)',
            }}
          />
        </div>
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <p className="label-stamp" style={{ marginBottom: 18 }}>cpu scheduling, visualized</p>
          <h1 className="display-headline">
            Watch the CPU<br />
            <span className="accent-word">make its choices.</span>
          </h1>
          <p className="sub">
            A live simulator for FCFS, SJF, SRTF and Round Robin. Edit the workload, step through
            time tick by tick, and chat with an AI tutor whenever you get stuck.
          </p>
          <div className="hero-cta">
            <Link to="/dashboard" className="btn primary">Open dashboard</Link>
            <Link to="/algorithms/fcfs" className="btn">Try FCFS first</Link>
          </div>
          <div className="hero-meta">
            <div><div className="num">AI</div><div className="lbl">tutor chatbot</div></div>
            <div><div className="num mono">RR·q</div><div className="lbl">adjustable quantum</div></div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="wrap">
          <h2 className="section-title">Pick an algorithm</h2>
          <p className="section-desc">
            Each page is a full workbench: an editable process table, demo presets, step-by-step
            playback, a live Gantt chart, and a tutor chatbot that knows what your simulation is doing.
          </p>
          <div className="feature-grid">
            {ALGO_CARDS.map((c) => (
              <Link key={c.to} to={c.to} className="feature-card">
                <span className="fnum">{c.num} · {c.label}</span>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="wrap">
          <h2 className="section-title">How it works</h2>
          <p className="section-desc">Three things happen on every algorithm page.</p>
          <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="feature-card">
              <span className="fnum">input</span>
              <h3>Bring your own data</h3>
              <p>Type in your own processes, or load one of five demo presets — a convoy-effect
                case, a starvation case, or a real-machine snapshot.</p>
            </div>
            <div className="feature-card">
              <span className="fnum">step</span>
              <h3>Click through time</h3>
              <p>Press Step to advance one tick at a time, or Run to autoplay at a speed you
                control. The CPU core glows only while something is actually executing.</p>
            </div>
            <div className="feature-card">
              <span className="fnum">explain</span>
              <h3>Chat with the AI tutor</h3>
              <p>Open the chat bubble any time and ask why the scheduler picked what it picked — the
                bot sees your exact process table, not a generic textbook answer.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="wrap">
          <h2 className="section-title">Everything else lives on the dashboard</h2>
          <p className="section-desc">
            Run all four algorithms side by side on the same workload, compare average waiting
            time head to head, and manage your AI tutor settings.
          </p>
          <Link to="/dashboard" className="btn primary">Open dashboard →</Link>
        </div>
      </section>
    </>
  );
}
