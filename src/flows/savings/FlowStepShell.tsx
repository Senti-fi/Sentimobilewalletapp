import { ArrowLeft, X } from 'lucide-react';

interface FlowStepShellProps {
  /** Flow name shown in the header */
  flowName: string;
  /** Current step label */
  stepName: string;
  stepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onExit: () => void;
  children: React.ReactNode;
  /** Primary CTA label */
  ctaLabel?: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
}

/**
 * FlowStepShell
 * ─────────────────────────────────────────────
 * Consistent layout wrapper for every flow step:
 *
 *   ┌──────────────────────────────┐
 *   │  ← back     flow / step  ×  │  header
 *   │  ── ── ── step dots ── ── ── │  progress
 *   │                              │
 *   │  {children}                  │  scrollable content
 *   │                              │
 *   │  [   CTA button   ]          │  pinned footer
 *   └──────────────────────────────┘
 *
 * Replace children with Figma screens when ready.
 */
export default function FlowStepShell({
  flowName,
  stepName,
  stepIndex,
  totalSteps,
  onBack,
  onExit,
  children,
  ctaLabel,
  onCta,
  ctaDisabled = false,
}: FlowStepShellProps) {
  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
        <button
          onClick={stepIndex === 0 ? onExit : onBack}
          className="flex items-center justify-center w-8 h-8 rounded-full text-[#8ac7ff]"
          aria-label={stepIndex === 0 ? 'Exit flow' : 'Go back'}
        >
          {stepIndex === 0 ? <X className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </button>

        <div className="flex flex-col items-center">
          <p className="text-white text-[14px] font-semibold leading-[18px]">{flowName}</p>
          <p className="text-[#8ac7ff] text-[11px] leading-[15px]">{stepName}</p>
        </div>

        <button
          onClick={onExit}
          className="flex items-center justify-center w-8 h-8 rounded-full text-[#8ac7ff]"
          aria-label="Exit flow"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step progress dots */}
      <div className="flex items-center justify-center gap-1.5 pb-4 shrink-0">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i === stepIndex
                ? 'bg-[#007bff] w-5 h-[4px]'
                : i < stepIndex
                ? 'bg-[#00e6ff] w-2 h-[4px]'
                : 'bg-[#1a2540] w-2 h-[4px]'
            }`}
          />
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {children}
      </div>

      {/* Pinned CTA */}
      {ctaLabel && onCta && (
        <div className="px-6 pb-6 pt-3 shrink-0">
          <button
            onClick={onCta}
            disabled={ctaDisabled}
            className="w-full h-14 bg-[#007bff] rounded-xl text-white text-[16px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </div>
  );
}
