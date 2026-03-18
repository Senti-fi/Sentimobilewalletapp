/**
 * FlexibleSavingsFlow
 * Figma frames: 185:267 (Intro) → 191:668 (Setup) → 191:1060 (Success)
 *
 * Figma composite structure for steps 1 & 2:
 *   Layer 1 — IntroStep frozen (pointer-events-none, overflow-hidden)
 *   Layer 2 — Full-screen blur overlay: backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)]
 *   Layer 3 — Bottom sheet (SetupStep or SuccessStep)
 */
import { useFlowStepper } from '../../../hooks/useFlowStepper';
import type { FlexibleSavingsData } from '../types';
import IntroStep   from './steps/IntroStep';
import SetupStep   from './steps/SetupStep';
import SuccessStep from './steps/SuccessStep';

const STEPS = ['intro', 'setup', 'success'] as const;

const INITIAL: FlexibleSavingsData = {
  amount:    '',
  asset:     'USDC',
  frequency: 'once',
};

interface FlexibleSavingsFlowProps {
  onExit: () => void;
}

const NOOP = () => {};

export default function FlexibleSavingsFlow({ onExit }: FlexibleSavingsFlowProps) {
  const { stepIndex, totalSteps, data, next, back, reset } =
    useFlowStepper<FlexibleSavingsData>(STEPS, INITIAL, onExit);

  const stepProps = { data, onNext: next, onBack: back, onExit, onDismiss: reset, stepIndex, totalSteps };

  /* Steps 1 & 2 — composite: frozen bg + blur overlay + bottom sheet */
  if (stepIndex === 1 || stepIndex === 2) {
    return (
      <div className="relative h-full">
        {/* Layer 1: frozen IntroStep background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <IntroStep {...stepProps} onNext={NOOP} onBack={NOOP} />
        </div>
        {/* Layer 2: blur + tint overlay (matches Figma node 191:859 / 191:1130) */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)] pointer-events-none" />
        {/* Layer 3: interactive bottom sheet */}
        {stepIndex === 1
          ? <SetupStep   {...stepProps} />
          : <SuccessStep {...stepProps} />
        }
      </div>
    );
  }

  /* Step 0 — standalone intro page */
  return <IntroStep {...stepProps} />;
}
