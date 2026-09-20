import { useEffect, useMemo, useRef, useState } from 'react';
import { computeSchedule, cpuUtilization, assignColors } from './scheduler';
import { PRESETS, clonePreset } from '../data/presets';

export default function useSimulator(algoKey) {
  const [processes, setProcesses] = useState(clonePreset(PRESETS[0]));
  const [quantum, setQuantum] = useState(2);
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const timerRef = useRef(null);

  const colorOf = useMemo(() => assignColors(processes), [processes]);
  const schedule = useMemo(
    () => computeSchedule(algoKey, processes, quantum),
    [algoKey, processes, quantum],
  );

  // clamp tick whenever the schedule changes (e.g. process edits)
  useEffect(() => {
    setTick(0);
    setIsPlaying(false);
  }, [algoKey, processes, quantum]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTick((t) => {
          if (t + 1 >= schedule.makespan) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            return schedule.makespan;
          }
          return t + 1;
        });
      }, 1000 - speed);
    }
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, speed, schedule.makespan]);

  const runningSegment = schedule.segments.find((s) => s.start <= tick && tick < s.end) || null;

  const waitingProcesses = processes.filter((p) => {
    const st = schedule.stats.find((s) => s.id === p.id);
    if (!st) return false;
    const isRunning = runningSegment && runningSegment.pid === p.id;
    return p.arrival <= tick && st.completion > tick && !isRunning;
  });

  const utilization = cpuUtilization(schedule.segments, tick);

  const togglePlay = () => {
    if (isPlaying) { setIsPlaying(false); return; }
    if (tick >= schedule.makespan) setTick(0);
    setIsPlaying(true);
  };
  const step = () => {
    setIsPlaying(false);
    setTick((t) => Math.min(t + 1, schedule.makespan));
  };
  const reset = () => { setIsPlaying(false); setTick(0); };

  const addProcess = () => {
    const n = processes.length + 1;
    setProcesses((prev) => [...prev, { id: `P${n}`, arrival: prev.length, burst: 4 }]);
  };
  const removeProcess = (idx) => {
    setProcesses((prev) => prev.filter((_, i) => i !== idx));
  };

  return {
    processes, setProcesses, colorOf,
    quantum, setQuantum,
    schedule, tick, setTick,
    isPlaying, togglePlay, step, reset,
    speed, setSpeed,
    runningSegment, waitingProcesses, utilization,
    addProcess, removeProcess,
    atEnd: tick >= schedule.makespan,
  };
}
