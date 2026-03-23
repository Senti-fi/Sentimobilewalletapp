/**
 * LockedSavingsFlow › Step 6 — Lock Details
 * Figma frame: 243:616 "Lock Details"
 *
 * Full-page scrollable detail for an active lock.
 * Dynamic from data: lockPeriodDays, amount, apy
 * Static/mock: lock date (today), progress (1%), earned so far (+$0.42)
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

function getPeriodTitle(days: number): string {
  return days === 365 ? '1 Year Lock' : `${days} Day Lock`;
}

function getPeriodLabel(days: number): string {
  return days === 365 ? '1 Year' : `${days} Days`;
}

function getDaysRemaining(days: number): string {
  return `${days - 1} days remaining`;
}

export default function LockDetailsStep({ data, onBack }: StepProps<LockedSavingsData>) {
  const amount     = data.amount    || '500';
  const days       = data.lockPeriodDays || 90;
  const baseEst    = EST_EARNINGS[days] ?? 38;
  const estScaled  = (parseFloat(amount) / 500) * baseEst;
  const totalUnlock = parseFloat(amount) + estScaled;
  const lockDate   = getLockDate();
  const unlockDate = getUnlockDate(days);

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">
      <PageHeader title={getPeriodTitle(days)} onBack={onBack} />

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col px-6 gap-4 pb-24">

        {/* ── Status Card ──────────────────────────────────────────── */}
        <div className="bg-[#1a2540] rounded-[20px] flex flex-col gap-6 shrink-0" style={{ padding: 20 }}>
          {/* ACTIVE badge + days remaining */}
          <div className="flex items-center justify-between">
            <div className="bg-[#0a3040] rounded-full px-[10px] py-1">
              <p className="text-[#00e6ff] font-normal text-[12px] leading-[16px] tracking-[0.6px] uppercase">
                Active
              </p>
            </div>
            <p className="text-[#8ac7ff] font-medium text-[12px] leading-[16px]">
              {getDaysRemaining(days)}
            </p>
          </div>

          {/* Amount */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-white font-bold text-[36px] leading-[40px] text-center">
              {fmtAmount(amount)}
            </p>
            <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px] text-center">
              Locked Amount
            </p>
          </div>

          {/* Timeline + progress bar */}
          <div className="flex flex-col gap-2" style={{ paddingTop: 8 }}>
            <div className="flex items-center justify-between">
              <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">{lockDate}</p>
              <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">{unlockDate}</p>
            </div>
            <div className="bg-[#334155] h-2 rounded-full w-full overflow-hidden">
              <div className="h-full w-[1%] bg-[#007bff] rounded-full" />
            </div>
            <div className="flex items-center justify-end">
              <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">1% complete</p>
            </div>
          </div>
        </div>

        {/* ── Earnings Card ─────────────────────────────────────────── */}
        <div className="bg-[#0a142f] border border-[rgba(138,199,255,0.3)] rounded-[12px] flex flex-col gap-4 shrink-0" style={{ padding: 21 }}>
          <p className="text-white font-bold text-[18px] leading-[28px]">Earnings</p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Earned So Far</p>
              <p className="text-[#00e6ff] font-medium text-[16px] leading-[24px]">+$0.42</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Estimated Total</p>
              <p className="text-[#00e6ff] font-medium text-[16px] leading-[24px]">
                ≈ ${estScaled.toFixed(2)}
              </p>
            </div>
            <div className="border-t border-[#3c5679] flex items-center justify-between shrink-0" style={{ paddingTop: 13 }}>
              <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Total at Unlock</p>
              <p className="text-white font-bold text-[16px] leading-[24px]">
                ${totalUnlock.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Lock Details Card ────────────────────────────────────── */}
        <div className="bg-[#0a142f] border border-[#3c5679] rounded-[12px] flex flex-col gap-4 shrink-0" style={{ padding: 21 }}>
          <p className="text-white font-bold text-[18px] leading-[28px]">Lock Details</p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Lock Date</p>
              <p className="text-white font-normal text-[14px] leading-[20px]">{lockDate}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Unlock Date</p>
              <p className="text-[#00e6ff] font-medium text-[14px] leading-[20px]">{unlockDate}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Lock Period</p>
              <p className="text-white font-normal text-[14px] leading-[20px]">{getPeriodLabel(days)}</p>
            </div>
            {/* Rate Guarantee row with shield icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#8ac7ff] shrink-0" />
                <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Rate Guarantee</p>
              </div>
              <p className="text-white font-normal text-[14px] leading-[20px]">Guaranteed until unlock</p>
            </div>
          </div>
        </div>

        {/* ── Lucy card ─────────────────────────────────────────────── */}
        <div
          className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[12px] flex items-center gap-4 shrink-0 overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
          style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 12, paddingBottom: 12 }}
        >
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="text-white font-normal text-[12px] leading-[16px] flex-1">
            You&apos;re on day 1 of {days}. Your money is working. Check back anytime to see your earnings grow.
          </p>
        </div>

        {/* ── Early Withdrawal Section ──────────────────────────────── */}
        <div
          className="bg-[#2d1515] border border-[#3d1f1f] rounded-[12px] flex flex-col gap-[7px] shrink-0"
          style={{ padding: 17 }}
        >
          {/* Header row */}
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-[#f44] shrink-0" />
            <p className="text-[#f44] font-bold text-[16px] leading-[24px]">Early Withdrawal</p>
          </div>
          {/* Description */}
          <p className="text-[#f44] font-normal text-[12px] leading-[19.5px]">
            Withdrawing before {unlockDate} will forfeit all earnings and incur a penalty.
          </p>
          {/* Link */}
          <button className="flex items-center justify-start" style={{ paddingTop: 4 }}>
            <span className="text-[#f44] font-bold text-[14px] leading-[20px] underline decoration-solid">
              Request Early Withdrawal
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
