import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[#f1f5f9] text-lg font-semibold leading-7">{title}</h2>
      {actionLabel && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-[#007bff] text-sm font-semibold leading-5"
        >
          {actionLabel}
          <ArrowRight className="w-2.5 h-2.5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
