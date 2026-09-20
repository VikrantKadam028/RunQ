export default function GanttChart({ segments, makespan, upToTime, colorOf }) {
  if (!makespan) {
    return <div className="gantt-track" />;
  }
  const scale = 100 / makespan;
  const visible = segments.filter((s) => s.start < upToTime);

  return (
    <div className="gantt-wrap">
      <div className="gantt-track">
        {visible.map((s, i) => {
          const end = Math.min(s.end, upToTime);
          const width = (end - s.start) * scale;
          return (
            <div
              key={`${s.pid}-${s.start}-${i}`}
              className="gantt-seg"
              style={{
                width: `${width}%`,
                background: s.pid === '__idle__' ? '#151515' : colorOf[s.pid],
              }}
            >
              {s.pid === '__idle__' ? '' : s.pid}
            </div>
          );
        })}
      </div>
      <div className="gantt-axis">
        {visible.map((s, i) => {
          const end = Math.min(s.end, upToTime);
          const width = (end - s.start) * scale;
          return (
            <div key={`axis-${s.pid}-${s.start}-${i}`} style={{ width: `${width}%` }}>{s.start}</div>
          );
        })}
        <div style={{ marginLeft: 'auto' }}>{upToTime}</div>
      </div>
    </div>
  );
}
