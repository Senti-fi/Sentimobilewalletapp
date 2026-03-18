/**
 * GoalSavingsFlow
 * Figma frames: 193:1172 → 133:1606 → 141:1932 → 143:2202
 *
 * Steps: Intro → Goal Setup → Success → Goal Detail
 *
 * Step 2 (Success) renders GoalSetupStep as a frozen, non-interactive
 * background layer so the bottom-sheet overlay has the correct blurred
 * context behind it, matching Figma composite frame 141:1932.
 */
import { useFlowStepper } from '../../../hooks/useFlowStepper';
import type { GoalSavingsData } from '../types';
import { useAppStore } from '../../../store';
import IntroStep      from './steps/IntroStep';
import GoalSetupStep  from './steps/GoalSetupStep';
import SuccessStep    from './steps/SuccessStep';
import GoalDetailStep from './steps/GoalDetailStep';

const STEPS = ['intro', 'setup', 'success', 'detail'] as const;

const INITIAL: GoalSavingsData = {
  emoji:         '🎯',
  goalName:      '',
  targetAmount:  '',
  deadline:      '',
  agreedToTerms: false,
};

interface GoalSavingsFlowProps {
  onExit: () => void;
}

const NOOP = () => {};

export default function GoalSavingsFlow({ onExit }: GoalSavingsFlowProps) {
  const { stepIndex, totalSteps, data, next, back } =
    useFlowStepper<GoalSavingsData>(STEPS, INITIAL, onExit);
  const { createGoal } = useAppStore();

  const stepProps = { data, onNext: next, onBack: back, onExit, stepIndex, totalSteps };

  /* Step 2: GoalSetupStep frozen in background, SuccessStep overlay on top */
  if (stepIndex === 2) {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <GoalSetupStep {...stepProps} onNext={NOOP} onBack={NOOP} />
        </div>
        <SuccessStep {...stepProps} />
      </div>
    );
  }

  switch (stepIndex) {
    case 0: return <IntroStep {...stepProps} />;
    case 1: return (
      <GoalSetupStep
        {...stepProps}
        onNext={(update) => {
          const merged = { ...data, ...update };
          const result = createGoal({
            name:         merged.goalName    ?? '',
            emoji:        merged.emoji       ?? '🎯',
            targetAmount: parseFloat(merged.targetAmount || '0'),
            asset:        'USDC',
            dueDate:      merged.deadline    ?? '',
          });
          if (result.ok) next(update);
        }}
      />
    );
    case 3: return <GoalDetailStep {...stepProps} />;
    default: return null;
  }
}
