import { useState } from 'react';

/**
 * useFlowStepper
 * ─────────────────────────────────────────────
 * Generic hook for managing multi-step flows.
 * Each step receives data, next(), back(), and exit().
 *
 * @param steps     Ordered array of step identifiers (used for debugging/tracking)
 * @param initial   Initial accumulated data shape for the flow
 * @param onExit    Called when the user exits or completes the flow
 */
export function useFlowStepper<TData>(
  steps: readonly string[],
  initial: TData,
  onExit: () => void,
) {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<TData>(initial);

  const next = (update?: Partial<TData>) => {
    if (update) setData(prev => ({ ...prev, ...update }));
    setStepIndex(i => Math.min(i + 1, steps.length - 1));
  };

  const back = () => {
    if (stepIndex === 0) onExit();
    else setStepIndex(i => i - 1);
  };

  const reset = () => {
    setStepIndex(0);
    setData(initial);
  };

  return {
    stepIndex,
    totalSteps: steps.length,
    stepName: steps[stepIndex],
    data,
    next,
    back,
    exit: onExit,
    reset,
  };
}
