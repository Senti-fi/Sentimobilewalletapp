/**
 * LockedSavingsFlow
 * Figma frames: 204:1398 → 218:961 → 220:1712 → 224:2071 → 242:323 → 243:616
 *
 * Steps: Intro → Lock Selection → Setup → Review → Success → Lock Details
 *
 * Step 1 (Lock Selection) renders IntroStep as a frozen, non-interactive
 * background so the bottom-sheet overlay has the correct blurred context
 * behind it, matching Figma composite frame 218:961.
 */
import { useEffect } from 'react';
import { useFlowStepper } from '../../../hooks/useFlowStepper';
import type { LockedSavingsData } from '../types';
import { useAppStore } from '../../../store';
import { track } from '../../../lib/analytics';
import IntroStep         from './steps/IntroStep';
import LockSelectionStep from './steps/LockSelectionStep';
import SetupStep         from './steps/SetupStep';
import ReviewStep        from './steps/ReviewStep';
import SuccessStep       from './steps/SuccessStep';
import LockDetailsStep   from './steps/LockDetailsStep';

const STEPS = ['intro', 'lock-selection', 'setup', 'review', 'success', 'lock-detail'] as const;

const INITIAL: LockedSavingsData = {
  lockPeriodDays: 0,
  apy:            '',
  amount:         '',
  asset:          'USDC',
};

interface LockedSavingsFlowProps {
  onExit: () => void;
}

const NOOP = () => {};

export default function LockedSavingsFlow({ onExit }: LockedSavingsFlowProps) {
  const { stepIndex, totalSteps, data, next, back } =
    useFlowStepper<LockedSavingsData>(STEPS, INITIAL, onExit);
  const { lockFunds } = useAppStore();

  useEffect(() => { track('locked_savings_flow_started'); }, []);

  const stepProps = { data, onNext: next, onBack: back, onExit, stepIndex, totalSteps };

  /* Step 1: IntroStep frozen in background, LockSelectionStep overlay on top */
  if (stepIndex === 1) {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <IntroStep {...stepProps} onNext={NOOP} onBack={NOOP} />
        </div>
        <LockSelectionStep {...stepProps} />
      </div>
    );
  }

  /* Step 2: IntroStep frozen in background, SetupStep overlay on top */
  if (stepIndex === 2) {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <IntroStep {...stepProps} onNext={NOOP} onBack={NOOP} />
        </div>
        <SetupStep {...stepProps} />
      </div>
    );
  }

  switch (stepIndex) {
    case 0: return <IntroStep {...stepProps} />;
    case 3: return (
      <ReviewStep
        {...stepProps}
        onNext={() => {
          const result = lockFunds({
            asset:          (data.asset as 'USDC' | 'USDT' | 'SOL') ?? 'USDC',
            amount:         parseFloat(data.amount || '0'),
            lockPeriodDays: data.lockPeriodDays ?? 90,
            apy:            parseFloat(String(data.apy ?? '7.6').replace('%', '')),
          });
          if (result.ok) {
            track('savings_locked', { asset: data.asset, amount: data.amount, lockPeriodDays: data.lockPeriodDays, apy: data.apy });
            next({});
          }
        }}
      />
    );
    case 4: return <SuccessStep     {...stepProps} />;
    case 5: return <LockDetailsStep {...stepProps} />;
    default: return null;
  }
}
