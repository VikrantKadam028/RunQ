export default function CpuCore({
  runningSegment, tick, makespan, waitingProcesses, colorOf,
}) {
  const isRunning = runningSegment && runningSegment.pid !== '__idle__';

  return (
    <>
      <div className="core-stage">
        <div className={`core-hex ${isRunning ? 'running' : 'idle-pulse'}`}>
          <div className="core-pid" style={{ color: isRunning ? colorOf[runningSegment.pid] : undefined }}>
            {isRunning ? runningSegment.pid : '—'}
          </div>
          <div className="core-lbl">{isRunning ? 'running' : 'idle'}</div>
        </div>
        <div className="core-time">
          t = <b>{tick}</b> / <span className="mono">{makespan}</span>
        </div>
      </div>

      <div className="queue-title">ready queue</div>
      <div className="ready-queue">
        {waitingProcesses.length === 0 && <span className="rq-empty">empty</span>}
        {waitingProcesses.map((p) => (
          <div className="rq-token" key={p.id}>
            <span className="swatch" style={{ background: colorOf[p.id] }} />
            {p.id}
          </div>
        ))}
      </div>
    </>
  );
}
