/**
 * LockedSavingsFlow › Step 5 — Lock Success
 * Figma frame: 242:323 "Lock success"
 *
 * Full-page terminal step. Celebration icon, lock summary, Lucy card,
 * milestone indicator, and pinned footer.
 *
 * "View Lock Details" → onNext() → LockDetailsStep
 * "Back to Savings"   → onExit()
 */
import type { StepProps, LockedSavingsData } from '../../types';

// ── Figma asset URLs (242:323) — valid 7 days ────────────────────────
const imgLockKey = 'https://www.figma.com/api/mcp/asset/4603f06b-0791-4dd5-886e-839cc9e42a3c'; // LockKey Vector 48×48
const imgTrophy  = 'https://www.figma.com/api/mcp/asset/b8b38a88-4795-44b4-a575-9a5c177b4d8f'; // Trophy SVG 16×16

const EST_EARNINGS: Record<number, number> = {
  30: 12, 60: 24, 90: 38, 180: 80, 365: 180,
};

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

export default function SuccessStep({ data, onNext, onExit }: StepProps<LockedSavingsData>) {
  const amount     = data.amount || '500';
  const days       = data.lockPeriodDays || 90;
  const baseEst    = EST_EARNINGS[days] ?? 38;
  const estScaled  = (parseFloat(amount) / 500) * baseEst;
  const unlockDate = getUnlockDate(days);

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col items-center pb-[120px]">

        {/* Celebration icon: 100px circle with glow */}
        <div
          className="bg-[#1a3a6b] border border-[rgba(0,123,255,0.1)] rounded-full flex items-center justify-center shrink-0 shadow-[0px_0px_20px_5px_rgba(0,123,255,0.2)]"
          style={{ width: 100, height: 100, marginTop: 84 }}
        >
          <div className="relative shrink-0 size-12">
            <div className="absolute inset-[1.56%_10.94%_10.94%_10.94%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgLockKey} />
            </div>
          </div>
        </div>

        {/* "You're locked in." */}
        <p
          className="text-white font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-center"
          style={{ marginTop: 16 }}
        >
          You&apos;re locked in.
        </p>

        {/* Subtitle */}
        <p
          className="text-[#8ac7ff] font-medium text-[14px] leading-[18px] text-center"
          style={{ marginTop: 8, width: 248 }}
        >
          Your {fmtAmount(amount)} is secured and earning from today. See you on {unlockDate}.
        </p>

        {/* ── Lock Summary Pill card ────────────────────────────────── */}
        <div
          className="bg-[#1a2540] border border-[#262626] rounded-[16px] flex flex-col w-full shrink-0"
          style={{ margin: '24px 24px 0', width: 'calc(100% - 48px)', padding: 21 }}
        >
          <div className="flex flex-col gap-4">
            <SummaryRow label="Amount Locked" value={fmtAmount(amount)} />
            <div className="bg-[#262626] h-px w-full shrink-0" />
            <SummaryRow label="Lock Period"   value={getPeriodLabel(days)} />
            <div className="bg-[#262626] h-px w-full shrink-0" />
            <SummaryRow label="Unlocks On"    value={unlockDate}           cyan />
            <div className="bg-[#262626] h-px w-full shrink-0" />
            <SummaryRow label="Est. Earnings" value={`≈ $${estScaled.toFixed(2)}`} cyan />
          </div>
        </div>

        {/* ── Lucy card ─────────────────────────────────────────────── */}
        <div
          className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[12px] flex items-center gap-4 shrink-0 overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
          style={{ marginTop: 16, marginLeft: 24, marginRight: 24, paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8, width: 'calc(100% - 48px)' }}
        >
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="text-white font-normal text-[12px] leading-[16px] flex-1">
            Great move. I&apos;ll remind you 5 days before your funds unlock so you&apos;re ready.
          </p>
        </div>

        {/* ── Milestone Indicator ──────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 shrink-0" style={{ marginTop: 24 }}>
          <div className="relative shrink-0 size-4">
            <img alt="" className="absolute block max-w-none size-full" src={imgTrophy} />
          </div>
          <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] text-center">
            You&apos;re building toward your first savings milestone.
          </p>
        </div>
      </div>

      {/* ── Pinned footer ─────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 backdrop-blur-[2px] bg-[rgba(10,20,47,0.95)] px-6 pb-8 pt-4 flex flex-col gap-4 items-center"
      >
        <button onClick={onNext}>
          <span className="text-[#8ac7ff] font-medium text-[14px] leading-[18px]">View Lock Details</span>
        </button>
        <button
          onClick={onExit}
          className="w-full bg-[#007bff] rounded-[12px] h-14 flex items-center justify-center"
        >
          <span className="text-white font-semibold text-[16px] leading-[20px]">Back to Savings</span>
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
      <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">{label}</p>
      <p className={`font-normal text-[16px] leading-[24px] ${cyan ? 'text-[#00e6ff]' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
