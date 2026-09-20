import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import useSimulator from '../lib/useSimulator';
import ProcessTable from './ProcessTable';
import CpuCore from './CpuCore';
import GanttChart from './GanttChart';
import MetricsPanel from './MetricsPanel';
import StepControls from './StepControls';
import { setChatContextProvider } from '../lib/chatContext';

const ALGO_TABS = [
  { key: 'fcfs', path: '/algorithms/fcfs', label: 'FCFS' },
  { key: 'sjf', path: '/algorithms/sjf', label: 'SJF' },
  { key: 'srtf', path: '/algorithms/srtf', label: 'SRTF' },
  { key: 'rr', path: '/algorithms/round-robin', label: 'Round Robin' },
];

const NARRATIONS = {
  fcfs: () => 'FCFS runs strictly in arrival order — no matter how short a later job is, it waits its turn.',
  sjf: () => 'SJF picks whichever arrived job has the smallest total burst — greedy, but can starve long jobs.',
  srtf: () => 'SRTF re-checks every tick and preempts the moment something with less remaining time arrives.',
  rr: (q) => `Round Robin caps everyone at ${q} ticks per turn, then cycles the queue — fairness over speed.`,
};

export default function AlgoWorkbench({ algoKey, title, full, description }) {
  const sim = useSimulator(algoKey);
  const {
    processes, setProcesses, colorOf, quantum, setQuantum,
    schedule, tick, isPlaying, togglePlay, step, reset, speed, setSpeed,
    runningSegment, waitingProcesses, utilization, addProcess, removeProcess, atEnd,
  } = sim;

  const narrative = runningSegment && runningSegment.pid !== '__idle__'
    ? `t=${tick} → core running ${runningSegment.pid}. ${NARRATIONS[algoKey](quantum)}`
    : tick > 0
      ? `t=${tick} → CPU idle, waiting on next arrival.`
      : `Press Run to simulate ${title} on ${processes.length} processes.`;

  const buildAiContext = () => ({
    algo: algoKey,
    algoFull: full,
    quantum,
    tick,
    processes,
    currentSegment: runningSegment,
    stats: schedule.stats.filter((s) => s.completion <= tick),
  });

  // Expose live simulator state to the global chatbot while this page is mounted.
  useEffect(() => {
    setChatContextProvider(buildAiContext);
    return () => setChatContextProvider(null);
  });

  return (
    <section className="page-section" style={{ borderTop: 'none' }}>
      <div className="wrap">
        <h2 className="section-title">{title}</h2>
        <p className="section-desc">{description}</p>

        <div className="algo-tabs">
          {ALGO_TABS.map((t) => (
            <NavLink
              key={t.key}
              to={t.path}
              className={({ isActive }) => `algo-tab${isActive ? ' active' : ''}`}
            >
              {t.label}
            </NavLink>
          ))}
        </div>

        <div className="sim-grid">
          <ProcessTable
            processes={processes}
            colorOf={colorOf}
            onChange={setProcesses}
            onAdd={addProcess}
            onRemove={removeProcess}
            quantum={quantum}
            onQuantumChange={setQuantum}
            showQuantum={algoKey === 'rr'}
          />

          <div>
            <div className="panel">
              <StepControls
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onStep={step}
                onReset={reset}
                speed={speed}
                onSpeedChange={setSpeed}
                atEnd={atEnd}
              />

              <CpuCore
                runningSegment={runningSegment}
                tick={tick}
                makespan={schedule.makespan}
                waitingProcesses={waitingProcesses}
                colorOf={colorOf}
              />

              <GanttChart
                segments={schedule.segments}
                makespan={schedule.makespan}
                upToTime={Math.min(tick + 1, schedule.makespan)}
                colorOf={colorOf}
              />

              <div className="ai-panel" style={{ marginTop: 16, padding: '12px 16px' }}>
                <p className="ai-text" style={{ color: 'var(--color-bone)' }}>{narrative}</p>
              </div>
            </div>
          </div>

          <MetricsPanel
            stats={schedule.stats}
            upToTime={Math.min(tick + 1, schedule.makespan)}
            utilization={utilization}
            colorOf={colorOf}
          />
        </div>
      </div>
    </section>
  );
}
