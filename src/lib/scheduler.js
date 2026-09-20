// RunQ scheduling engine — pure, framework-independent, unit-testable.
// Each algorithm returns { segments, stats, makespan }.
//   segments: [{ pid, start, end }]  (pid === '__idle__' for CPU-idle gaps)
//   stats:    [{ id, arrival, burst, completion, turnaround, waiting, response }]

export const ALGORITHMS = [
  { key: 'fcfs', label: 'FCFS', full: 'First Come First Serve' },
  { key: 'sjf', label: 'SJF', full: 'Shortest Job First' },
  { key: 'srtf', label: 'SRTF', full: 'Shortest Remaining Time First' },
  { key: 'rr', label: 'Round Robin', full: 'Round Robin' },
];

export function computeSchedule(algo, processesIn, quantum = 2) {
  const procs = processesIn.map((p) => ({ ...p, remaining: p.burst }));
  const n = procs.length;
  const segments = [];
  const completion = {};
  const firstRun = {};
  let time = 0;

  if (!n) return { segments: [], stats: [], makespan: 0 };

  if (algo === 'fcfs') {
    const order = [...procs].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
    order.forEach((p) => {
      const start = Math.max(time, p.arrival);
      if (start > time) segments.push({ pid: '__idle__', start: time, end: start });
      firstRun[p.id] = start;
      segments.push({ pid: p.id, start, end: start + p.burst });
      time = start + p.burst;
      completion[p.id] = time;
    });
  } else if (algo === 'sjf') {
    const remaining = [...procs];
    let done = 0;
    while (done < n) {
      const avail = remaining.filter((p) => p.arrival <= time && p.remaining > 0);
      if (!avail.length) {
        const next = Math.min(...remaining.filter((p) => p.remaining > 0).map((p) => p.arrival));
        segments.push({ pid: '__idle__', start: time, end: next });
        time = next;
        continue;
      }
      avail.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
      const p = avail[0];
      firstRun[p.id] = time;
      segments.push({ pid: p.id, start: time, end: time + p.remaining });
      time += p.remaining;
      p.remaining = 0;
      completion[p.id] = time;
      done += 1;
    }
  } else if (algo === 'srtf') {
    const remaining = [...procs];
    let done = 0;
    let lastPid = null;
    let segStart = 0;
    while (done < n) {
      const avail = remaining.filter((p) => p.arrival <= time && p.remaining > 0);
      if (!avail.length) {
        if (lastPid !== null) {
          segments.push({ pid: lastPid, start: segStart, end: time });
          lastPid = null;
        }
        const next = Math.min(...remaining.filter((p) => p.remaining > 0).map((p) => p.arrival));
        segments.push({ pid: '__idle__', start: time, end: next });
        time = next;
        continue;
      }
      avail.sort((a, b) => a.remaining - b.remaining || a.arrival - b.arrival);
      const p = avail[0];
      if (firstRun[p.id] === undefined) firstRun[p.id] = time;
      if (lastPid !== p.id) {
        if (lastPid !== null) segments.push({ pid: lastPid, start: segStart, end: time });
        segStart = time;
        lastPid = p.id;
      }
      p.remaining -= 1;
      time += 1;
      if (p.remaining === 0) {
        completion[p.id] = time;
        done += 1;
        segments.push({ pid: lastPid, start: segStart, end: time });
        lastPid = null;
      }
    }
    if (lastPid !== null) segments.push({ pid: lastPid, start: segStart, end: time });
  } else if (algo === 'rr') {
    const remaining = procs.map((p) => ({ ...p }));
    remaining.sort((a, b) => a.arrival - b.arrival);
    const byId = Object.fromEntries(remaining.map((p) => [p.id, p]));
    const queue = [];
    const arrived = new Set();
    let done = 0;

    const pullArrivals = (t) => {
      remaining.forEach((p) => {
        if (p.arrival <= t && !arrived.has(p.id) && p.remaining > 0) {
          queue.push(p.id);
          arrived.add(p.id);
        }
      });
    };

    pullArrivals(0);
    if (!queue.length && remaining.length) {
      time = Math.min(...remaining.map((p) => p.arrival));
      segments.push({ pid: '__idle__', start: 0, end: time });
      pullArrivals(time);
    }

    while (done < n) {
      if (!queue.length) {
        const nxt = Math.min(
          ...remaining.filter((p) => p.remaining > 0 && !arrived.has(p.id)).map((p) => p.arrival)
        );
        segments.push({ pid: '__idle__', start: time, end: nxt });
        time = nxt;
        pullArrivals(time);
        continue;
      }
      const pid = queue.shift();
      const p = byId[pid];
      if (p.remaining <= 0) continue;
      if (firstRun[pid] === undefined) firstRun[pid] = time;
      const run = Math.min(quantum, p.remaining);
      segments.push({ pid, start: time, end: time + run });
      time += run;
      p.remaining -= run;
      pullArrivals(time);
      if (p.remaining > 0) queue.push(pid);
      else {
        completion[pid] = time;
        done += 1;
      }
    }
  } else {
    throw new Error(`Unknown algorithm: ${algo}`);
  }

  const stats = procs.map((p) => {
    const turnaround = completion[p.id] - p.arrival;
    const waiting = turnaround - p.burst;
    const response = firstRun[p.id] - p.arrival;
    return {
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      completion: completion[p.id],
      turnaround,
      waiting,
      response,
    };
  });

  const makespan = Math.max(...segments.map((s) => s.end));
  return { segments, stats, makespan };
}

export function averages(stats) {
  if (!stats.length) return { waiting: 0, turnaround: 0, response: 0 };
  const avg = (key) => stats.reduce((a, s) => a + s[key], 0) / stats.length;
  return { waiting: avg('waiting'), turnaround: avg('turnaround'), response: avg('response') };
}

export function cpuUtilization(segments, upToTime) {
  if (!upToTime) return 0;
  const busy = segments
    .filter((s) => s.pid !== '__idle__' && s.start < upToTime)
    .reduce((a, s) => a + (Math.min(s.end, upToTime) - s.start), 0);
  return Math.round((100 * busy) / upToTime);
}

export const PROC_COLORS = [
  'var(--proc-1)', 'var(--proc-2)', 'var(--proc-3)', 'var(--proc-4)',
  'var(--proc-5)', 'var(--proc-6)', 'var(--proc-7)', 'var(--proc-8)',
];

export function assignColors(processes) {
  const map = {};
  processes.forEach((p, i) => { map[p.id] = PROC_COLORS[i % PROC_COLORS.length]; });
  return map;
}
