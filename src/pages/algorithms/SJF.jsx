import AlgoWorkbench from '../../components/AlgoWorkbench';

export default function SJF() {
  return (
    <AlgoWorkbench
      algoKey="sjf"
      title="Shortest Job First"
      full="Shortest Job First (non-preemptive)"
      description="At every decision point, the scheduler picks whichever arrived process has the smallest total burst time and runs it to completion. Minimizes average waiting time in theory — but a steady stream of short jobs can starve a long one indefinitely."
    />
  );
}
