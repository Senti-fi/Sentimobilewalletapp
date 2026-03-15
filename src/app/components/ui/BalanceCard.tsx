import { Plus, ArrowUpFromLine, Send } from 'lucide-react';

interface BalanceCardProps {
  label: string;
  amount: string;
  subLabel?: string;
  subValue?: string;
  subValueColor?: string;
  badge?: string;
  /** Carousel dot count – highlight index 0 */
  dots?: number;
  actions?: Array<{ label: string; icon: 'deposit' | 'send' | 'transfer' | 'none'; onClick?: () => void }>;
  /** Extra metric row below the amount (e.g. Savings: "Across 2 goals · 1 locked") */
  metaLine?: string;
  /** Optional extra badge button overlaid top-right of card (e.g. Save Now) */
  ctaButton?: { label: string; onClick?: () => void };
}

const ActionIcon = ({ type }: { type: 'deposit' | 'send' | 'transfer' | 'none' }) => {
  if (type === 'deposit')  return <Plus className="w-4 h-4" strokeWidth={2} />;
  if (type === 'send')     return <ArrowUpFromLine className="w-4 h-4" strokeWidth={2} />;
  if (type === 'transfer') return <Send className="w-4 h-4" strokeWidth={2} />;
  return null;
};

export default function BalanceCard({
  label,
  amount,
  subLabel,
  subValue,
  subValueColor = 'text-[#32fc65]',
  badge,
  dots = 0,
  actions = [],
  metaLine,
  ctaButton,
}: BalanceCardProps) {
  return (
    <div className="mx-6 rounded-[20px] bg-[#007bff] overflow-hidden relative">
      {/* Wave decoration — matches Figma SVG wave pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] left-0 w-[88%] h-[135%] rounded-[50%] bg-white/[0.09]" />
        <div className="absolute -top-[10%] left-[87%] w-full h-[135%] rounded-[50%] bg-white/[0.09]" />
      </div>

      <div className="relative px-5 pt-5 pb-4">
        {/* Badge top-right */}
        {badge && (
          <div className="absolute top-5 right-5 bg-[rgba(0,230,255,0.3)] px-2.5 py-1 rounded-full">
            <span className="text-[#00e6ff] text-[11px] font-semibold">{badge}</span>
          </div>
        )}

        {/* Label */}
        <p className="text-white text-xs font-normal leading-4 mb-2">{label}</p>

        {/* Amount */}
        <p className="text-white text-[32px] font-bold leading-8 tracking-tight mb-1">
          {amount}
        </p>

        {/* Sub line */}
        {(subLabel || metaLine) && (
          <div className="flex items-center gap-1 mb-1">
            {metaLine ? (
              <span className="text-white text-[11px] font-semibold">{metaLine}</span>
            ) : (
              <>
                {subLabel && <span className="text-white text-[11px] font-semibold">{subLabel}</span>}
                {subValue && <span className={`text-[11px] font-semibold ${subValueColor}`}>{subValue}</span>}
              </>
            )}
          </div>
        )}

        {/* Dots */}
        {dots > 0 && (
          <div className="flex items-center justify-center gap-1 my-3">
            {Array.from({ length: dots }).map((_, i) => (
              <div
                key={i}
                className={i === 0 ? 'w-3 h-1 rounded-full bg-[#2c14dd]' : 'w-1 h-1 rounded-full bg-white'}
              />
            ))}
          </div>
        )}

        {/* CTA button (e.g. "Save Now") */}
        {ctaButton && (
          <button
            onClick={ctaButton.onClick}
            className="flex items-center gap-2 mt-3 mb-1 px-4 py-2.5 rounded-full border border-[#b3fbff] bg-[#0a142f] text-white text-xs font-normal"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            {ctaButton.label}
          </button>
        )}

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-[#b3fbff] bg-[#007bff] text-white text-xs font-normal"
              >
                <ActionIcon type={action.icon} />
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
