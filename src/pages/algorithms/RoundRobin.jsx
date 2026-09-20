import AlgoWorkbench from '../../components/AlgoWorkbench';

export default function RoundRobin() {
  return (
    <AlgoWorkbench
      algoKey="rr"
      title="Round Robin"
      full="Round Robin"
      description="Every process gets a fixed time quantum on the CPU before being cycled to the back of the queue. Fairness-driven rather than throughput-driven — no process waits forever, but a too-small quantum wastes time on context switches while a too-large one degrades toward FCFS."
    />
  );
}
