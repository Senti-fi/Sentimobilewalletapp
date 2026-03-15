import { ReactNode } from 'react';

interface AuthFlowHeaderProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
}

export default function AuthFlowHeader({
  step,
  totalSteps,
  title,
  subtitle,
  rightSlot,
}: AuthFlowHeaderProps) {
  const progress = Math.min(Math.max(step / totalSteps, 0), 1) * 100;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-blue-200/70">
            Step {step} of {totalSteps}
          </p>
          <h2 className="mt-1 text-white text-xl font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-blue-200/75">{subtitle}</p>
        </div>
        {rightSlot}
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
