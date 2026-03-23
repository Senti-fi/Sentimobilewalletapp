/**
 * LockedSavingsFlow › Step 4 — Review
 * Figma frame: 224:2071 "Lock Preview"
 *
 * Shows lock summary, rate guarantee card, early-withdrawal warning.
 * "Confirm & Lock" → onNext()
 * "Go Back" → onBack()
 */
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import PageHeader from '../../../../components/ui/PageHeader';
import type { StepProps, LockedSavingsData } from '../../types';

const EST_EARNINGS: Record<number, number> = {
  30: 12, 60: 24, 90: 38, 180: 80, 365: 180,
};

function getLockDate(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getUnlockDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtAmount(val: string): string {
  const n = parseFloat(val || '500');
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getPeriodLabel(days: number): string {
  return days === 365 ? '1 Year' : `${days} Days`;
}

export default function ReviewStep({ data, onNext, onBack }: StepProps<LockedSavingsData>) {
  const amount    = data.amount    || '500';
  const days      = data.lockPeriodDays || 90;
  const baseEst   = EST_EARNINGS[days] ?? 38;
  const estScaled = (parseFloat(amount) / 500) * baseEst;
  const totalUnlock = parseFloat(amount) + estScaled;

  const lockDate   = getLockDate();
  const unlockDate = getUnlockDate(days);

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">
      <PageHeader title="Preview" onBack={onBack} />

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col px-6 gap-4 pb-6">

        {/* ── Your Lock Summary card ────────────────────────────────── */}
        <div
          className="bg-[#1a2540] border border-[#262626] rounded-[12px] flex flex-col gap-3 shrink-0"
          style={{ padding: 17 }}
        >
          <p className="text-white font-bold text-[16px] leading-[24px]">Your Lock Summary</p>

          <SummaryRow label="Amount"             value={fmtAmount(amount)}  />
          <SummaryRow label="Lock Period"         value={getPeriodLabel(days)} />
          <SummaryRow label="Lock Date"           value={lockDate}           />
          <SummaryRow label="Unlock Date"         value={unlockDate}         cyan />
          <SummaryRow label="Estimated Earnings"  value={`≈ $${estScaled.toFixed(2)}`} cyan />

          <div className="border-t border-[#262626] h-px w-full shrink-0" />

          {/* Total at Unlock */}
          <div className="flex items-center justify-between pt-1 shrink-0">
            <p className="text-white font-bold text-[18px] leading-[28px]">Total at Unlock</p>
            <p className="text-[#00e6ff] font-bold text-[20px] leading-[28px]">
              ${totalUnlock.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* ── Rate Guaranteed card ──────────────────────────────────── */}
        <div
          className="bg-[#0d2a4a] border border-[rgba(0,123,255,0.3)] rounded-[12px] flex items-start gap-3 shrink-0"
          style={{ padding: 17, minHeight: 97 }}
        >
          <ShieldCheck size={18} className="text-[#007bff] shrink-0 mt-[2px]" />
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-white font-bold text-[14px] leading-[20px]">Rate Guaranteed</p>
            <p className="text-[#8ac7ff] font-normal text-[12px] leading-[19.5px]">
              Your earnings are locked in for the full {days} days regardless of market changes.
            </p>
          </div>
        </div>

        {/* ── Early Withdrawal Warning ──────────────────────────────── */}
        <div
          className="bg-[#2d1515] border border-[#3d1f1f] rounded-[12px] flex items-start gap-3 shrink-0"
          style={{ padding: 17, minHeight: 97 }}
        >
          <AlertTriangle size={20} className="text-[#f44] shrink-0 mt-[2px]" />
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-[#f44] font-bold text-[14px] leading-[20px]">Early Withdrawal Penalty</p>
            <p className="text-[#f44] font-normal text-[12px] leading-[19.5px] opacity-90">
              Withdrawing before {unlockDate} will forfeit all earnings and incur a penalty fee.
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer actions ────────────────────────────────────────────── */}
      <div className="px-6 pb-8 flex flex-col gap-3 shrink-0">
        <button
          onClick={() => onNext()}
          className="w-full bg-[#007bff] rounded-[12px] h-14 flex items-center justify-center"
        >
          <span className="text-white font-bold text-[16px] leading-[24px]">
            Confirm &amp; Lock {fmtAmount(amount)}
          </span>
        </button>
        <button
          onClick={onBack}
          className="flex items-center justify-center w-full py-2"
        >
          <span className="text-[#8ac7ff] font-semibold text-[14px] leading-[20px]">Go Back</span>
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  cyan,
}: {
  label: string;
  value: string;
  cyan?: boolean;
}) {
  return (
    <div className="flex items-center justify-between shrink-0">
      <p className="text-[#94a3b8] font-normal text-[14px] leading-[20px]">{label}</p>
      <p className={`font-${cyan ? 'bold' : 'normal'} text-[16px] leading-[24px] ${cyan ? 'text-[#00e6ff]' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
