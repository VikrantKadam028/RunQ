export const PRESETS = [
  {
    key: 'classic',
    label: 'Classic mix',
    processes: [
      { id: 'P1', arrival: 0, burst: 6 },
      { id: 'P2', arrival: 1, burst: 4 },
      { id: 'P3', arrival: 2, burst: 8 },
      { id: 'P4', arrival: 3, burst: 2 },
      { id: 'P5', arrival: 4, burst: 5 },
    ],
  },
  {
    key: 'convoy',
    label: 'Convoy effect',
    processes: [
      { id: 'P1', arrival: 0, burst: 12 },
      { id: 'P2', arrival: 1, burst: 2 },
      { id: 'P3', arrival: 2, burst: 1 },
      { id: 'P4', arrival: 3, burst: 3 },
    ],
  },
  {
    key: 'starvation',
    label: 'Starvation case',
    processes: [
      { id: 'P1', arrival: 0, burst: 2 },
      { id: 'P2', arrival: 1, burst: 2 },
      { id: 'P3', arrival: 2, burst: 2 },
      { id: 'P4', arrival: 0, burst: 20 },
      { id: 'P5', arrival: 3, burst: 2 },
    ],
  },
  {
    key: 'simultaneous',
    label: 'All arrive together',
    processes: [
      { id: 'P1', arrival: 0, burst: 5 },
      { id: 'P2', arrival: 0, burst: 3 },
      { id: 'P3', arrival: 0, burst: 8 },
      { id: 'P4', arrival: 0, burst: 1 },
    ],
  },
  {
    key: 'realistic',
    label: 'Real-machine snapshot',
    processes: [
      { id: 'build', arrival: 0, burst: 14 },
      { id: 'chrome', arrival: 1, burst: 3 },
      { id: 'spotify', arrival: 2, burst: 2 },
      { id: 'slack', arrival: 3, burst: 1 },
      { id: 'terminal', arrival: 5, burst: 4 },
    ],
  },
];

export function clonePreset(preset) {
  return preset.processes.map((p) => ({ ...p }));
}
