import AlgoWorkbench from '../../components/AlgoWorkbench';

export default function FCFS() {
  return (
    <AlgoWorkbench
      algoKey="fcfs"
      title="First Come First Serve"
      full="First Come First Serve"
      description="Processes run strictly in arrival order, each to completion, with no preemption. Simple and fair by the clock — but a single long job at the front holds up everyone behind it."
    />
  );
}
