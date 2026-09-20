import AlgoWorkbench from '../../components/AlgoWorkbench';

export default function SRTF() {
  return (
    <AlgoWorkbench
      algoKey="srtf"
      title="Shortest Remaining Time First"
      full="Shortest Remaining Time First"
      description="The preemptive sibling of SJF. Every tick, the scheduler re-checks all arrived processes and switches to whichever has the least remaining work — even mid-execution. Aggressive and optimal for average wait time, at the cost of frequent context switches."
    />
  );
}
