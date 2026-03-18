/**
 * Shared prop contract every step component must satisfy.
 * TData is the accumulated data object for the flow.
 */
export interface StepProps<TData = Record<string, unknown>> {
  data: TData;
  /** Advance to the next step, optionally merging partial updates into data */
  onNext: (update?: Partial<TData>) => void;
  /** Go back one step (or exit if already on step 0) */
  onBack: () => void;
  /** Exit the flow and return to the Save tab */
  onExit: () => void;
  /**
   * Dismiss an overlay without exiting the flow.
   * Backdrop taps on success/overlay steps should use this so the user
   * returns to the underlying page rather than being sent back to /save.
   */
  onDismiss?: () => void;
  stepIndex: number;
  totalSteps: number;
}

// ── Per-flow data shapes ────────────────────────────────────────────

export interface FlexibleSavingsData {
  amount: string;
  asset: string;      // 'USDC' | 'USDT' | 'SOL'
  frequency: string;  // 'once' | 'weekly' | 'monthly'
}

export interface GoalSavingsData {
  emoji: string;
  goalName: string;
  targetAmount: string;
  deadline: string;
  agreedToTerms: boolean;
}

export interface LockedSavingsData {
  lockPeriodDays: number;
  apy: string;
  amount: string;
  asset: string;
}
