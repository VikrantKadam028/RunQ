export default function StepControls({
  isPlaying, onTogglePlay, onStep, onReset, speed, onSpeedChange, atEnd,
}) {
  return (
    <div className="controls-row">
      <button className="btn primary" type="button" onClick={onTogglePlay} disabled={atEnd && !isPlaying}>
        {isPlaying ? '⏸ Pause' : '▶ Run'}
      </button>
      <button className="btn" type="button" onClick={onStep} disabled={atEnd}>
        Step →
      </button>
      <button className="btn" type="button" onClick={onReset}>Reset</button>
      <div className="speed-wrap">
        <span>SLOW</span>
        <input
          type="range"
          min="120"
          max="900"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        />
        <span>FAST</span>
      </div>
    </div>
  );
}
