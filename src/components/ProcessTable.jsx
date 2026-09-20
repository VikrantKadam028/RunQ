import { PRESETS, clonePreset } from '../data/presets';

export default function ProcessTable({
  processes, colorOf, onChange, onAdd, onRemove, quantum, onQuantumChange, showQuantum,
}) {
  const handleField = (idx, field, value) => {
    const next = processes.map((p, i) => {
      if (i !== idx) return p;
      const num = Math.max(field === 'burst' ? 1 : 0, Number(value) || 0);
      return { ...p, [field]: num };
    });
    onChange(next);
  };

  return (
    <div className="panel">
      <p className="label-stamp" style={{ marginBottom: 12 }}>process queue</p>

      <div className="preset-row">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            className="preset-btn"
            onClick={() => onChange(clonePreset(preset))}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <table className="proc-table">
        <thead>
          <tr>
            <th>Proc</th>
            <th>Arr</th>
            <th>Burst</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {processes.map((p, idx) => (
            <tr key={p.id}>
              <td>
                <span className="pname">
                  <span className="swatch" style={{ background: colorOf[p.id] }} />
                  {p.id}
                </span>
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={p.arrival}
                  onChange={(e) => handleField(idx, 'arrival', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={p.burst}
                  onChange={(e) => handleField(idx, 'burst', e.target.value)}
                />
              </td>
              <td>
                <button className="rm-btn" type="button" title="remove" onClick={() => onRemove(idx)}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-proc" type="button" onClick={onAdd}>+ add process</button>

      {showQuantum && (
        <div className="quantum-wrap">
          <span>TIME QUANTUM</span>
          <input
            type="number"
            min="1"
            max="9"
            value={quantum}
            style={{ width: 52 }}
            onChange={(e) => onQuantumChange(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
      )}
    </div>
  );
}
