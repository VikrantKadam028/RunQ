export default function MetricsPanel({
  stats, upToTime, utilization, colorOf,
}) {
  const finished = stats.filter((s) => s.completion <= upToTime);
  const avg = (key) => (finished.length ? (finished.reduce((a, s) => a + s[key], 0) / finished.length).toFixed(1) : '0.0');

  return (
    <div className="panel">
      <p className="label-stamp" style={{ marginBottom: 12 }}>live metrics</p>
      <div className="metric-row"><span>Avg waiting time</span><span>{avg('waiting')}</span></div>
      <div className="metric-row"><span>Avg turnaround</span><span>{avg('turnaround')}</span></div>
      <div className="metric-row"><span>Avg response</span><span>{avg('response')}</span></div>
      <div className="metric-row"><span>CPU utilization</span><span>{utilization}%</span></div>

      <table className="stat-table">
        <thead>
          <tr><th>proc</th><th>wait</th><th>turn</th></tr>
        </thead>
        <tbody>
          {stats.map((s) => {
            const done = s.completion <= upToTime;
            return (
              <tr key={s.id}>
                <td>
                  <span className="pname">
                    <span className="swatch" style={{ background: colorOf[s.id] }} />
                    {s.id}
                  </span>
                </td>
                <td>{done ? s.waiting : '—'}</td>
                <td>{done ? s.turnaround : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
